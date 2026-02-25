import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

/**
 * Middleware que exige admin/super_admin OU ser o owner da turma.
 * Deve ser usado após authJwt. Usa req.user. O :id deve ser o classId.
 */
export async function requireClassOwnerOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }
  const classId = req.params.id;

  if (user.role === "admin" || user.role === "super_admin") {
    next();
    return;
  }

  const class_ = await prisma.class.findUnique({
    where: { id: classId },
    select: { ownerWorkerId: true },
  });

  if (!class_) {
    res.status(404).json({ error: "Turma não encontrada" });
    return;
  }

  if (class_.ownerWorkerId !== user.personId) {
    res.status(403).json({ error: "Sem permissão para editar esta turma" });
    return;
  }

  next();
}
