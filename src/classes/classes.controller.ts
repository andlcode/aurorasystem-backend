import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createClassSchema,
  patchClassSchema,
  addMemberSchema,
  openSessionSchema,
  listSessionsQuerySchema,
} from "./classes.dto";
import {
  getLocalDateStringAmericaBahia,
  normalizeDateOnly,
} from "../utils/dateUtils";
import type { ClassStatus } from "@prisma/client";

export async function createClass(req: Request, res: Response) {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;

  const owner = await prisma.people.findUnique({
    where: { id: data.ownerWorkerId },
    include: { worker: true },
  });
  if (!owner?.worker) {
    res.status(400).json({ error: "ownerWorkerId deve ser uma pessoa do tipo worker" });
    return;
  }

  const createdBy = req.userId ?? null;

  const class_ = await prisma.class.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime ?? null,
      ownerWorkerId: data.ownerWorkerId,
      createdBy,
    },
    include: { owner: { include: { worker: true } } },
  });

  res.status(201).json(class_);
}

export async function listClasses(req: Request, res: Response) {
  const role = req.userRole!;
  const userId = req.userId!;

  const where =
    role === "worker"
      ? { ownerWorkerId: userId }
      : {};

  const classes = await prisma.class.findMany({
    where,
    include: { owner: { include: { worker: true } } },
    orderBy: { name: "asc" },
  });

  res.json(classes);
}

export async function patchClass(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = patchClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;
  const role = req.userRole!;

  const existing = await prisma.class.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Turma não encontrada" });
    return;
  }

  if (data.ownerWorkerId != null && role !== "admin" && role !== "super_admin") {
    res.status(403).json({ error: "Somente admin pode trocar o owner da turma" });
    return;
  }

  if (data.ownerWorkerId != null) {
    const owner = await prisma.people.findUnique({
      where: { id: data.ownerWorkerId },
      include: { worker: true },
    });
    if (!owner?.worker) {
      res.status(400).json({
        error: "ownerWorkerId deve ser uma pessoa do tipo worker",
      });
      return;
    }
  }

  const class_ = await prisma.class.update({
    where: { id },
    data: {
      ...(data.name != null && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.dayOfWeek != null && { dayOfWeek: data.dayOfWeek }),
      ...(data.startTime != null && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.ownerWorkerId != null && { ownerWorkerId: data.ownerWorkerId }),
      ...(data.status != null && { status: data.status as ClassStatus }),
    },
    include: { owner: { include: { worker: true } } },
  });

  res.json(class_);
}

export async function addMember(req: Request, res: Response) {
  const { id: classId } = req.params;
  const parsed = addMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { personId, active } = parsed.data;

  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) {
    res.status(404).json({ error: "Turma não encontrada" });
    return;
  }

  const person = await prisma.people.findUnique({ where: { id: personId } });
  if (!person) {
    res.status(404).json({ error: "Pessoa não encontrada" });
    return;
  }

  const existing = await prisma.classMembership.findUnique({
    where: { classId_personId: { classId, personId } },
  });

  if (existing) {
    const updated = await prisma.classMembership.update({
      where: { classId_personId: { classId, personId } },
      data: { active },
      include: { person: true },
    });
    res.json(updated);
    return;
  }

  const membership = await prisma.classMembership.create({
    data: { classId, personId, active },
    include: { person: true },
  });

  res.status(201).json(membership);
}

export async function listMembers(req: Request, res: Response) {
  const { id: classId } = req.params;

  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) {
    res.status(404).json({ error: "Turma não encontrada" });
    return;
  }

  const memberships = await prisma.classMembership.findMany({
    where: {
      classId,
      person: { type: "participant" },
    },
    include: { person: true },
    orderBy: { person: { fullName: "asc" } },
  });

  const members = memberships.map((m) => ({
    ...m.person,
    active: m.active,
    sinceDate: m.sinceDate,
  }));

  res.json(members);
}

export async function removeMember(req: Request, res: Response) {
  const { id: classId, personId } = req.params;

  const membership = await prisma.classMembership.findUnique({
    where: { classId_personId: { classId, personId } },
  });

  if (!membership) {
    res.status(404).json({ error: "Participante não encontrado na turma" });
    return;
  }

  await prisma.classMembership.update({
    where: { classId_personId: { classId, personId } },
    data: { active: false },
  });

  res.status(204).send();
}

export async function openSession(req: Request, res: Response) {
  const { id: classId } = req.params;
  const parsed = openSessionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  const dateString = parsed.data.date ?? getLocalDateStringAmericaBahia();
  const sessionDate = normalizeDateOnly(dateString);
  const createdBy = req.userId!;

  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) {
    res.status(404).json({ error: "Turma não encontrada" });
    return;
  }

  const session = await prisma.classSession.upsert({
    where: {
      classId_sessionDate: { classId, sessionDate },
    },
    create: {
      classId,
      sessionDate,
      createdBy,
    },
    update: {},
    include: { class_: true },
  });

  const activeMembers = await prisma.classMembership.findMany({
    where: {
      classId,
      active: true,
      person: { type: "participant" },
    },
    include: { person: true },
    orderBy: { person: { fullName: "asc" } },
  });

  const members = activeMembers.map((m) => ({
    ...m.person,
    active: m.active,
    sinceDate: m.sinceDate,
  }));

  res.status(201).json({
    ...session,
    members,
  });
}

export async function listSessions(req: Request, res: Response) {
  const { id: classId } = req.params;
  const parsed = listSessionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { month } = parsed.data;

  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) {
    res.status(404).json({ error: "Turma não encontrada" });
    return;
  }

  const sessions = await prisma.classSession.findMany({
    where: {
      classId,
      sessionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { class_: true },
    orderBy: { sessionDate: "asc" },
  });

  const sessionsWithCalculated = sessions.map((s) => {
    const d = s.sessionDate;
    const day = d.getUTCDate();
    const monthVal = d.getUTCMonth() + 1;
    const yearVal = d.getUTCFullYear();
    const weekOfMonth = Math.floor((day - 1) / 7) + 1;

    return {
      ...s,
      month: monthVal,
      year: yearVal,
      weekOfMonth,
    };
  });

  res.json(sessionsWithCalculated);
}
