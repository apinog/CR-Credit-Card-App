/**
 * ui/cards.js — My Cards view: card visuals + detail sheets.
 */
window.CRW = window.CRW || {};
CRW.ui = CRW.ui || {};

CRW.ui.cards = (() => {
  const { el, esc, fmtUSD } = CRW.utils;

  function cardVisual(card) {
    const v = el("div", { class: "ccard", role: "img", "aria-label": `${card.name} card` });
    if (card.art.type === "image") {
      v.style.background = `center/cover url("${card.art.src}")`;
    } else {
      v.style.background = `linear-gradient(135deg, ${card.art.from}, ${card.art.to})`;
      v.style.setProperty("--card-accent", card.art.accent || "rgba(255,255,255,.2)");
    }
    const r = card.rewards;
    const rateLabel = r.type === "cashback"
      ? `${(r.baseRate * 100).toFixed(1).replace(/\.0$/, "")}%+ back`
      : `${r.baseRate}×+ ${r.rewardCurrency}`;
    v.append(
      el("div", { class: "row" },
        el("div", {},
          el("div", { class: "issuer" }, card.issuer),
          el("div", { class: "cname" }, card.name)
        ),
        el("div", { class: "net" }, card.network.toUpperCase())
      ),
      el("div", { class: "chip" }),
      el("div", { class: "meta" },
        el("div", { class: "num" }, "•••• •••• •••• ••••"),
        el("div", { class: "rate" }, rateLabel)
      )
    );
    return v;
  }

  function ratesList(card) {
    const cats = window.CRW_DATA.merchantCategories;
    const entries = Object.entries(card.rewards.categoryRates || {});
    if (entries.length === 0) return el("span", { class: "muted" }, "Flat rate on all spend");
    const chips = entries.map(([catId, rate]) => {
      const cat = cats.find((c) => c.id === catId);
      const label = card.rewards.type === "cashback"
        ? `${(rate * 100).toFixed(1).replace(/\.0$/, "")}%`
        : `${rate}×`;
      return el("span", { class: "badge" }, `${cat ? cat.icon + " " + cat.label : catId}: ${label}`);
    });
    return el("div", { class: "chips" }, chips);
  }

  function detailPanel(card) {
    const r = card.rewards;
    const baseLabel = r.type === "cashback"
      ? `${(r.baseRate * 100).toFixed(1).replace(/\.0$/, "")}% cashback`
      : `${r.baseRate} pt/$ (≈ ${fmtUSD(r.baseRate * (r.pointValueUSD ?? 0.01))}/$)`;

    return el("div", { class: "panel" },
      cardVisual(card),
      el("div", { style: "display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px" },
        el("span", { class: `badge net-${card.network}` }, card.network),
        r.estimate ? el("span", { class: "badge est" }, "rates: estimate — verify") : null
      ),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Issuer"), el("span", { class: "v" }, card.issuer)),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Annual fee"),
        el("span", { class: "v num" }, card.fees.annualFeeUSD === 0 ? "$0" : fmtUSD(card.fees.annualFeeUSD, 0))),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Base rate"), el("span", { class: "v" }, baseLabel)),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Category bonuses"), el("span", { class: "v" }, ratesList(card))),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Foreign tx fee"),
        el("span", { class: "v" }, `${card.fees.foreignTxFeePct}% — ${card.fees.foreignTxNote}`)),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Lounge access"), el("span", { class: "v" }, card.loungeAccess ? "Yes" : "No")),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Insurance"),
        el("span", { class: "v" }, card.insurance.join(" · "))),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Benefits"),
        el("span", { class: "v" }, card.benefits.join(" · "))),
      el("div", { class: "kv" }, el("span", { class: "k" }, "Caps"), el("span", { class: "v muted" }, r.capsNote || "—")),
      el("p", { class: "faint", style: "margin-top:12px" }, card.notes),
      el("p", { style: "margin-top:8px" },
        el("a", { href: card.productUrl, target: "_blank", rel: "noopener" }, "Official product page ↗"))
    );
  }

  function render(root) {
    root.innerHTML = "";
    root.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "Portfolio"),
        el("h1", {}, "My Cards"),
        el("p", { class: "sub" }, "Edit data/cards.data.js to add, remove or replace cards — no code changes needed.")
      ),
      el("div", { class: "grid cols-3" },
        window.CRW_DATA.cards.filter((c) => c.active).map(detailPanel)
      )
    );
  }

  return { render };
})();
