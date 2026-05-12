import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowRight, User, PlusCircle, X, Wallet } from 'lucide-react';
import { BookLayout } from '../components/BookLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import { CHAPTER_HEADER_EN } from '../components/chapterMeta';
import { newId } from '../utils/id';
import type { ChapterMeta, Expense } from '../types';

interface ExpenseProps {
    chapter: ChapterMeta;
    pageNo: number;
}

const calcDebts = (expenses: Expense[], users: string[]) => {
    if (users.length === 0) return { debts: [], totalSpent: 0 };

    const balances: Record<string, number> = {};
    users.forEach((u) => { balances[u] = 0; });

    let totalSpent = 0;
    expenses.forEach((e) => {
        const payer = users.includes(e.payer) ? e.payer : users[0];
        const cost = Number(e.amount) || 0;
        totalSpent += cost;
        balances[payer] = (balances[payer] ?? 0) + cost;
        const targets = e.involved && e.involved.length > 0 ? e.involved : users;
        const split = cost / targets.length;
        targets.forEach((u) => { if (balances[u] !== undefined) balances[u] -= split; });
    });

    const debtors = users.filter((u) => balances[u] < -1).sort((a, b) => balances[a] - balances[b]);
    const creditors = users.filter((u) => balances[u] > 1).sort((a, b) => balances[b] - balances[a]);

    const debts: { from: string; to: string; amount: number }[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const dr = debtors[i], cr = creditors[j];
        const amount = Math.min(Math.abs(balances[dr]), balances[cr]);
        if (amount > 0) debts.push({ from: dr, to: cr, amount: Math.round(amount) });
        balances[dr] += amount;
        balances[cr] -= amount;
        if (Math.abs(balances[dr]) < 1) i++;
        if (balances[cr] < 1) j++;
    }
    return { debts, totalSpent };
};

