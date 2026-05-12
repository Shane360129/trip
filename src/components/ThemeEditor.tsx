import { AnimatePresence, motion } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTripStore } from '../store/tripStore';
import { themeList, fontPairs, papers } from '../themes';
import type { ThemeConfig } from '../types';

const COLOR_KEYS: Array<{ key: keyof NonNullable<ThemeConfig['customColors']>; label: string; varName: string }> = [
    { key: 'accent',  label: '主色',   varName: '--accent' },
    { key: 'accent2', label: '輔色 1', varName: '--accent-2' },
    { key: 'accent3', label: '輔色 2', varName: '--accent-3' },
    { key: 'stamp',   label: '郵戳色', varName: '--stamp' },
];

const currentVar = (name: string): string => {
    if (typeof window === 'undefined') return '#000000';
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    // <input type="color"> only accepts hex. Best effort: if not hex, fall back.
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    return '#999999';
};

export const ThemeEditor = () => {
    const open = useUIStore((s) => s.themeEditorOpen);
    const close = useUIStore((s) => s.closeThemeEditor);
    const showToast = useUIStore((s) => s.showToast);
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);

    const set = (patch: Partial<ThemeConfig>) => update('theme', { ...trip.theme, ...patch });

    const selectPreset = (preset: ThemeConfig['preset']) => {
        update('theme', {
            ...trip.theme,
            preset,
            palette: preset,
            fontPair: preset,
            paper: preset as ThemeConfig['paper'],
            customColors: undefined,
        });
        showToast('主題已套用');
    };

    const setColor = (key: keyof NonNullable<ThemeConfig['customColors']>, value: string) => {
        set({ customColors: { ...(trip.theme.customColors ?? {}), [key]: value } });
    };

    const resetColors = () => {
        set({ customColors: undefined });
        showToast('已重設配色');
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.aside
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                    className="fixed top-0 right-0 bottom-0 w-[88%] max-w-sm z-[170] paper-card overflow-y-auto"
                    style={{ borderRadius: '12px 0 0 12px', background: 'var(--paper-soft)' }}
                >
                    <div
                        className="sticky top-0 flex items-center justify-between px-5 py-3 border-b z-10"
                        style={{ background: 'var(--paper-soft)', borderColor: 'var(--paper-edge)' }}
                    >
                        <h2 className="font-display text-lg font-black" style={{ color: 'var(--ink)' }}>主題編輯</h2>
                        <button onClick={close} className="btn btn-ghost p-2" aria-label="關閉">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-5 space-y-6">

                        {/* Preset */}
                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.25em] mb-2" style={{ color: 'var(--ink-soft)' }}>
                                預設風格
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {themeList().map((t) => {
                                    const active = trip.theme.preset === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => selectPreset(t.id as ThemeConfig['preset'])}
                                            className="paper-card p-3 text-left transition-transform active:scale-95"
                                            style={{
                                                background: t.vars['--paper'],
                                                color: t.vars['--ink'],
                                                outline: active ? `2px solid ${t.vars['--accent']}` : 'none',
                                                outlineOffset: 2,
                                            }}
                                        >
                                            <div className="flex items-center gap-1 mb-2">
                                                <span className="w-3 h-3 rounded-full" style={{ background: t.vars['--accent'] }} />
                                                <span className="w-3 h-3 rounded-full" style={{ background: t.vars['--accent-2'] }} />
                                                <span className="w-3 h-3 rounded-full" style={{ background: t.vars['--accent-3'] }} />
                                                <span className="w-3 h-3 rounded-full" style={{ background: t.vars['--stamp'] }} />
                                            </div>
                                            <div className="font-bold text-sm" style={{ fontFamily: t.vars['--font-display'] }}>
                                                {t.label}
                                            </div>
                                            <div className="text-[10px] mt-0.5 opacity-70">
                                                {t.description}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Fonts */}
                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.25em] mb-2" style={{ color: 'var(--ink-soft)' }}>
                                字體
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(fontPairs).map(([key, pair]) => {
                                    const active = trip.theme.fontPair === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => set({ fontPair: key })}
                                            className="w-full paper-card p-3 flex items-baseline justify-between transition-all"
                                            style={{
                                                background: active ? 'var(--paper)' : 'var(--paper-soft)',
                                                outline: active ? `2px solid var(--accent)` : 'none',
                                                outlineOffset: 2,
                                            }}
                                        >
                                            <div className="text-left min-w-0">
                                                <div
                                                    className="font-black text-base truncate"
                                                    style={{ fontFamily: pair.display, color: 'var(--ink)' }}
                                                >
                                                    {pair.sample}
                                                </div>
                                                <div className="text-[10px] tracking-[0.2em] font-bold mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                                                    {pair.label}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Paper */}
                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.25em] mb-2" style={{ color: 'var(--ink-soft)' }}>
                                紙質
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(papers).map(([key, p]) => {
                                    const active = trip.theme.paper === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => set({ paper: key as ThemeConfig['paper'] })}
                                            className="rounded-lg p-3 text-center text-xs font-bold transition-all border-2"
                                            style={{
                                                background: p.bg,
                                                color: 'var(--ink)',
                                                borderColor: active ? 'var(--accent)' : 'transparent',
                                                minHeight: 56,
                                            }}
                                        >
                                            {p.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Custom colors */}
                        <section>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-bold tracking-[0.25em]" style={{ color: 'var(--ink-soft)' }}>
                                    自訂配色
                                </h3>
                                {trip.theme.customColors && (
                                    <button
                                        onClick={resetColors}
                                        className="text-[10px] flex items-center gap-1 underline"
                                        style={{ color: 'var(--ink-soft)' }}
                                    >
                                        <RotateCcw size={10} /> 重設
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {COLOR_KEYS.map(({ key, label, varName }) => {
                                    const value = trip.theme.customColors?.[key] ?? currentVar(varName);
                                    return (
                                        <label
                                            key={key}
                                            className="paper-card flex items-center gap-2 p-2 cursor-pointer"
                                            style={{ background: 'var(--paper-soft)' }}
                                        >
                                            <input
                                                type="color"
                                                value={value}
                                                onChange={(e) => setColor(key, e.target.value)}
                                                className="w-8 h-8 cursor-pointer rounded border-0 bg-transparent"
                                                aria-label={label}
                                            />
                                            <div className="text-xs">
                                                <div className="font-bold" style={{ color: 'var(--ink)' }}>{label}</div>
                                                <div className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>{value}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Decorations */}
                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.25em] mb-2" style={{ color: 'var(--ink-soft)' }}>
                                裝飾
                            </h3>
                            <div className="space-y-2">
                                {(['stickers', 'washiTape', 'stamps'] as const).map((k) => (
                                    <label key={k} className="flex items-center gap-3 paper-card px-3 py-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={trip.theme.decorations[k]}
                                            onChange={() => set({ decorations: { ...trip.theme.decorations, [k]: !trip.theme.decorations[k] } })}
                                        />
                                        <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                                            {k === 'stickers' ? '貼紙' : k === 'washiTape' ? '和紙膠帶' : '郵戳'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};
