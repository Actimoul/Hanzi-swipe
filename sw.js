const CACHE_NAME = 'hanzi-swipe-v8';
const ASSETS = [
  '/Hanzi-swipe/',
  '/Hanzi-swipe/index.html',
  '/Hanzi-swipe/icon.png',
  '/Hanzi-swipe/Bg.jpg',
  '/Hanzi-swipe/Bg2.jpg',
  '/Hanzi-swipe/manifest.json'
];

// Install : mise en cache des assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate : suppression des anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch : cache-first pour les assets, network-first pour le reste
self.addEventListener('fetch', function(event) {
  // Ignorer les requêtes non-GET et les CDN externes
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Mettre en cache les nouvelles ressources valides
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback : retourner index.html
        return caches.match('/Hanzi-swipe/index.html');
      });
    })
  );
});
