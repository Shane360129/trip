import { Eye, Plus } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTripStore } from '../store/tripStore';

export const ReadOnlyBanner = () => {
    const readOnly = useUIStore((s) => s.readOnly);
    const leaveTrip = useTripStore((s) => s.leaveTrip);

    if (!readOnly) return null;

    return (
        <div
            className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg"
            style={{
                color: 'var(--ink-soft)',
                background: 'var(--paper-soft)',
                border: '1px solid var(--paper-edge)',
                marginBottom: 'var(--safe-bottom)',
            }}
            role="status"
        >
            <Eye size={12} />
            <span>預覽模式 · 唯讀</span>
            <button
                onClick={leaveTrip}
                className="flex items-center gap-1 ml-1 pl-2 py-0.5 text-[11px] font-bold"
                style={{ color: 'var(--accent)', borderLeft: '1px solid var(--paper-edge)' }}
            >
                <Plus size={11} /> 建立我的旅程
            </button>
        </div>
    );
};
