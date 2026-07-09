/**
 * utils.js — formatting, FX, DOM helpers. No app state here.
 */
window.CRW = window.CRW || {};

CRW.utils = (() => {
  const D = () => window.CRW_DATA;

  /** Current FX rate — delegates to live fx engine, falls back to config. */
  const fxRate = () => CRW.fx?.rate() || D().rewardRules.fx.crcPerUsd;

  /** Convert an amount to USD. currency: "USD" | "CRC" */
  const toUSD = (amount, currency) =>
    currency === "CRC" ? amount / fxRate() : amount;

  const toCRC = (amountUSD) => amountUSD * fxRate();

  const fmtUSD = (v, digits = 2) =>
    "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const fmtCRC = (v) =>
    "₡" + Math.round(Number(v)).toLocaleString("en-US");

  const fmtPct = (v, digits = 1) =>
    (v * 100).toFixed(digits).replace(/\.0$/, "") + "%";

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const el = (tag, attrs = {}, ...children) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (k === "html") n.innerHTML = v;
      else n.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null) continue;
      n.append(c.nodeType ? c : document.createTextNode(c));
    }
    return n;
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const acceptanceScale = (pct) => {
    const scale = D().amexAcceptance.scale;
    return scale.find((s) => pct >= s.min) || scale[scale.length - 1];
  };

  /**
   * Render the live FX pill — subtle, light gray, non-intrusive.
   * Shows: ₡XXX / $ · source · timestamp
   */
  function fxPill() {
    const m = CRW.fx?.meta() || { rate: fxRate(), source: "config", timestamp: null };
    const timeStr = m.timestamp
      ? new Date(m.timestamp).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Costa_Rica" })
      : null;
    const label = `₡${Math.round(m.rate).toLocaleString("en-US")} / $ · ${m.source}${timeStr ? " · " + timeStr : ""}`;
    return el("div", { class: "fx-pill" }, label);
  }

  return { toUSD, toCRC, fmtUSD, fmtCRC, fmtPct, esc, el, $, $$, acceptanceScale, fxRate, fxPill };
})();
