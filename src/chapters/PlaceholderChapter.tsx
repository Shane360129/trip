import { BookLayout } from '../components/BookLayout';
import { CHAPTER_EMOJI, CHAPTER_HEADER_EN } from '../components/chapterMeta';
import type { ChapterMeta } from '../types';

interface PlaceholderProps {
    chapter: ChapterMeta;
    pageNo: number;
}

const PHASE_NOTES: Partial<Record<ChapterMeta['type'], string>> = {
    before:   'Phase 2：行前清單、護照/簽證/保險、打包清單',
    guide:    'Phase 2：交通、票券、景點攻略（沿用舊資料）',
    food:     'Phase 2：餐廳卡片、星等、口味標籤',
    shopping: 'Phase 2：拍立得購物清單（沿用舊資料）',
    album:    'Phase 2：照片牆、依日期/地點分類',
    expense:  'Phase 2：分帳小幫手（沿用舊資料）',
    notes:    'Phase 3：自由 block 編輯器（像 Notion）',
    memory:   'Phase 3：旅行後反思、簽到地圖、紀念戳章',
};

export const PlaceholderChapter = ({ chapter, pageNo }: PlaceholderProps) => (
    <BookLayout chapter={chapter} pageNo={pageNo}>
        <div className="max-w-md mx-auto pr-6 py-6">
            <div
                className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-3"
                style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
            >
                {CHAPTER_HEADER_EN[chapter.type]}
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight mb-1" style={{ color: 'var(--ink)' }}>
                {chapter.title}
            </h1>

            <div className="paper-card p-6 mt-8 text-center">
                <div className="text-6xl mb-2">{CHAPTER_EMOJI[chapter.type]}</div>
                <p className="font-display text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>
                    施工中
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                    {PHASE_NOTES[chapter.type] ?? '即將推出'}
                </p>
                <p className="text-[10px] mt-4 tracking-[0.2em] font-bold" style={{ color: 'var(--ink-soft)' }}>
                    PHASE 1 · COMING SOON
                </p>
            </div>

            <div className="mt-6 text-center">
                <span className="washi">UNDER CONSTRUCTION</span>
            </div>
        </div>
    </BookLayout>
);
