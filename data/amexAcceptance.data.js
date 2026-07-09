/**
 * amexAcceptance.data.js — estimated Amex acceptance by province & category.
 *
 * ⚠️ THESE ARE PERSONAL ESTIMATES, NOT OFFICIAL STATISTICS.
 * No nationwide acceptance dataset exists. Values are heuristics built from:
 * urbanization, tourism intensity, merchant size mix, banking infrastructure
 * (BAC is the Amex acquirer in CR), and presence of large retail chains.
 *
 * Every number is editable. `confidence`: "high" | "medium" | "low".
 * `overall` drives the map choropleth; category values drive the panel.
 * Values are percentages (0–100).
 */
window.CRW_DATA = window.CRW_DATA || {};

window.CRW_DATA.amexAcceptance = {
  scale: [
    { min: 80, label: "Very High", color: "#1e8f5e" },
    { min: 65, label: "High",      color: "#57b26a" },
    { min: 50, label: "Medium",    color: "#e0b23e" },
    { min: 35, label: "Low",       color: "#e07b39" },
    { min: 0,  label: "Very Low",  color: "#d4503f" }
  ],

  provinces: {
    "san-jose": {
      overall: 82, confidence: "medium", lastUpdated: "2026-07",
      notes: "GAM core. Chains, malls and formal commerce dominate; small sodas and ferias remain cash/Visa territory.",
      categories: {
        restaurant: 88, supermarket: 95, gas: 88, pharmacy: 92,
        convenience: 82, department: 93, hotel: 96, streaming: 99,
        online: 90, government: 30, utilities: 60, healthcare: 85,
        entertainment: 80, travel: 92, electronics: 90, home: 85,
        "small-local": 55, taxi: 45, "farmers-market": 8, "street-vendor": 0
      }
    },
    "alajuela": {
      overall: 68, confidence: "medium", lastUpdated: "2026-07",
      notes: "Strong near the airport corridor and city core; drops quickly in rural cantons (San Carlos interior, Upala, Los Chiles).",
      categories: {
        restaurant: 72, supermarket: 90, gas: 82, pharmacy: 85,
        convenience: 70, department: 85, hotel: 88, streaming: 99,
        online: 90, government: 25, utilities: 55, healthcare: 75,
        entertainment: 65, travel: 85, electronics: 82, home: 75,
        "small-local": 40, taxi: 30, "farmers-market": 5, "street-vendor": 0
      }
    },
    "cartago": {
      overall: 64, confidence: "medium", lastUpdated: "2026-07",
      notes: "Urban Cartago behaves like GAM; agricultural cantons are cash-heavy.",
      categories: {
        restaurant: 68, supermarket: 90, gas: 80, pharmacy: 84,
        convenience: 66, department: 82, hotel: 78, streaming: 99,
        online: 90, government: 25, utilities: 55, healthcare: 72,
        entertainment: 60, travel: 75, electronics: 78, home: 72,
        "small-local": 38, taxi: 28, "farmers-market": 5, "street-vendor": 0
      }
    },
    "heredia": {
      overall: 74, confidence: "medium", lastUpdated: "2026-07",
      notes: "Dense GAM cantons (Heredia, Belén, Santa Ana-adjacent corridor) score high; Sarapiquí lowlands score low.",
      categories: {
        restaurant: 80, supermarket: 93, gas: 85, pharmacy: 88,
        convenience: 75, department: 88, hotel: 85, streaming: 99,
        online: 90, government: 28, utilities: 58, healthcare: 80,
        entertainment: 72, travel: 85, electronics: 85, home: 80,
        "small-local": 48, taxi: 35, "farmers-market": 6, "street-vendor": 0
      }
    },
    "guanacaste": {
      overall: 70, confidence: "medium", lastUpdated: "2026-07",
      notes: "Tourism inflates acceptance: beach hotels, resorts and Tamarindo/Papagayo restaurants take Amex readily; inland towns much less so.",
      categories: {
        restaurant: 78, supermarket: 88, gas: 78, pharmacy: 80,
        convenience: 65, department: 78, hotel: 94, streaming: 99,
        online: 90, government: 22, utilities: 50, healthcare: 70,
        entertainment: 75, travel: 90, electronics: 72, home: 65,
        "small-local": 42, taxi: 35, "farmers-market": 5, "street-vendor": 0
      }
    },
    "puntarenas": {
      overall: 58, confidence: "low", lastUpdated: "2026-07",
      notes: "Bimodal: tourist hubs (Jacó, Manuel Antonio, Monteverde, Osa lodges) accept widely; the long rural remainder does not.",
      categories: {
        restaurant: 65, supermarket: 85, gas: 72, pharmacy: 75,
        convenience: 58, department: 72, hotel: 90, streaming: 99,
        online: 90, government: 20, utilities: 48, healthcare: 62,
        entertainment: 62, travel: 85, electronics: 65, home: 58,
        "small-local": 32, taxi: 25, "farmers-market": 4, "street-vendor": 0
      }
    },
    "limon": {
      overall: 52, confidence: "low", lastUpdated: "2026-07",
      notes: "Weakest formal-acceptance footprint. Puerto Viejo / Cahuita tourism helps; elsewhere assume Visa/MC or cash.",
      categories: {
        restaurant: 58, supermarket: 82, gas: 68, pharmacy: 72,
        convenience: 52, department: 68, hotel: 82, streaming: 99,
        online: 90, government: 18, utilities: 45, healthcare: 58,
        entertainment: 52, travel: 75, electronics: 58, home: 52,
        "small-local": 28, taxi: 20, "farmers-market": 3, "street-vendor": 0
      }
    }
  },

  // Extra display-only rows shown in the province panel (beyond core categories)
  extraPanelRows: [
    { id: "small-local",     label: "Small Local Shops" },
    { id: "taxi",            label: "Taxi" },
    { id: "farmers-market",  label: "Farmer's Markets" },
    { id: "street-vendor",   label: "Street Vendors" }
  ]
};
