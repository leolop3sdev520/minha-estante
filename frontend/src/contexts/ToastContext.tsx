import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastTone = "success" | "error" | "info";
interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}
interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextToastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = ++nextToastId;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);
  const icons = { success: CheckCircle2, error: XCircle, info: Info };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = icons[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className="flex items-start gap-3 rounded-md border border-border bg-surface-raised px-4 py-3 text-sm text-ink shadow-lg"
            >
              <Icon
                size={18}
                className={
                  toast.tone === "success"
                    ? "mt-0.5 shrink-0 text-lido"
                    : toast.tone === "error"
                      ? "mt-0.5 shrink-0 text-danger"
                      : "mt-0.5 shrink-0 text-lendo"
                }
              />
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded p-0.5 text-ink-muted transition-colors hover:text-ink"
                aria-label="Fechar aviso"
              >
                <X size={15} />
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
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return context;
}
