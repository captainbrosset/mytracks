const CACHE_NAME = 'mytracks-cache-v1';
const INITIAL_RESOURCES_TO_CACHE = [
    '/mytracks/',
    '/mytracks/index.html',
    '/mytracks/error.html',
    '/mytracks/style.css',
    '/mytracks/bundle.js',
];

// On install, fill the cache with the initial resources.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(INITIAL_RESOURCES_TO_CACHE);
    })());
});

// On fetch events, do a network-first approach, so we can more easily work on the app for the time being.
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
            const fetchResponse = await fetch(event.request);
            if (!event.request.url.includes('bing.com') && fetchResponse.status === 200) {
                // Save the new resource in the cache (responses are streams, so we need to clone in order to use it here).
                cache.put(event.request, fetchResponse.clone());
            }

            // And return it.
            return fetchResponse;
        } finally {
            // Fetching didn't work let's go to the cache.
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse !== undefined) {
                // Cache hit, let's send the cached resource.
                return cachedResponse;
            } else {
                // Nothing in cache, let's go to the error page.
                if (event.request.mode === 'navigate') {
                    const errorResponse = await cache.match('error.html');
                    return errorResponse;
                }
            }
        }
    })());
});
