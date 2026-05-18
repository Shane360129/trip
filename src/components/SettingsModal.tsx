import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, RotateCcw, Share2 } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTripStore } from '../store/tripStore';
import { ConfirmModal } from './ConfirmModal';

export const SettingsModal = () => {
    const open = useUIStore((s) => s.settingsOpen);
    const close = useUIStore((s) => s.closeSettings);
    const openShare = useUIStore((s) => s.openShare);
    const readOnly = useUIStore((s) => s.readOnly);
    const showToast = useUIStore((s) => s.showToast);
    const tripId = useTripStore((s) => s.tripId);
    const trip = useTripStore((s) => s.trip);
    const patch = useTripStore((s) => s.patch);
    const leaveTrip = useTripStore((s) => s.leaveTrip);
    const resetTrip = useTripStore((s) => s.resetTrip);

    const [local, setLocal] = useState(trip.settings);
    const [confirmReset, setConfirmReset] = useState(false);
    const [resetting, setResetting] = useState(false);

    useEffect(() => { if (open) setLocal(trip.settings); }, [open, trip.settings]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    if (!open) return null;

    const save = async () => {
        await patch({ settings: local });
        showToast('已儲存');
        close();
    };

    const handleReset = async () => {
        setResetting(true);
        await resetTrip();
        setResetting(false);
        setConfirmReset(false);
        close();
        showToast('資料已重置');
    };

    return (
        <div
            className="fixed inset-0 z-[160] flex items-center justify-center p-4"
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
                <h2 className="font-display text-xl font-black mb-4" style={{ color: 'var(--ink)' }}>
                    {readOnly ? '旅程資訊' : '旅程設定'}
                </h2>

                <div
                    className="paper-card flex items-center justify-between p-3 mb-4"
                    style={{ background: 'var(--paper)' }}
                >
                    <div>
                        <div className="text-[10px] tracking-[0.2em] font-bold" style={{ color: 'var(--ink-soft)' }}>CURRENT TRIP ID</div>
                        <div className="font-mono font-bold" style={{ color: 'var(--ink)' }}>{tripId}</div>
                    </div>
                    <button onClick={() => { leaveTrip(); close(); }} className="btn btn-ghost text-xs" style={{ background: 'var(--paper-soft)' }}>
                        <LogOut size={14} /> 切換
                    </button>
                </div>

                {!readOnly && (
                    <button
                        onClick={() => { close(); openShare(); }}
                        className="btn btn-secondary w-full py-3 mb-4"
                    >
                        <Share2 size={16} /> 分享這本小書
                    </button>
                )}

                {readOnly ? (
                    <div className="space-y-3">
                        <div>
                            <div className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>旅程名稱</div>
                            <div className="font-bold mt-1" style={{ color: 'var(--ink)' }}>{local.title}</div>
                        </div>
                        <div className="flex gap-6">
                            <div>
                                <div className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>出發日期</div>
                                <div className="font-mono mt-1" style={{ color: 'var(--ink)' }}>{local.startDate}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>天數</div>
                                <div className="font-mono mt-1" style={{ color: 'var(--ink)' }}>{local.duration}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>旅程名稱</label>
                                <input
                                    value={local.title}
                                    onChange={(e) => setLocal({ ...local, title: e.target.value })}
                                    className="field mt-1"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>出發日期</label>
                                    <input
                                        type="date"
                                        value={local.startDate}
                                        onChange={(e) => setLocal({ ...local, startDate: e.target.value })}
                                        className="field mt-1"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] font-bold tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>天數</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={60}
                                        value={local.duration}
                                        onChange={(e) => setLocal({ ...local, duration: parseInt(e.target.value) || 1 })}
                                        className="field mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <button onClick={save} className="btn btn-primary w-full py-3">儲存</button>
                            <button
                                onClick={() => setConfirmReset(true)}
                                className="btn btn-ghost w-full py-2 text-sm"
                                style={{ background: 'var(--paper)', color: 'var(--stamp)' }}
                            >
                                <RotateCcw size={14} /> 清空此 ID 的所有資料
                            </button>
                        </div>
                    </>
                )}
            </motion.div>

            <ConfirmModal
                open={confirmReset}
                title="清空所有資料？"
                message={`此操作會清除 Trip ID "${tripId}" 的所有行程、攻略、購物、分帳、筆記等資料，且無法復原。`}
                confirmText="確定清空"
                danger
                loading={resetting}
                onConfirm={handleReset}
                onCancel={() => setConfirmReset(false)}
            />
        </div>
    );
};
