# Pura Wallet — Costa Rica Credit Card Rewards Optimizer

A configuration-driven, single-page PWA that answers "which card should I use?" for purchases in Costa Rica, with a special focus on estimated **American Express acceptance** by province and merchant category.

**Stack:** HTML + CSS + vanilla JS. No build step, no backend, no dependencies.

---

## Run it

**Locally:** open `index.html` in any browser. Everything works from `file://` (data ships as JS modules, not fetched JSON, precisely so this works). The service worker/offline mode is skipped on `file://` — that's expected.

**GitHub Pages:**
1. Push this folder to a repo.
2. Settings → Pages → deploy from branch (root).
3. Open the published URL.

**Install on iPhone (PWA):**
1. Open the GitHub Pages URL in Safari.
2. Share → **Add to Home Screen**.
3. Launches full-screen with the app icon; the service worker caches the shell for offline use.

---

## Architecture

```
cr-wallet/
├── index.html                 App shell (nav, view containers, script wiring)
├── manifest.webmanifest       PWA manifest
├── sw.js                      Service worker (offline app shell)
├── css/styles.css             Design tokens + all styling (dark/light)
├── data/                      ★ ALL configuration lives here ★
│   ├── cards.data.js          Your cards: fees, rates, benefits, art
│   ├── rewardRules.data.js    FX rate, recommendation weighting, promotions (P2)
│   ├── merchantCategories.data.js
│   ├── merchants.data.js      Known merchants w/ Amex overrides
│   ├── provinces.data.js      Province metadata + map label anchors
│   ├── amexAcceptance.data.js Estimated acceptance by province × category
│   └── mapPaths.data.js       Generated real province SVG geometry
├── js/
│   ├── utils.js               Formatting, FX, DOM helpers (pure)
│   ├── state.js               localStorage store (recent calcs, prefs)
│   ├── engine/rewards.js      ★ Business logic, zero DOM ★
│   ├── ui/{dashboard,cards,optimizer,map}.js
│   └── app.js                 Router, theme, PWA bootstrap
├── assets/icons/              PWA icons (generated placeholders)
└── tools/geo/to_svg.py        Regenerates mapPaths from GeoJSON
```

**Principles**
- Presentation (`js/ui/*`) never computes; logic (`js/engine/*`) never touches the DOM.
- Anything you might want to change lives in `data/` — cards, rates, FX, acceptance estimates, merchants.
- Data files are plain JS (`window.CRW_DATA.*`) instead of fetched JSON so the app runs from `file://`. They are JSON-shaped; converting to fetched `.json` later is a 10-line change.

## Common edits

| I want to… | Edit |
|---|---|
| Replace the Promerica card | `data/cards.data.js` — copy a card object, set old one `active:false` |
| Fix a reward rate after verifying | `data/cards.data.js` → `rewards`, set `estimate:false` |
| Update the FX rate | `data/rewardRules.data.js` → `fx.crcPerUsd` |
| Adjust an acceptance estimate | `data/amexAcceptance.data.js` |
| Add a merchant | `data/merchants.data.js` |
| Add a promotion (Phase 2) | `data/rewardRules.data.js` → `promotions[]` |

## The map

Real province geometry from IGN Costa Rica boundaries (via `schweini/CR_distritos_geojson`), simplified with Douglas-Peucker to ~25 KB and projected to a responsive SVG. Each province is a focusable, clickable `<path>` colored by the acceptance scale in `amexAcceptance.data.js`. Regenerate at different fidelity with `tools/geo/to_svg.py`.

## Honest-data policy

- Every reward rate ships flagged `estimate: true` and the UI badges it until you verify against statements/T&Cs.
- Acceptance figures are **personal heuristics** (urbanization, tourism, merchant mix, BAC/Amex footprint) — the UI labels them as estimates everywhere, never as official statistics.

## How the optimizer ranks (Phase 1)

`expectedValueUSD = rewardValueUSD × P(acceptance)`

Acceptance resolution order: merchant override → province × category → province overall → national average. Visa/MC assumed 99%. Below the warn threshold (60%, configurable) the optimizer tells you to carry a backup card.

## Roadmap

- **Phase 2:** projections engine (weekly→annual, category mix), merchant explorer, card comparison scoring, promotions & caps enforcement, dashboard widgets.
- **Phase 3:** charts, animations, offline polish, accessibility pass, docs; groundwork for OCR receipts, GPS nearby-merchants, live FX, CSV import, Apple Shortcuts.
