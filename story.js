/* Light behaviour: progress bar, reveal on scroll, timeline tooltips and highlighting, filters. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const printMode = /[?&]print/.test(location.search);
  if (printMode) { $$("details").forEach(d => (d.open = true)); document.documentElement.classList.remove("js"); }
  addEventListener("beforeprint", () => $$("details").forEach(d => (d.open = true)));

  /* progress + header border */
  const bar = $("#bar"), top = $(".top");
  const onScroll = () => {
    const h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.width = (p * 100).toFixed(1) + "%"; top.classList.toggle("scrolled", h.scrollTop > 10);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* reveal */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach(el => rio.observe(el));

  /* nav state */
  const map = { design: "design", timeline: "timeline", work: "work", mongolia: "work", bangladesh: "work", daetox: "work", chronilux: "work", tipping: "work", field: "work", more: "work", all: "all", contact: "contact" };
  const nio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const k = map[e.target.id];
    $$(".top nav a").forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === "#" + k ? "true" : "false"));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id], article[id]").forEach(s => nio.observe(s));

  /* timeline: tooltip, legend highlight */
  const tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip);
  const W = window.WORKS || {}, svg = $(".tl");
  $$(".tl-dot").forEach(d => {
    const t = d.querySelector("title"); const label = t ? t.textContent : ""; if (t) t.remove();
    const [name, when] = label.split(" · ");
    const show = (x, y) => { tip.innerHTML = `${name}<small>${when || ""}</small>`; tip.style.left = Math.min(x + 14, innerWidth - 300) + "px"; tip.style.top = (y + 14) + "px"; tip.classList.add("on"); };
    d.addEventListener("mousemove", e => show(e.clientX, e.clientY));
    d.addEventListener("focus", () => { const r = d.getBoundingClientRect(); show(r.right, r.bottom); });
    d.addEventListener("mouseleave", () => tip.classList.remove("on")); d.addEventListener("blur", () => tip.classList.remove("on"));
  });
  $$(".legend a").forEach(a => {
    const c = a.getAttribute("href").slice(1);
    const on = () => { svg.classList.add("focus"); $$(".tl-dot").forEach(d => d.classList.toggle("hi", d.dataset.case === c)); };
    const off = () => svg.classList.remove("focus");
    a.addEventListener("mouseenter", on); a.addEventListener("focus", on); a.addEventListener("mouseleave", off); a.addEventListener("blur", off);
  });

  /* filters */
  const rows = $$("table.works tbody tr[data-id]");
  $("#filters") && $("#filters").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#filters button").forEach(x => x.setAttribute("aria-pressed", x === b));
    if (b.dataset.f === "all") return rows.forEach(r => (r.hidden = false));
    const [k, v] = b.dataset.f.split(":"); rows.forEach(r => (r.hidden = r.dataset[k] !== v));
  });
})();

/* goal filter: highlights the dots built for one goal; choose again or "Show all" to reset */
(function () {
  const box = document.querySelector(".timeline-wrap .aims"); if (!box) return;
  const svg = document.querySelector(".tl"), out = document.getElementById("aim-count"), clear = document.getElementById("aim-clear");
  const dots = [...document.querySelectorAll(".tl-dot")], btns = [...box.querySelectorAll("button[data-aim]")];
  let active = "all";
  const set = a => {
    active = a;
    btns.forEach(x => x.setAttribute("aria-pressed", x.dataset.aim === a));
    if (a === "all") { svg.classList.remove("aiming"); dots.forEach(d => d.classList.remove("match")); out.textContent = ""; clear.hidden = true; return; }
    let n = 0;
    dots.forEach(d => { const m = (d.dataset.aims || "").split(" ").includes(a); d.classList.toggle("match", m); if (m) n++; });
    svg.classList.add("aiming");
    out.textContent = n + " of " + dots.length + " games and tools built for this goal";
    clear.hidden = false;
  };
  btns.forEach(b => b.addEventListener("click", () => set(b.dataset.aim === active ? "all" : b.dataset.aim)));
  clear.addEventListener("click", () => set("all"));
})();

/* opening the full list when someone goes to it */
(function () {
  const d = document.getElementById("all-details"); if (!d) return;
  const open = () => { if (location.hash === "#all") d.open = true; };
  addEventListener("hashchange", open); open();
  document.querySelectorAll('a[href="#all"]').forEach(a => a.addEventListener("click", () => (d.open = true)));
})();

