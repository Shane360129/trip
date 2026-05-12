import type { ThemeDef } from './types';

export const washiTheme: ThemeDef = {
    id: 'washi',
    label: '和風 Washi',
    description: '粉藍粉櫻、和紙紋、日式花紋',
    bodyClass: 'theme-washi',
    vars: {
        '--paper': '#FBF6F0',
        '--paper-soft': '#FFFCF7',
        '--paper-edge': '#E9DDD0',
        '--ink': '#4B3A3A',
        '--ink-soft': '#9A8585',
        '--accent': '#E5A4A4',
        '--accent-2': '#A2C5DD',
        '--accent-3': '#C7D3A1',
        '--stamp': '#B23A48',
        '--font-display': '"Sawarabi Mincho", "Noto Serif TC", serif',
        '--font-body': '"Zen Maru Gothic", "Noto Sans TC", sans-serif',
        '--font-hand': '"Caveat", cursive',
        '--paper-bg':
            "radial-gradient(circle at 50% 50%, rgba(229,164,164,0.06) 0%, transparent 60%)," +
            "linear-gradient(180deg, #FBF6F0 0%, #F2E8DC 100%)",
        '--paper-noise':
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.35 0 0 0 0 0.4 0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    },
};
