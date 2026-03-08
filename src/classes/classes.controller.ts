import type { Request, Response } from "express";
import {
  createClassSchema,
  patchClassSchema,
  addParticipantSchema,
  openSessionSchema,
  listSessionsQuerySchema,
  createOrGetSessionSchema,
  putBulkAttendanceSchema,
} from "./classes.dto";
import { getLocalDateStringAmericaBahia } from "../utils/dateUtils";
import * as classesService from "./classes.service";

export async function listResponsibles(req: Request, res: Response) {
  try {
    const responsibles = await classesService.listResponsibles();
    console.log("[Classes] GET /classes/responsibles retorno:", responsibles);
    res.json(responsibles);
  } catch (err) {
    console.error("[Classes] Erro ao listar responsáveis:", err);
    res.status(500).json({ error: "Erro ao carregar responsáveis disponíveis" });
  }
}

export async function createClass(req: Request, res: Response) {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  try {
    console.log("[Classes] POST /classes payload:", parsed.data);
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
  try {
    console.log("[Classes] Entrada na rota GET /classes", {
      userRole: req.userRole,
      userId: req.userId,
    });

    if (!req.userId) {
      res.status(401).json({ error: "Autenticação necessária" });
      return;
    }

    const classes = await classesService.listClasses(req.userRole! as import("@prisma/client").UserRole, req.userId!);
    console.log("[Classes] GET /classes retorno:", classes);
    res.json(classes);
  } catch (err) {
    console.error("[Classes] Erro detalhado ao listar turmas:", err);
    res.status(500).json({ error: "Erro ao carregar turmas" });
  }
}

export async function getTodayClass(req: Request, res: Response) {
  try {
    const personId = req.userId;

    if (!personId) {
      res.status(401).json({ error: "Autenticação necessária" });
      return;
    }

    const class_ = await classesService.getTodayClassForResponsible(personId);
    res.json(class_ ?? null);
  } catch (err) {
    console.error("[Classes] Erro ao buscar turma de hoje:", err);
    res.status(500).json({ error: "Não foi possível verificar a turma de hoje." });
  }
}

export async function getClassById(req: Request, res: Response) {
  const { id: classId } = req.params;
  const role = req.userRole!;
  const personId = req.userId!;

  const result = await classesService.getClassById(classId, role, personId);
  if (result.status === "not_found") {
    res.status(404).json({ error: "Turma não encontrada" });
    return;
  }
  if (result.status === "forbidden") {
    res.status(403).json({ error: "Sem permissão para acessar esta turma" });
    return;
  }
  res.json(result.class);
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
    console.log("[Classes] GET /classes/:id/participants", { classId });
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
    console.log("[Classes] POST /classes/:id/sessions/open", { classId, dateString });
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

export async function createOrGetSession(req: Request, res: Response) {
  const { id: classId } = req.params;
  const parsed = createOrGetSessionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  if (!req.userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  const dateString = parsed.data.date;

  try {
    console.log("[Classes] POST /classes/:id/sessions", { classId, dateString });
    const session = await classesService.openSession(
      classId,
      dateString,
      req.userId
    );
    res.status(201).json(session);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao abrir sessão";
    console.error("[Classes] Erro ao criar/obter sessão:", err);
    res.status(404).json({ error: msg });
  }
}

export async function getSessionById(req: Request, res: Response) {
  const { id: classId, sessionId } = req.params;

  try {
    const session = await classesService.getSessionById(classId, sessionId);
    if (!session) {
      res.status(404).json({ error: "Sessão não encontrada" });
      return;
    }
    res.json(session);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao buscar sessão";
    console.error("[Classes] Erro ao buscar sessão:", err);
    res.status(404).json({ error: msg });
  }
}

export async function putBulkAttendance(req: Request, res: Response) {
  const { id: classId, sessionId } = req.params;
  const parsed = putBulkAttendanceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  try {
    const result = await classesService.putBulkAttendance(
      classId,
      sessionId,
      parsed.data.records.map((r) => ({
        participantId: r.participantId,
        status: r.status,
        notes: r.notes,
      })),
      req.userId!
    );
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao salvar presença";
    const status = msg.includes("não encontrad") ? 404 : 400;
    res.status(status).json({ error: msg });
  }
}
