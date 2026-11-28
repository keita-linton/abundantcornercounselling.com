"""Abundant Corner traffic collector — tiny FastAPI service.

Receives pageview/heartbeat beacons from abundantcornercounselling.com and
serves a live feed for the traffic dashboard. No cookies, no IP storage, no
personal data: only the page, referrer, coarse location (browser timezone),
device type and user-agent family are kept.

Endpoints:
  POST /hit   beacon: {page, referrer, ua, screen, tz, key}
  GET  /live  dashboard feed: online now, recent events, aggregates, bots
  POST /log   server-log ingestion (AI crawlers etc.): {ua, path, ts, source}
  GET  /health
"""
import json
import os
import re
import secrets
import string
import time
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

DATA = Path(os.environ.get("AC_DATA", "/data"))
DATA.mkdir(parents=True, exist_ok=True)
EVENTS = DATA / "events.jsonl"
SITE_KEY = os.environ.get("AC_SITE_KEY", "")
READ_KEY = os.environ.get("AC_READ_KEY", "")  # private read key for GET /live; only the dashboard knows it (never in site JS)
CODES = DATA / "access_codes.json"  # per-device access codes for Yeukai's dashboard (code only Keita can give)
MAX_FAILED_ATTEMPTS = 5             # wrong-code guesses before a device is locked out
LOCKOUT_SECONDS = 15 * 60           # 15-minute lockout after too many wrong guesses

ONLINE_WINDOW = 75          # seconds since last heartbeat to count as "on the site now"
MAX_EVENTS = 2000           # keep the newest N events in the file

AI_PATTERNS = [
    ("GPTBot", "OpenAI"), ("ChatGPT-User", "OpenAI"), ("OAI-SearchBot", "OpenAI"),
    ("ClaudeBot", "Anthropic"), ("Claude-Web", "Anthropic"), ("anthropic-ai", "Anthropic"),
    ("Googlebot", "Google"), ("Google-Extended", "Google"), ("Bingbot", "Microsoft"),
    ("bingbot", "Microsoft"), ("PerplexityBot", "Perplexity"), ("Perplexity-User", "Perplexity"),
    ("Applebot", "Apple"), ("DuckAssistBot", "DuckDuckGo"), ("CCBot", "Common Crawl"),
    ("cohere-ai", "Cohere"), ("Meta-ExternalAgent", "Meta"), ("FacebookBot", "Meta"),
    ("Bytespider", "ByteDance"), ("YandexBot", "Yandex"), ("Sogou", "Sogou"),
]

app = FastAPI(title="Abundant Corner traffic collector")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # GET /live is read by the dashboard; POST /hit checks the key
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _read_events():
    if not EVENTS.exists():
        return []
    out = []
    try:
        for line in EVENTS.read_text().splitlines():
            try:
                out.append(json.loads(line))
            except Exception:
                continue
    except Exception:
        return []
    return out[-MAX_EVENTS:]


def _append_event(ev: dict):
    ev["ts"] = round(time.time(), 2)
    with open(EVENTS, "a") as f:
        f.write(json.dumps(ev) + "\n")
    # trim the file to the newest MAX_EVENTS
    try:
        lines = EVENTS.read_text().splitlines()
        if len(lines) > MAX_EVENTS:
            EVENTS.write_text("\n".join(lines[-MAX_EVENTS:]) + "\n")
    except Exception:
        pass


def _device_family(ua: str) -> str:
    u = (ua or "").lower()
    if "mobile" in u or "iphone" in u or "android" in u:
        return "mobile"
    if "tablet" in u or "ipad" in u:
        return "tablet"
    return "desktop"


def _ai_match(ua: str):
    for pat, vendor in AI_PATTERNS:
        if pat.lower() in (ua or "").lower():
            return {"bot": pat, "vendor": vendor}
    return None


def _source(referrer: str, page: str) -> str:
    r = (referrer or "").lower()
    if not r:
        return "direct"
    if "google." in r:
        return "google"
    if "bing." in r:
        return "bing"
    if "facebook.com" in r or "fb." in r:
        return "facebook"
    if "instagram.com" in r:
        return "instagram"
    if "abundantcornercounselling.com" in r:
        return "site"
    return "other"