export const ExpenseChapter = ({ chapter, pageNo }: ExpenseProps) => {
    const trip = useTripStore((s) => s.trip);
    const update = useTripStore((s) => s.update);
    const showToast = useUIStore((s) => s.showToast);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [payer, setPayer] = useState<string>(trip.users[0] ?? '');
    const [involved, setInvolved] = useState<string[]>(trip.users);

    const [newUserName, setNewUserName] = useState('');
    const [addingUser, setAddingUser] = useState(false);

    const [deleteExpenseId, setDeleteExpenseId] = useState<string | number | null>(null);
    const [deleteUser, setDeleteUser] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const { debts, totalSpent } = useMemo(() => calcDebts(trip.expenses, trip.users), [trip.expenses, trip.users]);

    // Keep payer/involved in sync with users
    if (trip.users.length > 0 && !trip.users.includes(payer)) {
        // setState directly during render is OK for this kind of derivation
        // but we wrap in setTimeout to avoid React 18 strict-mode warnings
        setTimeout(() => setPayer(trip.users[0]), 0);
    }
    if (involved.length === 0 && trip.users.length > 0) {
        setTimeout(() => setInvolved(trip.users), 0);
    }

    const addExpense = async () => {
        if (!title.trim() || !amount || trip.users.length === 0) return;
        setSaving(true);
        const exp: Expense = {
            id: newId(),
            title: title.trim(),
            amount: parseFloat(amount) || 0,
            payer: payer || trip.users[0],
            involved: involved.length > 0 ? involved : trip.users,
        };
        await update('expenses', [...trip.expenses, exp]);
        setTitle('');
        setAmount('');
        setSaving(false);
        showToast('記帳成功');
    };

    const confirmDeleteExpense = async () => {
        if (deleteExpenseId == null) return;
        setSaving(true);
        await update('expenses', trip.expenses.filter((e) => e.id !== deleteExpenseId));
        setSaving(false);
        setDeleteExpenseId(null);
        showToast('已刪除');
    };

    const addUser = async () => {
        const v = newUserName.trim();
        if (!v || trip.users.includes(v)) return;
        setSaving(true);
        await update('users', [...trip.users, v]);
        setNewUserName('');
        setAddingUser(false);
        setSaving(false);
        showToast('成員已新增');
    };

    const confirmDeleteUser = async () => {
        if (!deleteUser) return;
        if (trip.users.length <= 1) { setDeleteUser(null); showToast('至少保留一位成員'); return; }
        setSaving(true);
        await update('users', trip.users.filter((u) => u !== deleteUser));
        setSaving(false);
        setDeleteUser(null);
        showToast('成員已移除');
    };

    const toggleInvolved = (u: string) => {
        setInvolved((cur) => {
            if (cur.includes(u)) {
                return cur.length > 1 ? cur.filter((x) => x !== u) : cur;
            }
            return [...cur, u];
        });
    };

    return (
        <BookLayout chapter={chapter} pageNo={pageNo}>
            <div className="max-w-md mx-auto pr-6 py-2">
                <header className="mb-4">
                    <div
                        className="inline-block text-[10px] font-bold tracking-[0.35em] px-3 py-1 mb-2"
                        style={{ color: 'var(--ink-soft)', border: '1px solid var(--paper-edge)' }}
                    >
                        {CHAPTER_HEADER_EN.expense}
                    </div>
                    <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--ink)' }}>
                        帳本
                    </h1>
                </header>

                {/* Travelers */}
                <section className="mb-5">
                    <h2 className="text-[10px] font-bold tracking-[0.25em] mb-2" style={{ color: 'var(--ink-soft)' }}>TRAVELERS</h2>
                    <div className="flex flex-wrap gap-2 items-center">
                        {trip.users.map((u) => (
                            <span
                                key={u}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                                style={{ background: 'var(--paper-soft)', border: '1px solid var(--paper-edge)', color: 'var(--ink)' }}
                            >
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: 'var(--accent-3)' }}>
                                    {u[0]}
                                </span>
                                {u}
                                <button
                                    onClick={() => setDeleteUser(u)}
                                    aria-label="移除成員"
                                    style={{ color: 'var(--ink-soft)' }}
                                >
                                    <X size={11} />
                                </button>
                            </span>
                        ))}
                        {addingUser ? (
                            <div className="flex items-center gap-1">
                                <input
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addUser()}
                                    autoFocus
                                    placeholder="名字"
                                    className="field py-1 px-2 text-xs w-20"
                                />
                                <button onClick={addUser} disabled={saving} className="btn btn-primary px-2 py-1 text-[10px]">加入</button>
                                <button onClick={() => setAddingUser(false)} className="btn btn-ghost px-2 py-1 text-[10px]" style={{ background: 'var(--paper)' }}>
                                    <X size={10} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddingUser(true)}
                                className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-dashed"
                                style={{ borderColor: 'var(--paper-edge)', color: 'var(--ink-soft)' }}
                                aria-label="新增成員"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                    </div>
                </section>

                {/* Summary */}
                <div className="paper-card p-5 mb-5" style={{ background: 'var(--paper-soft)' }}>
                    <div className="flex justify-between items-end mb-3">
                        <h2 className="text-[10px] font-bold tracking-[0.25em]" style={{ color: 'var(--ink-soft)' }}>
                            TOTAL SPENT
                        </h2>
                        <span className="font-mono text-3xl font-black" style={{ color: 'var(--accent)' }}>
                            ¥{Math.round(totalSpent).toLocaleString()}
                        </span>
                    </div>
                    <div className="border-t border-dashed pt-3" style={{ borderColor: 'var(--paper-edge)' }}>
                        {debts.length === 0 ? (
                            <div className="text-center py-2 text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
                                目前沒有欠款 ✨
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {debts.map((d, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center px-3 py-2 rounded-lg"
                                        style={{ background: 'var(--paper)' }}
                                    >
                                        <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--ink)' }}>
                                            <span>{d.from}</span>
                                            <ArrowRight size={12} style={{ color: 'var(--ink-soft)' }} />
                                            <span>{d.to}</span>
                                        </div>
                                        <span className="font-mono font-bold" style={{ color: 'var(--ink)' }}>
                                            ¥{d.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* New expense form */}
                <section className="paper-card p-4 mb-5 border-l-4" style={{ background: 'var(--paper-soft)', borderLeftColor: 'var(--accent)' }}>
                    <h3 className="text-[10px] font-bold tracking-[0.25em] mb-3" style={{ color: 'var(--ink-soft)' }}>
                        NEW EXPENSE
                    </h3>
                    <div className="space-y-3">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="field"
                            placeholder="項目（例：居酒屋）"
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="field flex-1"
                                placeholder="¥ 金額"
                            />
                            <select
                                value={payer}
                                onChange={(e) => setPayer(e.target.value)}
                                className="field w-32"
                            >
                                {trip.users.map((u) => <option key={u} value={u}>{u} 先付</option>)}
                            </select>
                        </div>
                        <div className="paper-card p-3" style={{ background: 'var(--paper)' }}>
                            <div className="text-[10px] font-bold tracking-[0.2em] mb-2" style={{ color: 'var(--ink-soft)' }}>
                                誰要分攤？
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {trip.users.map((u) => {
                                    const isOn = involved.includes(u);
                                    return (
                                        <button
                                            key={u}
                                            onClick={() => toggleInvolved(u)}
                                            className="px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all"
                                            style={{
                                                borderColor: isOn ? 'var(--accent-3)' : 'var(--paper-edge)',
                                                background: isOn ? 'var(--accent-3)' : 'var(--paper-soft)',
                                                color: isOn ? 'white' : 'var(--ink-soft)',
                                            }}
                                        >
                                            {u}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <button
                            onClick={addExpense}
                            disabled={saving || !title.trim() || !amount}
                            className="btn btn-primary w-full py-3"
                        >
                            {saving ? <span className="spinner" /> : <><PlusCircle size={16} /> 記上一筆</>}
                        </button>
                    </div>
                </section>

                {/* Expense list */}
                {trip.expenses.length === 0 ? (
                    <div className="text-center py-8">
                        <Wallet size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>還沒有任何記帳</p>
                    </div>
                ) : (
                    <div className="space-y-2 pb-2">
                        {trip.expenses.slice().reverse().map((e, idx) => (
                            <motion.div
                                key={e.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25, delay: idx * 0.03 }}
                                className="paper-card flex justify-between items-center p-3"
                                style={{ background: 'var(--paper-soft)' }}
                            >
                                <div className="min-w-0">
                                    <div className="font-bold truncate" style={{ color: 'var(--ink)' }}>{e.title}</div>
                                    <div className="text-[10px] font-bold flex items-center gap-1 mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                                        <User size={10} />
                                        {e.payer} 付款
                                        <ArrowRight size={9} className="opacity-60" />
                                        {e.involved && e.involved.length < trip.users.length ? `${e.involved.length} 人分` : '全員'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
                                        ¥{Math.round(Number(e.amount)).toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => setDeleteExpenseId(e.id)}
                                        aria-label="刪除"
                                        style={{ color: 'var(--ink-soft)' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                open={deleteExpenseId != null}
                title="刪除這筆款項？"
                confirmText="刪除"
                danger
                loading={saving}
                onConfirm={confirmDeleteExpense}
                onCancel={() => setDeleteExpenseId(null)}
            />
            <ConfirmModal
                open={deleteUser != null}
                title={`移除 ${deleteUser}？`}
                message="這不會自動清除他已付的款項紀錄，請確認帳務已結清。"
                confirmText="移除"
                danger
                loading={saving}
                onConfirm={confirmDeleteUser}
                onCancel={() => setDeleteUser(null)}
            />
        </BookLayout>
    );
};
