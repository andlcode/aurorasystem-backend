import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/hash";
import {
  createTeamMemberSchema,
  listTeamQuerySchema,
  patchTeamMemberSchema,
} from "./team.dto";
import type { UserRole } from "@prisma/client";

export async function listTeamResponsibles(req: Request, res: Response) {
  const responsibles = await prisma.user.findMany({
    where: {
      status: "active",
      role: { in: ["SUPER_ADMIN", "COORDENADOR", "EVANGELIZADOR"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });

  res.json(
    responsibles.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    }))
  );
}

export async function listTeam(req: Request, res: Response) {
  const parsed = listTeamQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { q } = parsed.data;

  const where = {
    ...(q?.trim() && {
      OR: [
        { name: { contains: q.trim(), mode: "insensitive" as const } },
        { email: { contains: q.trim(), mode: "insensitive" as const } },
      ],
    }),
  };

  const members = await prisma.user.findMany({
    where,
    orderBy: { name: "asc" },
  });

  res.json(members);
}

export async function createTeamMember(req: Request, res: Response) {
  const parsed = createTeamMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: data.username, mode: "insensitive" } },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    },
  });
  if (existing) {
    res.status(409).json({ error: "Username ou e-mail já cadastrado" });
    return;
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.fullName,
      username: data.username,
      email: data.email ?? null,
      passwordHash,
      role: data.role as UserRole,
      status: "active",
    },
  });

  res.status(201).json(user);
}

export async function getTeamMemberById(req: Request, res: Response) {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    res.status(404).json({ error: "Membro da equipe não encontrado" });
    return;
  }

  res.json(user);
}

export async function patchTeamMember(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = patchTeamMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    res.status(404).json({ error: "Membro da equipe não encontrado" });
    return;
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.fullName != null && { name: data.fullName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.status != null && { status: data.status as "active" | "inactive" }),
      ...(data.role != null && { role: data.role as UserRole }),
    },
  });

  res.json(user);
}
