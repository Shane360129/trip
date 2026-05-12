import { ChevronRight, Eye, EyeOff, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BookLayout } from '../components/BookLayout';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_EMOJI, CHAPTER_HEADER_EN, CHAPTER_SPINE_COLORS } from '../components/chapterMeta';
import type { ChapterMeta } from '../types';

interface TocProps {
    chapter: ChapterMeta;
    pageNo: number;
}

const SortableRow = ({
    chapter,
    index,
    editMode,
    sortable,
    onToggle,
    onGo,
}: {
    chapter: ChapterMeta;
    index: number;
    editMode: boolean;
    sortable: boolean;
    onToggle: () => void;
    onGo: () => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: chapter.id,
        disabled: !sortable,
    });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    const spine = CHAPTER_SPINE_COLORS[chapter.type];

    return (
        <li ref={setNodeRef} style={style}>
            <div
                className="flex items-center gap-2 py-2 border-b border-dashed"
                style={{ borderColor: 'var(--paper-edge)' }}
            >
                {editMode && sortable && (
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100"
                        aria-label="拖曳排序"
                        style={{ color: 'var(--ink-soft)' }}
                    >
                        <GripVertical size={14} />
                    </button>
                )}
                <span className="w-2 h-6 rounded-sm shrink-0" style={{ background: spine }} aria-hidden />
                <span className="text-xl mr-1" aria-hidden>{CHAPTER_EMOJI[chapter.type]}</span>
                <button
                    onClick={onGo}
                    className="flex-1 text-left flex items-center justify-between group"
                >
                    <div>
                        <div className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>
                            {chapter.title}
                        </div>
                        <div className="text-[10px] tracking-[0.2em] font-bold" style={{ color: 'var(--ink-soft)' }}>
                            {CHAPTER_HEADER_EN[chapter.type]}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-sm tabular-nums" style={{ color: 'var(--ink-soft)' }}>
                            {String(index).padStart(2, '0')}
                        </span>
                        <ChevronRight size={16} style={{ color: 'var(--ink-soft)' }} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </button>
                {editMode && sortable && (
                    <button
                        onClick={onToggle}
                        className="opacity-60 hover:opacity-100"
                        style={{ color: 'var(--ink-soft)' }}
                        aria-label={chapter.visible ? '隱藏章節' : '顯示章節'}
                    >
                        {chapter.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                )}
            </div>
        </li>
    );
};

export const TocChapter = ({ chapter, pageNo }: TocProps) => {
    const trip = useTripStore((s) => s.trip);
    const patch = useTripStore((s) => s.patch);
    const goToChapter = useUIStore((s) => s.goToChapter);
    const editMode = useUIStore((s) => s.editMode);

    const sortedChapters = [...trip.chapters].sort((a, b) => a.order - b.order);
    const visibleChapters = sortedChapters.filter((c) => c.visible && c.type !== 'cover' && c.type !== 'toc');
    const rows = editMode ? sortedChapters : visibleChapters;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const list = [...sortedChapters];
        const oldIndex = list.findIndex((c) => c.id === active.id);
        const newIndex = list.findIndex((c) => c.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const reordered = arrayMove(list, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
        patch({ chapters: reordered });
    };

    const toggleVisible = (id: string) => {
        patch({ chapters: trip.chapters.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)) });
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

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={rows.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        <ol className="space-y-1">
                            {rows.map((c, idx) => {
                                const isFixed = c.type === 'cover' || c.type === 'toc';
                                return (
                                    <SortableRow
                                        key={c.id}
                                        chapter={c}
                                        index={idx + 1}
                                        editMode={editMode}
                                        sortable={!isFixed}
                                        onToggle={() => toggleVisible(c.id)}
                                        onGo={() => goToChapter(c.id, 1)}
                                    />
                                );
                            })}
                        </ol>
                    </SortableContext>
                </DndContext>

                {editMode && (
                    <p className="text-[11px] mt-4 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                        編輯模式：拖把手重排章節順序、眼睛切換顯示/隱藏。Cover 與 TOC 不可移動。
                    </p>
                )}
            </div>
        </BookLayout>
    );
};
