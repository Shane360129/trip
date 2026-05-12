import type { ThemeDef } from './types';

export const journalTheme: ThemeDef = {
    id: 'journal',
    label: '手帳 Journal',
    description: '方格紙、手寫字、塗鴉拼貼',
    bodyClass: 'theme-journal',
    vars: {
        '--paper': '#FBF8F0',
        '--paper-soft': '#FFFEF8',
        '--paper-edge': '#E2DAC5',
        '--ink': '#2C2A22',
        '--ink-soft': '#7B7560',
        '--accent': '#D97757',
        '--accent-2': '#7DAA8F',
        '--accent-3': '#6A9CC4',
        '--stamp': '#C44141',
        '--font-display': '"Caveat", "Zen Maru Gothic", cursive',
        '--font-body': '"Zen Maru Gothic", "Noto Sans TC", sans-serif',
        '--font-hand': '"Caveat", cursive',
        '--paper-bg':
            "linear-gradient(180deg, #FBF8F0 0%, #F5F0E1 100%)," +
            "repeating-linear-gradient(0deg, transparent 0 28px, rgba(108,127,168,0.10) 28px 29px)," +
            "repeating-linear-gradient(90deg, transparent 0 28px, rgba(108,127,168,0.10) 28px 29px)",
        '--paper-noise': 'none',
    },
};
