import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { Block } from '../../types';
import { BlockRenderer } from './BlockRenderer';
import { BlockInserter } from './BlockInserter';

interface BlockEditorProps {
    blocks: Block[];
    editing: boolean;
    onChange: (blocks: Block[]) => void;
    emptyHint?: string;
}

const SortableBlock = ({
    block,
    editing,
    onChange,
    onDelete,
}: {
    block: Block;
    editing: boolean;
    onChange: (b: Block) => void;
    onDelete: () => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {editing && (
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-0.5"
                        style={{ color: 'var(--ink-soft)' }}
                        aria-label="拖曳重排"
                    >
                        <GripVertical size={14} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-0.5"
                        style={{ color: 'var(--stamp)' }}
                        aria-label="刪除區塊"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
            <BlockRenderer block={block} editing={editing} onChange={onChange} />
        </div>
    );
};

export const BlockEditor = ({ blocks, editing, onChange, emptyHint = '還是空白頁面' }: BlockEditorProps) => {
    const [insertIndex, setInsertIndex] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        onChange(arrayMove(blocks, oldIndex, newIndex));
    };

    const setBlock = (id: string, next: Block) => {
        onChange(blocks.map((b) => (b.id === id ? next : b)));
    };

    const insertAt = (index: number, newBlock: Block) => {
        const list = [...blocks];
        list.splice(index, 0, newBlock);
        onChange(list);
        setInsertIndex(null);
    };

    const remove = (id: string) => {
        onChange(blocks.filter((b) => b.id !== id));
    };

    if (blocks.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-sm font-bold mb-3" style={{ color: 'var(--ink-soft)' }}>
                    {emptyHint}
                </p>
                {editing && (
                    <BlockInserter onInsert={(b) => insertAt(0, b)} label="開始第一段" />
                )}
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id as string)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 pl-2">
                    {blocks.map((b, i) => (
                        <div key={b.id}>
                            {editing && (
                                <div
                                    className="-mx-2 transition-opacity"
                                    style={{ opacity: insertIndex === i ? 1 : 0.3 }}
                                    onMouseEnter={() => setInsertIndex(i)}
                                    onMouseLeave={() => setInsertIndex((cur) => (cur === i ? null : cur))}
                                >
                                    <BlockInserter onInsert={(nb) => insertAt(i, nb)} />
                                </div>
                            )}
                            <SortableBlock
                                block={b}
                                editing={editing}
                                onChange={(next) => setBlock(b.id as string, next)}
                                onDelete={() => remove(b.id as string)}
                            />
                        </div>
                    ))}
                    {editing && (
                        <div className="-mx-2">
                            <BlockInserter onInsert={(nb) => insertAt(blocks.length, nb)} label="在這裡加一段" />
                        </div>
                    )}
                </div>
            </SortableContext>
        </DndContext>
    );
};
