import type { Request, Response, NextFunction } from "express";
/**
 * Middleware que exige admin/super_admin OU ser o owner da turma.
 * Deve ser usado após authJwt. Usa req.user. O :id deve ser o classId.
 */
export declare function requireClassOwnerOrAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=requireClassOwnerOrAdmin.d.ts.map