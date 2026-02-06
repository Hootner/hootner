// Service Worker for HOOTNER Dashboard
const CACHE_NAME = 'hootner-dashboard-v1';
const ASSETS = [
  './dashboard.html',
  './video-player.html',
  './shared-styles.css'
];

self.addEventListener('install', event => {
  console.log('Dashboard SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Dashboard SW: Caching dashboard assets');
        return cache.addAll(ASSETS);
      })
      .catch(err => {
        console.log('Dashboard SW: Cache installation failed:', err);
        // Continue installation even if caching fails
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Dashboard SW: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Dashboard SW: Deleting old cache:', cacheName);
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
          console.log('Dashboard SW: Serving from cache:', event.request.url);
          return response;
        }

        return fetch(event.request)
          .then(response => {
            // Only cache successful responses
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache))
                .catch(err => console.log('Dashboard SW: Cache write failed:', err));
            }
            return response;
          })
          .catch(err => {
            console.log('Dashboard SW: Network fetch failed:', err);
            return new Response('Service temporarily unavailable', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
      .catch(err => {
        console.log('Dashboard SW: Cache access failed:', err);
        return fetch(event.request);
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Dashboard Service Worker ready');
