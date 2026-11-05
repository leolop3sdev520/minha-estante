export type BookStatus = "quero_ler" | "lendo" | "lido";

export interface Book {
  id: string;
  titulo: string;
  autor: string;
  ano_publicacao: number | null;
  numero_paginas: number | null;
  resenha: string | null;
  status: BookStatus;
  nota: number | null;
  data_inicio: string | null;
  data_conclusao: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookListResponse {
  items: Book[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface BookSummary {
  total: number;
  quero_ler: number;
  lendo: number;
  lido: number;
  media_notas: number | null;
}

export interface BookPayload {
  titulo: string;
  autor: string;
  ano_publicacao?: number | null;
  numero_paginas?: number | null;
  resenha?: string | null;
  status?: BookStatus;
  nota?: number | null;
}

export type BookUpdatePayload = Partial<BookPayload>;
