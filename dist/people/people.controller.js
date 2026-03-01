"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPeople = createPeople;
exports.listPeople = listPeople;
exports.patchPeople = patchPeople;
const prisma_1 = require("../lib/prisma");
const people_dto_1 = require("./people.dto");
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
        include: { worker: true },
        orderBy: { fullName: "asc" },
    });
    res.json(people);
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
        include: { worker: true },
    });
    res.json(person);
}
//# sourceMappingURL=people.controller.js.map