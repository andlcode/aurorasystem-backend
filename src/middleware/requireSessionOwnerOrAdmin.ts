import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

/**
 * Permite acesso total apenas a SUPER_ADMIN.
 * Demais usuários só acessam sessões de turmas em que são o responsável.
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

  if (user.role === "SUPER_ADMIN") {
    next();
    return;
  }

  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: { class_: { select: { responsibleUserId: true } } },
  });

  if (!session) {
    res.status(404).json({ error: "Sessão não encontrada" });
    return;
  }

  if (session.class_.responsibleUserId !== user.userId) {
    res.status(403).json({ error: "Sem permissão para acessar esta sessão" });
    return;
  }

  next();
}
