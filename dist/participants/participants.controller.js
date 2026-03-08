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
exports.createParticipant = createParticipant;
exports.listParticipants = listParticipants;
exports.getParticipantById = getParticipantById;
exports.patchParticipant = patchParticipant;
exports.patchParticipantStatus = patchParticipantStatus;
exports.assignParticipantClass = assignParticipantClass;
const prisma_1 = require("../lib/prisma");
const classesService = __importStar(require("../classes/classes.service"));
const participants_dto_1 = require("./participants.dto");
const participantWithClassesInclude = {
    classParticipants: {
        where: { status: "active" },
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
        orderBy: { class_: { name: "asc" } },
    },
    attendances: {
        take: 1,
        orderBy: {
            session: {
                sessionDate: "desc",
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
function serializeParticipant(p) {
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
async function createParticipant(req, res) {
    const parsed = participants_dto_1.createParticipantSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const data = parsed.data;
    const participant = await prisma_1.prisma.participant.create({
        data: {
            name: data.name,
            email: data.email ?? null,
            phone: data.phone ?? null,
            status: "active",
        },
    });
    res.status(201).json(participant);
}
async function listParticipants(req, res) {
    const parsed = participants_dto_1.listParticipantsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const { q, status } = parsed.data;
    const where = {};
    if (status)
        where.status = status;
    if (q?.trim()) {
        const term = q.trim();
        where.OR = [
            { name: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } },
        ];
    }
    const participants = await prisma_1.prisma.participant.findMany({
        where,
        include: participantWithClassesInclude,
        orderBy: { name: "asc" },
    });
    res.json(participants.map(serializeParticipant));
}
async function getParticipantById(req, res) {
    const { id } = req.params;
    const participant = await prisma_1.prisma.participant.findUnique({
        where: { id },
        include: participantWithClassesInclude,
    });
    if (!participant) {
        res.status(404).json({ error: "Participante não encontrado" });
        return;
    }
    res.json(serializeParticipant(participant));
}
async function patchParticipant(req, res) {
    const { id } = req.params;
    const parsed = participants_dto_1.patchParticipantSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const data = parsed.data;
    const existing = await prisma_1.prisma.participant.findUnique({
        where: { id },
        include: participantWithClassesInclude,
    });
    if (!existing) {
        res.status(404).json({ error: "Participante não encontrado" });
        return;
    }
    const participant = await prisma_1.prisma.participant.update({
        where: { id },
        data: {
            ...(data.name != null && { name: data.name }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.status != null && { status: data.status }),
        },
        include: participantWithClassesInclude,
    });
    res.json(serializeParticipant(participant));
}
async function patchParticipantStatus(req, res) {
    const { id } = req.params;
    const parsed = participants_dto_1.patchParticipantStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const existing = await prisma_1.prisma.participant.findUnique({
        where: { id },
        include: participantWithClassesInclude,
    });
    if (!existing) {
        res.status(404).json({ error: "Aluno não encontrado" });
        return;
    }
    const updated = await prisma_1.prisma.participant.update({
        where: { id },
        data: { status: parsed.data.status },
        include: participantWithClassesInclude,
    });
    res.json(serializeParticipant(updated));
}
async function assignParticipantClass(req, res) {
    const { id } = req.params;
    const parsed = participants_dto_1.assignParticipantClassSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const participant = await prisma_1.prisma.participant.findUnique({
        where: { id },
        include: participantWithClassesInclude,
    });
    if (!participant) {
        res.status(404).json({ error: "Aluno não encontrado" });
        return;
    }
    try {
        await classesService.addParticipant(parsed.data.classId, { participantId: id }, { closeExistingMemberships: true });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao vincular aluno à turma";
        const status = msg.includes("não encontrad")
            ? 404
            : msg.includes("já vinculado")
                ? 409
                : 400;
        res.status(status).json({ error: msg, message: msg });
        return;
    }
    const updated = await prisma_1.prisma.participant.findUnique({
        where: { id },
        include: participantWithClassesInclude,
    });
    if (!updated) {
        res.status(404).json({ error: "Aluno não encontrado" });
        return;
    }
    res.json(serializeParticipant(updated));
}
//# sourceMappingURL=participants.controller.js.map