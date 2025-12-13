/* eslint-disable no-restricted-globals */

// Service Worker for House of Paradise PWA
const CACHE_NAME = 'house-of-paradise-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for cache
          const responseClone = response.clone();

          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - Cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          console.log('📦 Service Worker: Serving from cache:', request.url);
          return response;
        }

        // Not in cache, fetch from network
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone response for cache
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');

  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Push notification
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification received');

  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'New update from House of Paradise!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/view-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/close-icon.png'
      }
    ],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'House of Paradise', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }

          // Otherwise open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Helper function to sync bookings
async function syncBookings() {
  try {
    // Get failed booking requests from IndexedDB (if any)
    // Retry them when back online
    console.log('📤 Service Worker: Syncing bookings...');

    // TODO: Implement actual sync logic with IndexedDB
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Service Worker: Sync failed:', error);
    return Promise.reject(error);
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Service Worker: Periodic sync triggered');

  if (event.tag === 'update-prices') {
    event.waitUntil(updatePrices());
  }
});

async function updatePrices() {
  try {
    console.log('💰 Service Worker: Updating prices...');
    // Fetch latest prices for wishlisted hotels
    // Check price alerts
    // TODO: Implement price update logic
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Service Worker: Price update failed:', error);
    return Promise.reject(error);
  }
}

console.log('🎯 House of Paradise Service Worker Loaded!');
