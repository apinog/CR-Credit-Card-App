/**
 * ui/map.js — interactive Amex acceptance choropleth of Costa Rica.
 * Real province geometry (see data/mapPaths.data.js). Hover → tooltip;
 * click/tap → detail panel (bottom sheet on mobile, side panel on desktop).
 */
window.CRW = window.CRW || {};
CRW.ui = CRW.ui || {};

CRW.ui.map = (() => {
  const { el, esc, acceptanceScale, $ } = CRW.utils;
  const SVG_NS = "http://www.w3.org/2000/svg";

  let panelEl = null;
  let svgEl = null;
  let selectedId = null;

  function provinceData(id) {
    return {
      meta: window.CRW_DATA.provinces.find((p) => p.id === id),
      acc: window.CRW_DATA.amexAcceptance.provinces[id]
    };
  }

  /* ---------- SVG ---------- */
  function buildSVG(tooltip) {
    const { viewBox, provinces } = window.CRW_DATA.mapPaths;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("role", "group");
    svg.setAttribute("aria-label", "Costa Rica Amex acceptance map. Select a province for details.");

    for (const p of provinces) {
      const { acc, meta } = provinceData(p.id);
      const scale = acceptanceScale(acc.overall);
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", p.d);
      path.setAttribute("fill", scale.color);
      path.setAttribute("class", "province");
      path.setAttribute("data-id", p.id);
      path.setAttribute("tabindex", "0");
      path.setAttribute("role", "button");
      path.setAttribute("aria-label", `${meta.name}: ${scale.label} acceptance, ${acc.overall}%`);

      path.addEventListener("pointerenter", (e) => showTooltip(tooltip, e, p.id));
      path.addEventListener("pointermove", (e) => moveTooltip(tooltip, e));
      path.addEventListener("pointerleave", () => tooltip.classList.remove("show"));
      path.addEventListener("click", () => select(p.id));
      path.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(p.id); }
      });
      svg.appendChild(path);
    }

    // labels on top
    for (const meta of window.CRW_DATA.provinces) {
      const t = document.createElementNS(SVG_NS, "text");
      t.setAttribute("x", meta.labelAt[0]);
      t.setAttribute("y", meta.labelAt[1]);
      t.setAttribute("class", "prov-label");
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", "26");
      t.textContent = meta.name;
      svg.appendChild(t);
    }
    return svg;
  }

  function showTooltip(tooltip, e, id) {
    const { meta, acc } = provinceData(id);
    const scale = acceptanceScale(acc.overall);
    tooltip.innerHTML =
      `<div class="tt-name">${esc(meta.name)}</div>` +
      `<div class="tt-row"><span class="dot" style="background:${scale.color}"></span>` +
      `${scale.label} · ~${acc.overall}% overall</div>` +
      `<div class="tt-row faint">tap for category detail</div>`;
    tooltip.classList.add("show");
    moveTooltip(tooltip, e);
  }

  function moveTooltip(tooltip, e) {
    const wrap = tooltip.parentElement.getBoundingClientRect();
    const x = Math.min(e.clientX - wrap.left + 14, wrap.width - tooltip.offsetWidth - 8);
    const y = e.clientY - wrap.top - tooltip.offsetHeight - 10;
    tooltip.style.left = Math.max(4, x) + "px";
    tooltip.style.top = Math.max(4, y) + "px";
  }

  /* ---------- Detail panel ---------- */
  function select(id) {
    selectedId = id;
    svgEl.parentElement.parentElement.classList.add("map-dimmed");
    CRW.utils.$$(".province", svgEl).forEach((p) =>
      p.classList.toggle("selected", p.dataset.id === id));
    renderPanel(id);
    panelEl.classList.add("open");
    if (window.innerWidth < 920) $("#panel-backdrop").classList.add("show");
    $(".prov-panel-placeholder")?.style.setProperty("display", "none");
  }

  function closePanel() {
    if (!panelEl || !svgEl) return;
    panelEl.classList.remove("open");
    $("#panel-backdrop").classList.remove("show");
    svgEl?.parentElement.parentElement.classList.remove("map-dimmed");
    CRW.utils.$$(".province", svgEl).forEach((p) => p.classList.remove("selected"));
    if (window.innerWidth >= 920) $(".prov-panel-placeholder")?.style.removeProperty("display");
    selectedId = null;
  }

  function accRow(label, pct, icon) {
    const scale = acceptanceScale(pct);
    return el("div", { class: "acc-row" },
      el("div", { class: "lbl" }, icon ? `${icon} ${label}` : label),
      el("div", { class: "pct" }, pct + "%"),
      el("div", { class: "acc-bar" },
        el("i", { style: `width:${pct}%;background:${scale.color}` }))
    );
  }

  function renderPanel(id) {
    const { meta, acc } = provinceData(id);
    const scale = acceptanceScale(acc.overall);
    const cats = window.CRW_DATA.merchantCategories;
    const extras = window.CRW_DATA.amexAcceptance.extraPanelRows;

    panelEl.innerHTML = "";
    panelEl.append(
      el("div", { class: "grab" }),
      el("div", { class: "pp-head" },
        el("div", { style: "flex:1" },
          el("h2", {}, meta.name),
          el("div", { class: "faint" }, `Capital: ${meta.capital}`)),
        el("div", { class: "pp-score" },
          el("div", { class: "pct", style: `color:${scale.color}` }, acc.overall + "%"),
          el("div", { class: "lbl" }, scale.label)),
        el("button", { class: "icon-btn", "aria-label": "Close panel", onclick: closePanel }, "✕")),
      el("div", { class: "pp-meta" },
        el("span", { class: `badge conf-${acc.confidence}` }, `confidence: ${acc.confidence}`),
        el("span", { class: "badge" }, `updated ${acc.lastUpdated}`),
        el("span", { class: "badge est" }, "estimate")),
      el("p", { class: "pp-notes" }, acc.notes),
      el("h3", { style: "margin:6px 0 4px" }, "Estimated Amex acceptance by category"),
      ...cats.filter((c) => acc.categories[c.id] != null)
        .sort((a, b) => acc.categories[b.id] - acc.categories[a.id])
        .map((c) => accRow(c.label, acc.categories[c.id], c.icon)),
      el("h3", { style: "margin:14px 0 4px" }, "Informal commerce"),
      ...extras.filter((x) => acc.categories[x.id] != null)
        .map((x) => accRow(x.label, acc.categories[x.id])),
      el("p", { class: "faint", style: "margin-top:14px" },
        "Personal estimates from urbanization, tourism, merchant mix and BAC/Amex footprint — not official statistics. Edit data/amexAcceptance.data.js.")
    );
  }

  /* ---------- View ---------- */
  function render(root) {
    root.innerHTML = "";
    const tooltip = el("div", { class: "map-tooltip", role: "tooltip" });
    svgEl = buildSVG(tooltip);

    const legend = el("div", { class: "map-legend" },
      window.CRW_DATA.amexAcceptance.scale.map((s) =>
        el("div", { class: "lg" }, el("span", { class: "sw", style: `background:${s.color}` }), s.label)));

    panelEl = el("aside", { class: "prov-panel", "aria-label": "Province acceptance detail" });

    root.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "Acceptance"),
        el("h1", {}, "Amex acceptance map"),
        el("p", { class: "sub" }, "Estimated American Express acceptance by province. Tap a province.")),
      el("div", { class: "map-layout" },
        el("div", { class: "map-wrap" },
          el("div", { class: "map-frame" }, svgEl, tooltip),
          legend,
          el("p", { class: "faint map-disclaimer" },
            "⚠️ Estimates, not official data — built from urbanization, tourism intensity, merchant size mix and known Amex/BAC penetration.")),
        el("div", {},
          el("div", { class: "prov-panel-placeholder" },
            "Select a province on the map to see estimated acceptance by merchant category."),
          panelEl))
    );

    $("#panel-backdrop").onclick = closePanel;
  }

  return { render, closePanel };
})();