# --- Access codes for Yeukai's dashboard -----------------------------------
# A device requests access -> server creates a random 6-digit code (pending).
# Keita gets the code by email (via the cron polling /pending-requests) and
# gives it to Yeukai. She enters it -> device is approved permanently.
# The code is never returned by /request-access; only the master key holder
# (via /pending-requests) and Keita (via email) ever see it.

def _read_codes():
    if not CODES.exists():
        return {"devices": {}}
    try:
        return json.loads(CODES.read_text())
    except Exception:
        return {"devices": {}}


def _write_codes(store: dict):
    CODES.write_text(json.dumps(store, indent=2))


def _new_code() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(6))


def _master_ok(req: Request) -> bool:
    """True if the request carries the master READ_KEY (query or header)."""
    if not READ_KEY:
        return False
    provided = req.query_params.get("key") or req.headers.get("x-read-key")
    return provided == READ_KEY


def _device_authorized(req: Request) -> bool:
    """True if the request carries an approved (device_id, code) pair."""
    device_id = req.query_params.get("device_id") or req.headers.get("x-device-id")
    code = req.query_params.get("code") or req.headers.get("x-device-code")
    if not device_id or not code:
        return False
    dev = _read_codes().get("devices", {}).get(device_id)
    return bool(dev and dev.get("status") == "approved" and dev.get("code") == code)


@app.post("/request-access")
async def request_access(req: Request):
    """Create (or return) a pending access request for a device.
    Body: {device_id, name}. The code is NEVER returned here."""
    body = await req.json()
    device_id = str(body.get("device_id") or "")[:100]
    name = str(body.get("name") or "")[:100]
    if not device_id:
        return {"ok": False, "error": "device_id required"}
    store = _read_codes()
    devices = store.setdefault("devices", {})
    dev = devices.get(device_id)
    if dev and dev.get("status") == "approved":
        return {"ok": True, "status": "approved"}
    if dev and dev.get("status") == "pending":
        if dev.get("emailed"):
            # Code was already emailed once and she is asking again (lost it?).
            # Issue a fresh code so the cron emails the new one.
            dev["code"] = _new_code()
            dev["emailed"] = False
            dev["failed_attempts"] = 0
            dev["locked_until"] = 0
            _write_codes(store)
        return {"ok": True, "status": "pending"}
    devices[device_id] = {
        "code": _new_code(),
        "name": name,
        "status": "pending",
        "created_at": int(time.time()),
        "approved_at": None,
        "emailed": False,
        "failed_attempts": 0,
        "locked_until": 0,
    }
    _write_codes(store)
    return {"ok": True, "status": "pending"}


@app.post("/verify-code")
async def verify_code(req: Request):
    """Check a code for a device. Body: {device_id, code}.
    Locks the device for 15 minutes after 5 wrong guesses."""
    body = await req.json()
    device_id = str(body.get("device_id") or "")[:100]
    code = str(body.get("code") or "")[:20]
    if not device_id or not code:
        return {"ok": False, "error": "device_id and code required"}
    store = _read_codes()
    dev = store.get("devices", {}).get(device_id)
    if not dev:
        return {"ok": False, "error": "no request for this device"}
    now = int(time.time())
    if dev.get("locked_until", 0) > now:
        return {"ok": False, "error": "locked", "retry_after": dev["locked_until"] - now}
    if dev.get("status") == "approved":
        return {"ok": code == dev.get("code"), "status": "approved"} if code == dev.get("code") else {"ok": False, "error": "wrong code"}
    if code != dev.get("code"):
        dev["failed_attempts"] = dev.get("failed_attempts", 0) + 1
        attempts_left = MAX_FAILED_ATTEMPTS - dev["failed_attempts"]
        if dev["failed_attempts"] >= MAX_FAILED_ATTEMPTS:
            dev["locked_until"] = now + LOCKOUT_SECONDS
            dev["failed_attempts"] = 0
            attempts_left = 0
        _write_codes(store)
        return {"ok": False, "error": "wrong code", "attempts_left": attempts_left}
    dev["status"] = "approved"
    dev["approved_at"] = now
    dev["failed_attempts"] = 0
    _write_codes(store)
    return {"ok": True, "status": "approved"}


