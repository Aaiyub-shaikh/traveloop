import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (m) => push(m, "success"),
      error: (m) => push(m, "error"),
      info: (m) => push(m, "info"),
    }),
    [push]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[400] flex max-w-[min(100vw-2rem,24rem)] flex-col gap-2 sm:bottom-6 sm:right-6">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${
                t.type === "success"
                  ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/90 dark:text-emerald-100"
                  : t.type === "error"
                    ? "border-red-200/80 bg-red-50/95 text-red-950 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-100"
                    : "border-slate-200/80 bg-white/95 text-slate-900 dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-100"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : t.type === "error" ? (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              ) : (
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
              )}
              <p className="text-sm leading-snug">{t.message}</p>
              <button
                type="button"
                className="ml-auto shrink-0 rounded-lg px-2 py-1 text-xs font-medium opacity-70 hover:opacity-100"
                onClick={() => dismiss(t.id)}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
