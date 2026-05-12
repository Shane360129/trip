import type { ChapterType } from '../types';

export const CHAPTER_SPINE_COLORS: Record<ChapterType, string> = {
    cover:     'var(--accent)',
    toc:       'var(--ink-soft)',
    before:    '#B8826E',
    itinerary: 'var(--accent-2)',
    guide:     '#9DB7C9',
    food:      '#D08770',
    shopping:  '#B188A8',
    album:     '#A8B086',
    expense:   '#D4B16A',
    notes:     '#7B8FA1',
    memory:    'var(--stamp)',
};

export const CHAPTER_EMOJI: Record<ChapterType, string> = {
    cover:     '✈️',
    toc:       '📑',
    before:    '🎒',
    itinerary: '🗓️',
    guide:     '🗺️',
    food:      '🍜',
    shopping:  '🛍️',
    album:     '📸',
    expense:   '💰',
    notes:     '✍️',
    memory:    '💌',
};

export const CHAPTER_HEADER_EN: Record<ChapterType, string> = {
    cover:     'COVER',
    toc:       'CONTENTS',
    before:    'BEFORE YOU GO',
    itinerary: 'ITINERARY',
    guide:     'GUIDES',
    food:      'FOOD LOG',
    shopping:  'SHOPPING',
    album:     'ALBUM',
    expense:   'EXPENSES',
    notes:     'NOTES',
    memory:    'MEMORIES',
};
