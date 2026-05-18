// Lightweight geocoder backed by Nominatim (OpenStreetMap).
//
// Nominatim is free and key-less but enforces 1 req/sec and asks for a real
// User-Agent / Referer. We serialize requests through a tiny queue, cache
// results in localStorage indefinitely, and silently fail on errors so the
// rest of the UI degrades gracefully.

interface LatLng {
    lat: number;
    lng: number;
}

const CACHE_KEY = 'travel_log:geocode_cache_v1';
const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

type Cache = Record<string, LatLng | 'failed'>;

const loadCache = (): Cache => {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
};

const saveCache = (cache: Cache) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* quota */ }
};

let queue: Promise<unknown> = Promise.resolve();
const RATE_LIMIT_MS = 1100;

export const geocode = async (query: string): Promise<LatLng | null> => {
    const q = query.trim();
    if (!q) return null;

    const cache = loadCache();
    const cached = cache[q];
    if (cached === 'failed') return null;
    if (cached) return cached;

    const job = queue.then(async () => {
        await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
        try {
            const url = `${ENDPOINT}?format=json&limit=1&q=${encodeURIComponent(q)}`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'zh-TW,zh,en' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json() as Array<{ lat: string; lon: string }>;
            if (!data.length) {
                const c = loadCache(); c[q] = 'failed'; saveCache(c);
                return null;
            }
            const result: LatLng = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            const c = loadCache(); c[q] = result; saveCache(c);
            return result;
        } catch (err) {
            console.warn('[geocode] failed for', q, err);
            return null;
        }
    });

    queue = job.catch(() => undefined);
    return job;
};
