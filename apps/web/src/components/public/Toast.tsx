'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_CONFIG: Record<ToastType, { icon: string; bg: string; iconColor: string; border: string }> = {
  success: { icon: 'check_circle', bg: 'bg-score-high/10', iconColor: 'text-score-high', border: 'border-score-high/30' },
  error: { icon: 'error', bg: 'bg-error/10', iconColor: 'text-error', border: 'border-error/30' },
  info: { icon: 'info', bg: 'bg-primary/10', iconColor: 'text-primary', border: 'border-primary/30' },
  warning: { icon: 'warning', bg: 'bg-score-medium/10', iconColor: 'text-score-medium', border: 'border-score-medium/30' },
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', durationMs = 3500) => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), durationMs);
  }, [dismiss]);

  const value: ToastContextValue = {
    toast,
    success: (m, d) => toast(m, 'success', d),
    error: (m, d) => toast(m, 'error', d),
    info: (m, d) => toast(m, 'info', d),
    warning: (m, d) => toast(m, 'warning', d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none max-w-sm">
        {items.map((item) => {
          const cfg = TYPE_CONFIG[item.type];
          return (
            <div
              key={item.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-lg shadow-lg border ${cfg.bg} ${cfg.border} backdrop-blur-sm animate-fade-in`}
              onClick={() => dismiss(item.id)}
            >
              <span className={`material-icon ${cfg.iconColor} text-[18px] mt-0.5 shrink-0`} aria-hidden="true">
                {cfg.icon}
              </span>
              <p className="text-sm text-on-surface leading-snug flex-1">{item.message}</p>
              <button
                type="button"
                className="text-outline hover:text-on-surface shrink-0"
                aria-label="Kapat"
                onClick={(e) => { e.stopPropagation(); dismiss(item.id); }}
              >
                <span className="material-icon text-[16px]" aria-hidden="true">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback: no provider — silent no-op (dev/preview safety)
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    };
  }
  return ctx;
}
