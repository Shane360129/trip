import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

interface ErrorBoundaryState { error: Error | null }

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };
    static getDerivedStateFromError(error: Error) { return { error }; }
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('App crashed:', error, info);
    }
    handleReload = () => { this.setState({ error: null }); window.location.reload(); };
    render() {
        if (!this.state.error) return this.props.children;
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: 'var(--paper-bg)', color: 'var(--ink)' }}>
                <div className="text-6xl mb-3">🧭</div>
                <h2 className="font-display text-xl font-black mb-2">有點迷路了</h2>
                <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--ink-soft)' }}>
                    畫面出了點小狀況。你的資料已安全儲存在雲端，重新整理就能繼續。
                </p>
                <button onClick={this.handleReload} className="btn btn-primary px-6 py-3">重新整理</button>
            </div>
        );
    }
}

// Register service worker (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(`${import.meta.env.BASE_URL}sw.js`)
            .catch((err) => console.warn('SW registration failed:', err));
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
