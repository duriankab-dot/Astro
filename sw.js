// ASTROVERA Service Worker v2 — fixed POST cache bug
const CACHE_NAME = 'astrovera-v2';

// ไฟล์ที่ต้องการ cache (GET only)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/og-image.png',
  '/manifest.json',
];

// Install
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // cache เฉพาะ GET — ไม่ cache POST
      return Promise.allSettled(
        STATIC_ASSETS.map(function(url) {
          return fetch(new Request(url, { method: 'GET' }))
            .then(function(res) {
              if (res.ok) return cache.put(url, res);
            })
            .catch(function() {});
        })
      );
    })
  );
});

// Activate — ลบ cache เก่า
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch — GET เท่านั้นที่ cache ได้
self.addEventListener('fetch', function(e) {
  // ข้าม POST, PUT, DELETE ทั้งหมด — ปล่อยไปเน็ตตรงๆ
  if (e.request.method !== 'GET') return;

  // ข้าม API calls (netlify functions)
  var url = e.request.url;
  if (url.includes('/.netlify/') || url.includes('/api/')) return;
  if (url.includes('anthropic') || url.includes('supabase')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        // cache เฉพาะ response ที่ ok และ GET
        if (res && res.ok && e.request.method === 'GET') {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return res;
      }).catch(function() {
        // offline fallback
        return caches.match('/index.html');
      });
    })
  );
});
