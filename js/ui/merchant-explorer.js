/**
 * ui/merchant-explorer.js — browse merchants by category, see best card + acceptance.
 */
window.CRW = window.CRW || {};
CRW.ui = CRW.ui || {};

CRW.ui.merchantExplorer = (() => {
  const { el, esc, fmtUSD, fmtCRC, fxPill } = CRW.utils;

  let activeCategory = null;
  let searchQuery = "";
  let root = null;
  let listBox = null;

  function categoryTabs() {
    const cats = window.CRW_DATA.merchantCategories;
    // Only show categories that have at least one merchant
    const usedCats = new Set(window.CRW_DATA.merchants.map((m) => m.category));
    const filtered = cats.filter((c) => usedCats.has(c.id));

    const wrap = el("div", { class: "cat-tabs" });
    const allBtn = el("button", {
      class: "cat-tab" + (!activeCategory ? " active" : ""),
      onclick: () => { activeCategory = null; refresh(); }
    }, "All");
    wrap.append(allBtn);
    filtered.forEach((c) => {
      const btn = el("button", {
        class: "cat-tab" + (activeCategory === c.id ? " active" : ""),
        onclick: () => { activeCategory = c.id; refresh(); }
      }, `${c.icon} ${c.label}`);
      wrap.append(btn);
    });
    return wrap;
  }

  function searchBar() {
    const input = el("input", {
      type: "search", class: "search-input",
      placeholder: "Search merchants…",
      value: searchQuery,
      "aria-label": "Search merchants"
    });
    input.addEventListener("input", (e) => { searchQuery = e.target.value; refresh(); });
    return el("div", { class: "search-wrap" }, input);
  }

  function merchantCard(merchant) {
    const D = window.CRW_DATA;
    const cat = D.merchantCategories.find((c) => c.id === merchant.category);
    const mode = CRW.state.get("displayMode") || "USD";

    // Get best card for this merchant (no province context — nationwide)
    const { results, best } = CRW.engine.optimize({
      amount: 10000,
      currency: "CRC",
      categoryId: merchant.category,
      merchantId: merchant.id,
      displayMode: mode
    });

    const accColor = CRW.utils.acceptanceScale(merchant.amexOverride ?? 70).color;

    // Confidence badge color
    const confClass = { high: "conf-high", medium: "conf-medium", low: "conf-low" }[merchant.confidence] || "conf-low";

    // Per-card reward rows for ₡10,000 spend
    const cardRows = results.map((r) => {
      const isBest = r.card.id === best.card.id;
      return el("div", { class: "merch-card-row" + (isBest ? " best-row" : "") },
        el("div", { class: "mini-card sm", style: `background:linear-gradient(135deg,${r.card.art.from},${r.card.art.to})` }),
        el("div", { class: "merch-card-body" },
          el("span", { class: "merch-card-name" }, r.card.name),
          el("span", { class: "merch-card-rate faint" }, r.reward.detail)
        ),
        el("div", { class: "merch-card-val" + (isBest ? " emerald" : "") },
          isBest ? "🏆 " : "",
          r.reward.display
        )
      );
    });

    return el("div", { class: "panel merchant-card" },
      // Header row
      el("div", { class: "merch-header" },
        el("div", { class: "merch-info" },
          el("div", { class: "merch-name" }, esc(merchant.name)),
          el("div", { class: "merch-cat faint" }, cat ? `${cat.icon} ${cat.label}` : merchant.category)
        ),
        el("div", { class: "merch-acc" },
          merchant.amexOverride != null
            ? [
                el("div", { class: "amex-dot", style: `background:${accColor}` }),
                el("div", { class: "merch-acc-pct" }, `Amex ${merchant.amexOverride}%`),
                el("span", { class: `badge ${confClass}`, style: "font-size:.65rem" }, merchant.confidence)
              ]
            : el("span", { class: "faint" }, "Visa/MC only")
        )
      ),
      // Notes
      merchant.notes ? el("p", { class: "faint", style: "font-size:.8rem;margin:6px 0 10px" }, merchant.notes) : null,
      // Per ₡10,000 label
      el("div", { class: "faint", style: "font-size:.75rem;margin-bottom:6px" }, "Reward on ₡10,000 purchase:"),
      // Card rows
      el("div", { class: "merch-cards-list" }, ...cardRows),
      // Quick optimize button
      el("button", {
        class: "btn-ghost", style: "margin-top:10px;font-size:.8rem",
        onclick: () => {
          CRW.router.go("optimizer");
          // Pre-fill category after short delay for render
          setTimeout(() => {
            const catSel = document.getElementById("opt-category");
            const merchSel = document.getElementById("opt-merchant");
            if (catSel) catSel.value = merchant.category;
            if (catSel) catSel.dispatchEvent(new Event("change"));
            if (merchSel) {
              setTimeout(() => { if (merchSel) merchSel.value = merchant.id; }, 50);
            }
          }, 100);
        }
      }, "Optimize a purchase here →")
    );
  }

  function refresh() {
    if (!listBox) return;
    listBox.innerHTML = "";
    // Re-render tabs to update active state
    const tabsEl = root.querySelector(".cat-tabs");
    if (tabsEl) tabsEl.replaceWith(categoryTabs());

    const merchants = window.CRW_DATA.merchants.filter((m) => {
      const matchCat = !activeCategory || m.category === activeCategory;
      const matchQ = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQ;
    });

    if (merchants.length === 0) {
      listBox.append(el("div", { class: "empty" }, "No merchants match your search."));
      return;
    }

    merchants.forEach((m) => listBox.append(merchantCard(m)));
  }

  function render(r) {
    root = r;
    root.innerHTML = "";
    activeCategory = null;
    searchQuery = "";
    listBox = el("div", { class: "merchant-list" });

    root.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "Explorer"),
        el("h1", {}, "Merchant Explorer"),
        el("p", { class: "sub" }, "See the best card and Amex acceptance for known merchants."),
        fxPill()
      ),
      searchBar(),
      categoryTabs(),
      listBox
    );

    refresh();
  }

  return { render };
})();
