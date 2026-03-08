import type { Request, Response, NextFunction } from "express";
/**
 * Permite acesso total apenas a SUPER_ADMIN.
 * Demais usuários só acessam sessões de turmas em que são o responsável.
 */
export declare function requireSessionOwnerOrAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=requireSessionOwnerOrAdmin.d.ts.map