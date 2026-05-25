const CACHE_NAME = 'halaltune-admin-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/appicon.png',
    '/manifest.json'
];

self.addEventListener('install', event => {
    // Force the new service worker to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    // Clear old caches
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
});

self.addEventListener('fetch', event => {
    // Network-first for admin — always fetch fresh data, fall back to cache
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
