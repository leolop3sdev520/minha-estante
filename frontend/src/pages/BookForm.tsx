import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CalendarDays, ChevronDown, Info, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { LoadingState } from "../components/PageState";
import { Stars } from "../components/Stars";
import { useToast } from "../contexts/ToastContext";
import { useBook } from "../hooks/useBooks";
import { bookApi } from "../services/api";
import type { BookPayload, BookStatus } from "../types";
import { mapApiError } from "../utils/errorMapper";
import { getErrorMessage } from "../utils/formatters";

const formSchema = z.object({
  titulo: z.string().trim().min(1, "O título é obrigatório.").max(150, "O título deve ter no máximo 150 caracteres."),
  autor: z.string().trim().min(1, "O autor é obrigatório.").max(150, "O autor deve ter no máximo 150 caracteres."),
  ano_publicacao: z
    .string()
    .optional()
    .refine((value) => !value || (/^\d{4}$/.test(value) && Number(value) >= 1000 && Number(value) <= new Date().getFullYear()), {
      message: `Informe um ano entre 1000 e ${new Date().getFullYear()}.`,
    }),
  numero_paginas: z
    .string()
    .optional()
    .refine((value) => !value || (/^\d+$/.test(value) && Number(value) > 0), {
      message: "Informe um número de páginas maior que zero.",
    }),
  status: z.enum(["quero_ler", "lendo", "lido"]),
  nota: z.number().int().min(0).max(5),
  resenha: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const initialValues: FormValues = {
  titulo: "",
  autor: "",
  ano_publicacao: "",
  numero_paginas: "",
  status: "quero_ler",
  nota: 0,
  resenha: "",
};

const allowedStatuses: Record<BookStatus, BookStatus[]> = {
  quero_ler: ["quero_ler", "lendo", "lido"],
  lendo: ["quero_ler", "lendo", "lido"],
  lido: ["lendo", "lido"],
};

export function BookForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { book, loading, loadError, notFound, refresh } = useBook(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });
  const status = watch("status");
  const rating = watch("nota");

  useEffect(() => {
    if (book) {
      reset({
        titulo: book.titulo,
        autor: book.autor,
        ano_publicacao: book.ano_publicacao?.toString() ?? "",
        numero_paginas: book.numero_paginas?.toString() ?? "",
        status: book.status,
        nota: book.nota ?? 0,
        resenha: book.resenha ?? "",
      });
    }
  }, [book, reset]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const payload: BookPayload = {
      titulo: values.titulo.trim(),
      autor: values.autor.trim(),
      ano_publicacao: values.ano_publicacao ? Number(values.ano_publicacao) : null,
      numero_paginas: values.numero_paginas ? Number(values.numero_paginas) : null,
      resenha: values.resenha?.trim() || null,
      status: values.status,
      ...(values.status === "lido" ? { nota: values.nota || null } : {}),
    };

    try {
      if (isEditing && id) {
        await bookApi.update(id, payload);
        showToast("Alterações salvas com sucesso.");
        navigate(`/livros/${id}`);
      } else {
        const created = await bookApi.create({
          titulo: payload.titulo,
          autor: payload.autor,
          ano_publicacao: payload.ano_publicacao,
          numero_paginas: payload.numero_paginas,
          resenha: payload.resenha,
          status: payload.status,
        });
        if (values.status === "lido" && values.nota > 0) {
          try {
            await bookApi.update(created.id, { nota: values.nota });
          } catch (error) {
            showToast(
              `Livro criado, mas não foi possível salvar a nota: ${getErrorMessage(error)} Você pode tentar novamente ao editar.`,
              "error",
            );
            navigate(`/livros/${created.id}/editar`);
            return;
          }
        }
        showToast("Livro adicionado à sua estante.");
        navigate(`/livros/${created.id}`);
      }
    } catch (error) {
      const message = mapApiError(error, setError);
      if (message.handled) {
        if (message.message) showToast(message.message, "error");
      } else {
        showToast(getErrorMessage(error), "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isEditing && loading) {
    return (
      <div className="app-page bg-page">
        <Header backTo="/" />
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <LoadingState label="Carregando dados do livro…" />
        </main>
      </div>
    );
  }

  if (isEditing && !book && loadError) {
    return (
      <div className="app-page bg-page">
        <Header backTo="/" />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="font-display text-2xl text-ink">
              {notFound ? "Não encontramos este livro" : "Não conseguimos carregar este livro"}
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              {notFound ? "Ele pode ter sido removido da sua estante." : loadError}
            </p>
            {!notFound ? (
              <Button variant="outline" className="mt-5" onClick={refresh}>Tentar novamente</Button>
            ) : null}
            <Link to="/" className="mt-5 inline-flex"><Button variant="outline">Voltar à estante</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-page bg-page">
      <Header backTo={isEditing && id ? `/livros/${id}` : "/"} />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6 sm:pt-9 lg:px-8">
        <Link
          to={isEditing && id ? `/livros/${id}` : "/"}
          className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-primary"
        >
          <ArrowLeft size={15} />
          {isEditing ? "Voltar aos detalhes" : "Voltar à estante"}
        </Link>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            {isEditing ? "Sua biblioteca pessoal" : "Um novo capítulo"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-h1">
            {isEditing ? "Editar livro" : "Adicione à sua estante"}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {isEditing ? "Atualize os detalhes e mantenha sua jornada em dia." : "Registre os detalhes para guardar esse livro por aqui."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5 shadow-(--shadow-soft) sm:p-7">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm text-primary">01</span>
              <h2 className="font-display text-lg font-medium text-ink">Sobre o livro</h2>
            </div>
            <div className="space-y-5">
              <Input
                label="Título"
                placeholder="Ex.: O Hobbit"
                maxLength={150}
                error={errors.titulo?.message}
                {...register("titulo")}
              />
              <Input
                label="Autor"
                placeholder="Ex.: J. R. R. Tolkien"
                maxLength={150}
                error={errors.autor?.message}
                {...register("autor")}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Ano de publicação"
                  placeholder="Ex.: 1937"
                  inputMode="numeric"
                  error={errors.ano_publicacao?.message}
                  {...register("ano_publicacao")}
                />
                <Input
                  label="Número de páginas"
                  placeholder="Ex.: 320"
                  inputMode="numeric"
                  error={errors.numero_paginas?.message}
                  {...register("numero_paginas")}
                />
              </div>
              <label className="block space-y-1.5">
                <span className="block text-sm font-medium text-ink">Status de leitura</span>
                <span className="relative block">
                  <select
                    {...register("status")}
                    aria-invalid={Boolean(errors.status)}
                    aria-describedby={errors.status ? "status-error" : undefined}
                    className="h-11 w-full appearance-none rounded-md border border-border-strong bg-surface px-3.5 pr-10 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {(book ? allowedStatuses[book.status] : allowedStatuses.quero_ler).map((option) => (
                      <option key={option} value={option}>
                        {option === "quero_ler" ? "Quero ler" : option === "lendo" ? "Lendo" : "Lido"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                </span>
                {errors.status?.message ? (
                  <span id="status-error" className="text-xs text-danger">{errors.status.message}</span>
                ) : null}
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-(--shadow-soft) sm:p-7">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm text-primary">02</span>
              <h2 className="font-display text-lg font-medium text-ink">Sua experiência</h2>
            </div>
            <div>
              <label htmlFor="resenha" className="block text-sm font-medium text-ink">Resenha ou anotações</label>
              <textarea
                id="resenha"
                rows={5}
                maxLength={5000}
                placeholder="O que ficou com você depois da leitura?"
                aria-invalid={Boolean(errors.resenha)}
                aria-describedby={errors.resenha ? "resenha-error" : undefined}
                className="mt-1.5 w-full resize-y rounded-md border border-border-strong bg-surface px-3.5 py-3 text-sm leading-6 text-ink placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("resenha")}
              />
              {errors.resenha?.message ? (
                <p id="resenha-error" className="mt-1 text-xs text-danger">{errors.resenha.message}</p>
              ) : null}
            </div>

            {status === "lido" ? (
              <div className="mt-5 rounded-md border border-border bg-page/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">Que nota você daria?</p>
                    <p className="mt-0.5 text-xs text-ink-muted">Sua avaliação é só sua.</p>
                  </div>
                  <Stars
                    value={rating || null}
                    interactive
                    showEmpty
                    size={22}
                    onChange={(value) => setValue("nota", value, { shouldDirty: true, shouldValidate: true })}
                  />
                </div>
                {errors.nota?.message ? <p className="mt-2 text-xs text-danger">{errors.nota.message}</p> : null}
              </div>
            ) : (
              <div className="mt-5 flex items-start gap-2 rounded-md bg-muted px-3.5 py-3 text-xs leading-5 text-ink-muted">
                <Info size={15} className="mt-0.5 shrink-0 text-ink-muted" />
                A nota fica disponível quando o status do livro for “Lido”.
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-(--shadow-soft) sm:p-7">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm text-primary">03</span>
              <h2 className="font-display text-lg font-medium text-ink">Datas de leitura</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <SystemDateField id="data-inicio" label="Início da leitura" />
              <SystemDateField id="data-conclusao" label="Conclusão da leitura" />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
              <CalendarDays size={13} />
              Essas datas são registradas automaticamente ao atualizar o status.
            </p>
          </section>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <Link to={isEditing && id ? `/livros/${id}` : "/"} className="sm:inline-flex">
              <Button type="button" variant="outline" className="w-full">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              <Save size={16} />
              {submitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Adicionar à estante"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function SystemDateField({ id, label }: { id: string; label: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
      <input
        id={id}
        type="text"
        disabled
        value="Definido pelo sistema"
        readOnly
        className="h-11 w-full cursor-not-allowed rounded-md border border-border bg-muted px-3.5 text-sm text-ink-muted"
      />
    </div>
  );
}
