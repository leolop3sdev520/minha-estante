import { Request, Response } from "express";
import {
  CreateLivroService,
  ListLivrosService,
  GetLivroService,
  DeleteLivroService,
  UpdateLivroService,
  GetResumoService,
} from "../services/livros.service.js";

// ==========================================
// CONTROLLER DE CRIAÇÃO
// ==========================================
export class CreateLivroController {
  async handle(req: Request, res: Response) {
    const createLivroService = new CreateLivroService();
    try {
      const livro = await createLivroService.execute(req.body);
      return res.status(201).json(livro);
    } catch (error: any) {
      if (error.message === "DUPLICATE_BOOK") {
        return res.status(409).json({
          error: {
            code: "DUPLICATE_BOOK",
            message: "Já existe um livro com este título e autor.",
            field: "titulo",
          },
        });
      }
      throw error;
    }
  }
}

// ==========================================
// CONTROLLER DE LISTAGEM
// ==========================================
export class ListLivrosController {
  async handle(req: Request, res: Response) {
    const listLivrosService = new ListLivrosService();
    const { page, limit, status, q } = req.query as unknown as {
      page: number;
      limit: number;
      status?: "quero_ler" | "lendo" | "lido";
      q?: string;
    };
    const resultado = await listLivrosService.execute({
      page,
      limit,
      status,
      q,
    });
    return res.status(200).json(resultado);
  }
}

// ==========================================
// CONTROLLER DE BUSCA POR ID
// ==========================================
export class GetLivroController {
  async handle(req: Request, res: Response) {
    const getLivroService = new GetLivroService();
    try {
      const livro = await getLivroService.execute(req.params.id as string);
      return res.status(200).json(livro);
    } catch (error: any) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Livro não encontrado." },
        });
      }
      throw error;
    }
  }
}

export class DeleteLivroController {
  async handle(req: Request, res: Response) {
    const deleteLivroService = new DeleteLivroService();
    try {
      await deleteLivroService.execute(req.params.id as string);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Livro não encontrado." },
        });
      }
      throw error;
    }
  }
}

export class UpdateLivroController {
  async handle(req: Request, res: Response) {
    const updateLivroService = new UpdateLivroService();
    const { id } = req.params;

    try {
      const livro = await updateLivroService.execute(id as string, req.body);
      return res.status(200).json(livro);
    } catch (error: any) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Livro não encontrado." },
        });
      }
      if (error.message === "DUPLICATE_BOOK") {
        return res.status(409).json({
          error: {
            code: "DUPLICATE_BOOK",
            message: "Já existe um livro com este título e autor.",
          },
        });
      }
      if (error.message === "INVALID_TRANSITION") {
        return res.status(422).json({
          error: {
            code: "INVALID_TRANSITION",
            message: "Mudança de status proibida.",
          },
        });
      }
      if (error.message === "INVALID_FIELD_FOR_STATUS") {
        return res.status(422).json({
          error: {
            code: "INVALID_FIELD_FOR_STATUS",
            message: "Não é possível dar nota a um livro que não foi lido.",
          },
        });
      }
      throw error;
    }
  }
}

export class GetResumoController {
  async handle(_req: Request, res: Response) {
    const getResumoService = new GetResumoService();

    // Não precisa de try/catch porque não lançamos erros de negócio aqui
    const resumo = await getResumoService.execute();

    return res.status(200).json(resumo);
  }
}
