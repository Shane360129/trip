import { useMemo } from 'react';
import { BookLayout } from '../components/BookLayout';
import { BlockEditor } from '../components/blocks/BlockEditor';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { newId } from '../utils/id';
import type { Block, ChapterMeta, FreePage } from '../types';

interface NotesProps {
    chapter: ChapterMeta;
    pageNo: number;
}

export const NotesChapter = ({ chapter, pageNo }: NotesProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const editMode = useUIStore((s) => s.editMode);

    // Ensure exactly one default page exists per chapter (lazy-create on first edit).
    const page: FreePage = useMemo(() => {
        const existing = trip.pages.find((p) => p.chapterId === chapter.id);
        return existing ?? { id: newId(), chapterId: chapter.id, title: chapter.title, blocks: [] };
    }, [trip.pages, chapter.id, chapter.title]);

    const setBlocks = (blocks: Block[]) => {
        const exists = trip.pages.some((p) => p.id === page.id);
        const nextPage = { ...page, blocks };
        const nextPages = exists
            ? trip.pages.map((p) => (p.id === page.id ? nextPage : p))
            : [...trip.pages, nextPage];
        update('pages', nextPages);
    };

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="w-full px-4 md:px-6 py-2 md:py-4">
                <header className="mb-5">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-2"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.notes}
                    </div>
                    <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                        筆記
                    </h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                        {editMode ? '點 + 加區塊；按住左側拖把可重排' : '切換到編輯模式（右上角筆桿）開始書寫'}
                    </p>
                </header>

                <BlockEditor
                    blocks={page.blocks}
                    editing={editMode}
                    onChange={setBlocks}
                    emptyHint={editMode ? '從第一段開始吧 ✨' : '還沒寫筆記。切到編輯模式試試。'}
                />
            </div>
        </BookLayout>
    );
};
