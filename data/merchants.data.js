/**
 * merchants.data.js — known merchants with per-merchant Amex overrides.
 *
 * amexOverride: 0–100 replaces the province/category estimate when this
 * merchant is selected (chains behave the same nationwide).
 * confidence: how sure we are about the override.
 * Add merchants freely — the optimizer picks them up automatically.
 */
window.CRW_DATA = window.CRW_DATA || {};

window.CRW_DATA.merchants = [
  { id: "automercado",  name: "Automercado",      category: "supermarket", amexOverride: 98, confidence: "high",   notes: "Large chain, BAC-acquired POS." },
  { id: "walmart",      name: "Walmart",          category: "supermarket", amexOverride: 97, confidence: "high" },
  { id: "pricesmart",   name: "PriceSmart",       category: "supermarket", amexOverride: 95, confidence: "medium", notes: "Historically Visa/MC-leaning; verify at your club." },
  { id: "freshmarket",  name: "Fresh Market",     category: "convenience", amexOverride: 95, confidence: "medium" },
  { id: "ampm",         name: "AMPM",             category: "convenience", amexOverride: 92, confidence: "medium" },
  { id: "starbucks",    name: "Starbucks",        category: "restaurant",  amexOverride: 97, confidence: "high" },
  { id: "mcdonalds",    name: "McDonald's",       category: "restaurant",  amexOverride: 96, confidence: "high" },
  { id: "subway",       name: "Subway",           category: "restaurant",  amexOverride: 90, confidence: "medium" },
  { id: "kfc",          name: "KFC",              category: "restaurant",  amexOverride: 95, confidence: "medium" },
  { id: "fischel",      name: "Farmacia Fischel", category: "pharmacy",    amexOverride: 96, confidence: "high" },
  { id: "labomba",      name: "Farmacia La Bomba",category: "pharmacy",    amexOverride: 92, confidence: "medium" }
];
