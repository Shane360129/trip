import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Image as ImageIcon, Edit3 } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { ImageUploader } from '../components/ImageUploader';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import type { ChapterMeta } from '../types';

interface CoverProps {
    chapter: ChapterMeta;
    pageNo: number;
}

export const CoverChapter = ({ chapter, pageNo }: CoverProps) => {
    const trip = useTripStore((s) => s.trip);
    const patch = useTripStore((s) => s.patch);
    const editMode = useUIStore((s) => s.editMode);
    const goToChapter = useUIStore((s) => s.goToChapter);
    const showToast = useUIStore((s) => s.showToast);
    const [askPhoto, setAskPhoto] = useState(false);
    const [photoDraft, setPhotoDraft] = useState('');

    const tocChapter = trip.chapters.find((c) => c.type === 'toc');
    const nextChapter = trip.chapters
        .filter((c) => c.visible && c.type !== 'cover')
        .sort((a, b) => a.order - b.order)[0];

    const startTrip = () => {
        const target = tocChapter ?? nextChapter;
        if (target) goToChapter(target.id, 1);
    };

    const savePhoto = () => {
        patch({ cover: { ...trip.cover, photo: photoDraft.trim() } });
        setAskPhoto(false);
        setPhotoDraft('');
        showToast('封面照已更新');
    };

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="w-full px-4 md:px-6 py-4 md:py-6">
                <div className="text-center">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-4"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.cover}
                    </div>
                </div>

                {/* Cover photo */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mx-auto mb-6 polaroid"
                    style={{ ['--rot' as string]: '-1.5deg', maxWidth: 320 }}
                >
                    {trip.cover.photo ? (
                        <img
                            src={trip.cover.photo}
                            alt="Cover"
                            className="polaroid-img"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="polaroid-img flex flex-col items-center justify-center" style={{ color: 'var(--ink-soft)' }}>
                            <ImageIcon size={48} className="mb-2 opacity-50" />
                            <span className="text-xs font-bold">尚未設定封面</span>
                            {editMode && (
                                <button
                                    onClick={() => setAskPhoto(true)}
                                    className="btn btn-ghost text-xs mt-2"
                                    style={{ background: 'var(--paper)' }}
                                >
                                    貼上圖片網址
                                </button>
                            )}
                        </div>
                    )}
                    {trip.cover.photo && editMode && (
                        <button
                            onClick={() => { setPhotoDraft(trip.cover.photo); setAskPhoto(true); }}
                            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow"
                            aria-label="更換封面照"
                        >
                            <Edit3 size={14} />
                        </button>
                    )}
                </motion.div>

                {/* Title */}
                {editMode ? (
                    <input
                        value={trip.settings.title}
                        onChange={(e) => patch({ settings: { ...trip.settings, title: e.target.value } })}
                        className="field font-display text-center text-3xl font-black mb-2"
                    />
                ) : (
                    <h1 className="font-display text-center text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--ink)' }}>
                        {trip.settings.title}
                    </h1>
                )}

                {/* Motto */}
                {editMode ? (
                    <input
                        value={trip.cover.motto}
                        onChange={(e) => patch({ cover: { ...trip.cover, motto: e.target.value } })}
                        className="field font-hand text-center text-lg mb-4"
                        placeholder="一句話，作為旅程的標語"
                    />
                ) : (
                    <p className="font-hand text-center text-lg mb-4" style={{ color: 'var(--accent)' }}>
                        “{trip.cover.motto}”
                    </p>
                )}

                {/* Dates + duration */}
                <div className="flex items-center justify-center gap-4 mb-6 text-sm" style={{ color: 'var(--ink-soft)' }}>
                    {editMode ? (
                        <>
                            <input
                                type="date"
                                value={trip.settings.startDate}
                                onChange={(e) => patch({ settings: { ...trip.settings, startDate: e.target.value } })}
                                className="field text-sm py-1.5 w-auto"
                            />
                            <input
                                type="number"
                                min={1}
                                max={60}
                                value={trip.settings.duration}
                                onChange={(e) => patch({ settings: { ...trip.settings, duration: parseInt(e.target.value) || 1 } })}
                                className="field text-sm py-1.5 w-16"
                            />
                            <span>天</span>
                        </>
                    ) : (
                        <>
                            <span className="font-mono font-bold">{trip.settings.startDate}</span>
                            <span>·</span>
                            <span className="font-mono font-bold">{trip.settings.duration} DAYS</span>
                        </>
                    )}
                </div>

                {/* Travelers */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                    <span className="text-[10px] tracking-[0.25em] font-bold mr-1" style={{ color: 'var(--ink-soft)' }}>
                        TRAVELERS
                    </span>
                    {trip.users.map((u) => (
                        <span
                            key={u}
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: 'var(--paper-edge)', color: 'var(--ink)' }}
                        >
                            {u}
                        </span>
                    ))}
                </div>

                {/* Passport-style stamp */}
                <div className="flex justify-center mb-8">
                    <span className="stamp">{trip.cover.subtitle}</span>
                </div>

                <button onClick={startTrip} className="btn btn-primary w-full py-3 text-base">
                    開始旅程 <ArrowRight size={18} />
                </button>

                {askPhoto && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(40,30,20,0.45)', backdropFilter: 'blur(4px)' }} onClick={() => setAskPhoto(false)}>
                        <div className="paper-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-display text-lg font-black mb-3">封面照</h3>
                            <ImageUploader
                                value={photoDraft}
                                onChange={setPhotoDraft}
                                placeholder="貼上圖片網址或上傳"
                                previewSize={120}
                            />
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setAskPhoto(false)} className="btn btn-ghost flex-1" style={{ background: 'var(--paper)' }}>取消</button>
                                <button onClick={savePhoto} className="btn btn-primary flex-1">儲存</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BookLayout>
    );
};
