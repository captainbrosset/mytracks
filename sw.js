const CACHE_NAME = 'mytracks-cache-v1';
const INITIAL_RESOURCES_TO_CACHE = [
    '/',
    '/index.html',
    '/error.html',
    '/style.css',
    '/map.js',
];

// On install, fill the cache with the initial resources.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(INITIAL_RESOURCES_TO_CACHE);
    })());
});

// On fetch events, look for the resource in the cache, or download from the network.
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        
        const response = await cache.match(event.request);
        if (response !== undefined) {
            // Cache hit, let's send the cached resource.
            return response;
        } else {
            // Cache miss, let's fetch the resource
            try {
                const fetchResponse = await fetch(event.request);

                // Save the new resource in the cache (responses are streams, so we need to clone in order to use it here).
                cache.put(event.request, fetchResponse.clone());

                // And return it.
                return fetchResponse;
            } catch (e) {
                // Fetching the resource didn't work, let's go to the error page if this was a navigation request.
                if (event.request.mode === 'navigate') {
                    const errorResponse = await cache.match('error.html');
                    return errorResponse;
                }
            }
        }
    })());
});
