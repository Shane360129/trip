import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, RefreshCw } from 'lucide-react';
import { geocode } from '../utils/geocode';
import type { ItineraryItem } from '../types';

interface DayMapViewProps {
    items: ItineraryItem[];
    /** CSS variable name (without --) used for pins + route, e.g. "accent" */
    accentVar?: string;
    onItemClick?: (item: ItineraryItem) => void;
    onResolved?: (resolved: ItineraryItem[]) => void;
}

const readCssVar = (name: string, fallback: string): string => {
    if (typeof window === 'undefined') return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
    return v || fallback;
};

interface ResolvedItem extends ItineraryItem {
    lat: number;
    lng: number;
}

const isResolved = (item: ItineraryItem): item is ResolvedItem =>
    typeof item.lat === 'number' && typeof item.lng === 'number';

// Build a numbered SVG pin so the map order is obvious without external assets.
const makePinIcon = (label: string, color: string) => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
  <defs>
    <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path filter="url(#s)" d="M16 2c-7.7 0-14 6.1-14 13.7 0 9.8 12.7 25.6 13.2 26.3a1 1 0 0 0 1.6 0c.5-.7 13.2-16.5 13.2-26.3C30 8.1 23.7 2 16 2z" fill="${color}" stroke="white" stroke-width="2"/>
  <circle cx="16" cy="15" r="9" fill="white"/>
  <text x="16" y="20" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" text-anchor="middle" fill="${color}">${label}</text>
</svg>`.trim();
    return L.divIcon({
        html: svg,
        className: 'travel-map-pin',
        iconSize: [32, 44],
        iconAnchor: [16, 42],
        popupAnchor: [0, -36],
    });
};

export const DayMapView = ({ items, accentVar = 'accent', onItemClick, onResolved }: DayMapViewProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layerRef = useRef<L.LayerGroup | null>(null);
    const [, setResolveTick] = useState(0);
    const accentColor = useMemo(() => readCssVar(accentVar, '#C28B5A'), [accentVar]);

    const itemsWithLocation = useMemo(() => items.filter((i) => i.location.trim()), [items]);
    const resolved = useMemo(() => itemsWithLocation.filter(isResolved), [itemsWithLocation]);
    const pending = useMemo(
        () => itemsWithLocation.filter((i) => !isResolved(i) && !i.geocodeFailed),
        [itemsWithLocation]
    );

    // Resolve missing coordinates in the background.
    useEffect(() => {
        if (!pending.length) return;
        let cancelled = false;
        (async () => {
            const next: ItineraryItem[] = [...items];
            let changed = false;
            for (const item of pending) {
                if (cancelled) return;
                const result = await geocode(item.location);
                if (cancelled) return;
                const idx = next.findIndex((i) => i.id === item.id);
                if (idx === -1) continue;
                if (result) {
                    next[idx] = { ...next[idx], lat: result.lat, lng: result.lng, geocodeFailed: false };
                } else {
                    next[idx] = { ...next[idx], geocodeFailed: true };
                }
                changed = true;
                setResolveTick((t) => t + 1);
            }
            if (changed && !cancelled) onResolved?.(next);
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pending.map((p) => `${p.id}:${p.location}`).join('|')]);

    // Init / teardown the Leaflet map once.
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        const map = L.map(containerRef.current, {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: true,
        }).setView([25.0330, 121.5654], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
        }).addTo(map);
        layerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
            layerRef.current = null;
        };
    }, []);

    // Re-draw markers + route whenever the resolved set changes.
    useEffect(() => {
        const map = mapRef.current;
        const layer = layerRef.current;
        if (!map || !layer) return;
        layer.clearLayers();

        if (!resolved.length) return;

        const sorted = [...resolved].sort((a, b) =>
            (a.time || '99:99').localeCompare(b.time || '99:99'),
        );

        const points: L.LatLngExpression[] = sorted.map((i) => [i.lat, i.lng]);

        if (points.length > 1) {
            L.polyline(points, {
                color: accentColor,
                weight: 3,
                opacity: 0.7,
                dashArray: '6 8',
            }).addTo(layer);
        }

        sorted.forEach((item, idx) => {
            const marker = L.marker([item.lat, item.lng], {
                icon: makePinIcon(String(idx + 1), accentColor),
            }).addTo(layer);
            const popupHtml = `
              <div style="font-family: system-ui; min-width: 160px;">
                <div style="font-weight:800; font-size:14px; margin-bottom:2px;">${escapeHtml(item.title)}</div>
                <div style="font-size:11px; color:#777;">${escapeHtml(item.time || '--:--')} · ${escapeHtml(item.location)}</div>
              </div>`;
            marker.bindPopup(popupHtml);
            if (onItemClick) marker.on('click', () => onItemClick(item));
        });

        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }, [resolved, accentColor, onItemClick]);

    const total = itemsWithLocation.length;
    const resolvedCount = resolved.length;
    const failed = itemsWithLocation.filter((i) => i.geocodeFailed).length;

    if (!total) {
        return (
            <div className="paper-card p-6 text-center">
                <MapPin size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
                    這一天還沒有地點
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                    為行程加上地點才能顯示在地圖
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div
                className="paper-card overflow-hidden h-[360px] md:h-[480px] lg:h-[560px]"
                style={{ padding: 0 }}
            >
                <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
            </div>
            <div
                className="flex items-center justify-between text-[11px] px-1"
                style={{ color: 'var(--ink-soft)' }}
            >
                <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {resolvedCount}/{total} 已定位
                </span>
                {pending.length > 0 && (
                    <span className="flex items-center gap-1">
                        <RefreshCw size={11} className="animate-spin" />
                        定位中…
                    </span>
                )}
                {failed > 0 && pending.length === 0 && (
                    <span style={{ color: 'var(--stamp)' }}>{failed} 個地點查無位置</span>
                )}
            </div>
        </div>
    );
};

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
