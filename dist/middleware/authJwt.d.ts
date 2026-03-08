import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
export interface JwtPayload {
    userId: string;
    role: UserRole;
}
/**
 * Middleware que lê o token JWT do header Authorization: Bearer <token>,
 * valida com JWT_SECRET e injeta req.user = { userId, role }.
 * req.userId = User.id para compatibilidade com controllers.
 */
export declare function authJwt(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=authJwt.d.ts.map