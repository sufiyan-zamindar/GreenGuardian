// GreenGuardian Service Worker
const CACHE_NAME = 'greenguardian-v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return Promise.allSettled(
                    STATIC_ASSETS.map((asset) =>
                        fetch(asset)
                            .then((response) => {
                                if (response.ok) return cache.put(asset, response);
                                return null;
                            })
                            .catch(() => null)
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Never cache API calls.
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // For app shell files, use network-first to avoid stale frontend logic.
    const isAppShell = url.pathname === '/' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/app.js');

    if (isAppShell) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // For other static assets, cache-first.
    event.respondWith(
        caches.match(request)
            .then((cached) => cached || fetch(request))
    );
});

self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 192 192%27%3E%3Crect fill=%27%2310b981%27 width=%27192%27 height=%27192%27 rx=%2740%27/%3E%3Cpath fill=%27white%27 d=%27M96 32c-35.3 0-64 28.7-64 64 0 35.3 28.7 64 64 64s64-28.7 64-64c0-35.3-28.7-64-64-64z%27/%3E%3C/svg%3E',
            badge: 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 192 192%27%3E%3Crect fill=%27%2310b981%27 width=%27192%27 height=%27192%27 rx=%2740%27/%3E%3Cpath fill=%27white%27 d=%27M96 32c-35.3 0-64 28.7-64 64 0 35.3 28.7 64 64 64s64-28.7 64-64c0-35.3-28.7-64-64-64z%27/%3E%3C/svg%3E',
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'Open App' },
                { action: 'dismiss', title: 'Dismiss' }
            ]
        };

        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'open') {
        event.waitUntil(clients.openWindow('/'));
    }
});
