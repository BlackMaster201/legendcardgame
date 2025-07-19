const CACHE_NAME = 'ygo-pairings-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/LCG.png',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  // Manejar archivos CSV por separado (dinámicos)
  if (event.request.url.includes('Ronda-') && event.request.url.endsWith('.csv')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => response);
      })
    );
  } else {
    // Cualquier otro archivo desde caché o red
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
