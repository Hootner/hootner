const CACHE_NAME = 'hootner-frontend-v1';
const urlsToCache = [
  './',
  './index.html',
  './cinema-player.html',
  './dashboard.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching assets');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('SW: Cache installation failed:', err);
        // Don't fail installation completely
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only handle GET requests for HTTP protocols
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('SW: Serving from cache:', event.request.url);
          return response;
        }

        console.log('SW: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Check if response is valid for caching
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => console.log('SW: Cache write failed:', err));

            return response;
          })
          .catch(err => {
            console.log('SW: Fetch failed:', err);
            return new Response('Network error', {
              status: 408,
              statusText: 'Request Timeout'
            });
          });
      })
      .catch(err => {
        console.log('SW: Cache match failed:', err);
        return fetch(event.request).catch(() => {
          return new Response('Service unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Handle skip waiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker loaded successfully');
