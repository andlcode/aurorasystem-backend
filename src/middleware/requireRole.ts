import type { Request, Response, NextFunction } from "express";
import type { WorkerRole } from "@prisma/client";

/**
 * Middleware que exige que o usuário tenha uma das roles permitidas.
 * Deve ser usado após authJwt. Usa req.user.
 */
export function requireRole(...allowedRoles: WorkerRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Autenticação necessária" });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ error: "Sem permissão para esta ação" });
      return;
    }

    next();
  };
}
