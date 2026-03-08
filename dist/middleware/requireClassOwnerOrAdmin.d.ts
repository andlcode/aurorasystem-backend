import type { Request, Response, NextFunction } from "express";
/**
 * Permite acesso total apenas a SUPER_ADMIN.
 * Demais usuários (COORDENADOR, EVANGELIZADOR) só acessam turmas
 * em que são o responsável (responsibleUserId === user.userId).
 */
export declare function requireClassOwnerOrAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=requireClassOwnerOrAdmin.d.ts.map