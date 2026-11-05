import axios from "axios";
import type { FieldPath, UseFormSetError } from "react-hook-form";

interface ApiValidationIssue {
  path?: Array<string | number>;
  message?: string;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    field?: string;
    message?: string;
    details?: ApiValidationIssue[];
  };
}

export interface FormApiErrorResult {
  handled: boolean;
  message?: string;
}

export function mapApiError<T extends Record<string, unknown>>(
  error: unknown,
  setError: UseFormSetError<T>,
): FormApiErrorResult {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return { handled: false };

  const apiError = error.response?.data?.error;
  if (error.response?.status === 409 || apiError?.code === "DUPLICATE_BOOK") {
    const field = apiError?.field === "titulo" ? apiError.field : "titulo";
    setError(field as FieldPath<T>, {
      type: "server",
      message: "Já existe um livro com este título e autor",
    });
    return { handled: true };
  }

  if (error.response?.status === 422) {
    const fieldNames = new Set(["titulo", "autor", "ano_publicacao", "numero_paginas", "resenha", "status", "nota"]);
    let fieldErrorCount = 0;
    for (const issue of apiError?.details ?? []) {
      const field = issue.path?.find(
        (segment): segment is string => typeof segment === "string" && fieldNames.has(segment),
      );
      if (field && issue.message) {
        setError(field as FieldPath<T>, { type: "server", message: issue.message });
        fieldErrorCount += 1;
      }
    }

    if (apiError?.code === "INVALID_TRANSITION") {
      setError("status" as FieldPath<T>, {
        type: "server",
        message: "Essa mudança de status não é permitida para este livro.",
      });
      fieldErrorCount += 1;
    } else if (apiError?.code === "INVALID_FIELD_FOR_STATUS") {
      setError("status" as FieldPath<T>, {
        type: "server",
        message: "Para avaliar este livro, altere o status para “Lido”.",
      });
      fieldErrorCount += 1;
    }

    if (fieldErrorCount > 0) return { handled: true };
    return {
      handled: true,
      message: apiError?.message ?? "Confira os campos informados e tente novamente.",
    };
  }

  return { handled: false };
}
