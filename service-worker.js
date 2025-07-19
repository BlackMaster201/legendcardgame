const CACHE_NAME = "ygo-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./LCG.png",
  "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // 🔄 Solo cachea los archivos CSV que contienen "Ronda-"
  if (url.pathname.includes("Ronda-") && url.pathname.endsWith(".csv")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        fetch(request)
          .then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cache.match(request))
      )
    );
    return;
  }

  // 🌐 Para todo lo demás, primero busca en caché
  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request)
    )
  );
});
