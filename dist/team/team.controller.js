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
    const responsibles = await prisma_1.prisma.user.findMany({
        where: {
            status: "active",
            role: { in: ["SUPER_ADMIN", "COORDENADOR", "EVANGELIZADOR"] },
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
        orderBy: { name: "asc" },
    });
    res.json(responsibles.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
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
        ...(q?.trim() && {
            OR: [
                { name: { contains: q.trim(), mode: "insensitive" } },
                { email: { contains: q.trim(), mode: "insensitive" } },
            ],
        }),
    };
    const members = await prisma_1.prisma.user.findMany({
        where,
        orderBy: { name: "asc" },
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
    const existing = await prisma_1.prisma.user.findFirst({
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
    const user = await prisma_1.prisma.user.create({
        data: {
            name: data.fullName,
            username: data.username,
            email: data.email ?? null,
            passwordHash,
            role: data.role,
            status: "active",
        },
    });
    res.status(201).json(user);
}
async function getTeamMemberById(req, res) {
    const { id } = req.params;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        res.status(404).json({ error: "Membro da equipe não encontrado" });
        return;
    }
    res.json(user);
}
async function patchTeamMember(req, res) {
    const { id } = req.params;
    const parsed = team_dto_1.patchTeamMemberSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const data = parsed.data;
    const existing = await prisma_1.prisma.user.findUnique({
        where: { id },
    });
    if (!existing) {
        res.status(404).json({ error: "Membro da equipe não encontrado" });
        return;
    }
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: {
            ...(data.fullName != null && { name: data.fullName }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.status != null && { status: data.status }),
            ...(data.role != null && { role: data.role }),
        },
    });
    res.json(user);
}
//# sourceMappingURL=team.controller.js.map