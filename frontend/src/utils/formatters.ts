import axios from "axios";
import type { BookStatus } from "../types";

export const statusLabels: Record<BookStatus, string> = {
  quero_ler: "Quero ler",
  lendo: "Lendo",
  lido: "Lido",
};

export function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getStatusAction(status: BookStatus) {
  switch (status) {
    case "quero_ler":
      return { label: "Iniciar leitura", next: "lendo" as const, style: "outline" as const };
    case "lendo":
      return { label: "Concluir", next: "lido" as const, style: "primary" as const };
    case "lido":
      return { label: "Reler", next: "lendo" as const, style: "ghost" as const };
  }
}

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export function isNotFoundError(error: unknown) {
  return (
    axios.isAxiosError<ApiErrorResponse>(error) &&
    (error.response?.status === 404 || error.response?.data?.error?.code === "NOT_FOUND")
  );
}

export function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "Não foi possível concluir esta ação. Tente novamente.";
  }

  const status = error.response?.status;
  const code = error.response?.data?.error?.code;

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return "A solicitação demorou demais. Tente novamente.";
  }
  if (!error.response) {
    return "Não foi possível conectar à biblioteca. Verifique se a API está disponível.";
  }
  if (status === 404 || code === "NOT_FOUND") return "Este livro não foi encontrado.";
  if (status === 409 || code === "DUPLICATE_BOOK") {
    return "Já existe um livro com este título e autor.";
  }
  if (code === "INVALID_TRANSITION") {
    return "Essa mudança de status não é permitida. Atualize a página e tente novamente.";
  }
  if (code === "INVALID_FIELD_FOR_STATUS") {
    return "A nota só pode ser alterada quando o livro está marcado como lido.";
  }
  if (status === 422 || code === "VALIDATION_ERROR") {
    return "Confira os campos informados e tente novamente.";
  }
  if (status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
  if (status === 403) return "Você não tem permissão para realizar esta ação.";
  if (status === 429) return "Muitas solicitações em pouco tempo. Aguarde e tente novamente.";
  if (status !== undefined && status >= 500) {
    return "A biblioteca está temporariamente indisponível. Tente novamente.";
  }

  return "Não foi possível concluir esta ação. Tente novamente.";
}
