
```js
const CACHE_NAME = "neurix-v2";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/wallet.html",
  "/profile.html",
  "/games.html",
  "/shop-pro.html",
  "/ride.html",
  "/match.html",
  "/reels.html",
  "/explore.html",
  "/upload.html",
  "/chat.html",
  "/notifications.html"
];

// 1. Install - Save files offline
self.addEventListener("install", (event) => {
  console.log("NEURIX SW: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate - Delete old cache
self.addEventListener("activate", (event) => {
  console.log("NEURIX SW: Activated");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch - Serve from cache if offline, else from internet
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        // Save new files to cache for next time
        if (event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // If offline and no cache, show index.html
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
```
