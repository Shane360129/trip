import { AnimatePresence, motion } from 'framer-motion';
import { Settings as SettingsIcon, Palette, Pencil, PencilOff, Book, Eye } from 'lucide-react';
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
    const readOnly = useUIStore((s) => s.readOnly);
    const toggleEditMode = useUIStore((s) => s.toggleEditMode);
    const openThemeEditor = useUIStore((s) => s.openThemeEditor);
    const openSettings = useUIStore((s) => s.openSettings);
    const goToChapter = useUIStore((s) => s.goToChapter);
    const trip = useTripStore((s) => s.trip);
    const spineColor = CHAPTER_SPINE_COLORS[chapter.type] ?? 'var(--accent)';
    const isSyncing = useTripStore((s) => s.isSyncing);

    const tocChapter = trip.chapters.find((c) => c.type === 'toc');

    return (
        <div className="relative h-full w-full overflow-hidden" style={{ background: 'var(--paper-bg)' }}>
            <div className="chapter-spine" style={{ ['--spine' as string]: spineColor }} />

            <header className="page-head pl-8 pr-4" style={{ paddingTop: 'calc(14px + var(--safe-top))' }}>
                <span className="font-display" style={{ color: 'var(--ink)' }}>
                    {chapter.title}
                </span>
                <span>{trip.settings.title}</span>
            </header>

            <div className="absolute top-3 right-3 flex items-center gap-2 z-30" style={{ marginTop: 'var(--safe-top)' }}>
                {isSyncing && !readOnly && (
                    <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--ink-soft)' }}>
                        SYNC...
                    </span>
                )}
                {readOnly && (
                    <span
                        className="flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-1 rounded-full"
                        style={{ color: 'var(--ink-soft)', background: 'var(--paper-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        <Eye size={11} /> 預覽
                    </span>
                )}
                {tocChapter && chapter.type !== 'toc' && (
                    <button
                        onClick={() => goToChapter(tocChapter.id, -1)}
                        className="btn btn-ghost px-2 py-2"
                        title="目錄"
                        aria-label="目錄"
                    >
                        <Book size={18} />
                    </button>
                )}
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

            <AnimatePresence mode="wait" custom={direction}>
                <motion.main
                    key={chapter.id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -40 }}
                    transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                    className="absolute inset-0 pl-8 overflow-y-auto"
                    style={{ paddingTop: 56, paddingBottom: 60 }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            <footer
                className="page-foot absolute bottom-0 left-8 right-0"
                style={{ paddingBottom: 'calc(20px + var(--safe-bottom))' }}
            >
                <span>· {String(pageNo).padStart(2, '0')} ·</span>
            </footer>
        </div>
    );
};
