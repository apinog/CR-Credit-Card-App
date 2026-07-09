/**
 * state.js — minimal store with localStorage persistence.
 * Holds user-generated state only (recent calculations, preferences).
 * All financial configuration lives in /data.
 */
window.CRW = window.CRW || {};

CRW.state = (() => {
  const KEY = "crw-state-v1";
  const defaults = {
    theme: "dark",
    displayMode: "USD",        // "USD" | "CRC" — persisted across sessions
    recentCalcs: [],          // last N optimizer runs
    monthlySpendUSD: 1200     // editable assumption used by dashboard projections
  };

  let s;
  try { s = { ...defaults, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; }
  catch { s = { ...defaults }; }

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ } };

  return {
    get: (k) => s[k],
    set: (k, v) => { s[k] = v; save(); },
    pushCalc: (calc) => {
      s.recentCalcs = [calc, ...s.recentCalcs].slice(0, 8);
      save();
    }
  };
})();
