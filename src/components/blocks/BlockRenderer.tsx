import { MapPin, Quote as QuoteIcon, Lightbulb, Image as ImageIcon } from 'lucide-react';
import type { Block } from '../../types';
import { ImageUploader } from '../ImageUploader';

interface BlockRendererProps {
    block: Block;
    editing: boolean;
    onChange: (next: Block) => void;
}

const Editable = ({
    value,
    placeholder,
    onChange,
    multiline = false,
    className,
    style,
}: {
    value: string;
    placeholder: string;
    onChange: (v: string) => void;
    multiline?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) => {
    if (multiline) {
        return (
            <textarea
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`bg-transparent w-full resize-none outline-none ${className ?? ''}`}
                style={style}
                rows={Math.max(2, value.split('\n').length)}
            />
        );
    }
    return (
        <input
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`bg-transparent w-full outline-none ${className ?? ''}`}
            style={style}
        />
    );
};

export const BlockRenderer = ({ block, editing, onChange }: BlockRendererProps) => {
    switch (block.type) {
        case 'heading': {
            const sizes = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-lg' };
            const className = `font-display font-black tracking-tight ${sizes[block.level]}`;
            if (editing) {
                return (
                    <div className="flex items-baseline gap-2">
                        <select
                            value={block.level}
                            onChange={(e) => onChange({ ...block, level: parseInt(e.target.value) as 1 | 2 | 3 })}
                            className="field py-0.5 px-1 w-14 text-xs"
                            style={{ background: 'var(--paper)' }}
                        >
                            <option value={1}>H1</option>
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                        </select>
                        <Editable
                            value={block.text}
                            placeholder="標題"
                            onChange={(v) => onChange({ ...block, text: v })}
                            className={className}
                            style={{ color: 'var(--ink)' }}
                        />
                    </div>
                );
            }
            return <h2 className={className} style={{ color: 'var(--ink)' }}>{block.text}</h2>;
        }

        case 'paragraph':
            if (editing) {
                return (
                    <Editable
                        value={block.text}
                        placeholder="寫點什麼..."
                        onChange={(v) => onChange({ ...block, text: v })}
                        multiline
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--ink)' }}
                    />
                );
            }
            return (
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>
                    {block.text}
                </p>
            );

        case 'sticky': {
            const cls = `sticky ${block.color !== 'yellow' ? block.color : ''}`;
            return (
                <div className={cls} style={{ ['--rot' as string]: '-1deg' }}>
                    {editing ? (
                        <div className="space-y-1">
                            <Editable
                                value={block.text}
                                placeholder="便利貼內容"
                                onChange={(v) => onChange({ ...block, text: v })}
                                multiline
                                className="font-hand text-base"
                            />
                            <div className="flex gap-1">
                                {(['yellow', 'pink', 'blue', 'green'] as const).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => onChange({ ...block, color: c })}
                                        className="w-5 h-5 rounded-full border-2"
                                        style={{
                                            background: c === 'yellow' ? '#FFF6BF' : c === 'pink' ? '#FFD6E0' : c === 'blue' ? '#D6EBFF' : '#DFF0CB',
                                            borderColor: block.color === c ? 'var(--ink)' : 'transparent',
                                        }}
                                        aria-label={c}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap">{block.text}</div>
                    )}
                </div>
            );
        }

        case 'photo': {
            const rotation = block.rotate ?? -2;
            if (editing) {
                return (
                    <div className="polaroid" style={{ ['--rot' as string]: `${rotation}deg`, maxWidth: 280 }}>
                        <div className="polaroid-img">
                            {block.url ? (
                                <img
                                    src={block.url}
                                    alt={block.caption ?? ''}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--ink-soft)' }}>
                                    <ImageIcon size={32} className="opacity-50" />
                                </div>
                            )}
                        </div>
                        <div className="mt-2">
                            <ImageUploader
                                value={block.url}
                                onChange={(url) => onChange({ ...block, url })}
                                hidePreview
                                compact
                            />
                        </div>
                        <Editable
                            value={block.caption ?? ''}
                            placeholder="說明文字 ✨"
                            onChange={(v) => onChange({ ...block, caption: v })}
                            className="text-center mt-1 font-hand text-base"
                            style={{ color: 'var(--ink)' }}
                        />
                    </div>
                );
            }
            return (
                <div className="polaroid" style={{ ['--rot' as string]: `${rotation}deg`, maxWidth: 280 }}>
                    <div className="polaroid-img">
                        {block.url ? (
                            <img
                                src={block.url}
                                alt={block.caption ?? ''}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--ink-soft)' }}>
                                <ImageIcon size={32} className="opacity-50" />
                            </div>
                        )}
                    </div>
                    {block.caption && (
                        <div className="text-center mt-2 font-hand text-base" style={{ color: 'var(--ink)' }}>
                            {block.caption}
                        </div>
                    )}
                </div>
            );
        }

        case 'map': {
            const openMap = () => {
                if (block.query.trim()) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(block.query)}`, '_blank');
                }
            };
            return (
                <div
                    onClick={editing ? undefined : openMap}
                    className="paper-card flex items-center gap-3 p-3 cursor-pointer"
                    style={{ background: 'var(--paper-soft)' }}
                >
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(178,58,72,0.12)', color: 'var(--stamp)' }}
                    >
                        <MapPin size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <>
                                <Editable
                                    value={block.label ?? ''}
                                    placeholder="名稱（例：晴空塔）"
                                    onChange={(v) => onChange({ ...block, label: v })}
                                    className="font-bold text-sm"
                                    style={{ color: 'var(--ink)' }}
                                />
                                <Editable
                                    value={block.query}
                                    placeholder="搜尋字串"
                                    onChange={(v) => onChange({ ...block, query: v })}
                                    className="text-[10px]"
                                    style={{ color: 'var(--ink-soft)' }}
                                />
                            </>
                        ) : (
                            <>
                                <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                                    {block.label || block.query || '（未設定地點）'}
                                </div>
                                <div className="text-[10px]" style={{ color: 'var(--ink-soft)' }}>
                                    點擊開 Google Maps →
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        }

        case 'list': {
            const setItem = (idx: number, v: string) => {
                const items = [...block.items];
                items[idx] = v;
                onChange({ ...block, items });
            };
            const addItem = () => onChange({ ...block, items: [...block.items, ''] });
            const removeItem = (idx: number) => {
                if (block.items.length <= 1) return;
                const items = block.items.filter((_, i) => i !== idx);
                onChange({ ...block, items });
            };
            return (
                <ul className="space-y-1">
                    {editing && (
                        <select
                            value={block.style}
                            onChange={(e) => onChange({ ...block, style: e.target.value as 'bullet' | 'check' | 'numbered' })}
                            className="field py-0.5 px-1 w-24 text-[10px] mb-1"
                            style={{ background: 'var(--paper)' }}
                        >
                            <option value="bullet">圓點</option>
                            <option value="check">勾選</option>
                            <option value="numbered">編號</option>
                        </select>
                    )}
                    {block.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
                            <span className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }}>
                                {block.style === 'numbered' ? `${i + 1}.` : block.style === 'check' ? '☐' : '·'}
                            </span>
                            {editing ? (
                                <>
                                    <Editable
                                        value={item}
                                        placeholder="清單項目"
                                        onChange={(v) => setItem(i, v)}
                                        className="flex-1 text-sm"
                                    />
                                    <button
                                        onClick={() => removeItem(i)}
                                        className="text-xs opacity-50"
                                        style={{ color: 'var(--stamp)' }}
                                        aria-label="刪除項目"
                                    >×</button>
                                </>
                            ) : (
                                <span>{item}</span>
                            )}
                        </li>
                    ))}
                    {editing && (
                        <li>
                            <button
                                onClick={addItem}
                                className="text-xs underline"
                                style={{ color: 'var(--accent)' }}
                            >+ 新增項目</button>
                        </li>
                    )}
                </ul>
            );
        }

        case 'tip':
            return (
                <div
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: 'rgba(168,176,134,0.16)', border: '1px solid var(--accent-2)' }}
                >
                    <div className="shrink-0 text-xl">{block.icon || '💡'}</div>
                    <div className="flex-1">
                        {editing ? (
                            <>
                                <input
                                    value={block.icon ?? ''}
                                    onChange={(e) => onChange({ ...block, icon: e.target.value })}
                                    className="bg-transparent w-12 text-sm border-b outline-none mb-1"
                                    style={{ borderColor: 'var(--accent-2)' }}
                                    placeholder="💡"
                                />
                                <Editable
                                    value={block.text}
                                    placeholder="提醒內容..."
                                    onChange={(v) => onChange({ ...block, text: v })}
                                    multiline
                                    className="text-sm leading-relaxed"
                                    style={{ color: 'var(--ink)' }}
                                />
                            </>
                        ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>
                                {block.text}
                            </p>
                        )}
                    </div>
                </div>
            );

        case 'quote':
            return (
                <blockquote
                    className="pl-4 py-2 italic relative"
                    style={{ borderLeft: '4px solid var(--accent)', color: 'var(--ink)' }}
                >
                    <QuoteIcon size={14} className="absolute -left-1 -top-1 bg-[color:var(--paper)]" style={{ color: 'var(--accent)' }} />
                    {editing ? (
                        <>
                            <Editable
                                value={block.text}
                                placeholder="引用內容..."
                                onChange={(v) => onChange({ ...block, text: v })}
                                multiline
                                className="font-display text-base italic"
                            />
                            <Editable
                                value={block.author ?? ''}
                                placeholder="— 作者"
                                onChange={(v) => onChange({ ...block, author: v })}
                                className="text-xs mt-1 not-italic"
                                style={{ color: 'var(--ink-soft)' }}
                            />
                        </>
                    ) : (
                        <>
                            <p className="font-display text-base italic">{block.text}</p>
                            {block.author && <footer className="text-xs mt-1 not-italic" style={{ color: 'var(--ink-soft)' }}>— {block.author}</footer>}
                        </>
                    )}
                </blockquote>
            );

        case 'stamp':
            return (
                <div className="flex items-center justify-center py-2">
                    <div className="stamp text-sm">
                        {editing ? (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="date"
                                    value={block.date}
                                    onChange={(e) => onChange({ ...block, date: e.target.value })}
                                    className="bg-transparent outline-none text-xs"
                                    style={{ color: 'var(--stamp)' }}
                                />
                                <Editable
                                    value={block.location}
                                    placeholder="地點"
                                    onChange={(v) => onChange({ ...block, location: v })}
                                    className="text-sm w-24"
                                />
                            </div>
                        ) : (
                            `${block.date.replace(/-/g, '·')} · ${block.location || 'HERE'}`
                        )}
                    </div>
                </div>
            );

        case 'divider': {
            const renderStyle = () => {
                if (block.style === 'dots') return <div className="text-center tracking-[1em]" style={{ color: 'var(--paper-edge)' }}>· · ·</div>;
                if (block.style === 'washi') return <div className="washi text-[10px]" style={{ ['--rot' as string]: '-1deg' }}>·</div>;
                return <div className="border-t border-dashed" style={{ borderColor: 'var(--paper-edge)' }} />;
            };
            return (
                <div className="py-3 relative">
                    {editing && (
                        <select
                            value={block.style}
                            onChange={(e) => onChange({ ...block, style: e.target.value as 'line' | 'dots' | 'washi' })}
                            className="field py-0.5 px-1 w-20 text-[10px] absolute -top-1 right-0"
                            style={{ background: 'var(--paper)' }}
                        >
                            <option value="line">虛線</option>
                            <option value="dots">點</option>
                            <option value="washi">和紙</option>
                        </select>
                    )}
                    {renderStyle()}
                </div>
            );
        }

        default: {
            // Exhaustiveness check
            const _: never = block;
            return <div>{(_ as { type: string }).type}</div>;
        }
    }
};

// Re-export icons / hint
export { Lightbulb };
