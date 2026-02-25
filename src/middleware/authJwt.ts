import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
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
export function authJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({ error: "Token não informado" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "JWT_SECRET não configurado" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    req.userId = decoded.personId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
