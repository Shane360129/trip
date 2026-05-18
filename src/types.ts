// --- Trip-level data (Firestore: trips/{tripId}) ---

export type ChapterType =
    | 'cover'
    | 'toc'
    | 'before'
    | 'itinerary'
    | 'guide'
    | 'food'
    | 'shopping'
    | 'album'
    | 'expense'
    | 'notes'
    | 'memory';

export interface ChapterMeta {
    id: string;
    type: ChapterType;
    title: string;
    order: number;
    visible: boolean;
}

export interface Settings {
    title: string;
    startDate: string;
    duration: number;
    bgIcon?: string;
}

export interface CoverConfig {
    photo: string;
    motto: string;
    layout: 'classic' | 'photo' | 'minimal' | 'stamp';
    emoji: string;
    subtitle: string;
}

export interface ThemeConfig {
    preset: 'kraft' | 'vintage' | 'washi' | 'journal' | 'nordic' | 'map' | 'polaroid' | 'magazine';
    palette: string;
    fontPair: string;
    paper: 'kraft' | 'vintage' | 'washi' | 'grid' | 'plain' | 'parchment';
    decorations: {
        stickers: boolean;
        washiTape: boolean;
        stamps: boolean;
    };
    customColors?: {
        accent?: string;
        accent2?: string;
        accent3?: string;
        stamp?: string;
    };
}

// --- Existing data (preserved verbatim from legacy app) ---

export interface ItineraryItem {
    id: string | number;
    day: number;
    time: string;
    title: string;
    location: string;
    note: string;
    photo?: string;
    rating?: number;
    lat?: number;
    lng?: number;
    geocodeFailed?: boolean;
}

export interface Guide {
    id: string | number;
    type: 'transport' | 'ticket' | 'spot' | 'shopping';
    title: string;
    content: string;
}

export interface ShoppingItem {
    id: string | number;
    name: string;
    price: string | number;
    note: string;
    image: string;
    bought: boolean;
}

export interface Expense {
    id: string | number;
    title: string;
    amount: number;
    payer: string;
    involved: string[];
}

// --- New data (block-based pages, photos, places, packing) ---

export type Block =
    | { id: string; type: 'heading'; level: 1 | 2 | 3; text: string }
    | { id: string; type: 'paragraph'; text: string }
    | { id: string; type: 'sticky'; text: string; color: 'yellow' | 'pink' | 'blue' | 'green' }
    | { id: string; type: 'photo'; url: string; caption?: string; style: 'polaroid' | 'full' | 'instant'; rotate?: number }
    | { id: string; type: 'map'; query: string; label?: string }
    | { id: string; type: 'list'; items: string[]; style: 'bullet' | 'check' | 'numbered' }
    | { id: string; type: 'tip'; text: string; icon?: string }
    | { id: string; type: 'quote'; text: string; author?: string }
    | { id: string; type: 'stamp'; date: string; location: string }
    | { id: string; type: 'divider'; style: 'line' | 'dots' | 'washi' };

export interface FreePage {
    id: string;
    chapterId: string;
    title: string;
    blocks: Block[];
}

export interface Photo {
    id: string;
    url: string;
    caption?: string;
    day?: number;
    location?: string;
    tags?: string[];
}

export interface Place {
    id: string;
    name: string;
    type: 'food' | 'spot' | 'lodging' | 'shop';
    photo?: string;
    notes?: string;
    rating?: number;
    location?: string;
    visited?: boolean;
}

export interface PackingItem {
    id: string;
    item: string;
    category: string;
    checked: boolean;
}

// --- Composite Trip document ---

export interface Trip {
    settings: Settings;
    itinerary: ItineraryItem[];
    guides: Guide[];
    shopping: ShoppingItem[];
    expenses: Expense[];
    users: string[];
    theme: ThemeConfig;
    cover: CoverConfig;
    chapters: ChapterMeta[];
    pages: FreePage[];
    photos: Photo[];
    places: Place[];
    packing: PackingItem[];
}

export type TripField = keyof Trip;
