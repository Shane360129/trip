import { useEffect, useState } from 'react';
import { Landing } from './components/Landing';
import { Toast } from './components/Toast';
import { ThemeEditor } from './components/ThemeEditor';
import { SettingsModal } from './components/SettingsModal';
import { CoverChapter } from './chapters/CoverChapter';
import { TocChapter } from './chapters/TocChapter';
import { ItineraryChapter } from './chapters/ItineraryChapter';
import { PackingChapter } from './chapters/PackingChapter';
import { GuideChapter } from './chapters/GuideChapter';
import { FoodChapter } from './chapters/FoodChapter';
import { ShoppingChapter } from './chapters/ShoppingChapter';
import { AlbumChapter } from './chapters/AlbumChapter';
import { ExpenseChapter } from './chapters/ExpenseChapter';
import { NotesChapter } from './chapters/NotesChapter';
import { MemoryChapter } from './chapters/MemoryChapter';
import { PlaceholderChapter } from './chapters/PlaceholderChapter';
import { useTripStore, getLastTripId } from './store/tripStore';
import { useUIStore } from './store/uiStore';
import { ensureAnonymousAuth } from './firebase';
import { applyTheme } from './themes';
import type { ChapterMeta } from './types';

const useAutoLogin = () => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        ensureAnonymousAuth()
            .catch((err) => console.warn('Anonymous auth failed; running in local-only mode.', err))
            .finally(() => setReady(true));
    }, []);
    return ready;
};

const renderChapter = (chapter: ChapterMeta, pageNo: number) => {
    switch (chapter.type) {
        case 'cover':     return <CoverChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'toc':       return <TocChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'itinerary': return <ItineraryChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'before':    return <PackingChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'guide':     return <GuideChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'food':      return <FoodChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'shopping':  return <ShoppingChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'album':     return <AlbumChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'expense':   return <ExpenseChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'notes':     return <NotesChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        case 'memory':    return <MemoryChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
        default:          return <PlaceholderChapter key={chapter.id} chapter={chapter} pageNo={pageNo} />;
    }
};

export const App = () => {
    const authReady = useAutoLogin();
    const tripId = useTripStore((s) => s.tripId);
    const trip = useTripStore((s) => s.trip);
    const enterTrip = useTripStore((s) => s.enterTrip);
    const currentChapter = useUIStore((s) => s.currentChapter);
    const goToChapter = useUIStore((s) => s.goToChapter);

    // Auto-resume last trip
    useEffect(() => {
        if (!authReady || tripId) return;
        const last = getLastTripId();
        if (last) enterTrip(last);
    }, [authReady, tripId, enterTrip]);

    // Apply theme whenever any field of theme config changes
    useEffect(() => {
        applyTheme(trip.theme);
    }, [trip.theme]);

    // Ensure a valid current chapter
    const sortedChapters = [...trip.chapters].sort((a, b) => a.order - b.order);
    const visibleChapters = sortedChapters.filter((c) => c.visible);

    useEffect(() => {
        if (!tripId) return;
        if (!currentChapter || !visibleChapters.find((c) => c.id === currentChapter)) {
            const cover = sortedChapters.find((c) => c.type === 'cover');
            if (cover) goToChapter(cover.id, 1);
        }
    }, [tripId, currentChapter, sortedChapters, visibleChapters, goToChapter]);

    if (!tripId) return <><Landing /><Toast /></>;

    const activeChapter = sortedChapters.find((c) => c.id === currentChapter) ?? sortedChapters[0];
    const pageNo = visibleChapters.findIndex((c) => c.id === activeChapter.id) + 1;

    return (
        <>
            {renderChapter(activeChapter, pageNo)}
            <ThemeEditor />
            <SettingsModal />
            <Toast />
        </>
    );
};
