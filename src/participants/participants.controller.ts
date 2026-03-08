import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import * as classesService from "../classes/classes.service";
import {
  createParticipantSchema,
  listParticipantsQuerySchema,
  patchParticipantSchema,
  patchParticipantStatusSchema,
  assignParticipantClassSchema,
} from "./participants.dto";

const participantWithClassesInclude = {
  classParticipants: {
    where: { status: "active" as const },
    include: {
      class_: {
        select: {
          id: true,
          name: true,
          day: true,
          time: true,
        },
      },
    },
    orderBy: { class_: { name: "asc" as const } },
  },
  attendances: {
    take: 1,
    orderBy: {
      session: {
        sessionDate: "desc" as const,
      },
    },
    select: {
      session: {
        select: {
          sessionDate: true,
        },
      },
    },
  },
};

function serializeParticipant(p: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  classParticipants: Array<{
    class_: { id: string; name: string; day: number; time: string };
    createdAt: Date;
  }>;
  attendances: Array<{
    session: { sessionDate: Date };
  }>;
}) {
  return {
    id: p.id,
    fullName: p.name,
    name: p.name,
    email: p.email,
    phone: p.phone,
    status: p.status,
    notes: p.notes,
    classes: p.classParticipants.map((item) => ({
      id: item.class_.id,
      name: item.class_.name,
      day: item.class_.day,
      time: item.class_.time,
      linkedAt: item.createdAt,
    })),
    lastAttendanceDate: p.attendances[0]?.session.sessionDate ?? null,
  };
}

export async function createParticipant(req: Request, res: Response) {
  const parsed = createParticipantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;

  const participant = await prisma.participant.create({
    data: {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      status: "active",
    },
  });

  res.status(201).json(participant);
}

export async function listParticipants(req: Request, res: Response) {
  const parsed = listParticipantsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { q, status } = parsed.data;

  const where: { status?: "active" | "inactive"; OR?: Array<{ name?: object; email?: object; phone?: object }> } = {};
  if (status) where.status = status as "active" | "inactive";
  if (q?.trim()) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ];
  }

  const participants = await prisma.participant.findMany({
    where,
    include: participantWithClassesInclude,
    orderBy: { name: "asc" },
  });

  res.json(participants.map(serializeParticipant));
}

export async function getParticipantById(req: Request, res: Response) {
  const { id } = req.params;

  const participant = await prisma.participant.findUnique({
    where: { id },
    include: participantWithClassesInclude,
  });

  if (!participant) {
    res.status(404).json({ error: "Participante não encontrado" });
    return;
  }

  res.json(serializeParticipant(participant));
}

export async function patchParticipant(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = patchParticipantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;

  const existing = await prisma.participant.findUnique({
    where: { id },
    include: participantWithClassesInclude,
  });
  if (!existing) {
    res.status(404).json({ error: "Participante não encontrado" });
    return;
  }

  const participant = await prisma.participant.update({
    where: { id },
    data: {
      ...(data.name != null && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.status != null && { status: data.status as "active" | "inactive" }),
    },
    include: participantWithClassesInclude,
  });

  res.json(serializeParticipant(participant));
}

export async function patchParticipantStatus(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = patchParticipantStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  const existing = await prisma.participant.findUnique({
    where: { id },
    include: participantWithClassesInclude,
  });

  if (!existing) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  const updated = await prisma.participant.update({
    where: { id },
    data: { status: parsed.data.status as "active" | "inactive" },
    include: participantWithClassesInclude,
  });

  res.json(serializeParticipant(updated));
}

export async function assignParticipantClass(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = assignParticipantClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  const participant = await prisma.participant.findUnique({
    where: { id },
    include: participantWithClassesInclude,
  });

  if (!participant) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  try {
    await classesService.addParticipant(
      parsed.data.classId,
      { participantId: id },
      { closeExistingMemberships: true }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao vincular aluno à turma";
    const status = msg.includes("não encontrad")
      ? 404
      : msg.includes("já vinculado")
        ? 409
        : 400;
    res.status(status).json({ error: msg, message: msg });
    return;
  }

  const updated = await prisma.participant.findUnique({
    where: { id },
    include: participantWithClassesInclude,
  });

  if (!updated) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  res.json(serializeParticipant(updated));
}
