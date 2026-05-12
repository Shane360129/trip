import { ChevronRight, Eye, EyeOff, GripVertical } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_EMOJI, CHAPTER_HEADER_EN, CHAPTER_SPINE_COLORS } from '../components/chapterMeta';
import type { ChapterMeta } from '../types';

interface TocProps {
    chapter: ChapterMeta;
    pageNo: number;
}

export const TocChapter = ({ chapter, pageNo }: TocProps) => {
    const trip = useTripStore((s) => s.trip);
    const patch = useTripStore((s) => s.patch);
    const goToChapter = useUIStore((s) => s.goToChapter);
    const editMode = useUIStore((s) => s.editMode);

    const sorted = [...trip.chapters].sort((a, b) => a.order - b.order);
    const visibleEntries = sorted.filter((c) => c.visible && c.type !== 'cover' && c.type !== 'toc');

    const toggleVisible = (id: string) => {
        const next = trip.chapters.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c));
        patch({ chapters: next });
    };

    const move = (idx: number, dir: -1 | 1) => {
        const list = [...sorted];
        const j = idx + dir;
        if (j < 0 || j >= list.length) return;
        const tmp = list[idx];
        list[idx] = list[j];
        list[j] = tmp;
        patch({ chapters: list.map((c, i) => ({ ...c, order: i })) });
    };

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="max-w-md mx-auto pr-6 py-2">
                <header className="mb-6">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-2"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.toc}
                    </div>
                    <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                        目錄
                    </h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                        {trip.settings.title} · {trip.settings.duration} 天行程
                    </p>
                </header>

                <ol className="space-y-1">
                    {(editMode ? sorted : visibleEntries).map((c, i) => {
                        const spine = CHAPTER_SPINE_COLORS[c.type];
                        const isCoverOrToc = c.type === 'cover' || c.type === 'toc';
                        return (
                            <li key={c.id}>
                                <div className="flex items-center gap-2 py-2 border-b border-dashed" style={{ borderColor: 'var(--paper-edge)' }}>
                                    {editMode && !isCoverOrToc && (
                                        <div className="flex flex-col items-center gap-0.5" style={{ color: 'var(--ink-soft)' }}>
                                            <button onClick={() => move(sorted.findIndex((x) => x.id === c.id), -1)} aria-label="上移" className="opacity-60 hover:opacity-100">
                                                <GripVertical size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <span
                                        className="w-2 h-6 rounded-sm"
                                        style={{ background: spine }}
                                        aria-hidden
                                    />
                                    <span className="text-xl mr-1" aria-hidden>{CHAPTER_EMOJI[c.type]}</span>
                                    <button
                                        onClick={() => goToChapter(c.id, 1)}
                                        className="flex-1 text-left flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>
                                                {c.title}
                                            </div>
                                            <div className="text-[10px] tracking-[0.2em] font-bold" style={{ color: 'var(--ink-soft)' }}>
                                                {CHAPTER_HEADER_EN[c.type]}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm tabular-nums" style={{ color: 'var(--ink-soft)' }}>
                                                {String((editMode ? sorted : visibleEntries).indexOf(c) + (editMode ? 1 : 3)).padStart(2, '0')}
                                            </span>
                                            <ChevronRight size={16} style={{ color: 'var(--ink-soft)' }} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </button>
                                    {editMode && !isCoverOrToc && (
                                        <button
                                            onClick={() => toggleVisible(c.id)}
                                            className="opacity-60 hover:opacity-100"
                                            style={{ color: 'var(--ink-soft)' }}
                                            aria-label={c.visible ? '隱藏章節' : '顯示章節'}
                                        >
                                            {c.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                    )}
                                </div>
                                {!c.visible && editMode && <span className="text-[10px] ml-9" style={{ color: 'var(--ink-soft)' }}>· 已隱藏</span>}
                                {/* prevent unused index */}
                                <span className="sr-only">{i}</span>
                            </li>
                        );
                    })}
                </ol>

                {editMode && (
                    <p className="text-[11px] mt-4 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                        編輯模式：點箭頭排序、眼睛切換顯示。Phase 1 先支援這些；之後會加上拖曳重排。
                    </p>
                )}
            </div>
        </BookLayout>
    );
};
