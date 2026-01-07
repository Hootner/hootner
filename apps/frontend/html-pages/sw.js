const CACHE_VERSION = 'hootner-v1';
const CRITICAL_CACHE = 'hootner-critical-v1';
const DYNAMIC_CACHE = 'hootner-dynamic-v1';

const CRITICAL_ASSETS = [
  '/video-player.html',
  '/dashboard.html',
  '/lazy-load-manager.js',
  '/shared-styles.css'
];

self.addEventListener('install', (event) => { event.waitUntil(
    caches.open(CRITICAL_CACHE).then((cache) => { return cache.addAll(CRITICAL_ASSETS); })
  );
  self.skipWaiting(); });

self.addEventListener('activate', (event) => { event.waitUntil(
    caches.keys().then((cacheNames) => { return Promise.all(
        cacheNames.map((cacheName) => { if (cacheName !== CRITICAL_CACHE && cacheName !== DYNAMIC_CACHE) { return caches.delete(cacheName); } })
      ); })
  );
  self.clients.claim(); });

self.addEventListener('fetch', (event) => { const { request } = event;

  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => { if (cachedResponse) { return cachedResponse; }

      return fetch(request).then((response) => { if (!response || response.status !== 200 || response.type === 'error') { return response; }

        const shouldCache =
          request.url.includes('.js') ||
          request.url.includes('.css') ||
          request.url.includes('.html') ||
          request.url.includes('.jpg') ||
          request.url.includes('.png') ||
          request.url.includes('.webp');

        if (shouldCache) { const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => { cache.put(request, responseToCache); }); }

        return response; }); })
  ); });
