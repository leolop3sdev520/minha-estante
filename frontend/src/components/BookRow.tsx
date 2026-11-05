import { ArrowUpRight, Check, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import type { Book } from "../types";
import { getStatusAction } from "../utils/formatters";
import { Button } from "./Button";
import { Stars } from "./Stars";
import { StatusChip } from "./StatusChip";

interface BookRowProps {
  book: Book;
  onStatusChange: (id: string, status: Book["status"]) => void;
}

const spineColor = {
  quero_ler: "bg-spine-quero",
  lendo: "bg-spine-lendo",
  lido: "bg-spine-lido",
};

export function BookRow({ book, onStatusChange }: BookRowProps) {
  const action = getStatusAction(book.status);
  const actionVariant = action.style === "primary" ? "primary" : action.style === "outline" ? "outline" : "ghost";

  return (
    <article className="group relative grid grid-cols-[7px_minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-surface shadow-(--shadow-soft) transition-all duration-150 hover:border-border-strong sm:grid-cols-[8px_minmax(0,1fr)]">
      <span className={spineColor[book.status]} aria-hidden="true" />
      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5 sm:py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link
              to={`/livros/${book.id}`}
              className="truncate font-display text-lg font-medium leading-snug text-ink decoration-primary/50 underline-offset-4 hover:underline"
            >
              {book.titulo}
              <ArrowUpRight size={14} className="ml-1 inline -translate-y-0.5 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <StatusChip status={book.status} />
          </div>
          <p className="mt-1 truncate text-sm text-ink-muted">{book.autor}</p>
          <div className="mt-2 flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            {book.ano_publicacao ? <span>{book.ano_publicacao}</span> : null}
            {book.numero_paginas ? <span>{book.numero_paginas} páginas</span> : null}
            {book.status === "lido" && book.nota ? (
              <span className="inline-flex items-center gap-1.5">
                <Stars value={book.nota} size={13} />
                <span>{book.nota}/5</span>
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Link
            to={`/livros/${book.id}/editar`}
            className="inline-flex size-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-muted hover:text-ink sm:order-2"
            aria-label={`Editar ${book.titulo}`}
            title="Editar livro"
          >
            <Pencil size={16} />
          </Link>
          <Button
            type="button"
            variant={actionVariant}
            className="min-h-9 px-3 text-xs sm:order-1"
            onClick={() => onStatusChange(book.id, action.next)}
          >
            {book.status === "lendo" ? <Check size={14} /> : null}
            {action.label}
          </Button>
        </div>
      </div>
    </article>
  );
}
