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
import { CHAPTER_SPINE_COLORS } from './chapterMeta';
import type { ChapterMeta } from '../types';

interface BookLayoutProps {
    chapter: ChapterMeta;
    pageNo: number;
    children: React.ReactNode;
}

export const BookLayout = ({ chapter, pageNo, children }: BookLayoutProps) => {
    const direction = useUIStore((s) => s.direction);
    const editMode = useUIStore((s) => s.editMode);
    const toggleEditMode = useUIStore((s) => s.toggleEditMode);
    const openThemeEditor = useUIStore((s) => s.openThemeEditor);
    const openSettings = useUIStore((s) => s.openSettings);
    const goToChapter = useUIStore((s) => s.goToChapter);
    const trip = useTripStore((s) => s.trip);
    const spineColor = CHAPTER_SPINE_COLORS[chapter.type] ?? 'var(--accent)';
    const isSyncing = useTripStore((s) => s.isSyncing);

    const tocChapter = trip.chapters.find((c) => c.type === 'toc');

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
                <button onClick={openThemeEditor} className="btn btn-ghost px-2 py-2" title="主題" aria-label="主題">
                    <Palette size={18} />
                </button>
                <button onClick={openSettings} className="btn btn-ghost px-2 py-2" title="設定" aria-label="設定">
                    <SettingsIcon size={18} />
                </button>
            </div>

            <AnimatePresence mode="wait" custom={direction}>
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
                    {children}
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
