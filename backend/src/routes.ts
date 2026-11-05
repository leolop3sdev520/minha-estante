import { Router } from "express";
import { validateSchema } from "./middlewares/validateSchema.js";
import {
  createLivroSchema,
  listLivrosSchema,
  getLivroSchema,
  deleteLivroSchema,
  updateLivroSchema,
} from "./schemas/livros.schemas.js";
import {
  CreateLivroController,
  ListLivrosController,
  GetLivroController,
  DeleteLivroController,
  UpdateLivroController,
  GetResumoController,
} from "./controllers/livros.controller.js";

const router = Router();

const createLivroController = new CreateLivroController();
const listLivrosController = new ListLivrosController();
const getLivroController = new GetLivroController();
const deleteLivroController = new DeleteLivroController();
const updateLivroController = new UpdateLivroController();
const getResumoController = new GetResumoController();
// Health Check
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Rotas de Livros
router.post(
  "/livros",
  validateSchema(createLivroSchema),
  createLivroController.handle,
);
router.get(
  "/livros",
  validateSchema(listLivrosSchema),
  listLivrosController.handle,
);
router.get(
  "/livros/:id",
  validateSchema(getLivroSchema),
  getLivroController.handle,
);

router.delete(
  "/livros/:id",
  validateSchema(deleteLivroSchema),
  deleteLivroController.handle,
);

router.patch(
  "/livros/:id",
  validateSchema(updateLivroSchema),
  updateLivroController.handle,
);

router.get("/resumo", getResumoController.handle);

export { router };
