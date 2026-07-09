/**
 * sw.js — offline app shell (cache-first for same-origin static assets).
 * Bump CACHE_VERSION whenever files change so clients refresh.
 */
const CACHE_VERSION = "crw-v1";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/styles.css",
  "./js/utils.js", "./js/state.js", "./js/app.js",
  "./js/engine/rewards.js",
  "./js/ui/dashboard.js", "./js/ui/cards.js", "./js/ui/optimizer.js", "./js/ui/map.js",
  "./data/rewardRules.data.js", "./data/merchantCategories.data.js",
  "./data/cards.data.js", "./data/merchants.data.js",
  "./data/provinces.data.js", "./data/amexAcceptance.data.js", "./data/mapPaths.data.js",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // same-origin: cache-first; cross-origin (fonts): network-first with cache fallback
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
  } else {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
