import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { putAttendanceSchema } from "./sessions.dto";
import type { AttendanceStatus } from "@prisma/client";

export async function putAttendance(req: Request, res: Response) {
  const { sessionId } = req.params;
  const parsed = putAttendanceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { participantId, status } = parsed.data;
  const justificationReason =
    status === "justified" ? parsed.data.justificationReason! : null;
  const recordedBy = req.userId!;

  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: { class_: true },
  });
  if (!session) {
    res.status(404).json({ error: "Sessão não encontrada" });
    return;
  }

  const participant = await prisma.people.findUnique({
    where: { id: participantId },
  });
  if (!participant) {
    res.status(404).json({ error: "Participante não encontrado" });
    return;
  }
  if (participant.type !== "participant") {
    res.status(400).json({
      error: "participantId deve ser uma pessoa do tipo participant",
    });
    return;
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      sessionId_participantId: { sessionId, participantId },
    },
    create: {
      sessionId,
      participantId,
      status: status as AttendanceStatus,
      justificationReason,
      recordedBy,
    },
    update: {
      status: status as AttendanceStatus,
      justificationReason,
      recordedBy,
    },
    include: {
      participant: true,
      recorder: true,
    },
  });

  res.json(attendance);
}

export async function listAttendance(req: Request, res: Response) {
  const { sessionId } = req.params;

  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: { class_: true },
  });
  if (!session) {
    res.status(404).json({ error: "Sessão não encontrada" });
    return;
  }

  const attendances = await prisma.attendance.findMany({
    where: { sessionId },
    include: { participant: true, recorder: true },
    orderBy: { participant: { fullName: "asc" } },
  });

  const total = attendances.length;
  const present = attendances.filter((a) => a.status === "present").length;
  const absent = attendances.filter((a) => a.status === "absent").length;
  const justified = attendances.filter((a) => a.status === "justified").length;

  res.json({
    items: attendances,
    total,
    present,
    absent,
    justified,
  });
}
