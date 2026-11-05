import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  busy?: boolean;
  tone?: "default" | "danger";
}

export function Modal({
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Confirmar",
  busy = false,
  tone = "default",
}: ModalProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#11130f]/65 px-4 py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="modal-title"
            className={`font-display text-xl font-medium ${tone === "danger" ? "text-danger" : "text-ink"}`}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md p-1 text-ink-muted transition-colors hover:bg-muted hover:text-ink"
            aria-label="Fechar janela"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 text-sm leading-6 text-ink-muted">{children}</div>
        {onConfirm ? (
          <div className="mt-7 flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant={tone === "danger" ? "danger" : "primary"}
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? "Aguarde…" : confirmLabel}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
