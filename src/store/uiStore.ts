import { create } from 'zustand';

interface UIStore {
    currentChapter: string | null;
    direction: 1 | -1;
    editMode: boolean;
    themeEditorOpen: boolean;
    settingsOpen: boolean;
    shareOpen: boolean;
    readOnly: boolean;
    toast: { msg: string; visible: boolean };

    goToChapter: (chapterId: string, direction?: 1 | -1) => void;
    setEditMode: (on: boolean) => void;
    toggleEditMode: () => void;
    openThemeEditor: () => void;
    closeThemeEditor: () => void;
    openSettings: () => void;
    closeSettings: () => void;
    openShare: () => void;
    closeShare: () => void;
    setReadOnly: (on: boolean) => void;
    showToast: (msg: string) => void;
}

let toastTimer: number | undefined;

export const useUIStore = create<UIStore>((set) => ({
    currentChapter: null,
    direction: 1,
    editMode: false,
    themeEditorOpen: false,
    settingsOpen: false,
    shareOpen: false,
    readOnly: false,
    toast: { msg: '', visible: false },

    goToChapter: (chapterId, direction = 1) => set({ currentChapter: chapterId, direction }),
    setEditMode: (on) => set({ editMode: on }),
    toggleEditMode: () => set((s) => (s.readOnly ? s : { editMode: !s.editMode })),
    openThemeEditor: () => set({ themeEditorOpen: true }),
    closeThemeEditor: () => set({ themeEditorOpen: false }),
    openSettings: () => set({ settingsOpen: true }),
    closeSettings: () => set({ settingsOpen: false }),
    openShare: () => set({ shareOpen: true }),
    closeShare: () => set({ shareOpen: false }),
    setReadOnly: (on) => set((s) => ({ readOnly: on, editMode: on ? false : s.editMode })),
    showToast: (msg) => {
        if (toastTimer) window.clearTimeout(toastTimer);
        set({ toast: { msg, visible: true } });
        toastTimer = window.setTimeout(() => set({ toast: { msg: '', visible: false } }), 2000);
    },
}));
