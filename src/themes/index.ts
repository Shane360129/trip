import { kraftTheme } from './kraft';
import { vintageTheme } from './vintage';
import { washiTheme } from './washi';
import { journalTheme } from './journal';
import type { ThemeDef } from './types';

export const themes: Record<string, ThemeDef> = {
    kraft: kraftTheme,
    vintage: vintageTheme,
    washi: washiTheme,
    journal: journalTheme,
};

export const themeList = (): ThemeDef[] => Object.values(themes);

export const getTheme = (id: string): ThemeDef => themes[id] ?? kraftTheme;

export const applyThemeVars = (theme: ThemeDef) => {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => root.style.setProperty(key, value));

    const body = document.body;
    body.classList.forEach((cls) => { if (cls.startsWith('theme-')) body.classList.remove(cls); });
    body.classList.add(theme.bodyClass);
};

export type { ThemeDef };
