import type { Request, Response, NextFunction } from "express";
/**
 * Middleware que exige evangelizador/super_admin OU ser o responsável da turma da sessão.
 * Deve ser usado após authJwt. Usa req.user. O :sessionId deve ser o sessionId.
 */
export declare function requireSessionOwnerOrAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=requireSessionOwnerOrAdmin.d.ts.map