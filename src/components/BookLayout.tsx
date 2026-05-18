import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Settings as SettingsIcon, Palette, Pencil, PencilOff, Eye, X } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTripStore } from '../store/tripStore';
import { CHAPTER_EMOJI } from './chapterMeta';
import type { ChapterMeta } from '../types';

interface BookLayoutProps {
    chapter: ChapterMeta;
    pageNo: number;
    children: React.ReactNode;
}

const ActionButtons = () => {
    const editMode = useUIStore((s) => s.editMode);
    const readOnly = useUIStore((s) => s.readOnly);
    const toggleEditMode = useUIStore((s) => s.toggleEditMode);
    const openThemeEditor = useUIStore((s) => s.openThemeEditor);
    const openSettings = useUIStore((s) => s.openSettings);

    return (
        <div className="flex items-center gap-1 md:gap-2">
            {!readOnly && (
                <button
                    onClick={toggleEditMode}
                    className={`btn btn-ghost px-2 py-2 ${editMode ? 'text-[color:var(--accent)]' : ''}`}
                    title={editMode ? '完成編輯' : '編輯'}
                    aria-label="切換編輯模式"
                >
                    {editMode ? <PencilOff size={18} /> : <Pencil size={18} />}
                </button>
            )}
            {!readOnly && (
                <button onClick={openThemeEditor} className="btn btn-ghost px-2 py-2" title="主題" aria-label="主題">
                    <Palette size={18} />
                </button>
            )}
            <button onClick={openSettings} className="btn btn-ghost px-2 py-2" title="設定" aria-label="設定">
                <SettingsIcon size={18} />
            </button>
        </div>
    );
};

const ChapterNav = ({ active, onSelect }: { active: string; onSelect: (id: string) => void }) => {
    const trip = useTripStore((s) => s.trip);
    const chapters = [...trip.chapters].sort((a, b) => a.order - b.order).filter((c) => c.visible);

    return (
        <nav aria-label="章節導覽">
            <ul className="space-y-1">
                {chapters.map((c) => {
                    const isActive = c.id === active;
                    return (
                        <li key={c.id}>
                            <button
                                onClick={() => onSelect(c.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition"
                                style={{
                                    background: isActive ? 'var(--accent)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--ink)',
                                    fontWeight: isActive ? 700 : 500,
                                }}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <span aria-hidden className="text-base">{CHAPTER_EMOJI[c.type]}</span>
                                <span className="truncate">{c.title}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export const BookLayout = ({ chapter, children }: BookLayoutProps) => {
    const readOnly = useUIStore((s) => s.readOnly);
    const goToChapter = useUIStore((s) => s.goToChapter);
    const trip = useTripStore((s) => s.trip);
    const isSyncing = useTripStore((s) => s.isSyncing);
    const [navOpen, setNavOpen] = useState(false);

    // Close mobile drawer when active chapter changes
    useEffect(() => { setNavOpen(false); }, [chapter.id]);

    const handleSelect = (id: string) => goToChapter(id, 1);

    return (
        <div className="h-full w-full flex" style={{ background: 'var(--paper-bg)' }}>
            {/* Sidebar — desktop */}
            <aside
                className="hidden md:flex md:flex-col w-56 lg:w-64 shrink-0 border-r overflow-y-auto"
                style={{ borderColor: 'var(--paper-edge)', background: 'var(--paper-soft)' }}
            >
                <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--paper-edge)' }}>
                    <div className="text-[10px] font-bold tracking-[0.25em]" style={{ color: 'var(--ink-soft)' }}>
                        TRAVEL LOG
                    </div>
                    <div className="font-display text-lg font-black mt-1 truncate" style={{ color: 'var(--ink)' }} title={trip.settings.title}>
                        {trip.settings.title}
                    </div>
                </div>
                <div className="flex-1 px-3 py-3">
                    <ChapterNav active={chapter.id} onSelect={handleSelect} />
                </div>
                <div className="px-4 py-3 text-[11px] flex items-center justify-between border-t" style={{ borderColor: 'var(--paper-edge)', color: 'var(--ink-soft)' }}>
                    {readOnly ? (
                        <span className="flex items-center gap-1 font-bold"><Eye size={12} /> 預覽模式</span>
                    ) : isSyncing ? (
                        <span className="font-bold tracking-wider">SYNC…</span>
                    ) : (
                        <span>同步中</span>
                    )}
                </div>
            </aside>

            {/* Mobile drawer */}
            {navOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[150]"
                    style={{ background: 'rgba(40,30,20,0.45)', backdropFilter: 'blur(2px)' }}
                    onClick={() => setNavOpen(false)}
                >
                    <aside
                        className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] flex flex-col"
                        style={{ background: 'var(--paper-soft)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--paper-edge)' }}>
                            <div className="font-display text-base font-black truncate" style={{ color: 'var(--ink)' }}>
                                {trip.settings.title}
                            </div>
                            <button onClick={() => setNavOpen(false)} className="btn btn-ghost px-2 py-1" aria-label="關閉選單">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 px-3 py-3 overflow-y-auto">
                            <ChapterNav active={chapter.id} onSelect={handleSelect} />
                        </div>
                    </aside>
                </div>
            )}

            {/* Main column */}
            <div className="flex-1 min-w-0 flex flex-col">
                <header
                    className="sticky top-0 z-30 flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 border-b"
                    style={{ background: 'var(--paper-bg)', borderColor: 'var(--paper-edge)', paddingTop: 'calc(8px + var(--safe-top))' }}
                >
                    <button
                        onClick={() => setNavOpen(true)}
                        className="md:hidden btn btn-ghost px-2 py-2"
                        aria-label="開啟選單"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="font-display text-base md:text-lg font-black truncate" style={{ color: 'var(--ink)' }}>
                            {chapter.title}
                        </div>
                        <div className="hidden md:block text-[10px] font-bold tracking-[0.25em]" style={{ color: 'var(--ink-soft)' }}>
                            {trip.settings.title}
                        </div>
                    </div>
                    {readOnly && (
                        <span
                            className="flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full"
                            style={{ color: 'var(--ink-soft)', background: 'var(--paper-soft)', border: '1px solid var(--paper-edge)' }}
                        >
                            <Eye size={11} /> 預覽
                        </span>
                    )}
                    {isSyncing && !readOnly && (
                        <span className="hidden sm:inline text-[10px] font-bold tracking-wider" style={{ color: 'var(--ink-soft)' }}>
                            SYNC…
                        </span>
                    )}
                    <ActionButtons />
                </header>

                <motion.main
                    key={chapter.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    className="flex-1 overflow-y-auto"
                    style={{ paddingBottom: 'calc(24px + var(--safe-bottom))' }}
                >
                    <div className="mx-auto w-full max-w-3xl xl:max-w-4xl">
                        {children}
                    </div>
                </motion.main>
            </div>
        </div>
    );
};
