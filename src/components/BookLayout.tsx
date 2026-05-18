import { AnimatePresence, motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Palette,
    Pencil,
    PencilOff,
    BookOpen,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
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

    // Resolve prev / next visible chapters for in-book navigation.
    const visibleChapters = trip.chapters
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order);
    const currentIdx = visibleChapters.findIndex((c) => c.id === chapter.id);
    const prevChapter = currentIdx > 0 ? visibleChapters[currentIdx - 1] : null;
    const nextChapter = currentIdx >= 0 && currentIdx < visibleChapters.length - 1
        ? visibleChapters[currentIdx + 1]
        : null;

    return (
        <div className="relative h-full w-full overflow-hidden" style={{ background: 'var(--paper-bg)' }}>
            <div className="chapter-spine" style={{ ['--spine' as string]: spineColor }} />

            <header className="page-head pl-8 pr-4" style={{ paddingTop: 'calc(14px + var(--safe-top))' }}>
                <span className="font-display" style={{ color: 'var(--ink)' }}>
                    {chapter.title}
                </span>
                <span className="truncate max-w-[40%] text-right">{trip.settings.title}</span>
            </header>

            <div
                className="absolute top-3 right-3 flex items-center gap-1 z-30"
                style={{ marginTop: 'var(--safe-top)' }}
            >
                {isSyncing && (
                    <span className="text-[10px] font-bold tracking-wider mr-1" style={{ color: 'var(--ink-soft)' }}>
                        SYNC...
                    </span>
                )}
                {tocChapter && chapter.type !== 'toc' && (
                    <button
                        onClick={() => goToChapter(tocChapter.id, -1)}
                        className="btn btn-ghost px-2 py-1.5 text-xs"
                        title="目錄"
                        style={{ background: 'var(--paper-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        <BookOpen size={14} />
                        <span className="ml-1 font-bold tracking-wider">目錄</span>
                    </button>
                )}
                <button
                    onClick={toggleEditMode}
                    className="btn btn-ghost px-2 py-2"
                    style={{ color: editMode ? 'var(--accent)' : undefined }}
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
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -40 }}
                    transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                    className="absolute inset-0 pl-8 overflow-y-auto"
                    style={{ paddingTop: 60, paddingBottom: 72 }}
                >
                    <div className="mx-auto w-full max-w-3xl xl:max-w-4xl">
                        {children}
                    </div>
                </motion.main>
            </AnimatePresence>

            {/* Page-turn nav (left + right) */}
            <footer
                className="absolute bottom-0 left-8 right-0 z-30 flex items-center justify-between px-3 py-3"
                style={{
                    paddingBottom: 'calc(12px + var(--safe-bottom))',
                    background: 'linear-gradient(180deg, transparent 0%, var(--paper-bg) 30%)',
                }}
            >
                <button
                    onClick={() => prevChapter && goToChapter(prevChapter.id, -1)}
                    disabled={!prevChapter}
                    className="btn btn-ghost px-3 py-1.5 text-xs disabled:opacity-0"
                    style={{ background: 'var(--paper-soft)', border: '1px solid var(--paper-edge)' }}
                    aria-label={prevChapter ? `上一章：${prevChapter.title}` : '無上一章'}
                >
                    <ChevronLeft size={14} />
                    <span className="ml-0.5 font-bold tracking-wider">
                        {prevChapter ? prevChapter.title : ''}
                    </span>
                </button>

                <span
                    className="font-display text-xs tracking-[0.3em]"
                    style={{ color: 'var(--ink-soft)' }}
                >
                    · {String(pageNo).padStart(2, '0')} ·
                </span>

                <button
                    onClick={() => nextChapter && goToChapter(nextChapter.id, 1)}
                    disabled={!nextChapter}
                    className="btn btn-ghost px-3 py-1.5 text-xs disabled:opacity-0"
                    style={{ background: 'var(--paper-soft)', border: '1px solid var(--paper-edge)' }}
                    aria-label={nextChapter ? `下一章：${nextChapter.title}` : '無下一章'}
                >
                    <span className="mr-0.5 font-bold tracking-wider">
                        {nextChapter ? nextChapter.title : ''}
                    </span>
                    <ChevronRight size={14} />
                </button>
            </footer>
        </div>
    );
};
