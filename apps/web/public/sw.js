const CACHE_NAME = 'kozmetik-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'REVELA';
  const options = {
    body: data.body || 'Yeni bir güncelleme var!',
    icon: '/logos/icon-192x192.png',
    badge: '/logos/icon-72x72.png',
    data: { url: data.url || '/' },
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const match = clients.find((c) => c.url.includes(url));
      if (match) return match.focus();
      return self.clients.openWindow(url);
    })
  );
});

// Fetch: network-first for API, stale-while-revalidate for pages/assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API calls: network-first with 3s timeout
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      Promise.race([
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets & pages: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
