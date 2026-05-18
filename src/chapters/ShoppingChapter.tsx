import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ShoppingBag, Image as ImageIcon, Search } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { newId } from '../utils/id';
import type { ChapterMeta, ShoppingItem } from '../types';

interface ShoppingProps {
    chapter: ChapterMeta;
    pageNo: number;
}

type Draft = Omit<ShoppingItem, 'id' | 'bought'> & { id: string | number; bought: boolean };

const emptyDraft = (): Draft => ({
    id: newId(),
    name: '',
    price: '',
    note: '',
    image: '',
    bought: false,
});

const ROTATIONS = [-2, 1.2, -1, 1.5, -1.7, 0.8];

export const ShoppingChapter = ({ chapter, pageNo }: ShoppingProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const showToast = useUIStore((s) => s.showToast);
    const editMode = useUIStore((s) => s.editMode);

    const [draft, setDraft] = useState<Draft | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [saving, setSaving] = useState(false);

    const total = useMemo(
        () => trip.shopping.reduce((acc, it) => acc + (parseFloat(String(it.price)) || 0), 0),
        [trip.shopping]
    );
    const totalBought = useMemo(
        () => trip.shopping.filter((i) => i.bought).reduce((acc, it) => acc + (parseFloat(String(it.price)) || 0), 0),
        [trip.shopping]
    );

    const openNew = () => { setDraft(emptyDraft()); setIsNew(true); };
    const openEdit = (item: ShoppingItem) => { setDraft({ ...item, price: String(item.price ?? '') }); setIsNew(false); };
    const closeDraft = () => { setDraft(null); setIsNew(false); };

    const saveDraft = async () => {
        if (!draft || !draft.name.trim()) return;
        setSaving(true);
        const cleaned: ShoppingItem = {
            ...draft,
            name: draft.name.trim(),
            note: draft.note.trim(),
            image: draft.image.trim(),
            price: draft.price,
        };
        const next = isNew
            ? [...trip.shopping, cleaned]
            : trip.shopping.map((i) => (i.id === cleaned.id ? cleaned : i));
        await update('shopping', next);
        setSaving(false);
        closeDraft();
        showToast(isNew ? '已加入清單' : '已更新');
    };

    const toggleBought = async (item: ShoppingItem) => {
        await update('shopping', trip.shopping.map((i) => (i.id === item.id ? { ...i, bought: !i.bought } : i)));
    };

    const confirmDelete = async () => {
        if (deleteId == null) return;
        setSaving(true);
        await update('shopping', trip.shopping.filter((i) => i.id !== deleteId));
        setSaving(false);
        setDeleteId(null);
        showToast('已刪除');
    };

    const searchImage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!draft?.name.trim()) { showToast('請先填商品名稱'); return; }
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
                        {CHAPTER_HEADER_EN.shopping}
                    </div>
                    <div className="flex justify-between items-baseline">
                        <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                            購物
                        </h1>
                        <button onClick={openNew} className="btn btn-primary px-3 py-2 text-sm">
                            <Plus size={16} /> 新增
                        </button>
                    </div>
                </header>

                <div className="paper-card p-3 mb-5 flex justify-between items-center" style={{ background: 'var(--paper-soft)' }}>
                    <div>
                        <div className="text-[10px] tracking-[0.2em] font-bold" style={{ color: 'var(--ink-soft)' }}>
                            預算總計
                        </div>
                        <div className="font-mono text-2xl font-black" style={{ color: 'var(--accent)' }}>
                            ¥{Math.round(total).toLocaleString()}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] tracking-[0.2em] font-bold" style={{ color: 'var(--ink-soft)' }}>
                            已購買
                        </div>
                        <div className="font-mono text-lg font-black" style={{ color: 'var(--accent-2)' }}>
                            ¥{Math.round(totalBought).toLocaleString()}
                        </div>
                    </div>
                </div>

                {trip.shopping.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
                            還沒想買的東西
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-5 pb-4">
                        {trip.shopping.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.04 }}
                                onClick={() => openEdit(item)}
                                className="polaroid cursor-pointer relative"
                                style={{ ['--rot' as string]: `${ROTATIONS[idx % ROTATIONS.length]}deg` }}
                            >
                                <div className="polaroid-img relative">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                img.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--ink-soft)' }}>
                                            <ImageIcon size={32} className="opacity-50" />
                                        </div>
                                    )}
                                    {item.bought && (
                                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                            <span className="stamp text-[10px]" style={{ color: 'white', borderColor: 'white' }}>
                                                BOUGHT!
                                            </span>
                                        </div>
                                    )}
                                    {editMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                                            className="absolute top-1 right-1 bg-white/85 rounded-full p-1 shadow"
                                            style={{ color: 'var(--stamp)' }}
                                            aria-label="刪除"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-center mt-2 px-1">
                                    <div className="font-bold text-sm truncate" style={{ color: 'var(--ink)' }}>
                                        {item.name}
                                    </div>
                                    <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                                        ¥{item.price || '-'}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleBought(item); }}
                                        className="mt-2 w-full text-[10px] font-bold tracking-[0.15em] py-1 rounded"
                                        style={{
                                            background: item.bought ? 'var(--paper)' : 'var(--accent)',
                                            color: item.bought ? 'var(--ink-soft)' : 'white',
                                        }}
                                    >
                                        {item.bought ? '取消購買' : '標記購買'}
                                    </button>
                                </div>
                            </motion.div>
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
                            {isNew ? '新增想買的' : '編輯商品'}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>商品名稱 *</label>
                                <input
                                    value={draft.name}
                                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                    className="field mt-1"
                                    placeholder="例：Uniqlo 發熱衣"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>預估價格 (¥)</label>
                                <input
                                    type="number"
                                    value={draft.price as string}
                                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                                    className="field mt-1"
                                    placeholder="1000"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em] flex justify-between items-center" style={{ color: 'var(--ink-soft)' }}>
                                    <span>圖片網址</span>
                                    <button onClick={searchImage} className="text-[10px] flex items-center gap-1 underline" style={{ color: 'var(--accent-3)' }}>
                                        <Search size={11} /> Google 找圖
                                    </button>
                                </label>
                                <input
                                    value={draft.image}
                                    onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                                    className="field mt-1"
                                    placeholder="貼上圖片連結"
                                />
                                {draft.image && (
                                    <div className="mt-2 w-20 h-20 rounded overflow-hidden" style={{ background: 'var(--paper)' }}>
                                        <img
                                            src={draft.image}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>備註</label>
                                <textarea
                                    value={draft.note}
                                    onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                                    className="field mt-1 h-20 resize-none"
                                />
                            </div>
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
                title="刪除這個商品？"
                confirmText="刪除"
                danger
                loading={saving}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </BookLayout>
    );
};
