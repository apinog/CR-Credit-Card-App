/**
 * engine/fx.js — Live FX rate from BCCR (Banco Central de Costa Rica).
 *
 * Fetches the official USD→CRC sell rate via BCCR's public SOAP/JSON service.
 * Falls back gracefully to a cached rate, then to the hardcoded default.
 * Rate is cached in sessionStorage for 1 hour to avoid hammering the API.
 *
 * Usage:
 *   await CRW.fx.init();       // call once on boot
 *   CRW.fx.rate()              // → number (CRC per USD)
 *   CRW.fx.meta()              // → { rate, source, timestamp, age }
 */
window.CRW = window.CRW || {};

CRW.fx = (() => {
  const CACHE_KEY = "crw-fx-v1";
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour
  const FALLBACK = 505;

  // BCCR SOAP endpoint proxied via allorigins to avoid CORS
  // Indicator 318 = USD sell (venta) reference rate
  const BCCR_URL = () => {
    const today = new Date().toLocaleDateString("es-CR", { timeZone: "America/Costa_Rica" });
    return `https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicosXML?Indicador=318&FechaInicio=${today}&FechaFinal=${today}&Nombre=PuraWallet&SubNiveles=N&CorreoElectronico=&Token=`;
  };

  // Fallback: open exchange rates (no key needed for latest base USD)
  const OPENEX_URL = "https://open.er-api.com/v6/latest/USD";

  let _rate = FALLBACK;
  let _source = "default";
  let _timestamp = null;

  function saveCache(rate, source) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rate, source, ts: Date.now() }));
    } catch (_) {}
  }

  function loadCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (Date.now() - d.ts < CACHE_TTL) return d;
    } catch (_) {}
    return null;
  }

  async function fetchBCCR() {
    // BCCR returns XML; parse the value out
    const res = await fetch(BCCR_URL(), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("BCCR HTTP " + res.status);
    const text = await res.text();
    const match = text.match(/<NUM_VALOR>([\d.,]+)<\/NUM_VALOR>/);
    if (!match) throw new Error("BCCR parse fail");
    const val = parseFloat(match[1].replace(",", "."));
    if (isNaN(val) || val < 400 || val > 800) throw new Error("BCCR value out of range: " + val);
    return val;
  }

  async function fetchOpenExRates() {
    const res = await fetch(OPENEX_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("OpenEx HTTP " + res.status);
    const data = await res.json();
    const val = data?.rates?.CRC;
    if (!val || isNaN(val)) throw new Error("OpenEx CRC missing");
    return val;
  }

  async function init() {
    // 1. Try session cache
    const cached = loadCache();
    if (cached) {
      _rate = cached.rate;
      _source = cached.source + " (cached)";
      _timestamp = cached.ts;
      return;
    }

    // 2. Try BCCR (official)
    try {
      const val = await fetchBCCR();
      _rate = val;
      _source = "BCCR";
      _timestamp = Date.now();
      saveCache(val, "BCCR");
      return;
    } catch (e) {
      console.warn("BCCR FX fetch failed:", e.message);
    }

    // 3. Try open.er-api (free, no key)
    try {
      const val = await fetchOpenExRates();
      _rate = Math.round(val);
      _source = "open.er-api";
      _timestamp = Date.now();
      saveCache(_rate, "open.er-api");
      return;
    } catch (e) {
      console.warn("OpenEx FX fetch failed:", e.message);
    }

    // 4. Hardcoded fallback
    _rate = window.CRW_DATA?.rewardRules?.fx?.crcPerUsd || FALLBACK;
    _source = "fallback";
    _timestamp = null;
  }

  const rate = () => _rate;
  const meta = () => ({ rate: _rate, source: _source, timestamp: _timestamp });

  return { init, rate, meta };
})();
