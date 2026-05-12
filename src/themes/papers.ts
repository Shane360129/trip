export interface PaperDef {
    label: string;
    bg: string;
    noise: string;
}

export const papers: Record<string, PaperDef> = {
    kraft: {
        label: '牛皮紙',
        bg:
            "radial-gradient(circle at 20% 30%, rgba(194,139,90,0.05) 0%, transparent 40%)," +
            "radial-gradient(circle at 80% 70%, rgba(168,176,134,0.06) 0%, transparent 50%)," +
            "linear-gradient(180deg, #F5EBDD 0%, #F0E3D0 100%)",
        noise:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    },
    vintage: {
        label: '泛黃舊紙',
        bg:
            "radial-gradient(circle at 30% 20%, rgba(139,69,19,0.07) 0%, transparent 50%)," +
            "linear-gradient(180deg, #F1E4C9 0%, #E5D3A8 100%)",
        noise:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0.1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    },
    washi: {
        label: '和紙',
        bg:
            "radial-gradient(circle at 50% 50%, rgba(229,164,164,0.06) 0%, transparent 60%)," +
            "linear-gradient(180deg, #FBF6F0 0%, #F2E8DC 100%)",
        noise:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.35 0 0 0 0 0.4 0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    },
    grid: {
        label: '方格紙',
        bg:
            "linear-gradient(180deg, #FBF8F0 0%, #F5F0E1 100%)," +
            "repeating-linear-gradient(0deg, transparent 0 28px, rgba(108,127,168,0.10) 28px 29px)," +
            "repeating-linear-gradient(90deg, transparent 0 28px, rgba(108,127,168,0.10) 28px 29px)",
        noise: 'none',
    },
    plain: {
        label: '純色',
        bg: 'linear-gradient(180deg, #F8F4EC 0%, #F4EEE2 100%)',
        noise: 'none',
    },
    parchment: {
        label: '羊皮紙',
        bg:
            "radial-gradient(ellipse at 50% 50%, #F4E7CA 0%, #DCC9A0 100%)",
        noise:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.25 0 0 0 0 0.15 0 0 0 0 0.05 0 0 0 0.12 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    },
};
