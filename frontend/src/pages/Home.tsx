import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  BookOpen,
  BookText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Library,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BookRow } from "../components/BookRow";
import { Button } from "../components/Button";
import {
  EmptyBooksIllustration,
  LoadingState,
  RequestErrorState,
} from "../components/PageState";
import { Header } from "../components/Header";
import { useBooks } from "../hooks/useBooks";
import { useDebounce } from "../hooks/useDebounce";
import type { BookStatus } from "../types";
import { Stars } from "../components/Stars";

type Filter = "all" | BookStatus;
type SortOrder = "updated" | "title" | "author";
const PAGE_SIZE = 10;

export function Home() {
  const [search, setSearch] = useState("");
  const query = useDebounce(search.trim(), 350);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("updated");
  const [page, setPage] = useState(1);
  const { books, meta, summary, loading, loadError, refresh, updateBook } =
    useBooks({
      page,
      limit: PAGE_SIZE,
      status: filter === "all" ? undefined : filter,
      q: query || undefined,
    });

  useEffect(() => setPage(1), [query, filter]);

  const sortedBooks = useMemo(() => {
    const result = [...books];
    if (sortOrder === "title")
      result.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    if (sortOrder === "author")
      result.sort((a, b) => a.autor.localeCompare(b.autor, "pt-BR"));
    return result;
  }, [books, sortOrder]);

  const filters: Array<{ value: Filter; label: string; count?: number }> = [
    { value: "all", label: "Todos", count: summary?.total },
    { value: "quero_ler", label: "Quero ler", count: summary?.quero_ler },
    { value: "lendo", label: "Lendo", count: summary?.lendo },
    { value: "lido", label: "Lidos", count: summary?.lido },
  ];

  return (
    <div className="app-page bg-page">
      <Header search={search} onSearchChange={setSearch} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles size={14} />
            Seu cantinho de leitura
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-h1">
            Sua estante,{" "}
            <span className="italic text-primary">sua história.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted sm:text-base">
            Um lugar tranquilo para organizar as leituras que já fizeram parte
            de você - e as que ainda vêm por aí.
          </p>
        </div>

        <section
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          aria-label="Resumo da estante"
        >
          <SummaryCard
            label="Na estante"
            value={summary?.total ?? "—"}
            icon={<Library size={18} />}
          />
          <SummaryCard
            label="Quero ler"
            value={summary?.quero_ler ?? "—"}
            icon={<BookOpen size={18} />}
            color="text-quero"
          />
          <SummaryCard
            label="Lendo agora"
            value={summary?.lendo ?? "—"}
            icon={<BookText size={18} />}
            color="text-lendo"
          />
          <SummaryCard
            label="Já lidos"
            value={summary?.lido ?? "—"}
            icon={<BookMarked size={18} />}
            color="text-lido"
          />
          <div className="col-span-2 flex min-h-23 items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 shadow-(--shadow-soft) sm:col-span-1">
            <div>
              <p className="text-xs text-ink-muted">Sua nota média</p>
              <p className="mt-1 font-display text-2xl font-medium text-ink">
                {summary?.media_notas != null
                  ? summary.media_notas.toFixed(1)
                  : "—"}
                <span className="ml-1 text-sm font-normal text-ink-muted">
                  / 5
                </span>
              </p>
            </div>
            <Stars
              value={
                summary?.media_notas ? Math.round(summary.media_notas) : null
              }
              size={15}
            />
          </div>
        </section>

        <section className="mt-10" aria-label="Seus livros">
          <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex items-center gap-1 overflow-x-auto"
              role="tablist"
              aria-label="Filtrar por status"
            >
              {filters.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  role="tab"
                  aria-selected={filter === item.value}
                  onClick={() => setFilter(item.value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-150 ${
                    filter === item.value
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-ink-muted hover:bg-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                  {item.count != null ? (
                    <span
                      className={`text-xs ${filter === item.value ? "text-primary/75" : "text-ink-muted/75"}`}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <label className="relative flex items-center gap-2 text-xs text-ink-muted">
              <span className="shrink-0">Ordenar por</span>
              <span className="relative">
                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value as SortOrder)
                  }
                  className="h-9 min-w-36 appearance-none rounded-md border border-border bg-surface pl-3 pr-8 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Ordenar livros"
                >
                  <option value="updated">Mais recentes</option>
                  <option value="title">Título</option>
                  <option value="author">Autor</option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                />
              </span>
            </label>
          </div>

          {loading && books.length === 0 ? (
            <LoadingState />
          ) : !loading && loadError ? (
            <div className="mt-7">
              <RequestErrorState
                title="Não conseguimos carregar sua estante"
                message="Verifique sua conexão e tente novamente."
                onRetry={refresh}
              />
            </div>
          ) : sortedBooks.length > 0 ? (
            <>
              <div className="mt-4 space-y-3">
                {sortedBooks.map((book) => (
                  <BookRow
                    key={book.id}
                    book={book}
                    onStatusChange={updateBook}
                  />
                ))}
              </div>
              {meta && meta.total_pages > 1 ? (
                <nav
                  className="mt-7 flex items-center justify-between border-t border-border pt-5"
                  aria-label="Paginação"
                >
                  <p className="text-xs text-ink-muted">
                    Página {meta.page} de {meta.total_pages}
                    <span className="hidden sm:inline">
                      {" "}
                      · {meta.total} livros
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1 || loading}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      className="min-h-9 px-3"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= meta.total_pages || loading}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(meta.total_pages, current + 1),
                        )
                      }
                      className="min-h-9 px-3"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </nav>
              ) : null}
            </>
          ) : !loading && !summary?.total ? (
            <div className="mt-7 rounded-lg border border-dashed border-border-strong bg-surface/65 px-5 py-10 text-center sm:py-14">
              <EmptyBooksIllustration />
              <h2 className="mt-3 font-display text-xl font-medium text-ink">
                Sua estante começa com uma história
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
                Guarde aqui os livros que você quer ler, está lendo ou já
                terminou.
              </p>
              <Link to="/livros/novo" className="mt-5 inline-flex">
                <Button>
                  <Plus size={16} />
                  Adicionar livro
                </Button>
              </Link>
            </div>
          ) : !loading ? (
            <div className="mt-7 rounded-lg border border-dashed border-border bg-surface/65 px-5 py-12 text-center">
              <Search size={24} className="mx-auto text-ink-muted/70" />
              <h2 className="mt-3 font-display text-lg font-medium text-ink">
                {query ? "Nenhum livro encontrado" : "Nada por aqui ainda"}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {query
                  ? `Não encontramos resultados para “${query}”. Tente outro título ou autor.`
                  : "Nenhum livro corresponde a este filtro."}
              </p>
            </div>
          ) : null}
        </section>
      </main>
      <Link
        to="/livros/novo"
        className="fixed bottom-5 right-5 z-20 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-150 hover:bg-primary-hover active:scale-95 sm:hidden"
        aria-label="Adicionar livro"
      >
        <Plus size={23} />
      </Link>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color = "text-primary",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex min-h-23 items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 shadow-(--shadow-soft)">
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-medium text-ink">
          {value}
        </p>
      </div>
      <span className={`${color} opacity-80`}>{icon}</span>
    </div>
  );
}