@app.get("/pending-requests")
def pending_requests(req: Request):
    """Master-key only: list pending access requests (with their codes)
    so the email cron can send them to Keita."""
    if not _master_ok(req):
        return {"ok": False, "error": "unauthorized"}
    store = _read_codes()
    pending = []
    for device_id, dev in store.get("devices", {}).items():
        if dev.get("status") == "pending":
            pending.append({
                "device_id": device_id,
                "name": dev.get("name", ""),
                "code": dev.get("code", ""),
                "created_at": dev.get("created_at", 0),
                "emailed": dev.get("emailed", False),
            })
    return {"ok": True, "pending": pending}


@app.post("/ack-request")
async def ack_request(req: Request):
    """Master-key only: mark a pending request as emailed (body: {device_id})."""
    if not _master_ok(req):
        return {"ok": False, "error": "unauthorized"}
    body = await req.json()
    device_id = str(body.get("device_id") or "")[:100]
    store = _read_codes()
    dev = store.get("devices", {}).get(device_id)
    if not dev:
        return {"ok": False, "error": "no such device"}
    dev["emailed"] = True
    _write_codes(store)
    return {"ok": True}


@app.post("/hit")
async def hit(req: Request):
    body = await req.json()
    if SITE_KEY and body.get("key") != SITE_KEY:
        return {"ok": False, "error": "bad key"}
    ua = str(body.get("ua") or "")[:300]
    page = str(body.get("page") or "/")[:200]
    ai = _ai_match(ua)
    ev = {
        "kind": "bot" if ai else "visit",
        "page": page,
        "source": _source(str(body.get("referrer") or ""), page),
        "where": str(body.get("tz") or "")[:60],
        "device": _device_family(ua),
        "ua": ua[:120],
    }
    if ai:
        ev.update(ai)
    _append_event(ev)
    return {"ok": True}


@app.post("/log")
async def ingest_log(req: Request):
    """Server-log ingestion for crawlers that never run JS (AI bots etc.).
    Body: {ua, path, ts, source}. Same key check as /hit."""
    body = await req.json()
    if SITE_KEY and body.get("key") != SITE_KEY:
        return {"ok": False, "error": "bad key"}
    ua = str(body.get("ua") or "")[:300]
    ai = _ai_match(ua)
    ev = {
        "kind": "bot" if ai else "visit",
        "page": str(body.get("path") or "/")[:200],
        "source": str(body.get("source") or "server-log")[:60],
        "where": "",
        "device": _device_family(ua),
        "ua": ua[:120],
    }
    if ai:
        ev.update(ai)
    _append_event(ev)
    return {"ok": True}


@app.get("/live")
def live(req: Request):
    # Auth: master read key, OR an approved (device_id, code) pair.
    # (If no READ_KEY is configured the endpoint stays open, as before.)
    if READ_KEY:
        provided = req.query_params.get("key") or req.headers.get("x-read-key")
        if provided != READ_KEY and not _device_authorized(req):
            return {"ok": False, "error": "unauthorized"}
    now = time.time()
    events = _read_events()
    recent = [e for e in events if now - e.get("ts", 0) < 24 * 3600][-100:]
    online = [e for e in recent if now - e.get("ts", 0) < ONLINE_WINDOW]
    # de-duplicate online by (page, device, where) so one tab counts once
    seen, online_now = set(), []
    for e in reversed(online):
        k = (e.get("page"), e.get("device"), e.get("where"))
        if k in seen:
            continue
        seen.add(k)
        online_now.append(e)
    by_page, by_source, by_where, by_device = {}, {}, {}, {}
    for e in recent:
        by_page[e.get("page", "/")] = by_page.get(e.get("page", "/"), 0) + 1
        by_source[e.get("source", "direct")] = by_source.get(e.get("source", "direct"), 0) + 1
        if e.get("where"):
            by_where[e["where"]] = by_where.get(e["where"], 0) + 1
        by_device[e.get("device", "desktop")] = by_device.get(e.get("device", "desktop"), 0) + 1
    bots = [e for e in recent if e.get("kind") == "bot"]
    return {
        "now": int(now),
        "online_now": len(online_now),
        "online": online_now[:20],
        "recent": list(reversed(recent))[:100],
        "total_24h": len(recent),
        "by_page": by_page,
        "by_source": by_source,
        "by_where": by_where,
        "by_device": by_device,
        "bots_24h": len(bots),
        "bots": list(reversed(bots))[:50],
    }


@app.get("/health")
def health():
    return {"ok": True, "events": len(_read_events())}
