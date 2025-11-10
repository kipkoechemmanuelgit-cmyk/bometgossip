// js/service-worker.js - Service Worker for offline functionality

const CACHE_NAME = 'bomet-county-hub-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/news.html',
    '/resources.html',
    '/about.html',
    '/css/style.css',
    '/js/app.js',
    '/js/news.js',
    '/js/resources.js',
    '/data/news.json',
    '/data/resources.json',
    '/data/categories.json'
];

// Install event - cache essential files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installed');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(() => {
                // If both cache and network fail, show offline page
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Background sync for news updates (future enhancement)
self.addEventListener('sync', event => {
    if (event.tag === 'news-update') {
        console.log('Background sync for news updates');
        // Could implement background news updates here
    }
});