import { AlertCircle, BookOpen, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export function LoadingState({ label = "Carregando sua estante…" }: { label?: string }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-sm text-ink-muted" role="status">
      <LoaderCircle size={23} className="animate-spin text-primary" />
      {label}
    </div>
  );
}

export function RequestErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-64 max-w-lg flex-col items-center justify-center rounded-lg border border-border bg-surface px-5 py-10 text-center">
      <AlertCircle size={25} className="text-danger" />
      <h1 className="mt-3 font-display text-xl font-medium text-ink">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          <RefreshCw size={15} />
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyBooksIllustration() {
  return (
    <div className="relative mx-auto flex h-36 w-52 items-end justify-center" aria-hidden="true">
      <span className="absolute bottom-2 h-2 w-44 rounded-full bg-border/80" />
      <span className="relative z-10 mb-3 h-24 w-12 -rotate-6 rounded-sm border border-[#c7a77b] bg-[#e7d2b0] shadow-sm">
        <span className="absolute inset-y-2 left-2 w-px bg-[#c4a477]" />
      </span>
      <span className="relative z-20 mb-3 h-28 w-14 rotate-2 rounded-sm border border-[#6e8068] bg-[#80967a] shadow-sm">
        <span className="absolute inset-y-2 right-2 w-px bg-white/30" />
      </span>
      <span className="relative z-10 mb-3 h-20 w-11 -rotate-3 rounded-sm border border-[#9a6d61] bg-[#b48172] shadow-sm">
        <span className="absolute inset-y-2 right-2 w-px bg-white/30" />
      </span>
      <BookOpen size={20} className="absolute right-2 top-1 text-primary/50" />
    </div>
  );
}
