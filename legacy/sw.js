// Service Worker for Travel Log PWA
// Strategy:
//   - App shell (index.html, manifest):   stale-while-revalidate
//   - 3rd-party libs (unpkg/gstatic/etc): cache-first (immutable URLs)
//   - Google Fonts CSS/woff2:             stale-while-revalidate
//   - Firestore / API calls:              network-only (real-time data)

const VERSION = 'v1';
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const SHELL_ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
];

const CDN_HOSTS = [
    'unpkg.com',
    'cdn.tailwindcss.com',
    'www.gstatic.com',
];

const FONT_HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

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

const cacheFirst = async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Skip Firestore / real-time API — must be live
    if (url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('identitytoolkit.googleapis.com')) {
        return;
    }

    // Navigation requests: serve cached shell, update in background
    if (request.mode === 'navigate') {
        event.respondWith(
            staleWhileRevalidate(new Request('./index.html'), SHELL_CACHE)
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    if (CDN_HOSTS.some((h) => url.hostname.endsWith(h))) {
        event.respondWith(cacheFirst(request, RUNTIME_CACHE));
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
