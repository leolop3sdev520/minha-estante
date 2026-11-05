import { prisma } from "../prisma/index.js";
import { normalizeText } from "../utils/normalize.js";
import { getTodayDate } from "../utils/date.js";

// ==========================================
// SERVICE DE CRIAÇÃO
// ==========================================
interface CreateLivroDTO {
  titulo: string;
  autor: string;
  ano_publicacao?: number | null;
  numero_paginas?: number | null;
  resenha?: string | null;
  status?: "quero_ler" | "lendo" | "lido";
}

export class CreateLivroService {
  async execute(data: CreateLivroDTO) {
    const titulo_normalizado = normalizeText(data.titulo);
    const autor_normalizado = normalizeText(data.autor);

    const livroExistente = await prisma.livro.findFirst({
      where: { titulo_normalizado, autor_normalizado },
    });

    if (livroExistente) throw new Error("DUPLICATE_BOOK");

    const livro = await prisma.livro.create({
      data: {
        titulo: data.titulo,
        titulo_normalizado,
        autor: data.autor,
        autor_normalizado,
        ano_publicacao: data.ano_publicacao,
        numero_paginas: data.numero_paginas,
        resenha: data.resenha,
        status: data.status || "quero_ler",
      },
    });

    return livro;
  }
}

// ==========================================
// SERVICE DE LISTAGEM
// ==========================================
interface ListLivrosDTO {
  page: number;
  limit: number;
  status?: "quero_ler" | "lendo" | "lido";
  q?: string;
}

export class ListLivrosService {
  async execute({ page, limit, status, q }: ListLivrosDTO) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;

    if (q) {
      const queryNormalized = normalizeText(q);
      where.OR = [
        { titulo_normalizado: { contains: queryNormalized } },
        { autor_normalizado: { contains: queryNormalized } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.livro.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updated_at: "desc" },
      }),
      prisma.livro.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }
}

// ==========================================
// SERVICE DE BUSCA POR ID
// ==========================================
export class GetLivroService {
  async execute(id: string) {
    const livro = await prisma.livro.findUnique({ where: { id } });
    if (!livro) throw new Error("NOT_FOUND");
    return livro;
  }
}

// ==========================================
// SERVICE DE DELETAR LIVRO
// ==========================================
export class DeleteLivroService {
  async execute(id: string) {
    const livro = await prisma.livro.findUnique({ where: { id } });
    if (!livro) throw new Error("NOT_FOUND");

    await prisma.livro.delete({ where: { id } });
  }
}

// ==========================================
// SERVICE DE ATUALIZAR LIVRO
// ==========================================

export class UpdateLivroService {
  async execute(id: string, data: any) {
    // 1. Busca o livro atual no banco
    const livro = await prisma.livro.findUnique({ where: { id } });
    if (!livro) throw new Error("NOT_FOUND");

    const dataToUpdate: any = {};
    const hoje = getTodayDate();

    // 2. Verifica se o usuário quer mudar o título ou autor (e normaliza para checar duplicidade)
    if (data.titulo !== undefined || data.autor !== undefined) {
      const novoTitulo = data.titulo || livro.titulo;
      const novoAutor = data.autor || livro.autor;
      const titulo_normalizado = normalizeText(novoTitulo);
      const autor_normalizado = normalizeText(novoAutor);

      // Verifica se essa nova combinação já existe em OUTRO livro
      const duplicado = await prisma.livro.findFirst({
        where: {
          titulo_normalizado,
          autor_normalizado,
          id: { not: id }, // Ignora o próprio livro atual
        },
      });
      if (duplicado) throw new Error("DUPLICATE_BOOK");

      dataToUpdate.titulo = novoTitulo;
      dataToUpdate.titulo_normalizado = titulo_normalizado;
      dataToUpdate.autor = novoAutor;
      dataToUpdate.autor_normalizado = autor_normalizado;
    }

    // 3. Atualiza campos simples (que não dependem de regras malucas)
    if (data.resenha !== undefined) dataToUpdate.resenha = data.resenha;
    if (data.numero_paginas !== undefined)
      dataToUpdate.numero_paginas = data.numero_paginas;
    if (data.ano_publicacao !== undefined)
      dataToUpdate.ano_publicacao = data.ano_publicacao;

    // 4. A MÁGICA DAS TRANSIÇÕES DE STATUS
    if (data.status !== undefined && data.status !== livro.status) {
      const statusAtual = livro.status;
      const novoStatus = data.status;

      // Regra 6: Transições permitidas
      const transicoesValidas: Record<string, string[]> = {
        quero_ler: ["lendo", "lido"],
        lendo: ["lido", "quero_ler"],
        lido: ["lendo"],
      };

      if (!transicoesValidas[statusAtual]?.includes(novoStatus)) {
        throw new Error("INVALID_TRANSITION");
      }

      dataToUpdate.status = novoStatus;

      // Regra 4: Datas automáticas e Regra 3: Notas
      if (novoStatus === "lendo") {
        dataToUpdate.data_inicio = hoje;
        dataToUpdate.data_conclusao = null;
        dataToUpdate.nota = null; // Se for releitura, apaga a nota antiga
      } else if (novoStatus === "lido") {
        dataToUpdate.data_conclusao = hoje;
        dataToUpdate.data_inicio = livro.data_inicio || hoje; // Se não tinha início, usa hoje
      } else if (novoStatus === "quero_ler") {
        // Significa que desistiu
        dataToUpdate.data_inicio = null;
        dataToUpdate.data_conclusao = null;
        dataToUpdate.nota = null;
      }
    }

    // 5. Validação da Nota
    // Se o usuário enviou uma nota, o status final PRECISA ser "lido"
    const statusFinal = dataToUpdate.status || livro.status;
    if (data.nota !== undefined) {
      if (statusFinal !== "lido") throw new Error("INVALID_FIELD_FOR_STATUS");
      dataToUpdate.nota = data.nota;
    }

    // 6. Salva no banco
    const livroAtualizado = await prisma.livro.update({
      where: { id },
      data: dataToUpdate,
    });

    return livroAtualizado;
  }
}

export class GetResumoService {
  async execute() {
    // O Promise.all executa todas essas buscas no banco em PARALELO.
    // Isso é muito mais rápido do que esperar uma por uma terminar.
    const [total, quero_ler, lendo, lido, aggregate] = await Promise.all([
      prisma.livro.count(), // Total geral
      prisma.livro.count({ where: { status: "quero_ler" } }), // Contagem por status
      prisma.livro.count({ where: { status: "lendo" } }),
      prisma.livro.count({ where: { status: "lido" } }),

      // O 'aggregate' calcula a média (_avg) da coluna 'nota'
      // O filtro 'where' garante que só vamos calcular a média dos livros 'lido' que possuem nota preenchida
      prisma.livro.aggregate({
        _avg: { nota: true },
        where: {
          status: "lido",
          nota: { not: null },
        },
      }),
    ]);

    // Extrai a média do objeto retornado pelo Prisma
    const media_notas = aggregate._avg.nota;

    return {
      total,
      quero_ler,
      lendo,
      lido,
      // Se a média for null (nenhum livro avaliado), mantém null. Senão, arredonda para 1 casa decimal.
      media_notas: media_notas !== null ? Number(media_notas.toFixed(1)) : null,
    };
  }
}
