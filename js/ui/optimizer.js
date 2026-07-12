/**
 * ui/optimizer.js — Phase 2+: channel (online/in-person) + geography toggles.
 */
window.CRW = window.CRW || {};
CRW.ui = CRW.ui || {};

CRW.ui.optimizer = (() => {
  const { el, esc, fmtUSD, fmtCRC, fxPill } = CRW.utils;

  let resultsBox = null;
  let displayMode = () => CRW.state.get("displayMode") || "USD";

  // Channel: "online" | "in-person"
  let channel = "in-person";
  // Geography: "local" | "us" | "international"
  let geography = "local";

  /* ── Reusable currency toggle ── */
  function currencyToggle() {
    const mode = displayMode();
    const wrap = el("div", { class: "currency-toggle" });
    const usdBtn = el("button", { class: "toggle-btn" + (mode === "USD" ? " active" : ""), onclick: () => setMode("USD") }, "$ USD");
    const crcBtn = el("button", { class: "toggle-btn" + (mode === "CRC" ? " active" : ""), onclick: () => setMode("CRC") }, "₡ CRC");
    wrap.append(usdBtn, crcBtn);
    function setMode(m) {
      CRW.state.set("displayMode", m);
      usdBtn.className = "toggle-btn" + (m === "USD" ? " active" : "");
      crcBtn.className = "toggle-btn" + (m === "CRC" ? " active" : "");
    }
    return wrap;
  }

  /* ── Pill toggle group ── */
  function pillGroup(options, current, onChange) {
    const wrap = el("div", { class: "pill-group" });
    const btns = options.map(({ value, label, icon }) => {
      const btn = el("button", {
        class: "pill-btn" + (current === value ? " active" : ""),
        onclick: () => {
          current = value;
          btns.forEach((b) => b.classList.toggle("active", b.dataset.val === value));
          onChange(value);
        }
      }, icon ? `${icon} ${label}` : label);
      btn.dataset.val = value;
      return btn;
    });
    wrap.append(...btns);
    return wrap;
  }

  /* ── Main form ── */
  function form() {
    const D = window.CRW_DATA;
    const cats = D.merchantCategories;
    const provs = D.provinces;
    const merchants = D.merchants;

    const currencySel = el("select", { id: "opt-currency", "aria-label": "Currency" },
      el("option", { value: "CRC" }, "₡ CRC"),
      el("option", { value: "USD" }, "$ USD"));

    const amountInput = el("input", {
      id: "opt-amount", class: "num", type: "number",
      inputmode: "decimal", min: "0", placeholder: "25 000", "aria-label": "Amount"
    });

    const catSel = el("select", { id: "opt-category" },
      cats.map((c) => el("option", { value: c.id }, `${c.icon} ${c.label}`)));

    const provSel = el("select", { id: "opt-province" },
      el("option", { value: "" }, "Anywhere in Costa Rica"),
      provs.map((p) => el("option", { value: p.id }, p.name)));

    const merchSel = el("select", { id: "opt-merchant" },
      el("option", { value: "" }, "Any merchant"));

    // Province/merchant row — hidden for non-local
    const localFields = el("div", { id: "opt-local-fields" },
      el("div", { class: "grid cols-2" },
        el("div", { class: "field" },
          el("label", { for: "opt-province" }, "Province (optional)"), provSel),
        el("div", { class: "field" },
          el("label", { for: "opt-merchant" }, "Merchant (optional)"), merchSel))
    );

    const syncMerchants = () => {
      const cat = catSel.value;
      merchSel.innerHTML = "";
      merchSel.append(el("option", { value: "" }, "Any merchant"));
      merchants.filter((m) => m.category === cat)
        .forEach((m) => merchSel.append(el("option", { value: m.id }, m.name)));
    };
    catSel.addEventListener("change", syncMerchants);
    syncMerchants();

    // Channel toggle — show/hide local fields and update geography options
    const geoWrap = el("div", { id: "opt-geo-wrap", class: "field" });

    const updateGeoOptions = () => {
      geoWrap.innerHTML = "";
      if (channel === "in-person") {
        geoWrap.append(
          el("label", {}, "Where are you spending?"),
          pillGroup([
            { value: "local", label: "Costa Rica", icon: "🇨🇷" },
            { value: "us",    label: "United States", icon: "🇺🇸" },
            { value: "international", label: "Other country", icon: "🌍" }
          ], geography, (v) => {
            geography = v;
            localFields.style.display = (v === "local") ? "" : "none";
          })
        );
        localFields.style.display = (geography === "local") ? "" : "none";
      } else {
        // Online: only local vs foreign matters (province irrelevant)
        geoWrap.append(
          el("label", {}, "Where is the merchant based?"),
          pillGroup([
            { value: "local",         label: "Costa Rica (.cr)", icon: "🇨🇷" },
            { value: "us",            label: "US / International", icon: "🌐" }
          ], geography === "local" ? "local" : "us", (v) => {
            geography = (v === "us") ? "us" : "local";
          })
        );
        localFields.style.display = "none";
      }
    };

    const channelWrap = el("div", { class: "field" },
      el("label", {}, "How are you paying?"),
      pillGroup([
        { value: "in-person", label: "In person", icon: "🏪" },
        { value: "online",    label: "Online",    icon: "💻" }
      ], channel, (v) => {
        channel = v;
        updateGeoOptions();
      })
    );

    updateGeoOptions();

    const run = () => {
      const amount = parseFloat(amountInput.value);
      if (!amount || amount <= 0) { amountInput.focus(); return; }
      const txn = {
        amount,
        currency: currencySel.value,
        categoryId: catSel.value,
        provinceId: (geography === "local" && channel === "in-person") ? (provSel.value || null) : null,
        merchantId: (geography === "local" && channel === "in-person") ? (merchSel.value || null) : null,
        channel,
        geography,
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
        channelWrap,
        geoWrap,
        localFields,
        el("button", { class: "btn", onclick: run }, "Find the best card")
      )
    );
  }

  /* ── Results ── */
  function renderResults(txn) {
    const D = window.CRW_DATA;
    const { results, best, warning } = CRW.engine.optimize(txn);
    const mode = txn.displayMode;
    const cat = D.merchantCategories.find((c) => c.id === txn.categoryId);
    const prov = txn.provinceId ? D.provinces.find((p) => p.id === txn.provinceId) : null;
    const merch = txn.merchantId ? D.merchants.find((m) => m.id === txn.merchantId) : null;

    // Context label for results header
    const channelLabel = txn.channel === "online" ? "🌐 Online" : "🏪 In person";
    const geoLabel = { local: "🇨🇷 Costa Rica", us: "🇺🇸 United States", international: "🌍 International" }[txn.geography] || "";
    const contextTag = `${channelLabel} · ${geoLabel}`;

    const accSourceLabel = {
      merchant: "merchant data",
      "province-category": "province × category",
      province: "province overall",
      "national-average": "national avg",
      network: "network baseline",
      "online-channel": "online channel",
      "us-market": "US market",
      "international-estimate": "international est."
    };

    resultsBox.innerHTML = "";

    const rows = results.map((r) => {
      const isBest = r.card.id === best.card.id;
      const evDisplay = mode === "CRC" ? fmtCRC(r.expectedCRC) : fmtUSD(r.expectedUSD);
      const srcLabel = accSourceLabel[r.acceptance.source] || r.acceptance.source;

      return el("div", { class: "result-card" + (isBest ? " best" : "") },
        isBest ? el("div", { class: "crown" }, "🏆 Best card") : null,
        el("div", { class: "mini-card", style: `background:linear-gradient(135deg,${r.card.art.from},${r.card.art.to})` }),
        el("div", { class: "body" },
          el("div", { class: "rname" }, r.card.name),
          el("div", { class: "rmeta" },
            `${r.reward.detail}${r.reward.isCategoryBonus ? " (category bonus)" : ""} · acceptance ~${r.acceptance.pct}% `,
            el("span", { class: `badge conf-${r.acceptance.confidence}`, style: "margin-left:2px" }, r.acceptance.confidence)),
          el("div", { class: "faint" }, `acceptance source: ${srcLabel}`)
        ),
        el("div", { class: "rvalue" },
          el("div", { class: "main" }, r.reward.display),
          el("div", { class: "sub" }, `EV ${evDisplay}`))
      );
    });

    const runnerUp = results[1];
    const bestEV = mode === "CRC" ? fmtCRC(best.expectedCRC) : fmtUSD(best.expectedUSD);
    const margin = runnerUp
      ? (mode === "CRC" ? fmtCRC(best.expectedCRC - runnerUp.expectedCRC) : fmtUSD(best.expectedUSD - runnerUp.expectedUSD))
      : null;

    // Smart explanation text
    const isIntl = txn.geography === "us" || txn.geography === "international";
    const explainText = el("div", { class: "explain" },
      el("strong", {}, `${best.card.name} wins. `),
      isIntl
        ? `For ${geoLabel} spend, the "international" category applies, earning ${best.reward.detail} on this purchase. `
        : `On ${esc(cat?.label.toLowerCase() || "")} it earns ${best.reward.detail}${best.reward.isCategoryBonus ? " (category bonus)" : ""}. `,
      txn.channel === "online"
        ? `Online purchases have near-universal Amex acceptance (~${best.acceptance.pct}%), so there's no acceptance risk here. `
        : (best.card.network === "amex"
            ? `Amex acceptance is estimated at ~${best.acceptance.pct}% (${accSourceLabel[best.acceptance.source] || best.acceptance.source}), giving an expected value of ${bestEV}. `
            : `As a ${best.card.network} card, acceptance is near-universal (~${best.acceptance.pct}%). `),
      runnerUp && margin ? `${margin} ahead of ${runnerUp.card.name}.` : ""
    );

    const amountLabel = txn.currency === "CRC" ? fmtCRC(txn.amount) : fmtUSD(txn.amount);

    resultsBox.append(
      el("div", { class: "results-header" },
        el("div", {},
          el("h2", {}, `Results · ${amountLabel}${merch ? " at " + esc(merch.name) : ""}`),
          el("div", { class: "context-tag faint" }, contextTag)
        ),
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
      categoryLabel: cat?.label || "",
      provinceName: prov?.name || null,
      bestCardName: best.card.name,
      rewardDisplay: best.reward.display
    });
  }

  function render(root) {
    root.innerHTML = "";
    resultsBox = el("div", {});
    channel = "in-person";
    geography = "local";
    root.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "Optimizer"),
        el("h1", {}, "Which card should I use?"),
        el("p", { class: "sub" }, "Rewards × acceptance → expected value per card."),
        fxPill()
      ),
      form(),
      resultsBox
    );
  }

  return { render };
})();
