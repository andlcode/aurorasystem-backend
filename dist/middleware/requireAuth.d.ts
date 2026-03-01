import type { Request, Response, NextFunction } from "express";
/**
 * Middleware que exige usuário autenticado (qualquer role).
 * Deve ser usado após authJwt. Usa req.user.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=requireAuth.d.ts.map