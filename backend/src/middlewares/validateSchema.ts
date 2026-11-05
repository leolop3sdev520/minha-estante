import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

export function validateSchema(schema: ZodType) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = (parsed as any).body;
      req.query = (parsed as any).query;
      req.params = (parsed as any).params;

      next();
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Existem campos inválidos.",
            details: error.issues,
          },
        });
        return;
      }

      next(error);
      return;
    }
  };
}
