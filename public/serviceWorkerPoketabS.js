const OFFLINE_VERSION = 5;
const CACHE_NAME = 'offline';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			await caches.keys().then(cacheNames => {
				return Promise.all(
					cacheNames.map(cache => {
						if (cache !== CACHE_NAME+'-'+OFFLINE_VERSION) {
							console.log('%cService Worker: Clearing Old cache', 'color: blue;');
							return caches.delete(cache);
						}
					})
				);
			});
			const cache = await caches.open(CACHE_NAME+'-'+OFFLINE_VERSION);
			await cache.addAll([
				new Request(OFFLINE_URL, { cache: 'reload' }),
				'/fonts/comic-webfont.woff2',
				'/images/avatars/pikachu.webp',
				'/images/offline.png',
				'/scripts/themeLoader.js',
			]);
		})()
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			if ('navigationPreload' in self.registration) {
				await self.registration.navigationPreload.enable();
			}
		})()
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	if (event.request.mode === 'navigate') {
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
					console.log('%cFetch failed; returning offline page instead.', 'color: orangered;');
					const cache = await caches.open(CACHE_NAME+'-'+OFFLINE_VERSION);
					const cachedResponse = await cache.match(OFFLINE_URL);
					return cachedResponse;
				}
			})()
		);
	} else if (event.request.url.includes('/fonts/comic-webfont.woff2')) {
		event.respondWith(
			response(event)
		);
	} else if (event.request.url.includes('/images/offline.png')) {
		event.respondWith(
			response(event)
		);
	} else if (event.request.url.includes('/scripts/themeLoader.js')) {
		event.respondWith(
			response(event)
		);
	}
});

async function response (event){
	const cache = await caches.open(CACHE_NAME+'-'+OFFLINE_VERSION);
	const cachedResponse = await cache.match(event.request);
	if (cachedResponse) {
		return cachedResponse;
	} else {
		const networkResponse = await fetch(event.request);
		cache.put(event.request, networkResponse.clone());
		return networkResponse;
	}
}
  

console.log('%cService Worker: Poketab Messenger is running', 'color: limegreen;');