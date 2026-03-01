import type { Request, Response, NextFunction } from "express";
import type { WorkerRole } from "@prisma/client";
/**
 * Middleware que exige que o usuário tenha uma das roles permitidas.
 * Deve ser usado após authJwt. Usa req.user.
 */
export declare function requireRole(...allowedRoles: WorkerRole[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireRole.d.ts.map