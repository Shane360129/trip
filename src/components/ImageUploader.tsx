import { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { uploadImage } from '../utils/upload';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    previewSize?: number;
    compact?: boolean;
    hidePreview?: boolean;
}

export const ImageUploader = ({
    value,
    onChange,
    placeholder = '貼上網址或上傳圖片',
    previewSize = 80,
    compact = false,
    hidePreview = false,
}: ImageUploaderProps) => {
    const tripId = useTripStore((s) => s.tripId);
    const showToast = useUIStore((s) => s.showToast);
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number | null>(null);

    const handleFile = async (file: File | null) => {
        if (!file) return;
        if (!tripId) { showToast('請先進入旅程'); return; }
        setProgress(0);
        try {
            const result = await uploadImage(file, tripId, (p) => setProgress(p.progress));
            onChange(result.url);
            showToast('圖片已上傳');
        } catch (err) {
            const msg = err instanceof Error ? err.message : '上傳失敗';
            showToast(msg);
        } finally {
            setProgress(null);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2 items-stretch">
                <div className="relative flex-1">
                    <LinkIcon
                        size={12}
                        className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--ink-soft)' }}
                    />
                    <input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="field pl-7"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={progress != null}
                    className="btn btn-secondary px-3 py-2 shrink-0 text-sm"
                    aria-label="上傳圖片"
                >
                    {progress != null ? <span className="spinner" /> : <Upload size={14} />}
                    {!compact && <span className="ml-1">{progress != null ? `${progress}%` : '上傳'}</span>}
                </button>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="btn btn-ghost px-2 py-2 shrink-0"
                        style={{ background: 'var(--paper)' }}
                        aria-label="清除"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {!hidePreview && (
                value ? (
                    <div
                        className="rounded overflow-hidden"
                        style={{ background: 'var(--paper)', width: previewSize, height: previewSize }}
                    >
                        <img
                            src={value}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    </div>
                ) : (
                    <div
                        className="rounded border-2 border-dashed flex flex-col items-center justify-center text-[10px] font-bold"
                        style={{
                            background: 'var(--paper)',
                            borderColor: 'var(--paper-edge)',
                            color: 'var(--ink-soft)',
                            width: previewSize,
                            height: previewSize,
                        }}
                    >
                        <ImageIcon size={20} className="opacity-50 mb-1" />
                        NO IMAGE
                    </div>
                )
            )}
        </div>
    );
};
