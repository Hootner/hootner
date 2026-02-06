// Service Worker for HOOTNER Electron Code Editor
const CACHE_NAME = 'hootner-editor-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  console.log('Editor SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Editor SW: Caching editor assets');
        return cache.addAll(ASSETS);
      })
      .catch(err => {
        console.log('Editor SW: Cache installation failed:', err);
        // Continue installation even if caching fails
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Editor SW: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Editor SW: Deleting old cache:', cacheName);
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
          console.log('Editor SW: Serving from cache:', event.request.url);
          return response;
        }

        return fetch(event.request)
          .then(response => {
            // Only cache successful responses
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache))
                .catch(err => console.log('Editor SW: Cache write failed:', err));
            }
            return response;
          })
          .catch(err => {
            console.log('Editor SW: Network fetch failed:', err);
            // Return a simple offline response for the editor
            if (event.request.url.includes('.html')) {
              return new Response('<h1>Offline</h1><p>Editor is running offline.</p>', {
                headers: { 'Content-Type': 'text/html' }
              });
            }
            return new Response('Resource unavailable offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
      .catch(err => {
        console.log('Editor SW: Cache access failed:', err);
        return fetch(event.request);
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Editor Service Worker ready');
