/**
 * cards.data.js — Your wallet, as configuration.
 * Sources: BAC website + Promerica website + verified by Alberto July 2026.
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
    art: { type: "gradient", from: "#1f4e9c", to: "#4fa3e0", accent: "rgba(255,255,255,.22)" },
    fees: {
      annualFeeUSD: 0,
      annualFeeNote: "No annual fee per BAC website.",
      foreignTxFeePct: 0,
      foreignTxNote: "Amex-network CRC/USD dual billing; verify FX markup."
    },
    rewards: {
      type: "cashback",
      rewardCurrency: "USD",
      program: "BAC CashBack Blue",
      baseRate: 0.01,
      categoryRates: {
        // 5% — verified July 2026 (BAC/Amex Blue product page)
        international: 0.05,
        streaming:     0.05,
        airline:       0.05,
        hotel:         0.05,
        travel:        0.05,
        // 1% — verified July 2026
        fast_food:     0.01,
        restaurant:    0.01,
        entertainment: 0.01,
        supermarket:   0.01,
        grocery:       0.01,
        pet:           0.01
      },
      capsNote: "Verify monthly/annual cashback cap in BAC Reglamento Plan de Lealtad CashBack Blue.",
      estimate: false
    },
    benefits: [
      "5% cashback: international purchases, streaming, apps, airlines, hotels, travel agencies, car rentals",
      "1% cashback: fast food, restaurants, entertainment, supermarkets, grocery, veterinary"
    ],
    insurance: ["Purchase protection (verify)"],
    loungeAccess: false,
    notes: "Best card for all online/international spending, subscriptions, and travel bookings. Use EconoMía for local supermarkets and restaurants."
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
      annualFeeNote: "No annual fee per BAC website.",
      foreignTxFeePct: 0,
      foreignTxNote: "Verify FX markup on non-CRC transactions."
    },
    rewards: {
      type: "cashback",
      rewardCurrency: "USD",
      program: "EconoMía CashBack",
      baseRate: 0.01,
      categoryRates: {
        // 4% — verified July 2026 (BAC EconoMía product page)
        supermarket:  0.04,
        grocery:      0.04,
        pharmacy:     0.04,
        healthcare:   0.04,
        // 2% — verified July 2026
        restaurant:   0.02,
        fast_food:    0.02,
        pet:          0.02
      },
      capsNote: "Monthly cap: 22,000 CRC (~$44). Annual cap: 264,000 CRC (~$523). Min redemption: 15,000 CRC. Points expire every 2 rolling years.",
      estimate: false
    },
    benefits: [
      "4% cashback: supermarkets, mini-marts, corner stores",
      "4% cashback: pharmacies, clinics, hospitals, labs",
      "2% cashback: restaurants, fast food",
      "2% cashback: veterinary and pet supply stores"
    ],
    insurance: ["Basic purchase protection (verify)"],
    loungeAccess: false,
    notes: "Everyday workhorse. Best for Automercado, Walmart, Fischel, and local restaurants. Monthly cap ~₡600k spend before hitting ceiling."
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
      annualFeeNote: "Verify current annual fee with Promerica.",
      foreignTxFeePct: 0,
      foreignTxNote: "Verify FX markup on international transactions."
    },
    rewards: {
      type: "points",
      rewardCurrency: "Premia miles",
      program: "Premia Travel",
      // Standard earn per $1 USD spent
      baseRate: 1.0,
      categoryRates: {
        // 3 miles/$1 — standard travel categories + gas (custom rate confirmed by Alberto)
        gas:       3.0,
        airline:   3.0,
        hotel:     3.0,
        travel:    3.0,
        // 2 miles/$1 — international purchases
        international: 2.0,
        // 1 mile/$1
        restaurant:  1.0,
        supermarket: 1.0,
        pharmacy:    1.0
      },
      // Verified by Alberto July 2026: 1 mile = ₡3 CRC (156.47 pts = ₡469.41 CRC)
      // At ₡505/USD → 1 mile ≈ $0.00594. Update pointValueCRC if Promerica changes rate.
      pointValueCRC: 3.0,
      pointValueUSD: 0.00594,
      capsNote: "Verify Premia miles expiration policy with Promerica.",
      estimate: false
    },
    benefits: [
      "3 miles/$1: gas stations (custom rate), airlines, hotels, car rentals, travel agencies, cruises",
      "2 miles/$1: international purchases",
      "1 mile/$1: restaurants, supermarkets, gas stations, pharmacies",
      "Near-universal Visa acceptance"
    ],
    insurance: ["Travel insurance when tickets purchased with card (verify tier)"],
    loungeAccess: false,
    notes: "Best for gas and any travel bookings. Primary Visa/Mastercard fallback where Amex isn't accepted. Note: Promerica may be migrating gas earn to the standard 3-mile travel tier — verify if earn rate changes."
  }
];
