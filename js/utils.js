/**
 * utils.js — formatting, FX, DOM helpers. No app state here.
 */
window.CRW = window.CRW || {};

CRW.utils = (() => {
  const D = () => window.CRW_DATA;

  const fxRate = () => D().rewardRules.fx.crcPerUsd;

  /** Convert an amount to USD. currency: "USD" | "CRC" */
  const toUSD = (amount, currency) =>
    currency === "CRC" ? amount / fxRate() : amount;

  const fmtUSD = (v, digits = 2) =>
    "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const fmtCRC = (v) =>
    "₡" + Math.round(Number(v)).toLocaleString("en-US");

  const fmtPct = (v, digits = 1) =>
    (v * 100).toFixed(digits).replace(/\.0$/, "") + "%";

  /** Escape a string for safe HTML interpolation. */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** el("div", {class:"x"}, children...) — tiny DOM builder */
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

  /** Acceptance % → scale entry ({label,color}) from amexAcceptance.scale */
  const acceptanceScale = (pct) => {
    const scale = D().amexAcceptance.scale;
    return scale.find((s) => pct >= s.min) || scale[scale.length - 1];
  };

  return { toUSD, fmtUSD, fmtCRC, fmtPct, esc, el, $, $$, acceptanceScale, fxRate };
})();
