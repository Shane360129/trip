import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Star, Navigation2, Utensils, Camera } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { newId } from '../utils/id';
import type { ChapterMeta, Place } from '../types';

interface FoodProps {
    chapter: ChapterMeta;
    pageNo: number;
}

type FilterMode = 'all' | 'wishlist' | 'visited';

const emptyDraft = (): Place => ({
    id: newId(),
    name: '',
    type: 'food',
    photo: '',
    notes: '',
    rating: 0,
    location: '',
    visited: false,
});

const Stars = ({ value, onChange, readOnly = false }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <button
                key={s}
                type="button"
                onClick={() => !readOnly && onChange?.(value === s ? 0 : s)}
                disabled={readOnly}
                aria-label={`${s} 星`}
                style={{ color: s <= value ? 'var(--accent)' : 'var(--paper-edge)' }}
            >
                <Star size={readOnly ? 14 : 18} fill={s <= value ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
        ))}
    </div>
);

export const FoodChapter = ({ chapter, pageNo }: FoodProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const showToast = useUIStore((s) => s.showToast);
    const editMode = useUIStore((s) => s.editMode);

    const [filter, setFilter] = useState<FilterMode>('all');
    const [draft, setDraft] = useState<Place | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const foods = useMemo(() => trip.places.filter((p) => p.type === 'food'), [trip.places]);
    const filtered = useMemo(() => {
        if (filter === 'wishlist') return foods.filter((p) => !p.visited);
        if (filter === 'visited') return foods.filter((p) => p.visited);
        return foods;
    }, [foods, filter]);

    const counts = {
        all: foods.length,
        wishlist: foods.filter((p) => !p.visited).length,
        visited: foods.filter((p) => p.visited).length,
    };

    const openNew = () => { setDraft(emptyDraft()); setIsNew(true); };
    const openEdit = (p: Place) => { setDraft({ ...p }); setIsNew(false); };
    const closeDraft = () => { setDraft(null); setIsNew(false); };

    const saveDraft = async () => {
        if (!draft || !draft.name.trim()) return;
        setSaving(true);
        const cleaned: Place = {
            ...draft,
            name: draft.name.trim(),
            location: draft.location?.trim() ?? '',
            notes: draft.notes?.trim() ?? '',
            photo: draft.photo?.trim() ?? '',
        };
        const next = isNew
            ? [...trip.places, cleaned]
            : trip.places.map((p) => (p.id === cleaned.id ? cleaned : p));
        await update('places', next);
        setSaving(false);
        closeDraft();
        showToast(isNew ? '已新增' : '已更新');
    };

    const toggleVisited = async (p: Place) => {
        await update('places', trip.places.map((x) => (x.id === p.id ? { ...x, visited: !x.visited } : x)));
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setSaving(true);
        await update('places', trip.places.filter((p) => p.id !== deleteId));
        setSaving(false);
        setDeleteId(null);
        showToast('已刪除');
    };

    const searchImage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!draft?.name.trim()) { showToast('請先填店名'); return; }
        window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(draft.name)}`, '_blank');
    };

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="w-full px-4 md:px-6 py-2 md:py-4">
                <header className="mb-4">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-2"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.food}
                    </div>
                    <div className="flex justify-between items-baseline">
                        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                            美食
                        </h1>
                        <button onClick={openNew} className="btn btn-primary px-3 py-2 text-sm">
                            <Plus size={16} /> 新增
                        </button>
                    </div>
                </header>

                <div className="flex gap-2 mb-4">
                    {(['all', 'wishlist', 'visited'] as const).map((k) => {
                        const labelMap = { all: '全部', wishlist: '想吃', visited: '吃過' };
                        const active = filter === k;
                        return (
                            <button
                                key={k}
                                onClick={() => setFilter(k)}
                                className="flex-1 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
                                style={{
                                    borderColor: active ? 'var(--ink)' : 'var(--paper-edge)',
                                    background: active ? 'var(--ink)' : 'var(--paper-soft)',
                                    color: active ? 'var(--paper-soft)' : 'var(--ink-soft)',
                                }}
                            >
                                {labelMap[k]} · {counts[k]}
                            </button>
                        );
                    })}
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Utensils size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
                            還沒記錄美食
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((p, idx) => (
                            <motion.article
                                key={p.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.04 }}
                                onClick={() => openEdit(p)}
                                className="paper-card overflow-hidden cursor-pointer flex"
                                style={{ background: 'var(--paper-soft)' }}
                            >
                                <div
                                    className="shrink-0 w-24 h-24 relative"
                                    style={{ background: 'var(--paper-edge)' }}
                                >
                                    {p.photo ? (
                                        <img
                                            src={p.photo}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--ink-soft)' }}>
                                            <Utensils size={28} className="opacity-50" />
                                        </div>
                                    )}
                                    {p.visited && (
                                        <span className="absolute top-1 left-1 stamp text-[9px] !px-1.5 !py-0.5">VISITED</span>
                                    )}
                                </div>
                                <div className="flex-1 p-3 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-display text-base font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                                            {p.name}
                                        </h3>
                                        {editMode && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                                                aria-label="刪除"
                                                style={{ color: 'var(--stamp)' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {p.rating ? <div className="mt-1"><Stars value={p.rating} readOnly /></div> : null}
                                    {p.location && (
                                        <div className="flex items-center gap-1 text-xs mt-1 truncate" style={{ color: 'var(--ink-soft)' }}>
                                            <Navigation2 size={11} /> {p.location}
                                        </div>
                                    )}
                                    {p.notes && (
                                        <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                                            {p.notes}
                                        </p>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleVisited(p); }}
                                        className="mt-2 text-[10px] tracking-[0.15em] font-bold px-2 py-0.5 rounded"
                                        style={{
                                            background: p.visited ? 'var(--paper)' : 'var(--accent-2)',
                                            color: p.visited ? 'var(--ink-soft)' : 'white',
                                        }}
                                    >
                                        {p.visited ? '未吃' : '標記吃過'}
                                    </button>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>

            {draft && (
                <div
                    className="fixed inset-0 z-[180] flex items-center justify-center p-4"
                    style={{ background: 'rgba(40,30,20,0.45)', backdropFilter: 'blur(4px)' }}
                    onClick={() => !saving && closeDraft()}
                >
                    <div className="paper-card w-full max-w-sm p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-display text-lg font-black mb-4" style={{ color: 'var(--ink)' }}>
                            {isNew ? '新增美食' : '編輯美食'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>店名 *</label>
                                <input
                                    value={draft.name}
                                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                    className="field mt-1"
                                    placeholder="例：一蘭拉麵"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>地點</label>
                                <input
                                    value={draft.location ?? ''}
                                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                                    className="field mt-1"
                                    placeholder="可開 Google Maps"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em] flex justify-between" style={{ color: 'var(--ink-soft)' }}>
                                    <span>圖片網址</span>
                                    <button onClick={searchImage} className="text-[10px] underline" style={{ color: 'var(--accent-3)' }}>
                                        Google 找圖
                                    </button>
                                </label>
                                <input
                                    value={draft.photo ?? ''}
                                    onChange={(e) => setDraft({ ...draft, photo: e.target.value })}
                                    className="field mt-1"
                                    placeholder="https://..."
                                />
                                {draft.photo && (
                                    <div className="mt-2 w-20 h-20 rounded overflow-hidden" style={{ background: 'var(--paper)' }}>
                                        <img
                                            src={draft.photo}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em] block mb-1" style={{ color: 'var(--ink-soft)' }}>星等</label>
                                <Stars value={draft.rating ?? 0} onChange={(v) => setDraft({ ...draft, rating: v })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>心得 / 必點</label>
                                <textarea
                                    value={draft.notes ?? ''}
                                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                                    className="field mt-1 h-24 resize-none"
                                />
                            </div>
                            <label className="flex items-center gap-2 paper-card px-3 py-2 cursor-pointer" style={{ background: 'var(--paper)' }}>
                                <input
                                    type="checkbox"
                                    checked={draft.visited ?? false}
                                    onChange={(e) => setDraft({ ...draft, visited: e.target.checked })}
                                />
                                <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--ink)' }}>
                                    <Camera size={14} /> 已經吃過了
                                </span>
                            </label>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={closeDraft} disabled={saving} className="btn btn-ghost flex-1" style={{ background: 'var(--paper)' }}>取消</button>
                            <button onClick={saveDraft} disabled={saving || !draft.name.trim()} className="btn btn-primary flex-1">
                                {saving ? <span className="spinner" /> : (isNew ? '加入' : '更新')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={deleteId != null}
                title="刪除這家店？"
                confirmText="刪除"
                danger
                loading={saving}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </BookLayout>
    );
};
