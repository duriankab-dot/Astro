// sw.js — Service Worker for ASTROVERA (single-file static app)
//
// IMPORTANT: this app is one self-contained HTML file (index.html) — there is
// no separate /css or /js build output, and no /api backend yet. This worker
// is intentionally simple: cache the app shell + icons + manifest, serve them
// cache-first so the app opens instantly and works offline, and fall back to
// offline.html only for navigations that can't be served from cache.

const CACHE_NAME = 'astrovera-v1.8.1';
const OFFLINE_URL = './offline.html';

// Everything the app needs to run with zero network access once cached.
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './favicon.ico',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap'
];

// ============ Install ============
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        // addAll fails the whole install if ONE request fails (e.g. the Google
        // Fonts request, if offline during install) — so cache them individually
        // and don't let a font hiccup block the app shell from installing.
        return Promise.all(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => console.warn('[SW] Skip caching', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ============ Activate ============
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ============ Fetch ============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navigations (opening/refreshing the app) — try cache first since the
  // whole app is one file, fall back to network, fall back to offline.html.
  if (request.mode === 'navigate') {
    event.respondWith(cacheFirstWithOfflineFallback(request));
    return;
  }

  // Everything else (icons, manifest, fonts) — cache first.
  event.respondWith(cacheFirst(request));
});

// ============ Strategies ============

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.error('[SW] Fetch failed:', request.url, err);
    return new Response('Network error', { status: 503 });
  }
}

async function cacheFirstWithOfflineFallback(request) {
  const cached = await caches.match(request) || await caches.match('./index.html');
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const fallback = await caches.match(OFFLINE_URL);
    if (fallback) return fallback;
    return new Response('Offline', { status: 503 });
  }
}

// ============ Push Notification (for future Follow-up reminders) ============
// Inactive until a real push subscription + push server exist. Safe to leave
// registered — it just won't fire without a backend sending pushes.
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'ถึงเวลาบันทึก Journal แล้ว!',
    icon: './android-chrome-192x192.png',
    badge: './favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || './' }
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'ASTROVERA', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
