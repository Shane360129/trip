import { useEffect, useState } from 'react';
import { Plane, ArrowRight, Key } from 'lucide-react';
import { useTripStore, getLastTripId } from '../store/tripStore';

export const Landing = () => {
    const [tripId, setTripId] = useState('');
    const [error, setError] = useState('');
    const enterTrip = useTripStore((s) => s.enterTrip);

    useEffect(() => {
        const last = getLastTripId();
        if (last) setTripId(last);
    }, []);

    const handleSubmit = () => {
        const value = tripId.trim();
        if (!value) { setError('請輸入旅程 ID'); return; }
        if (!/^[a-zA-Z0-9_-]{1,64}$/.test(value)) {
            setError('ID 只能用英文、數字、_ 或 -（最多 64 字）');
            return;
        }
        enterTrip(value);
    };

    return (
        <div className="h-full w-full flex items-center justify-center p-6" style={{ background: 'var(--paper-bg)' }}>
            <div
                className="paper-card w-full max-w-sm p-8 relative overflow-hidden"
                style={{ background: 'var(--paper-soft)' }}
            >
                <div
                    aria-hidden
                    className="absolute top-0 left-0 right-0 h-2"
                    style={{
                        background:
                            'repeating-linear-gradient(45deg, var(--stamp) 0 10px, transparent 10px 20px, var(--accent-3) 20px 30px, transparent 30px 40px)',
                    }}
                />
                <div
                    aria-hidden
                    className="absolute bottom-0 left-0 right-0 h-2"
                    style={{
                        background:
                            'repeating-linear-gradient(45deg, var(--accent-2) 0 10px, transparent 10px 20px, var(--accent) 20px 30px, transparent 30px 40px)',
                    }}
                />

                <div className="text-center mb-7 mt-2">
                    <div
                        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white mb-3 shadow-lg"
                        style={{ background: 'var(--accent)' }}
                    >
                        <Plane size={32} />
                    </div>
                    <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                        TRAVEL LOG
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-1" style={{ color: 'var(--accent)' }}>
                        Your Journey Starts Here
                    </p>
                </div>

                <label
                    className="text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-1 mb-2"
                    style={{ color: 'var(--ink-soft)' }}
                >
                    <Key size={11} /> ENTER TRIP ID
                </label>
                <input
                    type="text"
                    value={tripId}
                    onChange={(e) => { setTripId(e.target.value); setError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                    placeholder="TOKYO2026"
                    className="field text-center font-mono text-xl tracking-wider uppercase py-3"
                    autoFocus
                />
                {error && (
                    <p className="text-xs font-bold mt-2 text-center" style={{ color: 'var(--stamp)' }}>
                        {error}
                    </p>
                )}

                <button onClick={handleSubmit} className="btn btn-primary w-full py-3 mt-5 text-base">
                    GO <ArrowRight size={18} />
                </button>

                <p className="text-[10px] font-bold text-center mt-6 opacity-60" style={{ color: 'var(--ink-soft)' }}>
                    Travel Log · v2.0
                </p>
            </div>
        </div>
    );
};
