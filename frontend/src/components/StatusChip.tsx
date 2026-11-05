import type { BookStatus } from "../types";
import { statusLabels } from "../utils/formatters";

const styles: Record<BookStatus, string> = {
  quero_ler: "bg-quero/10 text-quero",
  lendo: "bg-lendo/10 text-lendo",
  lido: "bg-lido/10 text-lido",
};

export function StatusChip({ status }: { status: BookStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}
