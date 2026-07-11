/**
 * ui/card-comparison.js — side-by-side card comparison with scoring.
 */
window.CRW = window.CRW || {};
CRW.ui = CRW.ui || {};

CRW.ui.cardComparison = (() => {
  const { el, esc, fmtUSD, fmtCRC, fxPill } = CRW.utils;

  // Scoring dimensions and weights
  const DIMENSIONS = [
    { id: "rewards",     label: "Rewards value",      weight: 35, icon: "💰" },
    { id: "acceptance",  label: "Amex acceptance",    weight: 25, icon: "✅" },
    { id: "categories",  label: "Category breadth",   weight: 20, icon: "🗂️" },
    { id: "fees",        label: "No annual fee",      weight: 10, icon: "🏷️" },
    { id: "benefits",    label: "Benefits & perks",   weight: 10, icon: "⭐" }
  ];

  function scoreCard(card) {
    const E = CRW.engine;
    const D = window.CRW_DATA;
    const monthly = CRW.state.get("monthlySpendUSD") || 1200;

    // Rewards: yearly value at base rate normalized to max across cards
    const proj = E.yearlyProjection(monthly);
    const maxReward = Math.max(...proj.map((p) => p.valueUSD));
    const myReward = proj.find((p) => p.card.id === card.id)?.valueUSD || 0;
    const rewardsScore = maxReward > 0 ? Math.round((myReward / maxReward) * 100) : 0;

    // Acceptance: national average acceptance
    const acc = E.acceptanceFor(card, {});
    const acceptanceScore = acc.pct;

    // Category breadth: how many bonus categories does this card have
    const bonusCats = Object.keys(card.rewards.categoryRates || {}).length;
    const maxCats = Math.max(...E.activeCards().map((c) => Object.keys(c.rewards.categoryRates || {}).length));
    const catScore = maxCats > 0 ? Math.round((bonusCats / maxCats) * 100) : 50;

    // Fees: 100 if no annual fee, lower if fee
    const feeScore = card.fees.annualFeeUSD === 0 ? 100 : Math.max(0, 100 - card.fees.annualFeeUSD);

    // Benefits: count of meaningful benefits
    const benefitsScore = Math.min(100, (card.benefits.length / 5) * 100);

    const scores = {
      rewards: rewardsScore,
      acceptance: acceptanceScore,
      categories: catScore,
      fees: feeScore,
      benefits: Math.round(benefitsScore)
    };

    const overall = Math.round(
      DIMENSIONS.reduce((sum, d) => sum + (scores[d.id] * d.weight / 100), 0)
    );

    return { scores, overall };
  }

  function scoreBar(value, color = "var(--emerald)") {
    const wrap = el("div", { class: "score-bar-wrap" });
    const track = el("div", { class: "score-bar-track" });
    const fill = el("div", { class: "score-bar-fill", style: `width:${value}%;background:${color}` });
    track.append(fill);
    wrap.append(track, el("span", { class: "score-bar-val" }, value));
    return wrap;
  }

  function cardColumn(card, scored, rank) {
    const mode = CRW.state.get("displayMode") || "USD";
    const E = CRW.engine;
    const monthly = CRW.state.get("monthlySpendUSD") || 1200;
    const proj = E.yearlyProjection(monthly);
    const myProj = proj.find((p) => p.card.id === card.id);

    const yearlyVal = mode === "CRC"
      ? fmtCRC(myProj?.valueCRC || 0)
      : fmtUSD(myProj?.valueUSD || 0, 0);

    // Overall score color
    const scoreColor = scored.overall >= 75 ? "var(--emerald)"
      : scored.overall >= 50 ? "var(--gold)"
      : "var(--text-muted)";

    const rankLabel = rank === 1 ? "🥇 Best overall" : rank === 2 ? "🥈" : "🥉";

    return el("div", { class: "compare-col" },
      // Card visual
      el("div", { class: "ccard sm", style: `background:linear-gradient(135deg,${card.art.from},${card.art.to})` },
        el("div", { class: "row" },
          el("div", {}, el("div", { class: "cname", style: "font-size:.8rem" }, card.name)),
          el("div", { class: "net", style: "font-size:.65rem" }, card.network.toUpperCase())
        ),
        el("div", { class: "chip sm" })
      ),
      // Rank + overall score
      el("div", { class: "compare-rank" },
        el("span", { class: "rank-label" }, rankLabel),
        el("div", { class: "overall-score", style: `color:${scoreColor}` }, scored.overall),
        el("div", { class: "faint", style: "font-size:.7rem" }, "/ 100")
      ),
      // Yearly value
      el("div", { class: "compare-yearly" },
        el("div", { class: "faint", style: "font-size:.72rem;margin-bottom:2px" }, "Est. yearly rewards"),
        el("div", { class: "yearly-val" }, yearlyVal + "/yr")
      ),
      // Per-dimension scores
      el("div", { class: "dim-list" },
        DIMENSIONS.map((d) => {
          const val = scored.scores[d.id];
          const color = val >= 75 ? "var(--emerald)" : val >= 50 ? "var(--gold)" : "var(--text-muted)";
          return el("div", { class: "dim-row" },
            el("div", { class: "dim-label" },
              el("span", {}, d.icon + " " + d.label),
              el("span", { class: "dim-weight faint" }, `${d.weight}%`)
            ),
            scoreBar(val, color)
          );
        })
      ),
      // Top category
      el("div", { class: "faint", style: "font-size:.76rem;margin-top:10px" },
        "Best category: ",
        (() => {
          const cats = Object.entries(card.rewards.categoryRates || {});
          if (cats.length === 0) return "Flat rate";
          const best = cats.sort((a, b) => b[1] - a[1])[0];
          const catData = window.CRW_DATA.merchantCategories.find((c) => c.id === best[0]);
          const rateLabel = card.rewards.type === "cashback"
            ? `${(best[1] * 100).toFixed(0)}% cashback`
            : `${best[1]}× ${card.rewards.rewardCurrency}`;
          return `${catData ? catData.icon + " " + catData.label : best[0]} (${rateLabel})`;
        })()
      )
    );
  }

  function bestForSection() {
    const E = CRW.engine;
    const cards = E.activeCards();
    const D = window.CRW_DATA;

    // Best card per category (top categories only)
    const keyCats = ["supermarket", "restaurant", "gas", "pharmacy", "airline", "hotel", "streaming", "online", "international"];

    const rows = keyCats.map((catId) => {
      const cat = D.merchantCategories.find((c) => c.id === catId);
      if (!cat) return null;

      const { best } = E.optimize({ amount: 10000, currency: "CRC", categoryId: catId, displayMode: "USD" });
      if (!best) return null;

      return el("div", { class: "best-for-row" },
        el("div", { class: "bf-cat" }, `${cat.icon} ${cat.label}`),
        el("div", { class: "mini-card xs", style: `background:linear-gradient(135deg,${best.card.art.from},${best.card.art.to})` }),
        el("div", { class: "bf-card" }, best.card.name),
        el("div", { class: "bf-val emerald" }, best.reward.display)
      );
    }).filter(Boolean);

    return el("div", { class: "panel", style: "margin-top:20px" },
      el("h2", {}, "Best card by category"),
      el("p", { class: "faint", style: "font-size:.82rem;margin-bottom:12px" }, "On a ₡10,000 purchase with no province specified."),
      el("div", { class: "best-for-list" }, ...rows)
    );
  }

  function render(r) {
    const cards = CRW.engine.activeCards();
    const scored = cards.map((card) => ({ card, ...scoreCard(card) }));
    scored.sort((a, b) => b.overall - a.overall);

    r.innerHTML = "";
    r.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "Comparison"),
        el("h1", {}, "Card Comparison"),
        el("p", { class: "sub" }, "Side-by-side scoring across rewards, acceptance, categories and perks."),
        fxPill()
      ),
      el("div", { class: "panel" },
        el("p", { class: "faint", style: "font-size:.8rem;margin-bottom:16px" },
          "Scores are relative to your current portfolio. Rewards based on " +
          fmtUSD(CRW.state.get("monthlySpendUSD") || 1200, 0) + "/mo at base rate."),
        el("div", { class: "compare-grid" },
          scored.map((s, i) => cardColumn(s.card, s, i + 1))
        )
      ),
      bestForSection(),
      el("p", { class: "faint", style: "margin-top:16px;font-size:.78rem" },
        "Scoring is a heuristic model based on your portfolio data. Acceptance figures are personal estimates.")
    );
  }

  return { render };
})();
