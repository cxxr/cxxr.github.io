// Service Worker for Dino Keys PWA
// Provides 100% offline capability, instant app shell caching, and background update checks.

const CACHE_NAME = 'dino-keys-v1.1.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './bundle.js',
  './css/style.css',
  './manifest.webmanifest',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-167.png',
  './icons/icon-152.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
];

// Pre-cache all core app assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Precache failed:', err);
      })
  );
});

// Clean up older cache versions on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Cache-First strategy with Network Fallback & Runtime Caching
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Ignore non-http/https schemes (e.g. chrome-extension, file)
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background for next time (Stale-While-Revalidate)
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, networkResponse);
              });
            }
          })
          .catch(() => {
            // Offline - noop, we already served cached copy
          });
        return cachedResponse;
      }

      // Not in cache: fetch from network and cache
      return fetch(req)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request is for an HTML page, return cached index.html
          if (req.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html') || caches.match('./');
          }
        });
    })
  );
});
