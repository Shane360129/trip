import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrainFront, Ticket, MapPin, ShoppingBag, BookOpen } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { newId } from '../utils/id';
import type { ChapterMeta, Guide } from '../types';

interface GuideProps {
    chapter: ChapterMeta;
    pageNo: number;
}

type TypeKey = Guide['type'];

const TYPE_META: Record<TypeKey, { label: string; icon: typeof TrainFront; color: string; tint: string }> = {
    transport: { label: '交通', icon: TrainFront,  color: 'var(--accent-3)', tint: 'rgba(157,183,201,0.18)' },
    ticket:    { label: '票券', icon: Ticket,      color: 'var(--accent-2)', tint: 'rgba(168,176,134,0.18)' },
    spot:      { label: '景點', icon: MapPin,      color: 'var(--stamp)',    tint: 'rgba(178,58,72,0.12)' },
    shopping:  { label: '購物', icon: ShoppingBag, color: 'var(--accent)',   tint: 'rgba(194,139,90,0.16)' },
};

const TYPE_KEYS: TypeKey[] = ['transport', 'ticket', 'spot', 'shopping'];

const emptyDraft = (): Guide => ({ id: newId(), type: 'transport', title: '', content: '' });

export const GuideChapter = ({ chapter, pageNo }: GuideProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const showToast = useUIStore((s) => s.showToast);
    const editMode = useUIStore((s) => s.editMode);

    const [filter, setFilter] = useState<TypeKey | 'all'>('all');
    const [draft, setDraft] = useState<Guide | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(
        () => trip.guides.filter((g) => filter === 'all' || g.type === filter),
        [trip.guides, filter]
    );
    const counts = useMemo(() => {
        const m: Record<string, number> = { all: trip.guides.length };
        TYPE_KEYS.forEach((k) => { m[k] = trip.guides.filter((g) => g.type === k).length; });
        return m;
    }, [trip.guides]);

    const openNew = () => { setDraft(emptyDraft()); setIsNew(true); };
    const openEdit = (g: Guide) => { setDraft({ ...g }); setIsNew(false); };
    const closeDraft = () => { setDraft(null); setIsNew(false); };

    const saveDraft = async () => {
        if (!draft || !draft.title.trim()) return;
        setSaving(true);
        const cleaned: Guide = { ...draft, title: draft.title.trim(), content: draft.content.trim() };
        const next = isNew
            ? [...trip.guides, cleaned]
            : trip.guides.map((g) => (g.id === cleaned.id ? cleaned : g));
        await update('guides', next);
        setSaving(false);
        closeDraft();
        showToast(isNew ? '已新增' : '已更新');
    };

    const confirmDelete = async () => {
        if (deleteId == null) return;
        setSaving(true);
        await update('guides', trip.guides.filter((g) => g.id !== deleteId));
        setSaving(false);
        setDeleteId(null);
        showToast('已刪除');
    };

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="max-w-md mx-auto pr-6 py-2">
                <header className="mb-4">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-2"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.guide}
                    </div>
                    <div className="flex justify-between items-baseline">
                        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                            攻略
                        </h1>
                        <button onClick={openNew} className="btn btn-primary px-3 py-2 text-sm">
                            <Plus size={16} /> 新增
                        </button>
                    </div>
                </header>

                <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-2 px-2">
                    {(['all', ...TYPE_KEYS] as const).map((k) => {
                        const active = filter === k;
                        const label = k === 'all' ? '全部' : TYPE_META[k].label;
                        const count = counts[k] ?? 0;
                        return (
                            <button
                                key={k}
                                onClick={() => setFilter(k)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 whitespace-nowrap transition-all"
                                style={{
                                    borderColor: active ? 'var(--ink)' : 'var(--paper-edge)',
                                    background: active ? 'var(--ink)' : 'var(--paper-soft)',
                                    color: active ? 'var(--paper-soft)' : 'var(--ink-soft)',
                                }}
                            >
                                {label}
                                <span className="font-mono opacity-70">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
                            {filter === 'all' ? '還沒有攻略筆記' : `${TYPE_META[filter as TypeKey].label}類別還沒有筆記`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((g, idx) => {
                            const meta = TYPE_META[g.type] ?? TYPE_META.transport;
                            const TypeIcon = meta.icon;
                            return (
                                <motion.article
                                    key={g.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                                    onClick={() => openEdit(g)}
                                    className="paper-card relative cursor-pointer overflow-hidden"
                                    style={{ background: 'var(--paper-soft)' }}
                                >
                                    <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ background: meta.color }} aria-hidden />
                                    <div className="p-4 pl-5">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div
                                                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                                                style={{ background: meta.tint, color: meta.color }}
                                            >
                                                <TypeIcon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span
                                                    className="text-[10px] font-bold tracking-[0.2em] uppercase"
                                                    style={{ color: meta.color }}
                                                >
                                                    {meta.label}
                                                </span>
                                                <h3 className="font-display text-lg font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                                                    {g.title}
                                                </h3>
                                            </div>
                                            {editMode && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeleteId(g.id); }}
                                                    aria-label="刪除"
                                                    style={{ color: 'var(--stamp)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        {g.content && (
                                            <ul className="space-y-1 pl-12">
                                                {g.content.split('\n').filter(Boolean).map((line, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm leading-relaxed relative pl-3"
                                                        style={{ color: 'var(--ink-soft)' }}
                                                    >
                                                        <span className="absolute left-0" style={{ color: meta.color }}>·</span>
                                                        {line}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
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
                            {isNew ? '新增攻略' : '編輯攻略'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>類型</label>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    {TYPE_KEYS.map((k) => {
                                        const m = TYPE_META[k];
                                        const M = m.icon;
                                        const active = draft.type === k;
                                        return (
                                            <button
                                                key={k}
                                                onClick={() => setDraft({ ...draft, type: k })}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2"
                                                style={{
                                                    borderColor: active ? m.color : 'var(--paper-edge)',
                                                    background: active ? m.tint : 'transparent',
                                                    color: active ? m.color : 'var(--ink-soft)',
                                                }}
                                            >
                                                <M size={12} /> {m.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>標題 *</label>
                                <input
                                    value={draft.title}
                                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                    className="field mt-1"
                                    placeholder="例：JR Pass 怎麼買"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>內容（每行一個重點）</label>
                                <textarea
                                    value={draft.content}
                                    onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                                    className="field mt-1 h-32 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
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
                title="刪除這份攻略？"
                confirmText="刪除"
                danger
                loading={saving}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </BookLayout>
    );
};
