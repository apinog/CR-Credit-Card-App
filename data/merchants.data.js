/**
 * merchants.data.js — known merchants with per-merchant Amex overrides.
 * amexOverride: 0–100 replaces province/category estimate for this merchant.
 * confidence: "high" | "medium" | "low"
 */
window.CRW_DATA = window.CRW_DATA || {};

window.CRW_DATA.merchants = [

  // ── Supermarkets ──────────────────────────────────────────────
  { id: "automercado",    name: "Automercado",        category: "supermarket", amexOverride: 98, confidence: "high",   notes: "Premium chain, BAC-acquired POS. Amex widely accepted." },
  { id: "walmart",        name: "Walmart",            category: "supermarket", amexOverride: 97, confidence: "high",   notes: "All CR locations accept Amex." },
  { id: "pricesmart",     name: "PriceSmart",         category: "supermarket", amexOverride: 95, confidence: "medium", notes: "Warehouse club; verify at your local club." },
  { id: "freshmarket",    name: "Fresh Market",       category: "supermarket", amexOverride: 95, confidence: "medium", notes: "Upscale supermarket. San José area locations." },
  { id: "maxi-pali",      name: "Maxi Palí",          category: "supermarket", amexOverride: 75, confidence: "medium", notes: "Budget chain. Amex accepted but less consistent than Walmart." },
  { id: "pali",           name: "Palí",               category: "supermarket", amexOverride: 60, confidence: "low",    notes: "Discount format. Cash/Visa preferred at many locations." },
  { id: "super-mas",      name: "Supermás",           category: "supermarket", amexOverride: 78, confidence: "medium", notes: "Mid-range supermarket chain. Amex generally accepted." },
  { id: "buen-precio",    name: "Buen Precio",        category: "supermarket", amexOverride: 65, confidence: "low",    notes: "Smaller chain; acceptance varies by location." },

  // ── Convenience Stores ────────────────────────────────────────
  { id: "ampm",           name: "AMPM",               category: "convenience", amexOverride: 92, confidence: "medium", notes: "BAC-affiliated chain. Most locations take Amex." },
  { id: "freshmarket-c",  name: "Fresh Market Express",category: "convenience",amexOverride: 90, confidence: "medium" },
  { id: "musmanni",       name: "Musmanni",           category: "convenience", amexOverride: 70, confidence: "low",    notes: "Bakery/convenience hybrid. Amex hit-or-miss." },

  // ── Gas Stations ──────────────────────────────────────────────
  { id: "recope-full",    name: "Servicentro Delta",  category: "gas",         amexOverride: 80, confidence: "medium", notes: "Formal Recope station. Amex usually accepted." },
  { id: "gazel",          name: "Gazel",              category: "gas",         amexOverride: 85, confidence: "medium", notes: "Modern branded stations. Amex accepted at most." },
  { id: "puma-gas",       name: "Puma",               category: "gas",         amexOverride: 78, confidence: "medium", notes: "Widespread network. Acceptance varies by operator." },
  { id: "delta-gas",      name: "Delta",              category: "gas",         amexOverride: 82, confidence: "medium", notes: "Common in GAM. Most accept Amex." },
  { id: "via-uno",        name: "Via Uno",            category: "gas",         amexOverride: 75, confidence: "low",    notes: "Smaller chain. Verify at each location." },

  // ── Restaurants (Fast food) ───────────────────────────────────
  { id: "starbucks",      name: "Starbucks",          category: "restaurant",  amexOverride: 97, confidence: "high" },
  { id: "mcdonalds",      name: "McDonald's",         category: "restaurant",  amexOverride: 96, confidence: "high" },
  { id: "subway",         name: "Subway",             category: "restaurant",  amexOverride: 90, confidence: "medium" },
  { id: "kfc",            name: "KFC",                category: "restaurant",  amexOverride: 95, confidence: "medium" },
  { id: "burger-king",    name: "Burger King",        category: "restaurant",  amexOverride: 94, confidence: "medium" },
  { id: "taco-bell",      name: "Taco Bell",          category: "restaurant",  amexOverride: 93, confidence: "medium" },
  { id: "pizza-hut",      name: "Pizza Hut",          category: "restaurant",  amexOverride: 92, confidence: "medium" },
  { id: "dominos",        name: "Domino's Pizza",     category: "restaurant",  amexOverride: 91, confidence: "medium" },
  { id: "chipotle",       name: "Chipotle",           category: "restaurant",  amexOverride: 95, confidence: "medium", notes: "Multiplaza Escazú and Santa Ana locations." },

  // ── Restaurants (Sit-down / San José area) ────────────────────
  { id: "park-cafe",      name: "Park Café",          category: "restaurant",  amexOverride: 90, confidence: "medium", notes: "Upscale Rohrmoser. Formal dining, Amex expected." },
  { id: "ole-ole",        name: "Olé Olé",            category: "restaurant",  amexOverride: 88, confidence: "medium", notes: "Popular Spanish chain in malls. Amex accepted." },
  { id: "machu-picchu",   name: "Machu Picchu",       category: "restaurant",  amexOverride: 82, confidence: "medium", notes: "Peruvian classic in San José. Amex accepted." },
  { id: "tacobar",        name: "Taco Bar",           category: "restaurant",  amexOverride: 85, confidence: "medium", notes: "Local chain. Mall locations reliably accept Amex." },
  { id: "chancay",        name: "Chancay",            category: "restaurant",  amexOverride: 88, confidence: "medium", notes: "Peruvian fusion, Escazú/Santa Ana. Amex accepted." },
  { id: "la-luz",         name: "La Luz",             category: "restaurant",  amexOverride: 85, confidence: "medium", notes: "Alta Hotel restaurant. Formal, Amex accepted." },
  { id: "terruño",        name: "Terruño",            category: "restaurant",  amexOverride: 80, confidence: "low",    notes: "Local Costa Rican cuisine. Verify Amex on visit." },
  { id: "carbon-leña",    name: "Carbón y Leña",      category: "restaurant",  amexOverride: 83, confidence: "medium", notes: "Steakhouse. Amex generally accepted." },
  { id: "furca",          name: "Furca",              category: "restaurant",  amexOverride: 80, confidence: "low",    notes: "Trendy Barrio Escalante spot. Verify Amex." },
  { id: "sikwa",          name: "Sikwa",              category: "restaurant",  amexOverride: 78, confidence: "low",    notes: "Indigenous cuisine, Barrio Escalante. Verify." },
  { id: "nueve",          name: "Restaurante Nueve",  category: "restaurant",  amexOverride: 88, confidence: "medium", notes: "Upscale Escazú. Amex accepted." },
  { id: "tin-jo",         name: "Tin Jo",             category: "restaurant",  amexOverride: 85, confidence: "medium", notes: "Asian cuisine classic in San José centro. Amex accepted." },

  // ── Bars ──────────────────────────────────────────────────────
  { id: "bar-morazán",    name: "Bar Morazán",        category: "entertainment", amexOverride: 70, confidence: "low",  notes: "Historic bar, San José centro. Cash preferred." },
  { id: "jazz-cafe",      name: "Jazz Café",          category: "entertainment", amexOverride: 78, confidence: "medium",notes: "San Pedro and Escazú. Live music venue. Amex usually ok." },
  { id: "el-observatorio",name: "El Observatorio",    category: "entertainment", amexOverride: 72, confidence: "low",  notes: "Barrio California. Verify Amex — can be cash-heavy nights." },
  { id: "vino-bodega",    name: "Vinos & Bodegas",    category: "entertainment", amexOverride: 82, confidence: "medium",notes: "Wine bar/store. Formal environment, Amex expected." },
  { id: "roca-bar",       name: "Roca Bar (Multiplaza)",category: "entertainment",amexOverride: 88, confidence: "medium",notes: "Mall location. Amex accepted." },
  { id: "donde-carlos",   name: "Donde Carlos",       category: "entertainment", amexOverride: 65, confidence: "low",  notes: "Neighborhood bar. Mostly cash. Bring Visa/MC backup." },

  // ── Pharmacies ────────────────────────────────────────────────
  { id: "fischel",        name: "Farmacia Fischel",   category: "pharmacy",    amexOverride: 96, confidence: "high",   notes: "Largest CR pharmacy chain. Amex widely accepted." },
  { id: "labomba",        name: "Farmacia La Bomba",  category: "pharmacy",    amexOverride: 92, confidence: "medium" },
  { id: "chavarria",      name: "Farmacia Chavarría", category: "pharmacy",    amexOverride: 80, confidence: "medium", notes: "Local chain. Amex accepted at most branches." },
  { id: "sucre",          name: "Farmacia Sucre",     category: "pharmacy",    amexOverride: 75, confidence: "low",    notes: "Smaller chain. Verify at each location." },

  // ── Shopping / Department ─────────────────────────────────────
  { id: "multiplaza",     name: "Multiplaza (stores)", category: "department", amexOverride: 95, confidence: "high",   notes: "Premium mall. Virtually all stores accept Amex." },
  { id: "lincoln-plaza",  name: "Lincoln Plaza (stores)",category: "department",amexOverride: 88, confidence: "medium" },
  { id: "outlet-mall",    name: "City Mall / Alajuela",category: "department", amexOverride: 85, confidence: "medium" },
  { id: "universal",      name: "Librería Universal", category: "department",  amexOverride: 88, confidence: "medium", notes: "Books and stationery. Amex accepted." }
];
