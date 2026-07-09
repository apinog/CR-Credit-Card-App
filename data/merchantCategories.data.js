/**
 * merchantCategories.data.js — canonical category list.
 * `icon` is an inline emoji for Phase 1; swap for an icon set in Phase 3.
 * `amexBaselineAdj` nudges the province-level Amex estimate for this
 * category (multiplier applied to the province category table when a
 * category is missing there).
 */
window.CRW_DATA = window.CRW_DATA || {};

window.CRW_DATA.merchantCategories = [
  { id: "restaurant",     label: "Restaurant",        icon: "🍽️" },
  { id: "supermarket",    label: "Supermarket",       icon: "🛒" },
  { id: "gas",            label: "Gas Station",       icon: "⛽" },
  { id: "pharmacy",       label: "Pharmacy",          icon: "💊" },
  { id: "convenience",    label: "Convenience Store", icon: "🏪" },
  { id: "department",     label: "Department Store",  icon: "🏬" },
  { id: "airline",        label: "Airline",           icon: "✈️" },
  { id: "hotel",          label: "Hotel",             icon: "🏨" },
  { id: "streaming",      label: "Streaming",         icon: "📺" },
  { id: "online",         label: "Online Shopping",   icon: "🛍️" },
  { id: "government",     label: "Government",        icon: "🏛️" },
  { id: "utilities",      label: "Utilities",         icon: "💡" },
  { id: "healthcare",     label: "Healthcare",        icon: "🏥" },
  { id: "entertainment",  label: "Entertainment",     icon: "🎬" },
  { id: "travel",         label: "Travel",            icon: "🧳" },
  { id: "electronics",    label: "Electronics",       icon: "💻" },
  { id: "home",           label: "Home Improvement",  icon: "🛠️" }
];
