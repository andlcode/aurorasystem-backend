import type { Request, Response, NextFunction } from "express";

/**
 * Exige header x-register-secret igual a REGISTER_SECRET.
 * Usado em POST /auth/register.
 */
export function requireRegisterSecret(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secret = process.env.REGISTER_SECRET;
  if (!secret) {
    console.log("[Auth] requireRegisterSecret - REGISTER_SECRET não configurado no .env");
    res.status(503).json({ error: "Registro desabilitado (REGISTER_SECRET não configurado)" });
    return;
  }
  const provided = req.headers["x-register-secret"];
  if (provided !== secret) {
    console.log("[Auth] requireRegisterSecret - header x-register-secret inválido ou ausente");
    res.status(403).json({ error: "Chave de registro inválida" });
    return;
  }
  console.log("[Auth] requireRegisterSecret - chave válida, prosseguindo para register");
  next();
}
