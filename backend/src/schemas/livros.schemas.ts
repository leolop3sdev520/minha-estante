import { z } from "zod";

// ==========================================
// SCHEMA DE CRIAÇÃO (POST /api/livros)
// ==========================================
export const createLivroSchema = z.object({
  body: z
    .object({
      titulo: z
        .string()
        .trim()
        .min(1, "O título é obrigatório.")
        .max(150, "O título deve ter no máximo 150 caracteres."),
      autor: z
        .string()
        .trim()
        .min(1, "O autor é obrigatório.")
        .max(150, "O autor deve ter no máximo 150 caracteres."),
      ano_publicacao: z
        .number()
        .int()
        .min(1000)
        .max(new Date().getFullYear())
        .optional()
        .nullable(),
      numero_paginas: z
        .number()
        .int()
        .positive("O número de páginas deve ser maior que zero.")
        .optional()
        .nullable(),
      resenha: z.string().optional().nullable(),
      status: z.enum(["quero_ler", "lendo", "lido"]).optional(),
    })
    .strict(),
});

// ==========================================
// SCHEMA DE LISTAGEM (GET /api/livros)
// ==========================================
export const listLivrosSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["quero_ler", "lendo", "lido"]).optional(),
    q: z.string().optional(),
  }),
});

// ==========================================
// SCHEMA DE BUSCA POR ID (GET /api/livros/:id)
// ==========================================
export const getLivroSchema = z.object({
  params: z.object({
    id: z.uuid("O ID informado não é um UUID válido."),
  }),
});

// ==========================================
// SCHEMA DE DELETAR (DELETE /api/livros)
// ==========================================
export const deleteLivroSchema = z.object({
  params: z.object({
    id: z.uuid("O ID informado não é um UUID válido."),
  }),
});

//UPDATE DE LIVRO (PATCH /api/livros/:id)
export const updateLivroSchema = z.object({
  params: z.object({
    id: z.uuid("O ID informado não é um UUID válido."),
  }),
  body: z
    .object({
      titulo: z.string().trim().min(1).max(150).optional(),
      autor: z.string().trim().min(1).max(150).optional(),
      ano_publicacao: z
        .number()
        .int()
        .min(1000)
        .max(new Date().getFullYear())
        .optional()
        .nullable(),
      numero_paginas: z.number().int().positive().optional().nullable(),
      resenha: z.string().optional().nullable(),
      status: z.enum(["quero_ler", "lendo", "lido"]).optional(),
      nota: z.number().int().min(1).max(5).optional().nullable(),
    })
    .strict(),
});
