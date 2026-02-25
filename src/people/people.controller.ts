import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createPeopleSchema,
  listPeopleQuerySchema,
  patchPeopleSchema,
} from "./people.dto";
import type { PersonType, WorkerRole } from "@prisma/client";

export async function createPeople(req: Request, res: Response) {
  const parsed = createPeopleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;

  const birthDate = data.birthDate
    ? new Date(data.birthDate + "T00:00:00.000Z")
    : null;

  const person = await prisma.people.create({
    data: {
      fullName: data.fullName,
      birthDate,
      phone: data.phone ?? null,
      email: data.email ?? null,
      type: data.type as PersonType,
      ...(data.type === "worker" && {
        worker: {
          create: {
            function: data.function!,
            role: (data.role ?? "worker") as WorkerRole,
          },
        },
      }),
    },
    include: { worker: true },
  });

  res.status(201).json(person);
}

export async function listPeople(req: Request, res: Response) {
  const parsed = listPeopleQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { type, q } = parsed.data;

  const where: Parameters<typeof prisma.people.findMany>[0]["where"] = {};

  if (type) {
    where.type = type as PersonType;
  }

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    where.OR = [
      { fullName: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ];
  }

  const people = await prisma.people.findMany({
    where,
    include: { worker: true },
    orderBy: { fullName: "asc" },
  });

  res.json(people);
}

export async function patchPeople(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = patchPeopleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;
  const userRole = req.userRole!;

  const existing = await prisma.people.findUnique({
    where: { id },
    include: { worker: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Pessoa não encontrada" });
    return;
  }

  if (!existing.worker && (data.function != null || data.role != null)) {
    res.status(400).json({
      error: "function e role só podem ser editados para pessoas do tipo worker",
    });
    return;
  }

  if (data.role === "admin" && userRole !== "super_admin") {
    res.status(403).json({ error: "Somente super_admin pode promover para admin" });
    return;
  }

  const birthDate =
    data.birthDate !== undefined
      ? data.birthDate
        ? new Date(data.birthDate + "T00:00:00.000Z")
        : null
      : undefined;

  const person = await prisma.people.update({
    where: { id },
    data: {
      ...(data.fullName != null && { fullName: data.fullName }),
      ...(data.birthDate !== undefined && { birthDate }),
      ...(data.phone !== undefined && { phone: data.phone }),
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
    },
    include: { worker: true },
  });

  res.json(person);
}
