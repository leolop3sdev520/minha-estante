import { useState } from "react";
import { BookOpen, CalendarDays, Clock3, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { LoadingState, RequestErrorState } from "../components/PageState";
import { Modal } from "../components/Modal";
import { Stars } from "../components/Stars";
import { StatusChip } from "../components/StatusChip";
import { useBook } from "../hooks/useBooks";
import { bookApi } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import {
  getStatusAction,
  getErrorMessage,
  formatDate,
} from "../utils/formatters";

const spineColor = {
  quero_ler: "from-[#c89155] to-[#a9713e]",
  lendo: "from-[#7185ad] to-[#506b98]",
  lido: "from-[#779477] to-[#52775c]",
};

export function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, loading, loadError, notFound, refresh } = useBook(id);
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="app-page bg-page">
        <Header backTo="/" />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <LoadingState label="Abrindo detalhes do livro…" />
        </main>
      </div>
    );
  }

  if (!book && loadError) {
    return (
      <div className="app-page bg-page">
        <Header backTo="/" />
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <RequestErrorState
            title={
              notFound
                ? "Não encontramos este livro"
                : "Não conseguimos abrir este livro"
            }
            message={
              notFound
                ? "Ele pode ter sido removido da sua estante."
                : loadError
            }
            onRetry={notFound ? undefined : refresh}
          />
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">
              Voltar à estante
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="app-page bg-page">
        <Header backTo="/" />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl text-ink">
            Este livro não está disponível
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Volte à estante para escolher outro livro.
          </p>
          <Link to="/" className="mt-5 inline-flex">
            <Button variant="outline">Voltar à estante</Button>
          </Link>
        </main>
      </div>
    );
  }

  const action = getStatusAction(book.status);
  const actionVariant =
    action.style === "primary"
      ? "primary"
      : action.style === "outline"
        ? "outline"
        : "ghost";
  const startDate = formatDate(book.data_inicio);
  const endDate = formatDate(book.data_conclusao);

  async function changeStatus() {
    if (!book) return;
    setBusy(true);
    try {
      await bookApi.update(book.id, { status: action.next });
      showToast(
        action.next === "lido"
          ? "Leitura concluída. Parabéns!"
          : "Status da leitura atualizado.",
      );
      refresh();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteBook() {
    if (!book) return;
    setBusy(true);
    try {
      await bookApi.remove(book.id);
      showToast("Livro removido da sua estante.");
      navigate("/");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="app-page bg-page">
      <Header backTo="/" />
      <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6 sm:pt-9 lg:px-8">
        <nav
          className="mb-7 text-xs text-ink-muted"
          aria-label="Caminho de navegação"
        >
          <Link to="/" className="transition-colors hover:text-primary">
            Minha Estante
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{book.titulo}</span>
        </nav>

        <section className="grid gap-8 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-10">
          <div
            className={`relative mx-auto flex h-64 w-48 items-center justify-center overflow-hidden rounded-md bg-linear-to-br ${spineColor[book.status]} shadow-md sm:mx-0 sm:h-72 sm:w-52`}
          >
            <span className="absolute inset-y-0 left-4 w-px bg-white/25" />
            <span className="absolute inset-y-0 left-6 w-px bg-black/10" />
            <span className="absolute inset-y-0 right-5 w-2 bg-black/10" />
            <span className="absolute inset-x-7 top-6 h-px bg-white/35" />
            <span className="absolute inset-x-7 bottom-6 h-px bg-white/35" />
            <span className="max-h-[78%] overflow-hidden px-2 text-center font-display text-xl font-medium leading-tight text-white [writing-mode:vertical-rl]">
              {book.titulo}
            </span>
            <BookOpen size={17} className="absolute bottom-9 text-white/70" />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-3">
              <StatusChip status={book.status} />
              {book.status === "lido" && book.nota ? (
                <span className="inline-flex items-center gap-2">
                  <Stars value={book.nota} size={16} />
                  <span className="text-xs text-ink-muted">{book.nota}/5</span>
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 wrap-break-word font-display text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              {book.titulo}
            </h1>
            <p className="mt-2 font-display text-lg text-ink-muted">
              {book.autor}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-4 text-sm text-ink-muted">
              {book.numero_paginas ? (
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={15} /> {book.numero_paginas} páginas
                </span>
              ) : null}
              {book.ano_publicacao ? (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={15} /> Publicado em {book.ano_publicacao}
                </span>
              ) : null}
            </div>

            <section className="mt-6" aria-labelledby="timeline-heading">
              <h2
                id="timeline-heading"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
              >
                Sua jornada de leitura
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <TimelineDate label="Começou a ler" value={startDate} />
                <TimelineDate label="Terminou de ler" value={endDate} />
              </div>
            </section>
          </div>
        </section>

        <section
          className="mt-9 border-t border-border pt-7"
          aria-labelledby="review-heading"
        >
          <h2
            id="review-heading"
            className="font-display text-xl font-medium text-ink"
          >
            Sua resenha
          </h2>
          {book.resenha ? (
            <blockquote className="mt-3 whitespace-pre-wrap font-display text-base italic leading-8 text-ink-muted sm:text-lg">
              “{book.resenha}”
            </blockquote>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">
              Ainda não há uma resenha para este livro.
            </p>
          )}
        </section>

        <footer className="mt-9 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="justify-start px-2 text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={16} />
            Excluir livro
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Link to={`/livros/${book.id}/editar`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Pencil size={15} />
                Editar
              </Button>
            </Link>
            <Button
              type="button"
              variant={actionVariant}
              disabled={busy}
              onClick={changeStatus}
            >
              {action.label}
            </Button>
          </div>
        </footer>
      </main>

      {confirmDelete ? (
        <Modal
          title={`Excluir '${book.titulo}'?`}
          tone="danger"
          confirmLabel="Excluir livro"
          busy={busy}
          onClose={() => setConfirmDelete(false)}
          onConfirm={deleteBook}
        >
          Esta ação não pode ser desfeita. O livro será removido permanentemente
          da sua estante.
        </Modal>
      ) : null}
    </div>
  );
}

function TimelineDate({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-md border border-border bg-surface px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Clock3 size={13} />
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-ink">
        {value ?? "Ainda não registrado"}
      </p>
    </div>
  );
}
