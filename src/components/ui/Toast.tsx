'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    exiting?: boolean;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, title: string, message?: string) => void;
    removeToast: (id: string) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).substring(2, 8);
        setToasts((prev) => [...prev, { id, type, title, message }]);
        // Auto-remove after 4s
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ─── Toast Container ────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} className="text-emerald-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    warning: <AlertTriangle size={20} className="text-amber-400" />,
    info: <Info size={20} className="text-cyan-400" />,
};

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
                >
                    {ICONS[toast.type]}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-200">{toast.title}</div>
                        {toast.message && (
                            <div className="text-xs text-slate-400 mt-0.5">{toast.message}</div>
                        )}
                    </div>
                    <button onClick={() => onRemove(toast.id)} className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
