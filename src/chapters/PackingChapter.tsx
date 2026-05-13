import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Trash2, Luggage } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { newId } from '../utils/id';
import type { ChapterMeta, PackingItem } from '../types';

interface PackingProps {
    chapter: ChapterMeta;
    pageNo: number;
}

const DEFAULT_CATEGORIES = ['證件', '衣物', '3C', '盥洗', '藥品', '其他'];

export const PackingChapter = ({ chapter, pageNo }: PackingProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const showToast = useUIStore((s) => s.showToast);
    const editMode = useUIStore((s) => s.editMode);

    const [newItemText, setNewItemText] = useState('');
    const [newItemCategory, setNewItemCategory] = useState(DEFAULT_CATEGORIES[0]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const grouped = useMemo(() => {
        const cats = new Map<string, PackingItem[]>();
        DEFAULT_CATEGORIES.forEach((c) => cats.set(c, []));
        trip.packing.forEach((it) => {
            const list = cats.get(it.category) ?? [];
            list.push(it);
            cats.set(it.category, list);
        });
        return Array.from(cats.entries()).filter(([, list]) => list.length > 0 || editMode);
    }, [trip.packing, editMode]);

    const totalDone = trip.packing.filter((i) => i.checked).length;
    const total = trip.packing.length;

    const add = async () => {
        if (!newItemText.trim()) return;
        const item: PackingItem = {
            id: newId(),
            item: newItemText.trim(),
            category: newItemCategory,
            checked: false,
        };
        await update('packing', [...trip.packing, item]);
        setNewItemText('');
        showToast('已加入');
    };

    const toggle = async (id: string) => {
        await update('packing', trip.packing.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setSaving(true);
        await update('packing', trip.packing.filter((i) => i.id !== deleteId));
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
                        {CHAPTER_HEADER_EN.before}
                    </div>
                    <div className="flex justify-between items-baseline">
                        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                            出發前
                        </h1>
                        <div className="text-sm font-mono font-bold" style={{ color: 'var(--ink-soft)' }}>
                            {totalDone}/{total}
                        </div>
                    </div>
                    {total > 0 && (
                        <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper-edge)' }}>
                            <div
                                className="h-full transition-all"
                                style={{ width: `${(totalDone / total) * 100}%`, background: 'var(--accent-2)' }}
                            />
                        </div>
                    )}
                </header>

                <div className="paper-card p-3 flex gap-2 items-stretch mb-5">
                    <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="field py-2 w-24 text-sm"
                    >
                        {DEFAULT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
                        placeholder="例：護照、行動電源"
                        className="field py-2 flex-1 text-sm"
                    />
                    <button onClick={add} disabled={!newItemText.trim()} className="btn btn-primary px-3" aria-label="加入">
                        <Plus size={16} />
                    </button>
                </div>

                {trip.packing.length === 0 ? (
                    <div className="text-center py-16">
                        <Luggage size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
                            還沒有打包清單
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {grouped.map(([cat, list]) => (
                            <section key={cat}>
                                <h2 className="text-xs font-display font-black mb-2 flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                                    <span className="washi text-[10px]" style={{ ['--rot' as string]: '-1deg' }}>{cat}</span>
                                    <span className="text-[10px] font-mono" style={{ color: 'var(--ink-soft)' }}>
                                        {list.filter((i) => i.checked).length}/{list.length}
                                    </span>
                                </h2>
                                <ul className="space-y-1.5">
                                    {list.map((item) => (
                                        <motion.li
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="paper-card flex items-center gap-3 px-3 py-2"
                                        >
                                            <button
                                                onClick={() => toggle(item.id)}
                                                className="shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors"
                                                style={{
                                                    borderColor: item.checked ? 'var(--accent-2)' : 'var(--paper-edge)',
                                                    background: item.checked ? 'var(--accent-2)' : 'transparent',
                                                    color: 'white',
                                                }}
                                                aria-label={item.checked ? '取消勾選' : '勾選'}
                                            >
                                                {item.checked && <Check size={14} strokeWidth={3} />}
                                            </button>
                                            <span
                                                className="flex-1 text-sm"
                                                style={{
                                                    color: item.checked ? 'var(--ink-soft)' : 'var(--ink)',
                                                    textDecoration: item.checked ? 'line-through' : 'none',
                                                }}
                                            >
                                                {item.item}
                                            </span>
                                            {editMode && (
                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    aria-label="刪除"
                                                    style={{ color: 'var(--stamp)' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </motion.li>
                                    ))}
                                    {list.length === 0 && editMode && (
                                        <li className="text-xs italic px-1" style={{ color: 'var(--ink-soft)' }}>（空）</li>
                                    )}
                                </ul>
                            </section>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                open={deleteId != null}
                title="刪除這項？"
                confirmText="刪除"
                danger
                loading={saving}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </BookLayout>
    );
};
