// Smart Attendance - Service Worker
const CACHE_NAME = 'smart-attendance-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.svg',
  '/logo512.svg',
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate the new SW immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls and external requests - always go to network
  if (url.pathname.startsWith('/api') || url.origin !== location.origin) {
    return;
  }

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline - try cache first, then offline page
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images) - cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached version and update cache in background
        fetch(request)
          .then((response) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          })
          .catch(() => { });
        return cached;
      }

      // Not in cache - fetch from network and cache it
      return fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If it's an image, return nothing rather than error
          if (request.destination === 'image') {
            return new Response('', { status: 404 });
          }
        });
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
