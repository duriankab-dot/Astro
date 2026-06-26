// sw.js — Service Worker สำหรับ ASTROVERA PWA
const CACHE_VERSION = 'astrovera-v2';
const CACHE_NAME    = `astrovera-cache-${CACHE_VERSION}`;

// ── ไฟล์ static ที่แคชไว้ (ชื่อตรงกับ repo จริง) ──
const STATIC_ASSETS = [
  '/',
  '/astrovera-v5-3.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png'
];

const CACHE_EXPIRATION = 30 * 24 * 60 * 60 * 1000; // 30 วัน

// ── INSTALL ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW install error:', err))
  );
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => {
          if (name !== CACHE_NAME && name.startsWith('astrovera-cache-')) {
            return caches.delete(name);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/.netlify/functions/')) {
    event.respondWith(handleAPIFetch(request));
  } else {
    event.respondWith(handleStaticFetch(request));
  }
});

// ── API: Network first, Cache fallback ──
async function handleAPIFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkRes = await fetch(request.clone());
    // แคช GET เท่านั้น
    if (request.method === 'GET' && networkRes.ok) {
      const headers  = new Headers(networkRes.headers);
      headers.set('sw-cache-date', Date.now().toString());
      const toCache  = new Response(networkRes.clone().body, {
        status: networkRes.status, statusText: networkRes.statusText, headers
      });
      cache.put(request, toCache);
    }
    return networkRes;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ success: false, error: 'Offline', message: 'ไม่สามารถเชื่อมต่อได้' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ── Static: Cache first, Network fallback ──
async function handleStaticFetch(request) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkRes = await fetch(request.clone());
    if (networkRes.ok) cache.put(request, networkRes.clone());
    return networkRes;
  } catch {
    if (request.headers.get('Accept')?.includes('text/html')) {
      const offline = await cache.match('/offline.html');
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503 });
  }
}

// ── PUSH NOTIFICATIONS ──
self.addEventListener('push', event => {
  let data = { title: 'ASTROVERA', body: 'มีการอัปเดตใหม่สำหรับคุณ', icon: '/apple-touch-icon.png' };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; }
    catch { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon || '/apple-touch-icon.png',
      badge:   '/favicon-32x32.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/' },
      actions: [{ action: 'open', title: 'เปิด' }, { action: 'close', title: 'ปิด' }]
    })
  );
});

// ── NOTIFICATION CLICK ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url === urlToOpen && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

// ── BACKGROUND SYNC ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-decisions') event.waitUntil(syncDecisions());
});

async function syncDecisions() {
  try {
    const raw = await self.clients.matchAll().then(() =>
      // Service Worker ไม่เข้าถึง localStorage โดยตรง
      // ใช้ IDB ในอนาคต — ตอนนี้ no-op
      Promise.resolve([])
    );
  } catch(e) {
    console.error('sync error:', e);
  }
}
