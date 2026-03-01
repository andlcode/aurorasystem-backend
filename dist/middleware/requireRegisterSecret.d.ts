import type { Request, Response, NextFunction } from "express";
/**
 * Exige header x-register-secret igual a REGISTER_SECRET.
 * Usado em POST /auth/register.
 */
export declare function requireRegisterSecret(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=requireRegisterSecret.d.ts.map