import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Navigation2, Clock, GripVertical } from 'lucide-react';
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
import { ConfirmModal } from '../components/ConfirmModal';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { generateDays } from '../utils/date';
import { newId } from '../utils/id';
import type { ChapterMeta, ItineraryItem } from '../types';

interface ItineraryProps {
    chapter: ChapterMeta;
    pageNo: number;
}

const emptyDraft = (): Omit<ItineraryItem, 'id' | 'day'> => ({
    time: '',
    title: '',
    location: '',
    note: '',
});

const compareItems = (a: ItineraryItem, b: ItineraryItem): number => {
    const aHas = a.sortIndex !== undefined;
    const bHas = b.sortIndex !== undefined;
    if (aHas && bHas) return (a.sortIndex ?? 0) - (b.sortIndex ?? 0);
    return (a.time || '99:99').localeCompare(b.time || '99:99');
};

const ItineraryRow = ({
    item,
    isWeekend,
    editMode,
    onEdit,
    onDelete,
}: {
    item: ItineraryItem;
    isWeekend: boolean;
    editMode: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id as string,
        disabled: !editMode,
    });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <motion.li
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative pl-10 pb-5 cursor-pointer group"
            onClick={onEdit}
        >
            <span
                className="absolute left-[10px] top-1.5 w-4 h-4 rounded-full border-2"
                style={{
                    background: 'var(--paper-soft)',
                    borderColor: isWeekend ? 'var(--accent-3)' : 'var(--accent-2)',
                }}
                aria-hidden
            />
            <div className="paper-card p-3">
                <div className="flex items-baseline justify-between mb-1 gap-2">
                    <span
                        className="font-mono font-black text-lg px-2 py-0.5 rounded"
                        style={{
                            color: isWeekend ? 'var(--accent-3)' : 'var(--accent-2)',
                            background: 'var(--paper)',
                        }}
                    >
                        {item.time || '--:--'}
                    </span>
                    <div className="flex items-center gap-2">
                        {editMode && (
                            <button
                                {...attributes}
                                {...listeners}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-grab active:cursor-grabbing"
                                style={{ color: 'var(--ink-soft)' }}
                                aria-label="拖曳排序"
                            >
                                <GripVertical size={16} />
                            </button>
                        )}
                        {editMode && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                style={{ color: 'var(--stamp)' }}
                                aria-label="刪除"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
                <h3 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>
                    {item.title}
                </h3>
                {item.location && (
                    <div
                        className="flex items-center justify-between gap-2 mt-2 px-2 py-1.5 rounded text-xs"
                        style={{ background: 'var(--paper)' }}
                    >
                        <span className="flex items-center gap-1 truncate" style={{ color: 'var(--ink-soft)' }}>
                            <MapPin size={12} style={{ color: 'var(--stamp)' }} />
                            {item.location}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`,
                                    '_blank'
                                );
                            }}
                            className="btn btn-secondary text-[10px] px-2 py-0.5"
                            style={{ borderRadius: 999 }}
                            aria-label="在地圖查看"
                        >
                            <Navigation2 size={10} /> MAP
                        </button>
                    </div>
                )}
                {item.note && (
                    <div className="sticky mt-2" style={{ ['--rot' as string]: '-0.6deg' }}>
                        {item.note.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                )}
            </div>
        </motion.li>
    );
};

export const ItineraryChapter = ({ chapter, pageNo }: ItineraryProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const showToast = useUIStore((s) => s.showToast);
    const editMode = useUIStore((s) => s.editMode);

    const [selectedDay, setSelectedDay] = useState(1);
    const [draft, setDraft] = useState<ItineraryItem | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [saving, setSaving] = useState(false);

    const days = useMemo(
        () => generateDays(trip.settings.startDate, trip.settings.duration),
        [trip.settings.startDate, trip.settings.duration]
    );
    const dayInfo = days[selectedDay - 1];

    const items = useMemo(
        () => trip.itinerary.filter((i) => i.day === selectedDay).sort(compareItems),
        [trip.itinerary, selectedDay]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const openNew = () => {
        const maxIdx = items.reduce((acc, it) => Math.max(acc, it.sortIndex ?? -1), -1);
        setDraft({ ...emptyDraft(), id: newId(), day: selectedDay, sortIndex: maxIdx + 1 });
        setIsNew(true);
    };
    const openEdit = (item: ItineraryItem) => { setDraft(item); setIsNew(false); };
    const closeDraft = () => { setDraft(null); setIsNew(false); };

    const saveDraft = async () => {
        if (!draft || !draft.title.trim()) return;
        setSaving(true);
        const cleaned: ItineraryItem = {
            ...draft,
            title: draft.title.trim(),
            location: draft.location.trim(),
            note: draft.note.trim(),
        };
        const next = isNew
            ? [...trip.itinerary, cleaned]
            : trip.itinerary.map((i) => (i.id === cleaned.id ? cleaned : i));
        await update('itinerary', next);
        setSaving(false);
        closeDraft();
        showToast(isNew ? '已新增' : '已更新');
    };

    const confirmDelete = async () => {
        if (deleteId == null) return;
        setSaving(true);
        await update('itinerary', trip.itinerary.filter((i) => i.id !== deleteId));
        setSaving(false);
        setDeleteId(null);
        showToast('已刪除');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const reordered = arrayMove(items, oldIndex, newIndex);
        // Re-assign sortIndex 0..N for items in this day; leave other days alone.
        const reorderedById = new Map<string | number, number>();
        reordered.forEach((it, i) => reorderedById.set(it.id, i));
        const next = trip.itinerary.map((it) =>
            it.day === selectedDay && reorderedById.has(it.id)
                ? { ...it, sortIndex: reorderedById.get(it.id) }
                : it
        );
        update('itinerary', next);
    };

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="max-w-md mx-auto pr-6 py-2">
                <header className="mb-4">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-2"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.itinerary}
                    </div>
                    <div className="flex justify-between items-baseline">
                        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                            行程
                        </h1>
                        <button onClick={openNew} className="btn btn-primary px-3 py-2 text-sm">
                            <Plus size={16} /> 新增
                        </button>
                    </div>
                    {dayInfo && (
                        <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                            DAY {selectedDay} · {dayInfo.date} ({dayInfo.week})
                        </p>
                    )}
                </header>

                {/* Day tabs */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-2 px-2" style={{ scrollSnapType: 'x mandatory' }}>
                    {days.map((d) => {
                        const active = selectedDay === d.day;
                        return (
                            <button
                                key={d.day}
                                onClick={() => setSelectedDay(d.day)}
                                className="flex flex-col items-center min-w-16 px-2 py-2 rounded-lg transition-transform"
                                style={{
                                    scrollSnapAlign: 'center',
                                    background: active ? (d.isWeekend ? 'var(--accent-3)' : 'var(--accent-2)') : 'var(--paper-soft)',
                                    color: active ? 'white' : 'var(--ink-soft)',
                                    border: '1px solid var(--paper-edge)',
                                    transform: active ? 'translateY(-2px)' : 'none',
                                    boxShadow: active ? '0 6px 14px rgba(0,0,0,0.08)' : 'none',
                                }}
                            >
                                <span className="text-[10px] font-bold opacity-80">{d.week}</span>
                                <span className="font-display text-lg font-black">{d.date}</span>
                            </button>
                        );
                    })}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <Clock size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>這一天還沒有行程</p>
                        <button onClick={openNew} className="btn btn-ghost mt-3 text-sm" style={{ background: 'var(--paper-soft)' }}>
                            <Plus size={14} /> 新增第一個
                        </button>
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((i) => i.id as string)} strategy={verticalListSortingStrategy}>
                            <ol className="relative">
                                <div
                                    className="absolute top-0 bottom-0 left-[18px] w-[2px]"
                                    style={{ background: 'var(--paper-edge)' }}
                                    aria-hidden
                                />
                                {items.map((item) => (
                                    <ItineraryRow
                                        key={item.id}
                                        item={item}
                                        isWeekend={!!dayInfo?.isWeekend}
                                        editMode={editMode}
                                        onEdit={() => openEdit(item)}
                                        onDelete={() => setDeleteId(item.id)}
                                    />
                                ))}
                            </ol>
                        </SortableContext>
                        {editMode && (
                            <p className="text-[11px] mt-2 text-center" style={{ color: 'var(--ink-soft)' }}>
                                按住右側拖把可調整順序；時間仍會顯示在卡片上。
                            </p>
                        )}
                    </DndContext>
                )}
            </div>

            {draft && (
                <div
                    className="fixed inset-0 z-[180] flex items-center justify-center p-4"
                    style={{ background: 'rgba(40,30,20,0.45)', backdropFilter: 'blur(4px)' }}
                    onClick={() => !saving && closeDraft()}
                >
                    <div className="paper-card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-display text-lg font-black mb-4" style={{ color: 'var(--ink)' }}>
                            {isNew ? '新增行程' : '編輯行程'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>時間</label>
                                <input
                                    type="time"
                                    value={draft.time}
                                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                                    className="field mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>標題 *</label>
                                <input
                                    value={draft.title}
                                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                    className="field mt-1"
                                    placeholder="例：吃拉麵"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>地點</label>
                                <input
                                    value={draft.location}
                                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                                    className="field mt-1"
                                    placeholder="可開 Google Maps"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>筆記</label>
                                <textarea
                                    value={draft.note}
                                    onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                                    className="field mt-1 h-24 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            {!isNew && (
                                <button
                                    onClick={() => { setDeleteId(draft.id); }}
                                    disabled={saving}
                                    className="btn btn-ghost"
                                    style={{ background: 'var(--paper)', color: 'var(--stamp)' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <button onClick={closeDraft} disabled={saving} className="btn btn-ghost flex-1" style={{ background: 'var(--paper)' }}>取消</button>
                            <button onClick={saveDraft} disabled={saving || !draft.title.trim()} className="btn btn-primary flex-1">
                                {saving ? <span className="spinner" /> : (isNew ? '加入' : '更新')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={deleteId != null}
                title="刪除這個行程？"
                confirmText="刪除"
                danger
                loading={saving}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </BookLayout>
    );
};
