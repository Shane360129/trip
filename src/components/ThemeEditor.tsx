import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTripStore } from '../store/tripStore';
import { themeList } from '../themes';
import type { ThemeConfig } from '../types';

const PAPER_OPTIONS: ThemeConfig['paper'][] = ['kraft', 'vintage', 'washi', 'grid', 'plain', 'parchment'];

export const ThemeEditor = () => {
    const open = useUIStore((s) => s.themeEditorOpen);
    const close = useUIStore((s) => s.closeThemeEditor);
    const showToast = useUIStore((s) => s.showToast);
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);

    const select = async (preset: ThemeConfig['preset']) => {
        await update('theme', { ...trip.theme, preset, palette: preset, fontPair: preset, paper: preset as ThemeConfig['paper'] });
        showToast('主題已更新');
    };

    const toggleDeco = async (key: keyof ThemeConfig['decorations']) => {
        await update('theme', {
            ...trip.theme,
            decorations: { ...trip.theme.decorations, [key]: !trip.theme.decorations[key] },
        });
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
                    <div className="sticky top-0 flex items-center justify-between px-5 py-3 border-b z-10" style={{ background: 'var(--paper-soft)', borderColor: 'var(--paper-edge)' }}>
                        <h2 className="font-display text-lg font-black" style={{ color: 'var(--ink)' }}>主題</h2>
                        <button onClick={close} className="btn btn-ghost p-2" aria-label="關閉">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
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
                                            onClick={() => select(t.id as ThemeConfig['preset'])}
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
                            <p className="text-[10px] mt-3 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                                Phase 1 提供 4 種預設。Phase 3 會開放：色票、字體、紙質、各自獨立切換 + 自訂色。
                            </p>
                        </section>

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
                                            onChange={() => toggleDeco(k)}
                                        />
                                        <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                                            {k === 'stickers' ? '貼紙' : k === 'washiTape' ? '和紙膠帶' : '郵戳'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.25em] mb-2" style={{ color: 'var(--ink-soft)' }}>
                                紙質
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {PAPER_OPTIONS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => update('theme', { ...trip.theme, paper: p })}
                                        className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
                                        style={{
                                            borderColor: trip.theme.paper === p ? 'var(--accent)' : 'var(--paper-edge)',
                                            background: trip.theme.paper === p ? 'var(--accent)' : 'transparent',
                                            color: trip.theme.paper === p ? 'white' : 'var(--ink-soft)',
                                        }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};