/* Try it: aim → what to build in, what players then do, where to see it */
(function () {
  const t = document.getElementById("tryit"); if (!t) return;
  const tabs = [...t.querySelectorAll("[role=tab]")], panels = [...t.querySelectorAll(".try-panel")];
  const pick = k => { tabs.forEach(b => b.setAttribute("aria-selected", b.dataset.k === k)); panels.forEach(p => p.classList.toggle("on", p.dataset.k === k)); };
  tabs.forEach((b, i) => {
    b.addEventListener("click", () => pick(b.dataset.k));
    b.addEventListener("keydown", e => { if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return; e.preventDefault();
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); pick(n.dataset.k); });
  });
  pick("frame");
})();

/* Given / Made / Kept toggles under each story image */
document.querySelectorAll(".gmk-wrap").forEach(w => {
  const btns = [...w.querySelectorAll("button")], outs = [...w.querySelectorAll(".gmk-out")];
  btns.forEach(b => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    btns.forEach(x => x.setAttribute("aria-expanded", x === b && open));
    outs.forEach(o => o.classList.toggle("on", open && o.dataset.g === b.dataset.g));
  }));
});

/* Timeline dots open a small card. Its link says where it goes; following it never pulls you back. */
(function () {
  const W = window.WORKS || {}, box = document.querySelector(".timeline-wrap .wrap"); if (!box) return;
  const AIM = { tradeoffs: "Money and trade-offs", commons: "Sharing a limited resource", time: "Effects that take time", frame: "Whose view defines the problem", coop: "Working across sectors" };
  const card = document.createElement("div"); card.className = "dotcard"; card.hidden = true; card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "Work details");
  box.appendChild(card);
  let last = null;
  const hide = () => { card.hidden = true; document.querySelectorAll(".tl-dot.sel").forEach(d => d.classList.remove("sel")); };
  const closeAndReturn = () => { hide(); if (last) last.focus({ preventScroll: true }); };
  const flash = el => { if (!el) return; el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2200); };
  document.querySelectorAll(".tl-dot").forEach(d => d.addEventListener("click", e => {
    e.preventDefault(); const w = W[d.dataset.id]; if (!w) return; last = d;
    document.querySelectorAll(".tl-dot.sel").forEach(x => x.classList.remove("sel")); d.classList.add("sel");
    const target = w.case ? "#" + w.case : "#w-" + d.dataset.id;
    const label = w.group === "core" ? "Read the project →" : w.group === "other" || !w.case ? "See it in the full list →" : "Read the short summary →";
    card.innerHTML = `<button class="dc-x" aria-label="Close">×</button><div class="dc-when">${w.when} · ${w.fmt}</div><h4>${w.t}</h4><p>${w.line}</p>
      <div class="dc-tags"><span class="st">${w.st}</span>${(w.aims || "").split(" ").filter(Boolean).map(a => `<span>${AIM[a]}</span>`).join("")}</div><a class="dc-go" href="${target}">${label}</a>`;
    const r = d.getBoundingClientRect(), b = box.getBoundingClientRect();
    card.hidden = false;
    let x = r.left - b.left + r.width / 2 - card.offsetWidth / 2; x = Math.max(0, Math.min(x, b.width - card.offsetWidth));
    card.style.left = x + "px"; card.style.top = (r.bottom - b.top + 10) + "px";
    card.querySelector(".dc-x").addEventListener("click", closeAndReturn);
    card.querySelector(".dc-go").addEventListener("click", ev => {
      ev.preventDefault(); hide();
      if (target.startsWith("#w-")) { const det = document.getElementById("all-details"); if (det) det.open = true; }
      const el = document.querySelector(target); if (!el) return;
      el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: target.startsWith("#w-") || target.includes("-") ? "center" : "start" });
      history.replaceState(null, "", target); flash(el);
    });
    card.querySelector(".dc-go").focus({ preventScroll: true });
  }));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !card.hidden) closeAndReturn(); });
  document.addEventListener("click", e => { if (!card.hidden && !card.contains(e.target) && !e.target.closest(".tl-dot")) hide(); });
})();
