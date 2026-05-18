import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Camera, X } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { ImageUploader } from '../components/ImageUploader';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { generateDays } from '../utils/date';
import { newId } from '../utils/id';
import type { ChapterMeta, Photo } from '../types';

interface AlbumProps {
    chapter: ChapterMeta;
    pageNo: number;
}

const ROTATIONS = [-2.5, 1.5, -1.2, 2.2, -1.8, 1, -2, 0.8];

const emptyDraft = (): Photo => ({ id: newId(), url: '', caption: '', day: undefined, location: '', tags: [] });

export const AlbumChapter = ({ chapter, pageNo }: AlbumProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const showToast = useUIStore((s) => s.showToast);
    const editMode = useUIStore((s) => s.editMode);

    const [filter, setFilter] = useState<'all' | number>('all');
    const [draft, setDraft] = useState<Photo | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [lightbox, setLightbox] = useState<Photo | null>(null);

    const days = useMemo(() => generateDays(trip.settings.startDate, trip.settings.duration), [trip.settings.startDate, trip.settings.duration]);
    const filtered = useMemo(() => {
        if (filter === 'all') return trip.photos;
        return trip.photos.filter((p) => p.day === filter);
    }, [trip.photos, filter]);

    const openNew = () => {
        const d = emptyDraft();
        if (filter !== 'all') d.day = filter;
        setDraft(d);
        setIsNew(true);
    };
    const openEdit = (p: Photo) => { setDraft({ ...p }); setIsNew(false); };
    const closeDraft = () => { setDraft(null); setIsNew(false); };

    const saveDraft = async () => {
        if (!draft || !draft.url.trim()) return;
        setSaving(true);
        const cleaned: Photo = {
            ...draft,
            url: draft.url.trim(),
            caption: draft.caption?.trim() ?? '',
            location: draft.location?.trim() ?? '',
        };
        const next = isNew
            ? [...trip.photos, cleaned]
            : trip.photos.map((p) => (p.id === cleaned.id ? cleaned : p));
        await update('photos', next);
        setSaving(false);
        closeDraft();
        showToast(isNew ? '已加入相簿' : '已更新');
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setSaving(true);
        await update('photos', trip.photos.filter((p) => p.id !== deleteId));
        setSaving(false);
        setDeleteId(null);
        showToast('已刪除');
    };

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="w-full px-4 md:px-6 py-2 md:py-4">
                <header className="mb-4">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-2"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.album}
                    </div>
                    <div className="flex justify-between items-baseline">
                        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                            相簿
                        </h1>
                        <button onClick={openNew} className="btn btn-primary px-3 py-2 text-sm">
                            <Plus size={16} /> 新增
                        </button>
                    </div>
                </header>

                <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-2 px-2">
                    {(['all' as const, ...days.map((d) => d.day)]).map((k) => {
                        const active = filter === k;
                        const label = k === 'all' ? '全部' : `Day ${k}`;
                        const count = k === 'all' ? trip.photos.length : trip.photos.filter((p) => p.day === k).length;
                        return (
                            <button
                                key={k}
                                onClick={() => setFilter(k)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 whitespace-nowrap"
                                style={{
                                    borderColor: active ? 'var(--ink)' : 'var(--paper-edge)',
                                    background: active ? 'var(--ink)' : 'var(--paper-soft)',
                                    color: active ? 'var(--paper-soft)' : 'var(--ink-soft)',
                                }}
                            >
                                {label} <span className="font-mono opacity-70">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Camera size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
                            還沒有照片
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-5 pb-4">
                        {filtered.map((p, idx) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.04 }}
                                onClick={() => setLightbox(p)}
                                className="polaroid relative cursor-pointer"
                                style={{ ['--rot' as string]: `${ROTATIONS[idx % ROTATIONS.length]}deg` }}
                            >
                                <div className="polaroid-img">
                                    <img
                                        src={p.url}
                                        alt={p.caption ?? ''}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                                <div className="text-center mt-2 px-1 font-hand text-base leading-tight" style={{ color: 'var(--ink)' }}>
                                    {p.caption || (p.day ? `Day ${p.day}` : '·')}
                                </div>
                                {editMode && (
                                    <div className="absolute top-1 right-1 flex gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                                            className="bg-white/85 rounded-full p-1 shadow"
                                            aria-label="編輯"
                                            style={{ color: 'var(--ink-soft)' }}
                                        >
                                            <Camera size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                                            className="bg-white/85 rounded-full p-1 shadow"
                                            style={{ color: 'var(--stamp)' }}
                                            aria-label="刪除"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / edit modal */}
            {draft && (
                <div
                    className="fixed inset-0 z-[180] flex items-center justify-center p-4"
                    style={{ background: 'rgba(40,30,20,0.45)', backdropFilter: 'blur(4px)' }}
                    onClick={() => !saving && closeDraft()}
                >
                    <div className="paper-card w-full max-w-sm p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-display text-lg font-black mb-4" style={{ color: 'var(--ink)' }}>
                            {isNew ? '新增照片' : '編輯照片'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em] mb-1 block" style={{ color: 'var(--ink-soft)' }}>照片 *</label>
                                <ImageUploader
                                    value={draft.url}
                                    onChange={(url) => setDraft({ ...draft, url })}
                                    previewSize={140}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>說明</label>
                                <input
                                    value={draft.caption ?? ''}
                                    onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
                                    className="field mt-1 font-hand text-base"
                                    placeholder="今天的天空好藍 ✨"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>哪一天</label>
                                    <select
                                        value={draft.day ?? ''}
                                        onChange={(e) => setDraft({ ...draft, day: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="field mt-1"
                                    >
                                        <option value="">未指定</option>
                                        {days.map((d) => (
                                            <option key={d.day} value={d.day}>Day {d.day} · {d.date}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>地點</label>
                                    <input
                                        value={draft.location ?? ''}
                                        onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                                        className="field mt-1"
                                        placeholder="地點"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={closeDraft} disabled={saving} className="btn btn-ghost flex-1" style={{ background: 'var(--paper)' }}>取消</button>
                            <button onClick={saveDraft} disabled={saving || !draft.url.trim()} className="btn btn-primary flex-1">
                                {saving ? <span className="spinner" /> : (isNew ? '加入' : '更新')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[190] flex flex-col items-center justify-center p-4"
                        style={{ background: 'rgba(20,15,10,0.92)' }}
                        onClick={() => setLightbox(null)}
                    >
                        <button
                            onClick={() => setLightbox(null)}
                            className="absolute top-4 right-4 text-white p-2 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                            aria-label="關閉"
                        >
                            <X size={20} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.92 }}
                            animate={{ scale: 1 }}
                            src={lightbox.url}
                            alt={lightbox.caption ?? ''}
                            className="max-w-full max-h-[70vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        {(lightbox.caption || lightbox.location || lightbox.day) && (
                            <div className="mt-4 text-center text-white max-w-md">
                                {lightbox.caption && <p className="font-hand text-lg mb-1">{lightbox.caption}</p>}
                                <p className="text-xs opacity-70">
                                    {lightbox.day ? `Day ${lightbox.day}` : ''}
                                    {lightbox.day && lightbox.location ? ' · ' : ''}
                                    {lightbox.location ?? ''}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                open={deleteId != null}
                title="刪除這張照片？"
                confirmText="刪除"
                danger
                loading={saving}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </BookLayout>
    );
};
