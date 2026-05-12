import type { ThemeDef } from './types';

export const kraftTheme: ThemeDef = {
    id: 'kraft',
    label: '牛皮紙 Kraft',
    description: '米褐文青風 — 拿鐵金、抹茶綠、和紙膠帶',
    bodyClass: 'theme-kraft',
    vars: {
        '--paper': '#F5EBDD',
        '--paper-soft': '#FDFBF7',
        '--paper-edge': '#E8D9C2',

        '--ink': '#3D332B',
        '--ink-soft': '#8C7A6B',

        '--accent': '#C28B5A',
        '--accent-2': '#A8B086',
        '--accent-3': '#9DB7C9',
        '--stamp': '#B23A48',

        '--font-display': '"Zen Maru Gothic", "Noto Serif TC", serif',
        '--font-body': '"Zen Maru Gothic", "Noto Sans TC", sans-serif',
        '--font-hand': '"Caveat", "Zen Maru Gothic", cursive',

        '--paper-bg':
            "radial-gradient(circle at 20% 30%, rgba(194,139,90,0.05) 0%, transparent 40%)," +
            "radial-gradient(circle at 80% 70%, rgba(168,176,134,0.06) 0%, transparent 50%)," +
            "linear-gradient(180deg, #F5EBDD 0%, #F0E3D0 100%)",

        '--paper-noise':
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    },
};
