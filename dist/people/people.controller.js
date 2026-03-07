"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPeople = createPeople;
exports.listPeople = listPeople;
exports.listResponsaveis = listResponsaveis;
exports.getPeopleById = getPeopleById;
exports.patchPeople = patchPeople;
exports.patchPeopleStatus = patchPeopleStatus;
exports.assignParticipantClass = assignParticipantClass;
const prisma_1 = require("../lib/prisma");
const classesService = __importStar(require("../classes/classes.service"));
const people_dto_1 = require("./people.dto");
const RESPONSIBLE_ROLE_LABELS = {
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
                name: "asc",
            },
        },
    },
};
function serializePerson(person) {
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
async function createPeople(req, res) {
    const parsed = people_dto_1.createPeopleSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const data = parsed.data;
    const birthDate = data.birthDate
        ? new Date(data.birthDate + "T00:00:00.000Z")
        : null;
    const person = await prisma_1.prisma.people.create({
        data: {
            fullName: data.fullName,
            birthDate,
            phone: data.phone ?? null,
            email: data.email ?? null,
            type: data.type,
            status: (data.status ?? "active"),
            ...(data.type === "worker" && {
                worker: {
                    create: {
                        function: data.function,
                        role: (data.role ?? "worker"),
                    },
                },
            }),
        },
        include: { worker: true },
    });
    res.status(201).json(person);
}
async function listPeople(req, res) {
    const parsed = people_dto_1.listPeopleQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const { type, q } = parsed.data;
    const where = {};
    if (type) {
        where.type = type;
    }
    if (q && q.trim()) {
        const term = q.trim().toLowerCase();
        where.OR = [
            { fullName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } },
        ];
    }
    const people = await prisma_1.prisma.people.findMany({
        where,
        include: peopleWithClassesInclude,
        orderBy: { fullName: "asc" },
    });
    res.json(people.map(serializePerson));
}
async function listResponsaveis(req, res) {
    const responsaveis = await prisma_1.prisma.people.findMany({
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
                    in: ["super_admin", "evangelizador", "worker"],
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
    res.json(responsaveis.map((person) => ({
        id: person.id,
        name: person.fullName,
        email: person.email ?? person.authUser?.email ?? null,
        role: person.worker ? RESPONSIBLE_ROLE_LABELS[person.worker.role] : null,
    })));
}
async function getPeopleById(req, res) {
    const { id } = req.params;
    const person = await prisma_1.prisma.people.findUnique({
        where: { id },
        include: peopleWithClassesInclude,
    });
    if (!person) {
        res.status(404).json({ error: "Pessoa não encontrada" });
        return;
    }
    res.json(serializePerson(person));
}
async function patchPeople(req, res) {
    const { id } = req.params;
    const parsed = people_dto_1.patchPeopleSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const data = parsed.data;
    const userRole = req.userRole;
    const existing = await prisma_1.prisma.people.findUnique({
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
    const birthDate = data.birthDate !== undefined
        ? data.birthDate
            ? new Date(data.birthDate + "T00:00:00.000Z")
            : null
        : undefined;
    const person = await prisma_1.prisma.people.update({
        where: { id },
        data: {
            ...(data.fullName != null && { fullName: data.fullName }),
            ...(data.birthDate !== undefined && { birthDate }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.status != null && { status: data.status }),
            ...(existing.worker &&
                (data.function != null || data.role != null) && {
                worker: {
                    update: {
                        ...(data.function != null && { function: data.function }),
                        ...(data.role != null && { role: data.role }),
                    },
                },
            }),
        },
        include: peopleWithClassesInclude,
    });
    res.json(serializePerson(person));
}
async function patchPeopleStatus(req, res) {
    const { id } = req.params;
    const parsed = people_dto_1.patchPeopleStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const existing = await prisma_1.prisma.people.findUnique({
        where: { id },
        include: peopleWithClassesInclude,
    });
    if (!existing || existing.type !== "participant") {
        res.status(404).json({ error: "Aluno não encontrado" });
        return;
    }
    const updated = await prisma_1.prisma.people.update({
        where: { id },
        data: { status: parsed.data.status },
        include: peopleWithClassesInclude,
    });
    res.json(serializePerson(updated));
}
async function assignParticipantClass(req, res) {
    const { id } = req.params;
    const parsed = people_dto_1.assignParticipantClassSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const participant = await prisma_1.prisma.people.findUnique({
        where: { id },
        include: peopleWithClassesInclude,
    });
    if (!participant || participant.type !== "participant") {
        res.status(404).json({ error: "Aluno não encontrado" });
        return;
    }
    try {
        await classesService.addParticipant(parsed.data.classId, { participantId: id });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao vincular aluno à turma";
        const status = msg.includes("não encontrad") ? 404 : 400;
        res.status(status).json({ error: msg });
        return;
    }
    const updated = await prisma_1.prisma.people.findUnique({
        where: { id },
        include: peopleWithClassesInclude,
    });
    if (!updated) {
        res.status(404).json({ error: "Aluno não encontrado" });
        return;
    }
    res.json(serializePerson(updated));
}
//# sourceMappingURL=people.controller.js.map