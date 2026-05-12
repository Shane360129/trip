export interface FontPair {
    label: string;
    display: string;
    body: string;
    hand: string;
    sample: string;
}

export const fontPairs: Record<string, FontPair> = {
    kraft: {
        label: 'Maru × Caveat',
        display: '"Zen Maru Gothic", "Noto Serif TC", serif',
        body: '"Zen Maru Gothic", "Noto Sans TC", sans-serif',
        hand: '"Caveat", cursive',
        sample: 'TRAVEL · 旅程開始',
    },
    vintage: {
        label: 'Playfair Serif',
        display: '"Playfair Display", "Noto Serif TC", serif',
        body: '"Playfair Display", "Noto Serif TC", serif',
        hand: '"Caveat", cursive',
        sample: 'Travel · 旅程開始',
    },
    washi: {
        label: 'Sawarabi 明朝',
        display: '"Sawarabi Mincho", "Noto Serif TC", serif',
        body: '"Zen Maru Gothic", "Noto Sans TC", sans-serif',
        hand: '"Caveat", cursive',
        sample: 'TRAVEL · 旅程開始',
    },
    journal: {
        label: 'Caveat 手寫',
        display: '"Caveat", "Zen Maru Gothic", cursive',
        body: '"Zen Maru Gothic", "Noto Sans TC", sans-serif',
        hand: '"Caveat", cursive',
        sample: 'Travel · 旅程開始',
    },
    magazine: {
        label: 'Bebas 雜誌',
        display: '"Bebas Neue", "Noto Sans TC", sans-serif',
        body: '"Zen Maru Gothic", "Noto Sans TC", sans-serif',
        hand: '"Caveat", cursive',
        sample: 'TRAVEL · 旅程開始',
    },
};
