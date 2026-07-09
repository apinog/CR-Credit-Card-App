/**
 * engine/rewards.js — pure business logic, zero DOM.
 *
 * Phase 1 implements:
 *   ratesFor(card, category)          → effective rate + source
 *   rewardFor(card, amountUSD, cat)   → reward + USD value
 *   acceptanceFor(card, ctx)          → estimated acceptance % + provenance
 *   optimize(txn)                     → ranked cards with expected value
 *
 * Phase 2 will add: promotions, cap enforcement, projections engine.
 */
window.CRW = window.CRW || {};

CRW.engine = (() => {
  const D = () => window.CRW_DATA;
  const rules = () => D().rewardRules;

  const activeCards = () => D().cards.filter((c) => c.active);

  /** Effective earn rate for a card in a category. */
  function rateFor(card, categoryId) {
    const r = card.rewards;
    const override = r.categoryRates?.[categoryId];
    return {
      rate: override ?? r.baseRate,
      isCategoryBonus: override != null
    };
  }

  /** Reward earned for a USD amount. Returns display + USD value. */
  function rewardFor(card, amountUSD, categoryId) {
    const r = card.rewards;
    const { rate, isCategoryBonus } = rateFor(card, categoryId);
    if (r.type === "cashback") {
      const usd = amountUSD * rate;
      return {
        valueUSD: usd,
        display: CRW.utils.fmtUSD(usd),
        detail: `${(rate * 100).toFixed(1).replace(/\.0$/, "")}% cashback`,
        rate, isCategoryBonus
      };
    }
    // points
    const pts = amountUSD * rate;
    const usd = pts * (r.pointValueUSD ?? 0.01);
    return {
      valueUSD: usd,
      display: `${Math.round(pts).toLocaleString()} pts`,
      detail: `${rate}× ${r.rewardCurrency} · ≈ ${CRW.utils.fmtUSD(usd)}`,
      rate, isCategoryBonus
    };
  }

  /**
   * Estimated acceptance probability (0–100) for a card given context:
   * { provinceId?, categoryId?, merchantId? }
   * Priority: merchant override → province+category → province overall → national default.
   */
  function acceptanceFor(card, ctx = {}) {
    if (card.network !== "amex") {
      return { pct: rules().recommendation.visaMastercardAcceptance, source: "network", confidence: "high" };
    }
    const acc = D().amexAcceptance;

    if (ctx.merchantId) {
      const m = D().merchants.find((x) => x.id === ctx.merchantId);
      if (m?.amexOverride != null) {
        return { pct: m.amexOverride, source: "merchant", confidence: m.confidence || "medium" };
      }
    }
    if (ctx.provinceId) {
      const p = acc.provinces[ctx.provinceId];
      if (p) {
        const catPct = ctx.categoryId != null ? p.categories?.[ctx.categoryId] : null;
        if (catPct != null) return { pct: catPct, source: "province-category", confidence: p.confidence };
        return { pct: p.overall, source: "province", confidence: p.confidence };
      }
    }
    // national fallback: average of province overalls
    const vals = Object.values(acc.provinces).map((p) => p.overall);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    return { pct: avg, source: "national-average", confidence: "low" };
  }

  /**
   * Optimize a transaction.
   * txn: { amount, currency, categoryId, provinceId?, merchantId? }
   * Returns { results: [...ranked], best, warning }
   */
  function optimize(txn) {
    const amountUSD = CRW.utils.toUSD(txn.amount, txn.currency);
    const weight = rules().recommendation.useAcceptanceWeighting;

    const results = activeCards().map((card) => {
      const reward = rewardFor(card, amountUSD, txn.categoryId);
      const acceptance = acceptanceFor(card, txn);
      const expectedUSD = weight ? reward.valueUSD * (acceptance.pct / 100) : reward.valueUSD;
      return { card, reward, acceptance, expectedUSD, amountUSD };
    });

    results.sort((a, b) => b.expectedUSD - a.expectedUSD);
    const best = results[0];

    let warning = null;
    const warnAt = rules().recommendation.acceptanceWarnBelow;
    if (best && best.acceptance.pct < warnAt) {
      const backup = results.find((r) => r.acceptance.pct >= warnAt);
      warning = {
        text: `Estimated acceptance for ${best.card.name} here is only ${best.acceptance.pct}%. Carry ${backup ? backup.card.name : "a Visa/Mastercard"} as backup.`,
        backupCardId: backup?.card.id || null
      };
    }
    return { results, best, warning, amountUSD };
  }

  /**
   * Very simple Phase 1 yearly projection: monthly spend × 12 at each card's
   * base rate (category mix modeling arrives in Phase 2).
   */
  function yearlyProjection(monthlySpendUSD) {
    return activeCards().map((card) => {
      const r = rewardFor(card, monthlySpendUSD * 12, null);
      return { card, valueUSD: r.valueUSD, display: r.display };
    }).sort((a, b) => b.valueUSD - a.valueUSD);
  }

  /** Card with the highest realistic acceptance nationwide. */
  function bestAcceptanceCard() {
    return activeCards()
      .map((card) => ({ card, acc: acceptanceFor(card, {}) }))
      .sort((a, b) => b.acc.pct - a.acc.pct)[0];
  }

  return { activeCards, rateFor, rewardFor, acceptanceFor, optimize, yearlyProjection, bestAcceptanceCard };
})();
