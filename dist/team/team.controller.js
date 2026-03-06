"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTeamResponsibles = listTeamResponsibles;
exports.listTeam = listTeam;
exports.createTeamMember = createTeamMember;
exports.getTeamMemberById = getTeamMemberById;
exports.patchTeamMember = patchTeamMember;
const prisma_1 = require("../lib/prisma");
const hash_1 = require("../utils/hash");
const team_dto_1 = require("./team.dto");
async function listTeamResponsibles(req, res) {
    const responsibles = await prisma_1.prisma.people.findMany({
        where: {
            type: "worker",
            worker: {
                role: { in: ["evangelizador", "super_admin"] },
            },
        },
        include: { worker: true },
        orderBy: { fullName: "asc" },
    });
    res.json(responsibles.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        role: p.worker?.role,
    })));
}
async function listTeam(req, res) {
    const parsed = team_dto_1.listTeamQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const { q } = parsed.data;
    const where = {
        type: "worker",
        ...(q?.trim() && {
            OR: [
                { fullName: { contains: q.trim(), mode: "insensitive" } },
                { email: { contains: q.trim(), mode: "insensitive" } },
            ],
        }),
    };
    const members = await prisma_1.prisma.people.findMany({
        where,
        include: { worker: true, authUser: true },
        orderBy: { fullName: "asc" },
    });
    res.json(members);
}
async function createTeamMember(req, res) {
    const parsed = team_dto_1.createTeamMemberSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const data = parsed.data;
    const existing = await prisma_1.prisma.authUser.findFirst({
        where: {
            OR: [
                { username: { equals: data.username, mode: "insensitive" } },
                ...(data.email ? [{ email: data.email }] : []),
            ],
        },
    });
    if (existing) {
        res.status(409).json({ error: "Username ou e-mail já cadastrado" });
        return;
    }
    const passwordHash = await (0, hash_1.hashPassword)(data.password);
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const person = await tx.people.create({
            data: {
                fullName: data.fullName,
                email: data.email ?? null,
                type: "worker",
                worker: {
                    create: {
                        function: data.function,
                        role: data.role,
                    },
                },
            },
            include: { worker: true },
        });
        await tx.authUser.create({
            data: {
                username: data.username,
                email: data.email ?? null,
                passwordHash,
                personId: person.id,
            },
        });
        return person;
    });
    const created = await prisma_1.prisma.people.findUnique({
        where: { id: result.id },
        include: { worker: true, authUser: true },
    });
    res.status(201).json(created);
}
async function getTeamMemberById(req, res) {
    const { id } = req.params;
    const person = await prisma_1.prisma.people.findUnique({
        where: { id },
        include: { worker: true, authUser: true },
    });
    if (!person || person.type !== "worker") {
        res.status(404).json({ error: "Membro da equipe não encontrado" });
        return;
    }
    res.json(person);
}
async function patchTeamMember(req, res) {
    const { id } = req.params;
    const parsed = team_dto_1.patchTeamMemberSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const data = parsed.data;
    const existing = await prisma_1.prisma.people.findUnique({
        where: { id },
        include: { worker: true, authUser: true },
    });
    if (!existing || existing.type !== "worker") {
        res.status(404).json({ error: "Membro da equipe não encontrado" });
        return;
    }
    const updates = {
        ...(data.fullName != null && { fullName: data.fullName }),
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
    };
    const person = await prisma_1.prisma.people.update({
        where: { id },
        data: updates,
        include: { worker: true, authUser: true },
    });
    if (data.status === "inactive" && existing.authUser) {
        await prisma_1.prisma.authUser.update({
            where: { id: existing.authUser.id },
            data: { isActive: false },
        });
    }
    else if (data.status === "active" && existing.authUser) {
        await prisma_1.prisma.authUser.update({
            where: { id: existing.authUser.id },
            data: { isActive: true },
        });
    }
    const updated = await prisma_1.prisma.people.findUnique({
        where: { id },
        include: { worker: true, authUser: true },
    });
    res.json(updated);
}
//# sourceMappingURL=team.controller.js.map