"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.register = register;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const hash_1 = require("../utils/hash");
const tokenHash_1 = require("../utils/tokenHash");
const EmailService_1 = require("../services/EmailService");
const auth_dto_1 = require("./auth.dto");
const JWT_EXPIRES_IN = "7d";
async function login(req, res) {
    const parsed = auth_dto_1.loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const { username, password } = parsed.data;
    const authUser = await prisma_1.prisma.authUser.findFirst({
        where: {
            username: { equals: username, mode: "insensitive" },
        },
        include: {
            person: {
                include: { worker: true },
            },
        },
    });
    if (!authUser) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
    }
    if (!authUser.isActive) {
        res.status(401).json({ error: "Usuário inativo" });
        return;
    }
    const valid = await (0, hash_1.verifyPassword)(password, authUser.passwordHash);
    if (!valid) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
    }
    if (!authUser.person.worker) {
        res.status(403).json({ error: "Pessoa não é um trabalhador" });
        return;
    }
    await prisma_1.prisma.authUser.update({
        where: { id: authUser.id },
        data: { lastLoginAt: new Date() },
    });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ error: "JWT_SECRET não configurado" });
        return;
    }
    const payload = {
        userId: authUser.id,
        personId: authUser.personId,
        role: authUser.person.worker.role,
    };
    const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
    res.json({
        token,
        user: {
            personId: authUser.personId,
            username: authUser.username,
            role: authUser.person.worker.role,
            fullName: authUser.person.fullName,
        },
    });
}
async function forgotPassword(req, res) {
    const parsed = auth_dto_1.forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const { usernameOrEmail } = parsed.data;
    const authUser = await prisma_1.prisma.authUser.findFirst({
        where: {
            OR: [
                { username: { equals: usernameOrEmail, mode: "insensitive" } },
                { email: { equals: usernameOrEmail, mode: "insensitive" } },
            ],
            isActive: true,
        },
        include: { person: true },
    });
    res.status(200).json({
        message: "Se o usuário existir, você receberá um e-mail com instruções para redefinir sua senha.",
    });
    if (!authUser)
        return;
    const emailTo = authUser.email ?? authUser.person.email;
    if (!emailTo) {
        return;
    }
    const token = (0, tokenHash_1.generateResetToken)();
    const tokenHash = (0, tokenHash_1.hashToken)(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    let frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
        if (process.env.NODE_ENV === "production") {
            console.error("[Auth] FRONTEND_URL não configurado em produção. Links de reset usarão fallback localhost.");
        }
        frontendUrl = "http://localhost:5173";
    }
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    await prisma_1.prisma.passwordResetToken.create({
        data: {
            userId: authUser.id,
            tokenHash,
            expiresAt,
        },
    });
    await EmailService_1.emailService.sendPasswordResetEmail(emailTo, resetLink);
}
async function resetPassword(req, res) {
    const parsed = auth_dto_1.resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const { token, newPassword } = parsed.data;
    const tokenHash = (0, tokenHash_1.hashToken)(token);
    const resetToken = await prisma_1.prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });
    if (!resetToken) {
        res.status(400).json({ error: "Token inválido ou expirado" });
        return;
    }
    if (resetToken.usedAt) {
        res.status(400).json({ error: "Token já utilizado" });
        return;
    }
    if (new Date() > resetToken.expiresAt) {
        res.status(400).json({ error: "Token expirado" });
        return;
    }
    const passwordHash = await (0, hash_1.hashPassword)(newPassword);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.authUser.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        }),
        prisma_1.prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { usedAt: new Date() },
        }),
    ]);
    res.status(200).json({
        message: "Senha alterada com sucesso. Faça login com a nova senha.",
    });
}
async function register(req, res) {
    const parsed = auth_dto_1.registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const data = parsed.data;
    const existing = await prisma_1.prisma.authUser.findFirst({
        where: {
            OR: [
                { username: { equals: data.username, mode: "insensitive" } },
                ...(data.email ? [{ email: data.email }, { person: { email: data.email } }] : []),
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
    res.status(201).json({
        user: {
            personId: result.id,
            username: data.username,
            role: result.worker.role,
            fullName: result.fullName,
        },
    });
}
//# sourceMappingURL=auth.controller.js.map