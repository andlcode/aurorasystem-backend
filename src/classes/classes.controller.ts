import type { Request, Response } from "express";
import {
  createClassSchema,
  patchClassSchema,
  addParticipantSchema,
  openSessionSchema,
  listSessionsQuerySchema,
} from "./classes.dto";
import { getLocalDateStringAmericaBahia } from "../utils/dateUtils";
import * as classesService from "./classes.service";

export async function listResponsibles(req: Request, res: Response) {
  const responsibles = await classesService.listResponsibles();
  res.json(responsibles);
}

export async function createClass(req: Request, res: Response) {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  try {
    const class_ = await classesService.createClass(
      parsed.data,
      req.userId ?? null
    );
    res.status(201).json(class_);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao criar turma";
    res.status(400).json({ error: msg });
  }
}

export async function listClasses(req: Request, res: Response) {
  const role = req.userRole!;
  const personId = req.userId!;

  const classes = await classesService.listClasses(role, personId);
  res.json(classes);
}

export async function getClassById(req: Request, res: Response) {
  const { id: classId } = req.params;
  const role = req.userRole!;
  const personId = req.userId!;

  const class_ = await classesService.getClassById(classId, role, personId);
  if (!class_) {
    res.status(404).json({ error: "Turma não encontrada" });
    return;
  }
  res.json(class_);
}

export async function patchClass(req: Request, res: Response) {
  const { id: classId } = req.params;
  const parsed = patchClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  try {
    const class_ = await classesService.patchClass(
      classId,
      parsed.data,
      req.userRole!,
      req.userId!
    );
    if (!class_) {
      res.status(404).json({ error: "Turma não encontrada" });
      return;
    }
    res.json(class_);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao atualizar turma";
    res.status(err instanceof Error && msg.includes("permissão") ? 403 : 400).json({
      error: msg,
    });
  }
}

export async function addParticipant(req: Request, res: Response) {
  const { id: classId } = req.params;
  const parsed = addParticipantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  try {
    const cp = await classesService.addParticipant(classId, parsed.data);
    res.status(201).json(cp);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao vincular participante";
    const status = msg.includes("não encontrad") ? 404 : 400;
    res.status(status).json({ error: msg });
  }
}

export async function removeParticipant(req: Request, res: Response) {
  const { id: classId, participantId } = req.params;

  try {
    await classesService.removeParticipant(classId, participantId);
    res.status(204).send();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao remover participante";
    res.status(404).json({ error: msg });
  }
}

export async function listParticipants(req: Request, res: Response) {
  const { id: classId } = req.params;

  try {
    const participants = await classesService.listParticipants(classId);
    res.json(participants);
  } catch {
    res.status(404).json({ error: "Turma não encontrada" });
  }
}

export async function openSession(req: Request, res: Response) {
  const { id: classId } = req.params;
  const parsed = openSessionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  const dateString = parsed.data.date ?? getLocalDateStringAmericaBahia();

  try {
    const session = await classesService.openSession(
      classId,
      dateString,
      req.userId!
    );
    res.status(201).json(session);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao abrir sessão";
    res.status(404).json({ error: msg });
  }
}

export async function listSessions(req: Request, res: Response) {
  const { id: classId } = req.params;
  const parsed = listSessionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  try {
    const sessions = await classesService.listSessions(classId, parsed.data.month);
    res.json(sessions);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao listar sessões";
    res.status(404).json({ error: msg });
  }
}
