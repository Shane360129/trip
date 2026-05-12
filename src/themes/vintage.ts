import type { ThemeDef } from './types';

export const vintageTheme: ThemeDef = {
    id: 'vintage',
    label: '復古 Vintage',
    description: '泛黃紙、襯線字、郵戳印章',
    bodyClass: 'theme-vintage',
    vars: {
        '--paper': '#F1E4C9',
        '--paper-soft': '#FBF3DD',
        '--paper-edge': '#D9C7A1',
        '--ink': '#3B2A18',
        '--ink-soft': '#7A5E3A',
        '--accent': '#8B4513',
        '--accent-2': '#A6863F',
        '--accent-3': '#5C6D52',
        '--stamp': '#9E2A2B',
        '--font-display': '"Playfair Display", "Noto Serif TC", serif',
        '--font-body': '"Playfair Display", "Noto Serif TC", serif',
        '--font-hand': '"Caveat", cursive',
        '--paper-bg':
            "radial-gradient(circle at 30% 20%, rgba(139,69,19,0.07) 0%, transparent 50%)," +
            "radial-gradient(circle at 70% 80%, rgba(0,0,0,0.05) 0%, transparent 50%)," +
            "linear-gradient(180deg, #F1E4C9 0%, #E5D3A8 100%)",
        '--paper-noise':
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0.1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    },
};
