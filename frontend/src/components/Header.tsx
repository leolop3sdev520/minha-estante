import { ArrowLeft, BookOpen, Moon, Plus, Search, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./Button";

interface HeaderProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  backTo?: string;
  backLabel?: string;
}

export function Header({
  search,
  onSearchChange,
  backTo,
  backLabel = "Voltar à estante",
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-page/95 backdrop-blur-md">
      <div className="mx-auto flex h-17 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {backTo ? (
            <Link
              to={backTo}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-muted hover:text-ink"
              aria-label={backLabel}
              title={backLabel}
            >
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <Link
              to="/"
              className="flex shrink-0 items-center gap-2.5"
              aria-label="Minha Estante, início"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen size={19} strokeWidth={1.8} />
              </span>
              <span className="hidden font-display text-lg font-semibold tracking-tight text-ink sm:inline">
                Minha Estante
              </span>
            </Link>
          )}
          {backTo ? (
            <Link
              to="/"
              className="hidden font-display text-lg font-semibold tracking-tight text-ink sm:inline"
            >
              Minha Estante
            </Link>
          ) : null}
        </div>

        {onSearchChange ? (
          <label className="relative hidden w-full max-w-sm md:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              value={search ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por título ou autor"
              aria-label="Buscar livros por título ou autor"
              className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted/80 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        ) : null}

        <div className="flex shrink-0 items-center gap-2">
          {!backTo ? (
            <Link to="/livros/novo" className="hidden sm:inline-flex">
              <Button>
                <Plus size={16} />
                Novo livro
              </Button>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface text-ink-muted transition-all duration-150 hover:bg-muted hover:text-ink active:scale-[0.97]"
            aria-label={
              theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"
            }
            title={theme === "light" ? "Tema escuro" : "Tema claro"}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
        </div>
      </div>
      {onSearchChange ? (
        <div className="px-4 pb-3 md:hidden">
          <label className="relative block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              value={search ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por título ou autor"
              aria-label="Buscar livros por título ou autor"
              className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      ) : null}
    </header>
  );
}
