import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Copy, Check, X, Eye, Pencil, Share2 } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTripStore } from '../store/tripStore';

const buildShareUrl = (tripId: string, readOnly: boolean): string => {
    const { origin, pathname } = window.location;
    const params = new URLSearchParams();
    params.set('trip', tripId);
    if (readOnly) params.set('ro', '1');
    return `${origin}${pathname}?${params.toString()}`;
};

export const ShareModal = () => {
    const open = useUIStore((s) => s.shareOpen);
    const close = useUIStore((s) => s.closeShare);
    const showToast = useUIStore((s) => s.showToast);
    const tripId = useTripStore((s) => s.tripId);
    const trip = useTripStore((s) => s.trip);

    const [mode, setMode] = useState<'readonly' | 'edit'>('readonly');
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const url = useMemo(
        () => (tripId ? buildShareUrl(tripId, mode === 'readonly') : ''),
        [tripId, mode],
    );

    useEffect(() => { if (open) { setMode('readonly'); setCopied(false); } }, [open]);

    useEffect(() => {
        if (!url) { setQrDataUrl(''); return; }
        let cancelled = false;
        QRCode.toDataURL(url, {
            width: 280,
            margin: 1,
            color: { dark: '#3D332B', light: '#FDFBF7' },
            errorCorrectionLevel: 'M',
        })
            .then((data) => { if (!cancelled) setQrDataUrl(data); })
            .catch((err) => { console.warn('QR generation failed:', err); });
        return () => { cancelled = true; };
    }, [url]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    if (!open || !tripId) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            showToast('連結已複製');
            setTimeout(() => setCopied(false), 1500);
        } catch {
            showToast('複製失敗');
        }
    };

    const handleNativeShare = async () => {
        const nav = navigator as Navigator & { share?: (data: { title: string; text: string; url: string }) => Promise<void> };
        if (!nav.share) { handleCopy(); return; }
        try {
            await nav.share({
                title: trip.settings.title || '我的旅程',
                text: `來看看「${trip.settings.title || '我的旅程'}」的小書`,
                url,
            });
        } catch (err) {
            if ((err as { name?: string })?.name !== 'AbortError') console.warn('Share failed:', err);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[170] flex items-center justify-center p-4"
            style={{ background: 'rgba(40,30,20,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={close}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="paper-card w-full max-w-sm p-6"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-black" style={{ color: 'var(--ink)' }}>
                        分享小書
                    </h2>
                    <button onClick={close} aria-label="關閉" style={{ color: 'var(--ink-soft)' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Mode toggle */}
                <div
                    className="flex items-center gap-1 p-1 mb-4 rounded-full"
                    style={{ background: 'var(--paper)', border: '1px solid var(--paper-edge)' }}
                    role="tablist"
                    aria-label="分享模式"
                >
                    <button
                        role="tab"
                        aria-selected={mode === 'readonly'}
                        onClick={() => setMode('readonly')}
                        className="flex items-center justify-center gap-1 flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition"
                        style={{
                            background: mode === 'readonly' ? 'var(--accent)' : 'transparent',
                            color: mode === 'readonly' ? 'white' : 'var(--ink-soft)',
                        }}
                    >
                        <Eye size={12} /> 預覽（唯讀）
                    </button>
                    <button
                        role="tab"
                        aria-selected={mode === 'edit'}
                        onClick={() => setMode('edit')}
                        className="flex items-center justify-center gap-1 flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition"
                        style={{
                            background: mode === 'edit' ? 'var(--accent)' : 'transparent',
                            color: mode === 'edit' ? 'white' : 'var(--ink-soft)',
                        }}
                    >
                        <Pencil size={12} /> 共編
                    </button>
                </div>

                <p className="text-[11px] mb-3" style={{ color: 'var(--ink-soft)' }}>
                    {mode === 'readonly'
                        ? '收到連結的人可以翻頁瀏覽，但不能修改內容。'
                        : '⚠️ 收到連結的人可以直接編輯這本小書。'}
                </p>

                {/* QR */}
                <div className="flex justify-center mb-4">
                    <div
                        className="p-3 rounded-lg"
                        style={{ background: 'var(--paper-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="QR code" className="block" width={240} height={240} />
                        ) : (
                            <div className="w-[240px] h-[240px] flex items-center justify-center">
                                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>產生中…</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* URL row */}
                <div
                    className="flex items-center gap-2 p-2 rounded-lg mb-4"
                    style={{ background: 'var(--paper)', border: '1px solid var(--paper-edge)' }}
                >
                    <input
                        readOnly
                        value={url}
                        className="flex-1 bg-transparent text-xs font-mono truncate outline-none"
                        style={{ color: 'var(--ink)' }}
                        onFocus={(e) => e.currentTarget.select()}
                    />
                    <button
                        onClick={handleCopy}
                        className="btn btn-ghost text-xs px-2 py-1"
                        style={{ background: 'var(--paper-soft)' }}
                        aria-label="複製連結"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>

                <button onClick={handleNativeShare} className="btn btn-primary w-full py-3">
                    <Share2 size={16} /> 分享
                </button>
            </motion.div>
        </div>
    );
};
