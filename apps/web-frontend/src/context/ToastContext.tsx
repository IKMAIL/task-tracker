import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastCtx {
  addToast: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastCtx>({ addToast: () => {} });

interface ToastListProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastList({ toasts, onDismiss }: ToastListProps) {
  if (toasts.length === 0) return null;
  const icons: Record<ToastVariant, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.variant}`} role="alert">
          <span>{icons[t.variant]}</span>
          <span>{t.message}</span>
          <button className="toast-dismiss" onClick={() => onDismiss(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message, variant }]);
    const duration = variant === 'error' ? 6000 : 4000;
    timers.current[id] = setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
