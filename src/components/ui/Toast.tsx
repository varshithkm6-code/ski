"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastMessage["type"]; title: string; description?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({ type = "info", title, description }: { type?: ToastMessage["type"]; title: string; description?: string }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const icon =
            t.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-status-strong" />
            ) : t.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-status-critical" />
            ) : (
              <Info className="w-5 h-5 text-primary" />
            );

          return (
            <div
              key={t.id}
              className="pointer-events-auto p-4 rounded-card bg-surface border border-border shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom duration-200"
            >
              <div className="shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-muted hover:text-ink p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (opts: { title: string }) => console.log(opts.title),
    };
  }
  return context;
}
