import { newId } from '../../utils/id';
import type { Block } from '../../types';

export type BlockType = Block['type'];

export const BLOCK_LABEL: Record<BlockType, string> = {
    heading: '標題',
    paragraph: '段落',
    sticky: '便利貼',
    photo: '照片',
    map: '地圖',
    list: '清單',
    tip: 'Tip 提示',
    quote: '引用',
    stamp: '郵戳',
    divider: '分隔線',
};

export const BLOCK_HINT: Record<BlockType, string> = {
    heading: '章節大標題',
    paragraph: '寫一段心情或筆記',
    sticky: '黃色便利貼',
    photo: '拍立得風格照片',
    map: '嵌入 Google Maps 連結',
    list: '清單／待辦／checklist',
    tip: '提示框',
    quote: '名言佳句',
    stamp: '日期 + 地點章',
    divider: '分隔線',
};

export const makeBlock = (type: BlockType): Block => {
    switch (type) {
        case 'heading':   return { id: newId(), type: 'heading', level: 2, text: '新標題' };
        case 'paragraph': return { id: newId(), type: 'paragraph', text: '' };
        case 'sticky':    return { id: newId(), type: 'sticky', text: '寫點什麼吧 ✨', color: 'yellow' };
        case 'photo':     return { id: newId(), type: 'photo', url: '', caption: '', style: 'polaroid', rotate: -2 };
        case 'map':       return { id: newId(), type: 'map', query: '', label: '' };
        case 'list':      return { id: newId(), type: 'list', items: ['第一項'], style: 'bullet' };
        case 'tip':       return { id: newId(), type: 'tip', text: '小提醒...', icon: '💡' };
        case 'quote':     return { id: newId(), type: 'quote', text: '', author: '' };
        case 'stamp':     return { id: newId(), type: 'stamp', date: new Date().toISOString().slice(0, 10), location: '' };
        case 'divider':   return { id: newId(), type: 'divider', style: 'line' };
    }
};
