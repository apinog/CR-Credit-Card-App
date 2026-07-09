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
    more: () => renderMore($("#view-more"))
  };

  CRW.router = {
    go(view) {
      if (!views[view]) view = "dashboard";
      $$(".view").forEach((v) => v.classList.remove("active"));
      $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
      views[view]();
      $(`#view-${view}`).classList.add("active");
      if (location.hash !== "#" + view) history.replaceState(null, "", "#" + view);
      window.scrollTo({ top: 0 });
      CRW.ui.map?.closePanel?.();
    }
  };

  /* ---------- "More" view ---------- */
  function renderMore(root) {
    root.innerHTML = "";
    const items = [
      { ic: "📚", t: "Knowledge Base", d: "Searchable guide: reward rules, caps, expiration, BAC & Promerica specifics, Amex tips.", phase: "Phase 3" }
    ];
    root.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "More"),
        el("h1", {}, "More"),
        el("p", { class: "sub" }, "Additional modules.")),
      el("div", { class: "grid cols-2" },
        items.map((i) =>
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
