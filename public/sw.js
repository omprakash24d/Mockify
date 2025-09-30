// Service Worker for Mockify - Production Ready
// Handles caching strategies and performance optimization

const CACHE_NAME = "mockify-v1";
const STATIC_CACHE = "mockify-static-v1";
const DYNAMIC_CACHE = "mockify-dynamic-v1";

// Resources to cache immediately (production assets)
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (request.destination === "document") {
    // HTML pages - Network first, cache fallback
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  } else if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    // Static assets - Cache first, network fallback
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          // Don't cache if not successful
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        });
      })
    );
  } else {
    // API calls and other requests - Network first
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
  }
});

// Background sync for offline functionality
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync tasks
      Promise.resolve()
    );
  }
});

// Push notifications (future feature)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification from Mockify",
    icon: "/src/assets/mockify.jpeg",
    badge: "/src/assets/mockify.jpeg",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "2",
    },
    actions: [
      {
        action: "explore",
        title: "Go to app",
        icon: "/src/assets/mockify.jpeg",
      },
      {
        action: "close",
        title: "Close",
        icon: "/src/assets/mockify.jpeg",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Mockify", options));
});
