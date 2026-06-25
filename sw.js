// sw.js - Service Worker สำหรับ PWA และ Offline Support

const CACHE_VERSION = 'astrovera-v1';
const CACHE_NAME = `astrovera-cache-${CACHE_VERSION}`;

// รายการไฟล์ที่ต้องการแคช
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/favicon.ico',
    // เพิ่มรูปภาพและไฟล์อื่นๆ ที่ต้องการ
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// รายการ API ที่ต้องการแคช (สำหรับ Offline)
const API_CACHE = [
    '/.netlify/functions/natal-chart'
];

// กำหนดอายุของ Cache (30 วัน)
const CACHE_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

// เมื่อติดตั้ง Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Skip waiting');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// เมื่อเปิดใช้งาน Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName.startsWith('astrovera-cache-')) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Claiming clients');
                return self.clients.claim();
            })
    );
});

// จัดการ Fetch Requests
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // แยกการจัดการ API และ Static Files
    if (url.pathname.includes('/.netlify/functions/')) {
        // จัดการ API Request
        event.respondWith(handleAPIFetch(request));
    } else {
        // จัดการ Static Assets
        event.respondWith(handleStaticFetch(request));
    }
});

// จัดการ API Fetch
async function handleAPIFetch(request) {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(request.url);

    // ลองหาข้อมูลจาก Cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        // ตรวจสอบอายุของ Cache
        const cacheDate = cachedResponse.headers.get('sw-cache-date');
        if (cacheDate) {
            const age = Date.now() - parseInt(cacheDate);
            if (age < CACHE_EXPIRATION) {
                return cachedResponse;
            }
        }
    }

    try {
        // ลอง Fetch จาก Network
        const networkResponse = await fetch(request.clone());
        
        // บันทึกใน Cache
        const responseToCache = networkResponse.clone();
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cache-date', Date.now().toString());
        
        const cachedResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
        });
        
        cache.put(request, cachedResponse);
        
        return networkResponse;
    } catch (error) {
        // ถ้า Network ล้มเหลวและมี Cache ให้ส่ง Cache กลับ
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            // ส่ง response พร้อม header บอกว่ามาจาก Cache
            const headers = new Headers(cachedResponse.headers);
            headers.set('sw-cache-source', 'offline');
            
            return new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: headers
            });
        }
        
        // ถ้าไม่มี Cache และ Network ล้มเหลว
        return new Response(JSON.stringify({
            success: false,
            error: 'NetworkError',
            message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// จัดการ Static Fetch
async function handleStaticFetch(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        // ลอง Fetch จาก Network
        const networkResponse = await fetch(request.clone());
        
        // บันทึกใน Cache
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
    } catch (error) {
        // ถ้า Network ล้มเหลว ให้ส่งจาก Cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // ถ้าไม่มี Cache ให้ส่งหน้า Offline
        if (request.headers.get('Accept').includes('text/html')) {
            const offlinePage = await cache.match('/offline.html');
            if (offlinePage) {
                return offlinePage;
            }
        }
        
        // ถ้าไม่มีหน้า Offline
        return new Response('Offline - ไม่สามารถโหลดหน้าได้', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// จัดการ Push Notifications
self.addEventListener('push', event => {
    let data = {
        title: 'ASTROVERA',
        body: 'มีการอัปเดตใหม่สำหรับคุณ',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'เปิด'
            },
            {
                action: 'close',
                title: 'ปิด'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// จัดการคลิกที่ Notification
self.addEventListener('notificationclick', event => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        })
        .then(windowClients => {
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// จัดการการซิงค์ข้อมูลเมื่อออนไลน์
self.addEventListener('sync', event => {
    if (event.tag === 'sync-decisions') {
        event.waitUntil(syncDecisions());
    }
});

// ฟังก์ชันซิงค์ข้อมูลเมื่อออนไลน์
async function syncDecisions() {
    try {
        const decisions = JSON.parse(localStorage.getItem('astrovera_decisions_sync') || '[]');
        
        if (decisions.length > 0) {
            const response = await fetch('/.netlify/functions/natal-chart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'sync_decisions',
                    data: decisions
                })
            });
            
            if (response.ok) {
                localStorage.removeItem('astrovera_decisions_sync');
            }
        }
    } catch (error) {
        console.error('Error syncing decisions:', error);
    }
}

// ฟังก์ชันขออนุญาตสำหรับ Push Notification
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'REQUEST_PUSH_PERMISSION') {
        event.waitUntil(
            self.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    'YOUR_VAPID_PUBLIC_KEY' // เปลี่ยนเป็น VAPID Public Key ของคุณ
                )
            })
            .then(subscription => {
                // ส่ง subscription ไปยังเซิร์ฟเวอร์
                fetch('/.netlify/functions/natal-chart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'save_push_subscription',
                        data: subscription
                    })
                });
            })
            .catch(error => {
                console.error('Error subscribing to push:', error);
            })
        );
    }
});

// Helper function for VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
