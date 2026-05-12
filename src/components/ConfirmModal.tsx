import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal = ({
    open,
    title,
    message,
    confirmText = '確定',
    cancelText = '取消',
    danger = false,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, loading, onCancel]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[180] flex items-center justify-center p-4"
            style={{ background: 'rgba(40,30,20,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => !loading && onCancel()}
            role="dialog"
            aria-modal="true"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="paper-card w-full max-w-xs p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-display text-xl font-black mb-2" style={{ color: 'var(--ink)' }}>
                    {title}
                </h3>
                {message && (
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                        {message}
                    </p>
                )}
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading} className="btn btn-ghost flex-1" style={{ background: 'var(--paper)' }}>
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="btn flex-1"
                        style={{ background: danger ? 'var(--stamp)' : 'var(--accent)', color: 'white' }}
                    >
                        {loading ? <span className="spinner" /> : confirmText}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
