const OFFLINE_VERSION = 1212;
const CACHE_NAME = "offline";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME+"-"+OFFLINE_VERSION) {
              console.log('Service Worker: Clearing Old cache');
              return caches.delete(cache);
            }
          })
        );
      });
      const cache = await caches.open(CACHE_NAME+"-"+OFFLINE_VERSION);
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {

          console.log("Fetch failed; returning offline page instead.", error);

          const cache = await caches.open(CACHE_NAME+"-"+OFFLINE_VERSION);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  }
});