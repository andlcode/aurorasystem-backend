import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    res.status(400).json({ error: "Validação falhou", details: messages });
    return;
  }

  if (err instanceof Error) {
    if (err.message === "Not allowed by CORS") {
      res.status(403).json({ error: "Origem não permitida" });
      return;
    }
    if (err.message.includes("não encontrado") || err.message.includes("not found")) {
      res.status(404).json({ error: err.message });
      return;
    }
  }

  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
}
