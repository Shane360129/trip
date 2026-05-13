import { useMemo } from 'react';
import { Camera, MapPin, Utensils, ShoppingBag, Wallet } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { BlockEditor } from '../components/blocks/BlockEditor';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { newId } from '../utils/id';
import type { Block, ChapterMeta, FreePage } from '../types';

interface MemoryProps {
    chapter: ChapterMeta;
    pageNo: number;
}

interface Stat {
    label: string;
    value: string;
    icon: typeof Camera;
    color: string;
}

export const MemoryChapter = ({ chapter, pageNo }: MemoryProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const editMode = useUIStore((s) => s.editMode);

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

    const stats: Stat[] = useMemo(() => {
        const visitedFood = trip.places.filter((p) => p.type === 'food' && p.visited).length;
        const totalSpent = trip.expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0);
        const itineraryCount = trip.itinerary.length;
        const photoCount = trip.photos.length;
        const boughtCount = trip.shopping.filter((s) => s.bought).length;

        return [
            { label: '行程',     value: `${itineraryCount}`, icon: MapPin,      color: 'var(--accent-2)' },
            { label: '美食',     value: `${visitedFood}`,    icon: Utensils,    color: 'var(--stamp)' },
            { label: '購入',     value: `${boughtCount}`,    icon: ShoppingBag, color: 'var(--accent)' },
            { label: '照片',     value: `${photoCount}`,     icon: Camera,      color: 'var(--accent-3)' },
            { label: '總花費',   value: `¥${Math.round(totalSpent).toLocaleString()}`, icon: Wallet, color: 'var(--ink-soft)' },
        ];
    }, [trip]);

    const visitedPlaces = useMemo(
        () => trip.places.filter((p) => p.visited).slice(0, 12),
        [trip.places]
    );

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="w-full px-4 md:px-6 py-2 md:py-4">
                <header className="mb-5">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-2"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.memory}
                    </div>
                    <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                        紀念
                    </h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                        {trip.settings.title} · {trip.settings.startDate} · {trip.settings.duration} 天
                    </p>
                </header>

                {/* Stats — auto-generated, read-only */}
                <section className="mb-5">
                    <h2 className="text-[10px] font-bold tracking-[0.25em] mb-2" style={{ color: 'var(--ink-soft)' }}>
                        TRIP IN NUMBERS
                    </h2>
                    <div className="grid grid-cols-5 gap-2">
                        {stats.map(({ label, value, icon: Icon, color }) => (
                            <div
                                key={label}
                                className="paper-card flex flex-col items-center justify-center p-2"
                                style={{ background: 'var(--paper-soft)' }}
                            >
                                <Icon size={14} style={{ color }} />
                                <div className="font-display font-black text-base mt-1 tabular-nums" style={{ color: 'var(--ink)' }}>
                                    {value}
                                </div>
                                <div className="text-[9px] tracking-[0.15em] font-bold" style={{ color: 'var(--ink-soft)' }}>
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Visited stamps */}
                {visitedPlaces.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-[10px] font-bold tracking-[0.25em] mb-3" style={{ color: 'var(--ink-soft)' }}>
                            PASSPORT STAMPS
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {visitedPlaces.map((p, i) => (
                                <span
                                    key={p.id}
                                    className="stamp text-[10px] !px-2 !py-1"
                                    style={{ ['--rot' as string]: `${i % 2 === 0 ? -6 : -3}deg` }}
                                >
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                <div className="border-t border-dashed my-5" style={{ borderColor: 'var(--paper-edge)' }} />

                {/* Reflection blocks (user-editable) */}
                <h2 className="text-[10px] font-bold tracking-[0.25em] mb-3" style={{ color: 'var(--ink-soft)' }}>
                    REFLECTIONS
                </h2>
                <BlockEditor
                    blocks={page.blocks}
                    editing={editMode}
                    onChange={setBlocks}
                    emptyHint={editMode ? '寫下這趟旅程的反思與感謝...' : '還沒寫紀念。等旅程結束後再回來。'}
                />
            </div>
        </BookLayout>
    );
};
