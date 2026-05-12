// Service Worker for Travel Log (PWA, GitHub Pages)
// Strategy:
//   - Navigation & shell:    stale-while-revalidate
//   - 3rd-party CDNs / fonts: stale-while-revalidate / cache-first
//   - Firestore:             never intercepted (real-time live data)

const VERSION = 'v2';
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
                    .map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

const staleWhileRevalidate = async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const network = fetch(request).then((res) => {
        if (res && res.status === 200) cache.put(request, res.clone());
        return res;
    }).catch(() => cached);
    return cached || network;
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Real-time data — must go to network
    if (
        url.hostname.endsWith('firestore.googleapis.com') ||
        url.hostname.endsWith('firebaseio.com') ||
        url.hostname.endsWith('identitytoolkit.googleapis.com') ||
        url.hostname.endsWith('securetoken.googleapis.com')
    ) {
        return;
    }

    // Navigation: serve cached index, update in background
    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                const cache = await caches.open(SHELL_CACHE);
                const cached = await cache.match(request);
                const network = fetch(request).then((res) => {
                    if (res && res.status === 200) cache.put(request, res.clone());
                    return res;
                }).catch(() => cached);
                return cached || network;
            })()
        );
        return;
    }

    if (FONT_HOSTS.some((h) => url.hostname.endsWith(h))) {
        event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
        return;
    }

    if (url.origin === self.location.origin) {
        event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    }
});
