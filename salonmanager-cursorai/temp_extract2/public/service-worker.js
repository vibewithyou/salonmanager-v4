const CACHE_NAME = 'salonmanager-v1.0.0';
const STATIC_CACHE = 'salonmanager-static-v1';
const DYNAMIC_CACHE = 'salonmanager-dynamic-v1';

const STATIC_ASSETS = [
    '/',
    '/css/app.css',
    '/js/app.js',
    '/manifest.json',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png',
    '/offline.html'
];

const API_CACHE = [
    '/api/appointments',
    '/api/services',
    '/api/customers',
    '/api/analytics'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle static assets
    if (isStaticAsset(request.url)) {
        event.respondWith(handleStaticAsset(request));
        return;
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    // Default: network first, fallback to cache
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, responseClone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});

// Handle API requests with cache strategy
async function handleApiRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);
        
        if (response.status === 200) {
            // Cache successful API responses
            const responseClone = response.clone();
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, responseClone);
        }
        
        return response;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API requests
        return new Response(
            JSON.stringify({ error: 'Offline - No cached data available' }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static assets with cache first strategy
async function handleStaticAsset(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const response = await fetch(request);
        if (response.status === 200) {
            const responseClone = response.clone();
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, responseClone);
        }
        return response;
    } catch (error) {
        return new Response('Asset not available offline', { status: 404 });
    }
}

// Handle navigation requests
async function handleNavigation(request) {
    try {
        const response = await fetch(request);
        return response;
    } catch (error) {
        // Return offline page for navigation requests
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        return new Response(
            '<html><body><h1>Offline</h1><p>Bitte überprüfen Sie Ihre Internetverbindung.</p></body></html>',
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

// Check if request is for a static asset
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.includes(asset)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.svg') ||
           url.includes('.woff') ||
           url.includes('.woff2');
}

// Push notification event
self.addEventListener('push', event => {
    console.log('Push notification received:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Neue Benachrichtigung',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Anzeigen',
                icon: '/images/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Schließen',
                icon: '/images/icons/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('SalonManager', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Background sync:', event);
    
    if (event.tag === 'appointment-sync') {
        event.waitUntil(syncAppointments());
    } else if (event.tag === 'data-sync') {
        event.waitUntil(syncData());
    }
});

// Sync appointments when back online
async function syncAppointments() {
    try {
        const db = await openDB();
        const offlineAppointments = await db.getAll('offlineAppointments');
        
        for (const appointment of offlineAppointments) {
            try {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': appointment.csrfToken
                    },
                    body: JSON.stringify(appointment.data)
                });
                
                if (response.ok) {
                    await db.delete('offlineAppointments', appointment.id);
                }
            } catch (error) {
                console.error('Failed to sync appointment:', error);
            }
        }
    } catch (error) {
        console.error('Error syncing appointments:', error);
    }
}

// Sync general data when back online
async function syncData() {
    try {
        const db = await openDB();
        const offlineData = await db.getAll('offlineData');
        
        for (const data of offlineData) {
            try {
                const response = await fetch(data.url, {
                    method: data.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': data.csrfToken
                    },
                    body: data.body ? JSON.stringify(data.body) : undefined
                });
                
                if (response.ok) {
                    await db.delete('offlineData', data.id);
                }
            } catch (error) {
                console.error('Failed to sync data:', error);
            }
        }
    } catch (error) {
        console.error('Error syncing data:', error);
    }
}

// IndexedDB helper
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SalonManagerDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('offlineAppointments')) {
                db.createObjectStore('offlineAppointments', { keyPath: 'id', autoIncrement: true });
            }
            
            if (!db.objectStoreNames.contains('offlineData')) {
                db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
} 