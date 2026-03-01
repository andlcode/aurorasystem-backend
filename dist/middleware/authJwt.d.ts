import type { Request, Response, NextFunction } from "express";
import type { WorkerRole } from "@prisma/client";
export interface JwtPayload {
    userId: string;
    personId: string;
    role: WorkerRole;
}
/**
 * Middleware que lê o token JWT do header Authorization: Bearer <token>,
 * valida com JWT_SECRET e injeta req.user = { userId, personId, role }.
 * Também define req.userId e req.userRole para compatibilidade com controllers.
 */
export declare function authJwt(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=authJwt.d.ts.map