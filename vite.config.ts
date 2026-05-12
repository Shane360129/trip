import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves under /<repo>/ — set via env so it works for any fork.
const base = process.env.VITE_BASE_PATH ?? '/trip/';

export default defineConfig({
    base,
    plugins: [react()],
    build: {
        target: 'es2020',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    motion: ['framer-motion'],
                },
            },
        },
    },
});
