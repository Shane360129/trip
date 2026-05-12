import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                display: ['var(--font-display)', 'serif'],
                body: ['var(--font-body)', 'sans-serif'],
                hand: ['var(--font-hand)', 'cursive'],
                mono: ['ui-monospace', 'monospace'],
            },
            colors: {
                ink: 'var(--ink)',
                'ink-soft': 'var(--ink-soft)',
                paper: 'var(--paper)',
                'paper-soft': 'var(--paper-soft)',
                accent: 'var(--accent)',
                'accent-2': 'var(--accent-2)',
                'accent-3': 'var(--accent-3)',
                stamp: 'var(--stamp)',
            },
            boxShadow: {
                paper: '0 1px 0 rgba(0,0,0,0.03), 0 6px 18px rgba(0,0,0,0.06)',
                stamp: '0 0 0 2px var(--stamp), 0 4px 14px rgba(0,0,0,0.12)',
            },
            keyframes: {
                'page-in': {
                    '0%': { opacity: '0', transform: 'translateX(24px) rotateY(-3deg)' },
                    '100%': { opacity: '1', transform: 'translateX(0) rotateY(0)' },
                },
                'stamp-in': {
                    '0%': { opacity: '0', transform: 'scale(1.4) rotate(-12deg)' },
                    '60%': { opacity: '1', transform: 'scale(0.92) rotate(-6deg)' },
                    '100%': { opacity: '1', transform: 'scale(1) rotate(-8deg)' },
                },
            },
            animation: {
                'page-in': 'page-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                'stamp-in': 'stamp-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            },
        },
    },
    plugins: [],
};

export default config;
