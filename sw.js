// Service Worker for offline support (PWA + iOS Safari)
const CACHE_NAME = 'currency-exchange-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './ultimate-styles.css',
  './advanced-pro-styles.css',
  './enterprise-styles.css',
  './iraqi-exchange-styles.css',
  './admin-rates-styles.css',
  './navigation.css',
  './mobile-responsive.css',
  './ios-styles.css',
  './app.js',
  './shared-utilities.js',
  './advanced-features.js',
  './premium-features.js',
  './ultimate-features.js',
  './advanced-pro-features.js',
  './enterprise-features.js',
  './iraqi-exchange-rates.js',
  './navigation.js',
  './ios-bridge.js',
  './ios-install.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(function () {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
