/**
 * rewardRules.data.js — global rules the rewards engine applies on top of
 * per-card rates, plus app-level financial configuration.
 *
 * Phase 1 implements: fx, acceptance thresholds, recommendation weighting.
 * Phase 2 will implement: promotions[], caps enforcement, expirations.
 */
window.CRW_DATA = window.CRW_DATA || {};

window.CRW_DATA.rewardRules = {
  fx: {
    // CRC per USD. Update manually for now; Phase 3 can fetch live rates.
    crcPerUsd: 505,
    lastUpdated: "2026-07"
  },

  recommendation: {
    // How the optimizer trades rewards vs acceptance risk.
    // expectedValue = rewardValueUSD × P(acceptance) for Amex cards.
    useAcceptanceWeighting: true,
    // Below this acceptance %, the optimizer warns and prefers the backup.
    acceptanceWarnBelow: 60,
    // Assumed acceptance for Visa/Mastercard anywhere in CR.
    visaMastercardAcceptance: 99
  },

  // Phase 2: time-boxed promotions that override or add to category rates.
  promotions: [
    // {
    //   id: "bac-supermarket-boost-aug",
    //   cardId: "bac-amex-economia",
    //   category: "supermarket",
    //   rate: 0.06,
    //   startsOn: "2026-08-01",
    //   endsOn: "2026-08-31",
    //   notes: "Example structure — not active."
    // }
  ],

  // Phase 2: enforced caps. Phase 1 only displays capsNote text.
  caps: []
};
