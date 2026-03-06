import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/hash";
import {
  createTeamMemberSchema,
  listTeamQuerySchema,
  patchTeamMemberSchema,
} from "./team.dto";
import type { WorkerRole } from "@prisma/client";

export async function listTeam(req: Request, res: Response) {
  const parsed = listTeamQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { q } = parsed.data;

  const where = {
    type: "worker" as const,
    ...(q?.trim() && {
      OR: [
        { fullName: { contains: q.trim(), mode: "insensitive" as const } },
        { email: { contains: q.trim(), mode: "insensitive" as const } },
      ],
    }),
  };

  const members = await prisma.people.findMany({
    where,
    include: { worker: true, authUser: true },
    orderBy: { fullName: "asc" },
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

  const existing = await prisma.authUser.findFirst({
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

  const result = await prisma.$transaction(async (tx) => {
    const person = await tx.people.create({
      data: {
        fullName: data.fullName,
        email: data.email ?? null,
        type: "worker",
        worker: {
          create: {
            function: data.function,
            role: data.role as WorkerRole,
          },
        },
      },
      include: { worker: true },
    });

    await tx.authUser.create({
      data: {
        username: data.username,
        email: data.email ?? null,
        passwordHash,
        personId: person.id,
      },
    });

    return person;
  });

  const created = await prisma.people.findUnique({
    where: { id: result.id },
    include: { worker: true, authUser: true },
  });

  res.status(201).json(created);
}

export async function getTeamMemberById(req: Request, res: Response) {
  const { id } = req.params;

  const person = await prisma.people.findUnique({
    where: { id },
    include: { worker: true, authUser: true },
  });

  if (!person || person.type !== "worker") {
    res.status(404).json({ error: "Membro da equipe não encontrado" });
    return;
  }

  res.json(person);
}

export async function patchTeamMember(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = patchTeamMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;

  const existing = await prisma.people.findUnique({
    where: { id },
    include: { worker: true, authUser: true },
  });

  if (!existing || existing.type !== "worker") {
    res.status(404).json({ error: "Membro da equipe não encontrado" });
    return;
  }

  const updates: Parameters<typeof prisma.people.update>[0]["data"] = {
    ...(data.fullName != null && { fullName: data.fullName }),
    ...(data.email !== undefined && { email: data.email }),
    ...(data.status != null && { status: data.status as "active" | "inactive" }),
    ...(existing.worker &&
      (data.function != null || data.role != null) && {
        worker: {
          update: {
            ...(data.function != null && { function: data.function }),
            ...(data.role != null && { role: data.role as WorkerRole }),
          },
        },
      }),
  };

  const person = await prisma.people.update({
    where: { id },
    data: updates,
    include: { worker: true, authUser: true },
  });

  if (data.status === "inactive" && existing.authUser) {
    await prisma.authUser.update({
      where: { id: existing.authUser.id },
      data: { isActive: false },
    });
  } else if (data.status === "active" && existing.authUser) {
    await prisma.authUser.update({
      where: { id: existing.authUser.id },
      data: { isActive: true },
    });
  }

  const updated = await prisma.people.findUnique({
    where: { id },
    include: { worker: true, authUser: true },
  });

  res.json(updated);
}
