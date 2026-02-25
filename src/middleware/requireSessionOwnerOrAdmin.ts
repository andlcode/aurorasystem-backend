import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

/**
 * Middleware que exige admin/super_admin OU ser o owner da turma da sessão.
 * Deve ser usado após authJwt. Usa req.user. O :sessionId deve ser o sessionId.
 */
export async function requireSessionOwnerOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }
  const sessionId = req.params.sessionId;

  if (user.role === "admin" || user.role === "super_admin") {
    next();
    return;
  }

  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: { class_: { select: { ownerWorkerId: true } } },
  });

  if (!session) {
    res.status(404).json({ error: "Sessão não encontrada" });
    return;
  }

  if (session.class_.ownerWorkerId !== user.personId) {
    res.status(403).json({ error: "Sem permissão para esta sessão" });
    return;
  }

  next();
}
