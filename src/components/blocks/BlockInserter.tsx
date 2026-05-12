import { useState } from 'react';
import {
    Plus,
    Heading,
    Type,
    StickyNote,
    Image,
    MapPin,
    List,
    Lightbulb,
    Quote,
    Stamp,
    Minus,
} from 'lucide-react';
import type { Block } from '../../types';
import { BLOCK_LABEL, BLOCK_HINT, makeBlock, type BlockType } from './helpers';

const ICONS: Record<BlockType, typeof Plus> = {
    heading: Heading,
    paragraph: Type,
    sticky: StickyNote,
    photo: Image,
    map: MapPin,
    list: List,
    tip: Lightbulb,
    quote: Quote,
    stamp: Stamp,
    divider: Minus,
};

const ORDER: BlockType[] = ['heading', 'paragraph', 'sticky', 'photo', 'map', 'list', 'tip', 'quote', 'stamp', 'divider'];

interface BlockInserterProps {
    onInsert: (block: Block) => void;
    label?: string;
}

export const BlockInserter = ({ onInsert, label = '加一段' }: BlockInserterProps) => {
    const [open, setOpen] = useState(false);

    const handlePick = (type: BlockType) => {
        onInsert(makeBlock(type));
        setOpen(false);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2 py-1">
                <div className="flex-1 border-t border-dashed" style={{ borderColor: 'var(--paper-edge)' }} />
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all"
                    style={{
                        background: open ? 'var(--accent)' : 'var(--paper-soft)',
                        color: open ? 'white' : 'var(--ink-soft)',
                        border: '1px solid var(--paper-edge)',
                    }}
                >
                    <Plus size={12} />
                    {label}
                </button>
                <div className="flex-1 border-t border-dashed" style={{ borderColor: 'var(--paper-edge)' }} />
            </div>

            {open && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 mt-1 z-30 paper-card p-2 grid grid-cols-2 gap-1"
                    style={{ width: 260, background: 'var(--paper-soft)' }}
                >
                    {ORDER.map((type) => {
                        const Icon = ICONS[type];
                        return (
                            <button
                                key={type}
                                onClick={() => handlePick(type)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-[color:var(--paper)] transition-colors"
                                style={{ color: 'var(--ink)' }}
                            >
                                <Icon size={14} style={{ color: 'var(--accent)' }} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold">{BLOCK_LABEL[type]}</div>
                                    <div className="text-[9px] opacity-70 truncate" style={{ color: 'var(--ink-soft)' }}>
                                        {BLOCK_HINT[type]}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
