/**
 * engine/rewards.js — pure business logic, zero DOM.
 * Phase 2: live FX, CRC/USD display mode, Premia miles in CRC, projections.
 */
window.CRW = window.CRW || {};

CRW.engine = (() => {
  const D = () => window.CRW_DATA;
  const rules = () => D().rewardRules;

  const activeCards = () => D().cards.filter((c) => c.active);

  /** Current FX rate — live if available, fallback otherwise. */
  const fxRate = () => CRW.fx?.rate() || rules().fx.crcPerUsd;

  /** Effective earn rate for a card in a category. */
  function rateFor(card, categoryId) {
    const r = card.rewards;
    const override = categoryId ? r.categoryRates?.[categoryId] : null;
    return {
      rate: override ?? r.baseRate,
      isCategoryBonus: override != null
    };
  }

  /**
   * Reward earned for a USD amount.
   * displayMode: "USD" | "CRC"
   * Returns { valueUSD, valueCRC, display, displayCRC, detail, rate, isCategoryBonus }
   */
  function rewardFor(card, amountUSD, categoryId, displayMode = "USD") {
    const r = card.rewards;
    const { rate, isCategoryBonus } = rateFor(card, categoryId);
    const fx = fxRate();

    if (r.type === "cashback") {
      const usd = amountUSD * rate;
      const crc = usd * fx;
      return {
        valueUSD: usd,
        valueCRC: crc,
        display: displayMode === "CRC" ? CRW.utils.fmtCRC(crc) : CRW.utils.fmtUSD(usd),
        displayCRC: CRW.utils.fmtCRC(crc),
        displayUSD: CRW.utils.fmtUSD(usd),
        detail: `${(rate * 100).toFixed(1).replace(/\.0$/, "")}% cashback`,
        rate, isCategoryBonus
      };
    }

    // Points/miles card (Promerica Premia)
    // earn rate is points per USD; pointValueCRC is the verified CRC/point value
    const pts = amountUSD * rate;
    const pointCRC = r.pointValueCRC || (r.pointValueUSD ? r.pointValueUSD * fx : 3);
    const crc = pts * pointCRC;
    const usd = crc / fx;

    const ptsLabel = r.rewardCurrency === "Premia miles" ? "miles" : "pts";
    const detail = `${rate}× ${r.rewardCurrency}`;

    return {
      valueUSD: usd,
      valueCRC: crc,
      display: displayMode === "CRC"
        ? `${Math.round(pts).toLocaleString()} ${ptsLabel} ≈ ${CRW.utils.fmtCRC(crc)}`
        : `${Math.round(pts).toLocaleString()} ${ptsLabel} ≈ ${CRW.utils.fmtUSD(usd)}`,
      displayCRC: `${Math.round(pts).toLocaleString()} ${ptsLabel} ≈ ${CRW.utils.fmtCRC(crc)}`,
      displayUSD: `${Math.round(pts).toLocaleString()} ${ptsLabel} ≈ ${CRW.utils.fmtUSD(usd)}`,
      detail,
      rate, isCategoryBonus
    };
  }

  /**
   * Estimated acceptance probability (0–100) for a card.
   * ctx: { provinceId?, categoryId?, merchantId? }
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
    const vals = Object.values(acc.provinces).map((p) => p.overall);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    return { pct: avg, source: "national-average", confidence: "low" };
  }

  /**
   * Optimize a transaction.
   * txn: { amount, currency, categoryId, provinceId?, merchantId?, displayMode? }
   */
  function optimize(txn) {
    const amountUSD = CRW.utils.toUSD(txn.amount, txn.currency);
    const displayMode = txn.displayMode || CRW.state.get("displayMode") || "USD";
    const weight = rules().recommendation.useAcceptanceWeighting;

    const results = activeCards().map((card) => {
      const reward = rewardFor(card, amountUSD, txn.categoryId, displayMode);
      const acceptance = acceptanceFor(card, txn);
      const expectedUSD = weight ? reward.valueUSD * (acceptance.pct / 100) : reward.valueUSD;
      const expectedCRC = expectedUSD * fxRate();
      return { card, reward, acceptance, expectedUSD, expectedCRC, amountUSD };
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
    return { results, best, warning, amountUSD, displayMode };
  }

  /**
   * Phase 2 yearly projection with category mix.
   * spendProfile: { monthlySpendUSD, categoryMix: { categoryId: fraction } }
   * If no mix provided, uses base rate across full spend.
   */
  function yearlyProjection(monthlySpendUSD, categoryMix = null) {
    const annual = monthlySpendUSD * 12;
    return activeCards().map((card) => {
      let valueUSD = 0;
      if (categoryMix) {
        for (const [catId, fraction] of Object.entries(categoryMix)) {
          const r = rewardFor(card, annual * fraction, catId);
          valueUSD += r.valueUSD;
        }
      } else {
        valueUSD = rewardFor(card, annual, null).valueUSD;
      }
      const valueCRC = valueUSD * fxRate();
      return { card, valueUSD, valueCRC };
    }).sort((a, b) => b.valueUSD - a.valueUSD);
  }

  /** Card with highest realistic acceptance. */
  function bestAcceptanceCard() {
    return activeCards()
      .map((card) => ({ card, acc: acceptanceFor(card, {}) }))
      .sort((a, b) => b.acc.pct - a.acc.pct)[0];
  }

  return { activeCards, fxRate, rateFor, rewardFor, acceptanceFor, optimize, yearlyProjection, bestAcceptanceCard };
})();
