/**
 * ui/optimizer.js — Phase 2: live FX, CRC/USD toggle, Premia miles in CRC.
 */
window.CRW = window.CRW || {};
CRW.ui = CRW.ui || {};

CRW.ui.optimizer = (() => {
  const { el, esc, fmtUSD, fmtCRC, toUSD, fxPill } = CRW.utils;

  let resultsBox = null;
  let displayMode = () => CRW.state.get("displayMode") || "USD";

  function currencyToggle() {
    const mode = displayMode();
    const wrap = el("div", { class: "currency-toggle" });

    const usdBtn = el("button", {
      class: "toggle-btn" + (mode === "USD" ? " active" : ""),
      onclick: () => setMode("USD")
    }, "$ USD");

    const crcBtn = el("button", {
      class: "toggle-btn" + (mode === "CRC" ? " active" : ""),
      onclick: () => setMode("CRC")
    }, "₡ CRC");

    wrap.append(usdBtn, crcBtn);

    function setMode(m) {
      CRW.state.set("displayMode", m);
      usdBtn.className = "toggle-btn" + (m === "USD" ? " active" : "");
      crcBtn.className = "toggle-btn" + (m === "CRC" ? " active" : "");
    }

    return wrap;
  }

  function form() {
    const D = window.CRW_DATA;
    const cats = D.merchantCategories;
    const provs = D.provinces;
    const merchants = D.merchants;

    const currencySel = el("select", { id: "opt-currency", "aria-label": "Currency" },
      el("option", { value: "CRC" }, "₡ CRC"),
      el("option", { value: "USD" }, "$ USD"));
    const amountInput = el("input", { id: "opt-amount", class: "num", type: "number", inputmode: "decimal", min: "0", placeholder: "25 000", "aria-label": "Amount" });

    const catSel = el("select", { id: "opt-category" },
      cats.map((c) => el("option", { value: c.id }, `${c.icon} ${c.label}`)));

    const provSel = el("select", { id: "opt-province" },
      el("option", { value: "" }, "Anywhere in Costa Rica"),
      provs.map((p) => el("option", { value: p.id }, p.name)));

    const merchSel = el("select", { id: "opt-merchant" },
      el("option", { value: "" }, "Any merchant"));

    const syncMerchants = () => {
      const cat = catSel.value;
      merchSel.innerHTML = "";
      merchSel.append(el("option", { value: "" }, "Any merchant"));
      merchants.filter((m) => m.category === cat)
        .forEach((m) => merchSel.append(el("option", { value: m.id }, m.name)));
    };
    catSel.addEventListener("change", syncMerchants);
    syncMerchants();

    const run = () => {
      const amount = parseFloat(amountInput.value);
      if (!amount || amount <= 0) { amountInput.focus(); return; }
      const txn = {
        amount,
        currency: currencySel.value,
        categoryId: catSel.value,
        provinceId: provSel.value || null,
        merchantId: merchSel.value || null,
        displayMode: displayMode()
      };
      renderResults(txn);
    };

    return el("div", { class: "panel" },
      el("div", { class: "stack" },
        el("div", { class: "field" },
          el("label", { for: "opt-amount" }, "Amount"),
          el("div", { class: "amount-row" }, currencySel, amountInput)),
        el("div", { class: "field" },
          el("label", { for: "opt-category" }, "Merchant category"), catSel),
        el("div", { class: "grid cols-2" },
          el("div", { class: "field" },
            el("label", { for: "opt-province" }, "Province (optional)"), provSel),
          el("div", { class: "field" },
            el("label", { for: "opt-merchant" }, "Merchant (optional)"), merchSel)),
        el("button", { class: "btn", onclick: run }, "Find the best card")
      )
    );
  }

  function renderResults(txn) {
    const D = window.CRW_DATA;
    const { results, best, warning, amountUSD } = CRW.engine.optimize(txn);
    const mode = txn.displayMode;
    const cat = D.merchantCategories.find((c) => c.id === txn.categoryId);
    const prov = txn.provinceId ? D.provinces.find((p) => p.id === txn.provinceId) : null;
    const merch = txn.merchantId ? D.merchants.find((m) => m.id === txn.merchantId) : null;

    resultsBox.innerHTML = "";

    const rows = results.map((r) => {
      const isBest = r.card.id === best.card.id;
      const accSrc = {
        merchant: "merchant data",
        "province-category": "province × category",
        province: "province overall",
        "national-average": "national avg",
        network: "network baseline"
      }[r.acceptance.source];

      const evDisplay = mode === "CRC"
        ? fmtCRC(r.expectedCRC)
        : fmtUSD(r.expectedUSD);

      return el("div", { class: "result-card" + (isBest ? " best" : "") },
        isBest ? el("div", { class: "crown" }, "🏆 Best card") : null,
        el("div", { class: "mini-card", style: `background:linear-gradient(135deg, ${r.card.art.from}, ${r.card.art.to})` }),
        el("div", { class: "body" },
          el("div", { class: "rname" }, r.card.name),
          el("div", { class: "rmeta" },
            `${r.reward.detail}${r.reward.isCategoryBonus ? " (category bonus)" : ""} · acceptance ~${r.acceptance.pct}% `,
            el("span", { class: `badge conf-${r.acceptance.confidence}`, style: "margin-left:2px" }, r.acceptance.confidence)),
          el("div", { class: "faint" }, `acceptance source: ${accSrc}`)
        ),
        el("div", { class: "rvalue" },
          el("div", { class: "main" }, r.reward.display),
          el("div", { class: "sub" }, `EV ${evDisplay}`))
      );
    });

    const runnerUp = results[1];
    const bestEV = mode === "CRC" ? fmtCRC(best.expectedCRC) : fmtUSD(best.expectedUSD);
    const runnerEV = runnerUp
      ? (mode === "CRC" ? fmtCRC(runnerUp.expectedCRC) : fmtUSD(runnerUp.expectedUSD))
      : null;
    const margin = runnerUp
      ? (mode === "CRC" ? fmtCRC(best.expectedCRC - runnerUp.expectedCRC) : fmtUSD(best.expectedUSD - runnerUp.expectedUSD))
      : null;

    const explainText = el("div", { class: "explain" },
      el("strong", {}, `${best.card.name} wins. `),
      `On ${esc(cat.label.toLowerCase())} it earns ${best.reward.detail}` +
      (best.reward.isCategoryBonus ? " thanks to its category bonus" : "") +
      `, worth ${mode === "CRC" ? fmtCRC(best.reward.valueCRC) : fmtUSD(best.reward.valueUSD)} on this purchase. ` +
      (best.card.network === "amex"
        ? `Amex acceptance here is estimated at ${best.acceptance.pct}%, so the expected value is ${bestEV}`
        : `As a ${best.card.network} card, acceptance is near-universal (~${best.acceptance.pct}%)`) +
      (runnerUp && margin ? ` — ${margin} ahead of ${runnerUp.card.name}.` : ".")
    );

    const amountLabel = txn.currency === "CRC" ? fmtCRC(txn.amount) : fmtUSD(txn.amount);

    resultsBox.append(
      el("div", { class: "results-header" },
        el("h2", {}, `Results · ${amountLabel}${merch ? " at " + esc(merch.name) : ""}`),
        currencyToggle()
      ),
      ...rows,
      warning ? el("div", { class: "warn-note" }, "⚠️ " + warning.text) : null,
      explainText,
      el("div", { class: "fx-row" }, fxPill())
    );

    CRW.state.pushCalc({
      ts: Date.now(),
      amountLabel,
      categoryLabel: cat.label,
      provinceName: prov?.name || null,
      bestCardName: best.card.name,
      rewardDisplay: best.reward.display
    });
  }

  function render(root) {
    root.innerHTML = "";
    resultsBox = el("div", {});
    root.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "Optimizer"),
        el("h1", {}, "Which card should I use?"),
        el("p", { class: "sub" }, "Rewards × estimated Amex acceptance → expected value per card."),
        fxPill()
      ),
      form(),
      resultsBox
    );
  }

  return { render };
})();
