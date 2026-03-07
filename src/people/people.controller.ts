import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import * as classesService from "../classes/classes.service";
import {
  createPeopleSchema,
  listPeopleQuerySchema,
  patchPeopleSchema,
  patchPeopleStatusSchema,
  assignParticipantClassSchema,
} from "./people.dto";
import type { PersonType, Prisma, WorkerRole } from "@prisma/client";

const RESPONSIBLE_ROLE_LABELS: Record<WorkerRole, "super_admin" | "evangelizador" | "moderador"> = {
  super_admin: "super_admin",
  evangelizador: "evangelizador",
  worker: "moderador",
};

const peopleWithClassesInclude = {
  worker: true,
  classParticipants: {
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
    orderBy: {
      class_: {
        name: "asc" as const,
      },
    },
  },
};

type PersonWithClasses = Prisma.PeopleGetPayload<{
  include: typeof peopleWithClassesInclude;
}>;

function serializePerson(person: PersonWithClasses) {
  return {
    ...person,
    classes: person.classParticipants.map((item) => ({
      id: item.class_.id,
      name: item.class_.name,
      day: item.class_.day,
      time: item.class_.time,
      linkedAt: item.createdAt,
    })),
  };
}

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
      status: (data.status ?? "active") as "active" | "inactive",
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

  const where: Prisma.PeopleWhereInput = {};

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
    include: peopleWithClassesInclude,
    orderBy: { fullName: "asc" },
  });

  res.json(people.map(serializePerson));
}

export async function listResponsaveis(req: Request, res: Response) {
  const responsaveis = await prisma.people.findMany({
    where: {
      type: "worker",
      status: "active",
      authUser: {
        is: {
          isActive: true,
        },
      },
      worker: {
        role: {
          in: ["super_admin", "evangelizador", "worker"] as WorkerRole[],
        },
      },
    },
    include: {
      worker: true,
      authUser: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  res.json(
    responsaveis.map((person) => ({
      id: person.id,
      name: person.fullName,
      email: person.email ?? person.authUser?.email ?? null,
      role: person.worker ? RESPONSIBLE_ROLE_LABELS[person.worker.role] : null,
    }))
  );
}

export async function getPeopleById(req: Request, res: Response) {
  const { id } = req.params;

  const person = await prisma.people.findUnique({
    where: { id },
    include: peopleWithClassesInclude,
  });

  if (!person) {
    res.status(404).json({ error: "Pessoa não encontrada" });
    return;
  }

  res.json(serializePerson(person));
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
    include: peopleWithClassesInclude,
  });
  if (!existing) {
    res.status(404).json({ error: "Pessoa não encontrada" });
    return;
  }

  if (existing.type === "participant" && userRole !== "super_admin") {
    res.status(403).json({ error: "Somente super_admin pode editar participantes" });
    return;
  }

  if (!existing.worker && (data.function != null || data.role != null)) {
    res.status(400).json({
      error: "function e role só podem ser editados para pessoas do tipo worker",
    });
    return;
  }

  if (data.role === "evangelizador" && userRole !== "super_admin") {
    res.status(403).json({ error: "Somente super_admin pode promover para evangelizador" });
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
    include: peopleWithClassesInclude,
  });

  res.json(serializePerson(person));
}

export async function patchPeopleStatus(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = patchPeopleStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  const existing = await prisma.people.findUnique({
    where: { id },
    include: peopleWithClassesInclude,
  });

  if (!existing || existing.type !== "participant") {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  const updated = await prisma.people.update({
    where: { id },
    data: { status: parsed.data.status },
    include: peopleWithClassesInclude,
  });

  res.json(serializePerson(updated));
}

export async function assignParticipantClass(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = assignParticipantClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }

  const participant = await prisma.people.findUnique({
    where: { id },
    include: peopleWithClassesInclude,
  });

  if (!participant || participant.type !== "participant") {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  try {
    await classesService.addParticipant(parsed.data.classId, { participantId: id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao vincular aluno à turma";
    const status = msg.includes("não encontrad") ? 404 : 400;
    res.status(status).json({ error: msg });
    return;
  }

  const updated = await prisma.people.findUnique({
    where: { id },
    include: peopleWithClassesInclude,
  });

  if (!updated) {
    res.status(404).json({ error: "Aluno não encontrado" });
    return;
  }

  res.json(serializePerson(updated));
}
