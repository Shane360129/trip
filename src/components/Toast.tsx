import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const Toast = () => {
    const toast = useUIStore((s) => s.toast);
    return (
        <AnimatePresence>
            {toast.visible && (
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-xl"
                    style={{ background: 'var(--ink)', color: 'var(--paper-soft)' }}
                >
                    <span className="bg-white/15 rounded-full p-1"><Check size={12} /></span>
                    {toast.msg}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
