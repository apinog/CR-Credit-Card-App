/**
 * cards.data.js — Your wallet, as configuration.
 *
 * To replace a card (e.g. swap Promerica Premia Travel for a new card):
 *   1. Copy an existing card object.
 *   2. Change id, name, issuer, network, art, fees and rewards.
 *   3. Set `active: false` on the old card (kept for history) or delete it.
 *
 * IMPORTANT — every reward rate below is a PLACEHOLDER ESTIMATE
 * (estimate: true). Verify each one against your statement / issuer T&Cs
 * and flip `estimate` to false once confirmed. The UI surfaces this flag.
 *
 * Reward model:
 *   rewards.baseRate            — value earned per unit spent, in rewardCurrency
 *   rewards.categoryRates{}     — overrides by merchant category id
 *   rewards.pointValueUSD       — estimated USD value of 1 point/mile (points cards)
 *   For cashback cards, rates are fractions (0.01 = 1%).
 *   For points cards, rates are points per USD spent.
 */
window.CRW_DATA = window.CRW_DATA || {};

window.CRW_DATA.cards = [
  {
    id: "bac-amex-blue",
    active: true,
    name: "BAC Amex Blue",
    fullName: "BAC Credomatic American Express Blue",
    issuer: "BAC Credomatic",
    network: "amex",
    productUrl: "https://www.baccredomatic.com/es-cr/personas/tarjetas/destacadas/blue-american-expressr/american-express/blue",
    art: {
      // Placeholder gradient art. To use official imagery, drop a PNG in
      // assets/cards/ and set { type: "image", src: "assets/cards/blue.png" }.
      type: "gradient",
      from: "#1f4e9c",
      to: "#4fa3e0",
      accent: "rgba(255,255,255,.22)"
    },
    fees: {
      annualFeeUSD: 0,
      annualFeeNote: "Estimate — confirm current fee/waiver policy with BAC.",
      foreignTxFeePct: 0,
      foreignTxNote: "Amex-network CRC/USD dual billing; verify FX markup."
    },
    rewards: {
      type: "cashback",
      rewardCurrency: "USD",
      program: "BAC cashback",
      baseRate: 0.01,
      categoryRates: {},
      capsNote: "Check monthly/annual cashback caps in BAC T&Cs.",
      estimate: true
    },
    benefits: [
      "Amex Offers (when available in CR)",
      "Purchase protection (verify coverage terms)",
      "0 km / roadside perks vary by BAC promotion"
    ],
    insurance: ["Basic purchase protection (verify)"],
    loungeAccess: false,
    notes: "General-purpose Amex. Strong online + large-retail acceptance; carry a Visa/MC backup for small merchants."
  },

  {
    id: "bac-amex-economia",
    active: true,
    name: "BAC Amex EconoMía",
    fullName: "BAC Credomatic Tarjeta EconoMía American Express",
    issuer: "BAC Credomatic",
    network: "amex",
    productUrl: "https://www.baccredomatic.com/es-cr/personas/tarjetas/destacadas/tarjeta-economia-american-expressr/american-express/clasica",
    art: { type: "gradient", from: "#0e7a5f", to: "#3ecf9a", accent: "rgba(255,255,255,.20)" },
    fees: {
      annualFeeUSD: 0,
      annualFeeNote: "Estimate — confirm current fee/waiver policy with BAC.",
      foreignTxFeePct: 0,
      foreignTxNote: "Verify FX markup on non-CRC transactions."
    },
    rewards: {
      type: "cashback",
      rewardCurrency: "USD",
      program: "EconoMía everyday cashback",
      baseRate: 0.01,
      categoryRates: {
        supermarket: 0.04,
        pharmacy: 0.04,
        gas: 0.04
      },
      capsNote: "EconoMía category cashback typically capped monthly — verify exact cap and eligible MCCs.",
      estimate: true
    },
    benefits: [
      "Elevated cashback on everyday essentials (supermarket / pharmacy / fuel)",
      "Amex Offers (when available in CR)"
    ],
    insurance: ["Basic purchase protection (verify)"],
    loungeAccess: false,
    notes: "Your everyday-essentials workhorse. Pair with a high-acceptance backup where Amex is weak."
  },

  {
    id: "promerica-premia-travel",
    active: true,
    name: "Promerica Premia Travel",
    fullName: "Promerica Premia Travel Visa",
    issuer: "Banco Promerica",
    network: "visa",
    productUrl: "https://www.promerica.fi.cr/personas/detalle-tarjetas/?Tarjeta=PremiaTravel&Id=37896",
    art: { type: "gradient", from: "#5a2d82", to: "#9d5bd2", accent: "rgba(255,255,255,.18)" },
    fees: {
      annualFeeUSD: 0,
      annualFeeNote: "Estimate — confirm fee and waiver conditions with Promerica.",
      foreignTxFeePct: 0,
      foreignTxNote: "Verify FX markup."
    },
    rewards: {
      type: "points",
      rewardCurrency: "Premia points",
      program: "Premia",
      baseRate: 1.0,           // points per USD spent — PLACEHOLDER
      categoryRates: {
        airline: 2.0,
        hotel: 2.0,
        travel: 2.0
      },
      pointValueUSD: 0.01,     // PLACEHOLDER redemption value — verify
      capsNote: "Verify Premia earn rate, travel multipliers, and expiration.",
      estimate: true
    },
    benefits: [
      "Travel-oriented earn on airlines / hotels",
      "Near-universal acceptance (Visa)"
    ],
    insurance: ["Travel insurance when tickets purchased with card (verify tier)"],
    loungeAccess: false,
    notes: "Planned for replacement — kept as the high-acceptance backup. Swap by editing this file only."
  }
];
