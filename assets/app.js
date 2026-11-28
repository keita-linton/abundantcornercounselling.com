(function(){
  // Per-route metadata (titles/descriptions trimmed Nov 27, 2026).
  var PAGES = {
  "home": {
    "path": "/",
    "title": "Online Therapy Canada | Abundant Corner Counselling",
    "canonical": "https://abundantcornercounselling.com/",
    "desc": "Virtual therapy across Canada with Yeukai Tsikira, RP (Qualifying), CCC. Individual, teen 12+ & family therapy and EMDR. Free 15-min consultation."
  },
  "about": {
    "path": "/about",
    "title": "About Yeukai Tsikira, RP (Qualifying), CCC",
    "canonical": "https://abundantcornercounselling.com/about",
    "desc": "Meet Yeukai Tsikira, MA, RP (Qualifying) CRPO 18718 and CCC 11246478, founder of Abundant Corner Counselling. Virtual therapy across Canada."
  },
  "individual": {
    "path": "/individual-therapy",
    "title": "Online Individual Therapy Canada | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/individual-therapy",
    "desc": "Virtual individual therapy across Canada for anxiety, depression, grief and trauma. $120/50 min. Free 15-min consultation. $50/session promo."
  },
  "teen-family": {
    "path": "/teen-and-family-therapy",
    "title": "Teen (12+) & Family Therapy Online | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/teen-and-family-therapy",
    "desc": "Virtual teen therapy for ages 12+ and family therapy across Canada. Family sessions $180/75 min. Free 15-minute consultation."
  },
  "emdr": {
    "path": "/emdr-therapy",
    "title": "Online EMDR Therapy Canada | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/emdr-therapy",
    "desc": "Virtual EMDR therapy across Canada for trauma, PTSD, anxiety and grief. 90-minute sessions, $260. Free 15-minute consultation."
  },
  "fees": {
    "path": "/fees-and-faq",
    "title": "Therapy Fees: $120 Individual, $260 EMDR | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/fees-and-faq",
    "desc": "Therapy costs: free 15-min consultation, individual $120/50 min, family $180/75 min, EMDR $260/90 min. $50/session promo. Receipts for benefits."
  },
  "resources": {
    "path": "/resources",
    "title": "Therapy Resources & Reflections | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/resources",
    "desc": "Reflections on survival mode, EMDR, and grief through life transitions. Virtual therapy across Canada. Crisis lines: 911 and 988."
  },
  "speaking": {
    "path": "/speaking",
    "title": "Mental Health Speaker in Canada | Yeukai Tsikira",
    "canonical": "https://abundantcornercounselling.com/speaking",
    "desc": "Book Yeukai Tsikira for mental health speaking and workshops in Canada. Past engagements across Alberta and Saskatchewan. Fees per event."
  },
  "book": {
    "path": "/book",
    "title": "Book a Free 15-Minute Consultation | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/book",
    "desc": "Book a free 15-minute consultation with Yeukai Tsikira. Virtual therapy across Canada for adults, teens 12+ and families. Same-day bookings."
  },
  "edmonton": {
    "path": "/edmonton-therapy",
    "title": "Therapy in Edmonton | Virtual Counselling | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/edmonton-therapy",
    "desc": "Virtual therapy for Edmonton, Alberta — anxiety, trauma, grief and EMDR with Yeukai Tsikira, RP (Qualifying), CCC. Free 15-minute consultation."
  },
  "saskatoon": {
    "path": "/saskatoon-therapy",
    "title": "Therapy in Saskatoon | Virtual Counselling | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/saskatoon-therapy",
    "desc": "Virtual therapy for Saskatoon, Saskatchewan — anxiety, trauma, grief and EMDR with Yeukai Tsikira, RP (Qualifying), CCC. Free 15-minute consultation."
  },
  "prince-albert": {
    "path": "/prince-albert-therapy",
    "title": "Therapy in Prince Albert | Virtual Counselling",
    "canonical": "https://abundantcornercounselling.com/prince-albert-therapy",
    "desc": "Virtual therapy for Prince Albert, Saskatchewan — anxiety, trauma, grief and EMDR with Yeukai Tsikira, RP (Qualifying), CCC. Free 15-minute consultation."
  },
  "toronto": {
    "path": "/toronto-therapy",
    "title": "Therapy in Toronto | Virtual Counselling | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/toronto-therapy",
    "desc": "Virtual therapy for Toronto, Ontario — anxiety, trauma, grief and EMDR with Yeukai Tsikira, RP (Qualifying), CCC. Free 15-minute consultation."
  },
  "emdr-edmonton": {
    "path": "/emdr-edmonton",
    "title": "EMDR in Edmonton | Trauma Therapy | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/emdr-edmonton",
    "desc": "EMDR therapy for Edmonton, Alberta — virtual trauma and PTSD treatment with Yeukai Tsikira, RP (Qualifying), CCC. Free 15-minute consultation."
  },
  "emdr-saskatoon": {
    "path": "/emdr-saskatoon",
    "title": "EMDR in Saskatoon | Trauma Therapy | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/emdr-saskatoon",
    "desc": "EMDR therapy for Saskatoon, Saskatchewan — virtual trauma and PTSD treatment with Yeukai Tsikira, RP (Qualifying), CCC. Free 15-minute consultation."
  },
  "emdr-prince-albert": {
    "path": "/emdr-prince-albert",
    "title": "EMDR in Prince Albert | Trauma Therapy | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/emdr-prince-albert",
    "desc": "EMDR therapy for Prince Albert, Saskatchewan — virtual trauma and PTSD treatment with Yeukai Tsikira, RP (Qualifying), CCC. Free 15-minute consultation."
  },
  "emdr-toronto": {
    "path": "/emdr-toronto",
    "title": "EMDR in Toronto | Trauma Therapy | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/emdr-toronto",
    "desc": "EMDR therapy for Toronto, Ontario — virtual trauma and PTSD treatment with Yeukai Tsikira, RP (Qualifying), CCC. Free 15-minute consultation."
  },
  "fr": {
    "path": "/fr",
    "title": "Thérapie en ligne au Canada | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/fr",
    "desc": "Thérapie en français partout au Canada avec Yeukai Tsikira, psychothérapeute autorisée (qualifiante). Guérison à la racine. Consultation gratuite.",
    "lang": "fr"
  },
  "therapie-individuelle": {
    "path": "/therapie-individuelle",
    "title": "Thérapie individuelle en ligne au Canada",
    "canonical": "https://abundantcornercounselling.com/therapie-individuelle",
    "desc": "Thérapie individuelle en ligne au Canada avec Yeukai Tsikira, psychothérapeute autorisée (qualifiante). Guérison à la racine, 120 $/séance.",
    "lang": "fr"
  },
  "therapie-ados-famille": {
    "path": "/therapie-ados-famille",
    "title": "Thérapie pour ados et familles en ligne",
    "canonical": "https://abundantcornercounselling.com/therapie-ados-famille",
    "desc": "Thérapie pour adolescents de 12 ans et plus et thérapie familiale en ligne au Canada, avec Yeukai Tsikira. Guérison à la racine. Consultation gratuite.",
    "lang": "fr"
  },
  "emdr-francais": {
    "path": "/emdr-francais",
    "title": "EMDR en français en ligne au Canada",
    "canonical": "https://abundantcornercounselling.com/emdr-francais",
    "desc": "EMDR en français en ligne au Canada avec Yeukai Tsikira, psychothérapeute formée en EMDR. Approche fondée sur des données probantes. Consultation gratuite.",
    "lang": "fr"
  },
  "tarifs": {
    "path": "/tarifs",
    "title": "Tarifs de thérapie en ligne | Abundant Corner",
    "canonical": "https://abundantcornercounselling.com/tarifs",
    "desc": "Tarifs de thérapie en ligne au Canada : individuelle 120 $, familiale 180 $, EMDR 260 $. Consultation gratuite de 15 minutes. Reçus fournis.",
    "lang": "fr"
  },
  "privacy": {
    "path": "/privacy",
    "title": "Privacy Policy | Abundant Corner Counselling",
    "canonical": "https://abundantcornercounselling.com/privacy",
    "desc": "How Abundant Corner Counselling collects, uses and protects your personal information, including the contact form, JaneApp booking, and your rights."
  },
  "terms": {
    "path": "/terms",
    "title": "Terms of Use | Abundant Corner Counselling",
    "canonical": "https://abundantcornercounselling.com/terms",
    "desc": "Terms for using the Abundant Corner Counselling website and booking virtual therapy: services, fees, payment, cancellations and confidentiality."
  }
};
  var HASHMAP = {"":"home","/":"home","/about":"about","/individual-therapy":"individual","/teen-family":"teen-family","/teen-and-family-therapy":"teen-family","/emdr":"emdr","/emdr-therapy":"emdr","/fees":"fees","/fees-and-faq":"fees","/resources":"resources","/speaking":"speaking","/book":"book","/edmonton-therapy":"edmonton","/edmonton":"edmonton","/saskatoon-therapy":"saskatoon","/saskatoon":"saskatoon","/prince-albert-therapy":"prince-albert","/prince-albert":"prince-albert","/toronto-therapy":"toronto","/toronto":"toronto","/emdr-edmonton":"emdr-edmonton","/emdr-saskatoon":"emdr-saskatoon","/emdr-prince-albert":"emdr-prince-albert","/emdr-toronto":"emdr-toronto","/fr":"fr","/therapie-individuelle":"therapie-individuelle","/therapie-ados-famille":"therapie-ados-famille","/emdr-francais":"emdr-francais","/tarifs":"tarifs","/privacy":"privacy","/terms":"terms"};
  var PATH_TO_KEY = {};
  Object.keys(PAGES).forEach(function(k){ PATH_TO_KEY[PAGES[k].path] = k; });
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-page]"));
  var singlePage = sections.length === 1;
  var titleEl = document.getElementById("pageTitle");
  var descEl = document.getElementById("metaDesc");
  var canonEl = document.getElementById("canonicalLink");
  var ogT = document.getElementById("ogTitle"), ogD = document.getElementById("ogDesc"), ogU = document.getElementById("ogUrl");
  var twT = document.getElementById("twTitle"), twD = document.getElementById("twDesc");
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-route]"));
  var menuBtn = document.getElementById("menuBtn");
  var siteLinks = document.getElementById("siteLinks");
  var servicesDropdown = document.getElementById("servicesDropdown");
  var servicesBtn = document.getElementById("servicesBtn");
  var SERVICE_ROUTES = { "individual": true, "teen-family": true, "emdr": true };
  function setServicesOpen(open){
    if (!servicesDropdown || !servicesBtn) return;
    servicesDropdown.classList.toggle("open", !!open);
    servicesBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function closeServices(){ setServicesOpen(false); }
  if (servicesBtn && servicesDropdown){
    servicesBtn.addEventListener("click", function(e){
      e.stopPropagation();
      setServicesOpen(!servicesDropdown.classList.contains("open"));
    });
    servicesDropdown.addEventListener("mouseenter", function(){
      if (window.innerWidth > 900) setServicesOpen(true);
    });
    servicesDropdown.addEventListener("mouseleave", function(){
      if (window.innerWidth > 900) setServicesOpen(false);
    });
    document.addEventListener("click", function(e){
      if (!servicesDropdown.contains(e.target)) closeServices();
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && servicesDropdown.classList.contains("open")){
        closeServices();
        servicesBtn.focus();
      }
    });
  }
  if (menuBtn) menuBtn.addEventListener("click", function(){
    var open = siteLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open) closeServices();
  });
  function setMeta(key){
    var meta = PAGES[key];
    if (!meta) return;
    document.title = meta.title; if (titleEl) titleEl.textContent = meta.title;
    if (descEl) descEl.setAttribute("content", meta.desc);
    if (canonEl) canonEl.setAttribute("href", meta.canonical);
    if (ogT) ogT.setAttribute("content", meta.title);
    if (ogD) ogD.setAttribute("content", meta.desc);
    if (ogU) ogU.setAttribute("content", meta.canonical);
    if (twT) twT.setAttribute("content", meta.title);
    if (twD) twD.setAttribute("content", meta.desc);
    document.documentElement.lang = meta.lang || "en";
    links.forEach(function(a){ if (a.getAttribute("data-route") === key) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
    if (servicesBtn){
      if (SERVICE_ROUTES[key]){ servicesBtn.classList.add("has-active"); servicesBtn.setAttribute("aria-current","page"); }
      else { servicesBtn.classList.remove("has-active"); servicesBtn.removeAttribute("aria-current"); }
    }
  }
  function firePageView(path){
    if (typeof gtag === "function") { gtag("event", "page_view", {page_title: document.title, page_path: path}); }
  }
  function showSection(key){
    sections.forEach(function(s){ s.classList.toggle("active", s.getAttribute("data-page") === key); });
  }
  function routeFromHash(){
    var h = (location.hash || "#/").replace(/^#/, "");
    if (h.charAt(0) !== "/") h = "/" + h;
    return HASHMAP[h] || "home";
  }
  // --- initial load ---
  var currentKey;
  if (singlePage){
    // Prerendered sub-page: the server already shows the right section. Do not hide it.
    currentKey = sections[0].getAttribute("data-page");
    setMeta(currentKey);
    firePageView(location.pathname);
    // A hash deep-link to another SPA route navigates to its clean URL.
    window.addEventListener("hashchange", function(){
      var k = routeFromHash();
      if (k !== currentKey && PAGES[k]) { window.location.assign(PAGES[k].path); }
    });
  } else {
    // Root SPA (all 24 sections present): hash routing as before.
    currentKey = routeFromHash();
    showSection(currentKey);
    setMeta(currentKey);
    firePageView(location.pathname + location.hash);
    window.addEventListener("hashchange", function(){
      currentKey = routeFromHash();
      showSection(currentKey);
      setMeta(currentKey);
      closeServices();
      if (siteLinks) siteLinks.classList.remove("open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded","false");
      window.scrollTo(0,0);
      firePageView(location.pathname + location.hash);
    });
    window.addEventListener("popstate", function(){
      var k = PATH_TO_KEY[location.pathname] || routeFromHash();
      if (k && document.querySelector('[data-page="' + k + '"]')){
        currentKey = k;
        showSection(k);
        setMeta(k);
        window.scrollTo(0,0);
        firePageView(location.pathname);
      } else if (k && PAGES[k]) {
        window.location.assign(PAGES[k].path);
      }
    });
    // Intercept in-SPA nav clicks: swap if the section exists here, else navigate normally.
    document.addEventListener("click", function(e){
      var a = e.target.closest ? e.target.closest("a[data-nav]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "/") return;
      var k = PATH_TO_KEY[href];
      if (!k || !document.querySelector('[data-page="' + k + '"]')) return; // let the browser navigate
      e.preventDefault();
      if (k === currentKey) { window.scrollTo(0,0); return; }
      currentKey = k;
      showSection(k);
      setMeta(k);
      closeServices();
      if (siteLinks) siteLinks.classList.remove("open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded","false");
      try { history.pushState(null, "", PAGES[k].path); } catch(err){}
      window.scrollTo(0,0);
      firePageView(PAGES[k].path);
    });
  }
  document.addEventListener("click", function(e){
    var t = e.target.closest ? e.target.closest("[data-scroll]") : null;
    if (!t) return;
    var id = t.getAttribute("data-scroll");
    window.setTimeout(function(){
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
    }, 60);
  });
  // French-language banner (was a separate inline script; links now use clean URLs).
  try {
    if (!localStorage.getItem("acc-lang")){
      var lang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
      if (lang.indexOf("fr") === 0){
        var p = location.pathname.toLowerCase();
        var onFr = p === "/fr" || p.indexOf("therapie") !== -1 || p.indexOf("emdr-francais") !== -1 || p.indexOf("tarifs") !== -1;
        if (!onFr){
          var bar = document.createElement("div");
          bar.setAttribute("role", "dialog");
          bar.setAttribute("aria-label", "Version française disponible");
          bar.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#1f2a33;color:#fff;border-radius:12px;padding:14px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;font-family:inherit;box-shadow:0 8px 30px rgba(0,0,0,.25)";
          bar.innerHTML = '<span>Ce site est aussi disponible en français. Yeukai offre ses services en français et en anglais.</span><span style="display:flex;gap:8px"><a href="/fr" id="acc-fr-go" style="background:#e8b64c;color:#1f2a33;font-weight:700;border-radius:8px;padding:9px 14px;text-decoration:none">Voir en français</a><button id="acc-fr-stay" type="button" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:8px;padding:9px 14px;cursor:pointer">Rester en anglais</button></span>';
          document.body.appendChild(bar);
          document.getElementById("acc-fr-go").addEventListener("click", function(){ try { localStorage.setItem("acc-lang", "fr"); } catch(e){} });
          document.getElementById("acc-fr-stay").addEventListener("click", function(){ try { localStorage.setItem("acc-lang", "en"); } catch(e){} bar.remove(); });
        }
      }
    }
  } catch(e) {}
})();

/* --- Abundant Corner live-traffic beacon (Nov 28, 2026) ---
   Reports an anonymous pageview + a heartbeat every 30 s while the tab is
   open, so the traffic dashboard can show who is on the site right now.
   No cookies, no personal data, no IP stored. Endpoint: abundant-traffic. */
(function(){
  var EP = "https://abundant-traffic.fly.dev/hit";
  var KEY = "258kL7yo5KeaBz4N5RHLxwcxFvlaNCY3";
  function payload(){
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch(e){}
    return JSON.stringify({
      key: KEY,
      page: location.pathname,
      referrer: document.referrer || "",
      ua: navigator.userAgent || "",
      screen: (screen.width || 0) + "x" + (screen.height || 0),
      tz: tz
    });
  }
  function send(){
    try {
      if (navigator.sendBeacon) { navigator.sendBeacon(EP, payload()); return; }
    } catch(e){}
    try {
      fetch(EP, {method:"POST", headers:{"Content-Type":"application/json"}, body: payload(), keepalive:true}).catch(function(){});
    } catch(e){}
  }
  send();
  setInterval(function(){ if (!document.hidden) send(); }, 30000);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) send(); });
})();
