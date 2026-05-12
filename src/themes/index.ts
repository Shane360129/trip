import { kraftTheme } from './kraft';
import { vintageTheme } from './vintage';
import { washiTheme } from './washi';
import { journalTheme } from './journal';
import { fontPairs } from './fontPairs';
import { papers } from './papers';
import type { ThemeDef } from './types';
import type { ThemeConfig } from '../types';

export const themes: Record<string, ThemeDef> = {
    kraft: kraftTheme,
    vintage: vintageTheme,
    washi: washiTheme,
    journal: journalTheme,
};

export const themeList = (): ThemeDef[] => Object.values(themes);

export const getTheme = (id: string): ThemeDef => themes[id] ?? kraftTheme;

// Apply a ThemeConfig (preset + independent overrides) onto :root.
export const applyTheme = (cfg: ThemeConfig) => {
    const preset = getTheme(cfg.preset);
    const root = document.documentElement;

    // 1. base: preset vars
    Object.entries(preset.vars).forEach(([k, v]) => root.style.setProperty(k, v));

    // 2. override fonts if fontPair specifies a known pair
    const fp = fontPairs[cfg.fontPair];
    if (fp) {
        root.style.setProperty('--font-display', fp.display);
        root.style.setProperty('--font-body', fp.body);
        root.style.setProperty('--font-hand', fp.hand);
    }

    // 3. override paper if it differs from preset
    const paper = papers[cfg.paper];
    if (paper) {
        root.style.setProperty('--paper-bg', paper.bg);
        root.style.setProperty('--paper-noise', paper.noise);
    }

    // 4. custom accent colors
    if (cfg.customColors) {
        if (cfg.customColors.accent)  root.style.setProperty('--accent', cfg.customColors.accent);
        if (cfg.customColors.accent2) root.style.setProperty('--accent-2', cfg.customColors.accent2);
        if (cfg.customColors.accent3) root.style.setProperty('--accent-3', cfg.customColors.accent3);
        if (cfg.customColors.stamp)   root.style.setProperty('--stamp', cfg.customColors.stamp);
    }

    // 5. body class
    document.body.classList.forEach((cls) => {
        if (cls.startsWith('theme-')) document.body.classList.remove(cls);
    });
    document.body.classList.add(preset.bodyClass);
};

// Legacy API used in early Phase 1 — kept for back-compat.
export const applyThemeVars = (theme: ThemeDef) => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    document.body.classList.forEach((cls) => {
        if (cls.startsWith('theme-')) document.body.classList.remove(cls);
    });
    document.body.classList.add(theme.bodyClass);
};

export { fontPairs, papers };
export type { ThemeDef };
