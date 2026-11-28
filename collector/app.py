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
import time
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

DATA = Path(os.environ.get("AC_DATA", "/data"))
DATA.mkdir(parents=True, exist_ok=True)
EVENTS = DATA / "events.jsonl"
SITE_KEY = os.environ.get("AC_SITE_KEY", "")
READ_KEY = os.environ.get("AC_READ_KEY", "")  # private read key for GET /live; only the dashboard knows it (never in site JS)

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
    if READ_KEY:
        provided = req.query_params.get("key") or req.headers.get("x-read-key")
        if provided != READ_KEY:
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
