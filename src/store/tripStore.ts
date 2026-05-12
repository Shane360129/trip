import { create } from 'zustand';
import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { migrateTrip, DEFAULT_TRIP } from '../utils/migrate';
import type { Trip, TripField } from '../types';

interface TripStore {
    tripId: string | null;
    trip: Trip;
    isLoaded: boolean;
    isSyncing: boolean;
    error: string | null;
    _unsub: Unsubscribe | null;
    _localOnly: boolean;

    enterTrip: (tripId: string) => void;
    leaveTrip: () => void;
    update: <K extends TripField>(field: K, value: Trip[K]) => Promise<void>;
    patch: (partial: Partial<Trip>) => Promise<void>;
    resetTrip: () => Promise<void>;
}

const LS_TRIP_KEY = 'travel_log:last_trip_id';
const LS_LOCAL = (id: string) => `travel_log:trip:${id}`;

const readLocal = (tripId: string): Trip => {
    try {
        const raw = localStorage.getItem(LS_LOCAL(tripId));
        return migrateTrip(raw ? JSON.parse(raw) : null);
    } catch {
        return migrateTrip(null);
    }
};

const writeLocal = (tripId: string, trip: Trip) => {
    try { localStorage.setItem(LS_LOCAL(tripId), JSON.stringify(trip)); } catch { /* quota / private mode */ }
};

export const useTripStore = create<TripStore>((set, get) => ({
    tripId: null,
    trip: DEFAULT_TRIP,
    isLoaded: false,
    isSyncing: false,
    error: null,
    _unsub: null,
    _localOnly: false,

    enterTrip: (tripId) => {
        get()._unsub?.();

        const local = readLocal(tripId);
        set({ tripId, trip: local, isLoaded: false, error: null, _unsub: null });
        try { localStorage.setItem(LS_TRIP_KEY, tripId); } catch { /* ignore */ }

        const ref = doc(db, 'trips', tripId);
        const unsub = onSnapshot(
            ref,
            (snap) => {
                if (snap.exists()) {
                    const migrated = migrateTrip(snap.data() as Partial<Trip>);
                    writeLocal(tripId, migrated);
                    set({ trip: migrated, isLoaded: true, _localOnly: false });
                } else {
                    setDoc(ref, DEFAULT_TRIP, { merge: true }).catch(() => {
                        set({ _localOnly: true });
                    });
                    set({ isLoaded: true });
                }
            },
            (err) => {
                console.warn('Firestore listener error:', err);
                set({ isLoaded: true, error: err.message, _localOnly: true });
            }
        );
        set({ _unsub: unsub });
    },

    leaveTrip: () => {
        get()._unsub?.();
        set({ tripId: null, trip: DEFAULT_TRIP, isLoaded: false, _unsub: null });
        try { localStorage.removeItem(LS_TRIP_KEY); } catch { /* ignore */ }
    },

    update: async (field, value) => {
        const { tripId, trip } = get();
        const nextTrip = { ...trip, [field]: value };
        set({ trip: nextTrip, isSyncing: true });
        if (tripId) writeLocal(tripId, nextTrip);
        if (!tripId || get()._localOnly) { set({ isSyncing: false }); return; }
        try {
            await setDoc(doc(db, 'trips', tripId), { [field]: value }, { merge: true });
        } catch (e) {
            console.warn('Update failed:', e);
        } finally {
            set({ isSyncing: false });
        }
    },

    patch: async (partial) => {
        const { tripId, trip } = get();
        const nextTrip = { ...trip, ...partial };
        set({ trip: nextTrip, isSyncing: true });
        if (tripId) writeLocal(tripId, nextTrip);
        if (!tripId || get()._localOnly) { set({ isSyncing: false }); return; }
        try {
            await setDoc(doc(db, 'trips', tripId), partial, { merge: true });
        } catch (e) {
            console.warn('Patch failed:', e);
        } finally {
            set({ isSyncing: false });
        }
    },

    resetTrip: async () => {
        const { tripId } = get();
        if (!tripId) return;
        await get().patch({
            ...DEFAULT_TRIP,
            settings: { ...DEFAULT_TRIP.settings },
        });
    },
}));

export const getLastTripId = (): string | null => {
    try { return localStorage.getItem(LS_TRIP_KEY); } catch { return null; }
};
