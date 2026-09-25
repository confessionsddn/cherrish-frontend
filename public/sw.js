// Cherrish combined Service Worker
// IMPORTANT: OneSignal's push handling and this PWA cache must live in ONE
// service worker at the root scope. Two separate workers registered at "/"
// overwrite each other, which silently breaks OneSignal push subscriptions.
// So we import the OneSignal SDK worker here and add our caching below.
importScripts('/OneSignalSDKWorker.js');

const CACHE_NAME = 'cherrish-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests
  if (event.request.url.includes('/api/')) return;
  if (event.request.url.includes('socket.io')) return;

  // Skip OneSignal's own requests and SDK assets — let the SDK handle them
  if (event.request.url.includes('onesignal') || event.request.url.includes('OneSignal')) return;

  // Skip external/CDN requests (fonts, analytics, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip video/audio files (they use range requests which return 206)
  const path = url.pathname.toLowerCase();
  if (path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.mp3') || path.endsWith('.ogg')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache full successful responses (not 206 partial)
        if (response.ok && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline - serve from cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});
