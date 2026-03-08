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
const roles_1 = require("../constants/roles");
const JWT_EXPIRES_IN = "7d";
async function login(req, res) {
    const parsed = auth_dto_1.loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const { username, password } = parsed.data;
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            username: { equals: username, mode: "insensitive" },
        },
    });
    if (!user) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
    }
    if (user.status !== "active") {
        res.status(401).json({ error: "Usuário inativo" });
        return;
    }
    const valid = await (0, hash_1.verifyPassword)(password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
    }
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ error: "JWT_SECRET não configurado" });
        return;
    }
    const payload = {
        userId: user.id,
        role: user.role,
    };
    const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
    res.json({
        token,
        user: {
            userId: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
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
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            OR: [
                { username: { equals: usernameOrEmail, mode: "insensitive" } },
                { email: { equals: usernameOrEmail, mode: "insensitive" } },
            ],
            status: "active",
        },
    });
    res.status(200).json({
        message: "Se o usuário existir, você receberá um e-mail com instruções para redefinir sua senha.",
    });
    if (!user)
        return;
    const emailTo = user.email;
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
            userId: user.id,
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
        prisma_1.prisma.user.update({
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
    console.log("[Auth] POST /auth/register - requisição recebida");
    const parsed = auth_dto_1.registerSchema.safeParse(req.body);
    if (!parsed.success) {
        console.log("[Auth] POST /auth/register - validação falhou:", parsed.error.errors);
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
        console.log("[Auth] POST /auth/register - username ou e-mail já cadastrado:", data.username);
        res.status(409).json({ error: "Username ou e-mail já cadastrado" });
        return;
    }
    console.log("[Auth] POST /auth/register - criando usuário:", data.username);
    const passwordHash = await (0, hash_1.hashPassword)(data.password);
    const user = await prisma_1.prisma.user.create({
        data: {
            name: data.fullName,
            username: data.username,
            email: data.email ?? null,
            passwordHash,
            role: (data.role ?? roles_1.EVANGELIZADOR_ROLE),
            status: "active",
        },
    });
    console.log("[Auth] POST /auth/register - usuário criado com sucesso:", user.id, data.username);
    res.status(201).json({
        user: {
            userId: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
        },
    });
}
//# sourceMappingURL=auth.controller.js.map