import { newId } from './id';
import type {
    Trip,
    Settings,
    CoverConfig,
    ThemeConfig,
    ChapterMeta,
} from '../types';

export const DEFAULT_SETTINGS: Settings = {
    title: 'My Awesome Trip',
    startDate: new Date().toISOString().slice(0, 10),
    duration: 5,
    bgIcon: '✈️',
};

export const DEFAULT_COVER: CoverConfig = {
    photo: '',
    motto: 'The journey is the destination.',
    layout: 'classic',
    emoji: '✈️',
    subtitle: 'A TRAVELOGUE',
};

export const DEFAULT_THEME: ThemeConfig = {
    preset: 'kraft',
    palette: 'kraft',
    fontPair: 'kraft',
    paper: 'kraft',
    decorations: { stickers: true, washiTape: true, stamps: true },
};

export const DEFAULT_CHAPTERS: ChapterMeta[] = [
    { id: newId(), type: 'cover',     title: '封面',   order: 0, visible: true },
    { id: newId(), type: 'toc',       title: '目錄',   order: 1, visible: true },
    { id: newId(), type: 'before',    title: '出發前', order: 2, visible: true },
    { id: newId(), type: 'itinerary', title: '行程',   order: 3, visible: true },
    { id: newId(), type: 'guide',     title: '攻略',   order: 4, visible: true },
    { id: newId(), type: 'food',      title: '美食',   order: 5, visible: true },
    { id: newId(), type: 'shopping',  title: '購物',   order: 6, visible: true },
    { id: newId(), type: 'album',     title: '相簿',   order: 7, visible: true },
    { id: newId(), type: 'expense',   title: '帳本',   order: 8, visible: true },
    { id: newId(), type: 'notes',     title: '筆記',   order: 9, visible: true },
    { id: newId(), type: 'memory',    title: '紀念',   order: 10, visible: true },
];

export const DEFAULT_TRIP: Trip = {
    settings: DEFAULT_SETTINGS,
    itinerary: [],
    guides: [],
    shopping: [],
    expenses: [],
    users: ['我', '旅伴A'],
    theme: DEFAULT_THEME,
    cover: DEFAULT_COVER,
    chapters: DEFAULT_CHAPTERS,
    pages: [],
    photos: [],
    places: [],
    packing: [],
};

// Read whatever Firestore returns (possibly partial / legacy) and produce a
// complete Trip object. New fields fall back to defaults; existing ones are
// preserved verbatim.
export const migrateTrip = (raw: Partial<Trip> | undefined | null): Trip => {
    const data = raw ?? {};
    return {
        settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) },
        itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
        guides: Array.isArray(data.guides) ? data.guides : [],
        shopping: Array.isArray(data.shopping) ? data.shopping : [],
        expenses: Array.isArray(data.expenses) ? data.expenses : [],
        users: Array.isArray(data.users) && data.users.length > 0 ? data.users : ['我', '旅伴A'],
        theme: { ...DEFAULT_THEME, ...(data.theme ?? {}) },
        cover: { ...DEFAULT_COVER, ...(data.cover ?? {}) },
        chapters: Array.isArray(data.chapters) && data.chapters.length > 0
            ? data.chapters
            : DEFAULT_CHAPTERS.map((c) => ({ ...c, id: newId() })),
        pages: Array.isArray(data.pages) ? data.pages : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        places: Array.isArray(data.places) ? data.places : [],
        packing: Array.isArray(data.packing) ? data.packing : [],
    };
};
