/**
 * app.js — bootstrap: FX init, router, theme, PWA registration.
 */
window.CRW = window.CRW || {};

(() => {
  const { el, $, $$ } = CRW.utils;

  /* ---------- Router ---------- */
  const views = {
    dashboard: () => CRW.ui.dashboard.render($("#view-dashboard")),
    cards: () => CRW.ui.cards.render($("#view-cards")),
    optimizer: () => CRW.ui.optimizer.render($("#view-optimizer")),
    map: () => CRW.ui.map.render($("#view-map")),
    merchants: () => CRW.ui.merchantExplorer.render($("#view-merchants")),
    compare: () => CRW.ui.cardComparison.render($("#view-compare")),
    more: () => renderMore($("#view-more"))
  };

  // Sub-views that have a back button (not in bottom nav)
  const subViews = new Set(["merchants", "compare"]);

  CRW.router = {
    _prev: "dashboard",
    go(view) {
      if (!views[view]) view = "dashboard";
      const prev = CRW.router._prev;
      if (!subViews.has(view)) CRW.router._prev = view;

      $$(".view").forEach((v) => v.classList.remove("active"));
      // Only highlight nav for top-level views
      $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));

      views[view]();

      const viewEl = $(`#view-${view}`);
      viewEl.classList.add("active");

      // Scroll to top — use the view element itself for sub-views
      viewEl.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "instant" });

      if (location.hash !== "#" + view) history.replaceState(null, "", "#" + view);
      CRW.ui.map?.closePanel?.();

      // Back button: show for sub-views
      const backBtn = $("#back-btn");
      if (backBtn) {
        if (subViews.has(view)) {
          backBtn.style.display = "";
          backBtn.onclick = () => CRW.router.go(prev || "more");
        } else {
          backBtn.style.display = "none";
        }
      }
    }
  };

  /* ---------- "More" view ---------- */
  function renderMore(root) {
    root.innerHTML = "";
    const live = [
      { ic: "🧭", t: "Merchant Explorer", d: "Browse merchants by category — best card and Amex acceptance at a glance.", view: "merchants" },
      { ic: "⚔️", t: "Card Comparison", d: "Side-by-side scoring across rewards, acceptance, categories and perks.", view: "compare" }
    ];
    const coming = [
      { ic: "📚", t: "Knowledge Base", d: "Searchable guide: reward rules, caps, expiration, BAC & Promerica specifics, Amex tips.", phase: "Phase 3" }
    ];
    root.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "More"),
        el("h1", {}, "More"),
        el("p", { class: "sub" }, "Additional tools for your wallet.")),
      el("div", { class: "grid cols-2" },
        live.map((i) =>
          el("div", { class: "panel more-card", onclick: () => CRW.router.go(i.view), style: "cursor:pointer" },
            el("div", { class: "ph-ic" }, i.ic),
            el("h3", {}, i.t),
            el("p", {}, i.d),
            el("span", { class: "btn-ghost", style: "margin-top:12px;display:inline-block" }, "Open →")))),
      el("h2", { style: "margin:24px 0 12px" }, "Coming soon"),
      el("div", { class: "grid cols-2" },
        coming.map((i) =>
          el("div", { class: "coming" },
            el("div", { class: "ph-ic" }, i.ic),
            el("h3", {}, i.t),
            el("p", {}, i.d),
            el("span", { class: "badge phase" }, i.phase))))
    );
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    CRW.state.set("theme", theme);
    const icon = theme === "dark" ? "🌙" : "☀️";
    const tt = $("#theme-toggle"), td = $("#theme-toggle-desktop");
    if (tt) tt.textContent = icon;
    if (td) td.textContent = icon;
    $('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#0c1116" : "#f4f4ef");
  }
  function toggleTheme() {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    applyTheme(CRW.state.get("theme") || "dark");
    $("#theme-toggle")?.addEventListener("click", toggleTheme);
    $("#theme-toggle-desktop")?.addEventListener("click", toggleTheme);
    $$(".nav-btn").forEach((b) => b.addEventListener("click", () => CRW.router.go(b.dataset.view)));

    // Fetch live FX rate before first render (non-blocking — falls back gracefully)
    await CRW.fx.init();

    const initial = (location.hash || "#dashboard").slice(1);
    CRW.router.go(initial);

    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  });
})();
