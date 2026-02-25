import type { Request, Response, NextFunction } from "express";

/**
 * Middleware que exige usuário autenticado (qualquer role).
 * Deve ser usado após authJwt. Usa req.user.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }
  next();
}
