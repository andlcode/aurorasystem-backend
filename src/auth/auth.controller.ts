import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/hash";
import { generateResetToken, hashToken } from "../utils/tokenHash";
import { emailService } from "../services/EmailService";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerSchema,
} from "./auth.dto";
import type { UserRole } from "@prisma/client";
import { EVANGELIZADOR_ROLE } from "../constants/roles";

const JWT_EXPIRES_IN = "7d";

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { username, password } = parsed.data;

  const user = await prisma.user.findFirst({
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

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  await prisma.user.update({
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

  const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });

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

export async function forgotPassword(req: Request, res: Response) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { usernameOrEmail } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: usernameOrEmail, mode: "insensitive" } },
        { email: { equals: usernameOrEmail, mode: "insensitive" } },
      ],
      status: "active",
    },
  });

  res.status(200).json({
    message:
      "Se o usuário existir, você receberá um e-mail com instruções para redefinir sua senha.",
  });

  if (!user) return;

  const emailTo = user.email;
  if (!emailTo) {
    return;
  }

  const token = generateResetToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  let frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Auth] FRONTEND_URL não configurado em produção. Links de reset usarão fallback localhost.");
    }
    frontendUrl = "http://localhost:5173";
  }
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await emailService.sendPasswordResetEmail(emailTo, resetLink);
}

export async function resetPassword(req: Request, res: Response) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { token, newPassword } = parsed.data;

  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
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

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  res.status(200).json({
    message: "Senha alterada com sucesso. Faça login com a nova senha.",
  });
}

export async function register(req: Request, res: Response) {
  console.log("[Auth] POST /auth/register - requisição recebida");
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log("[Auth] POST /auth/register - validação falhou:", parsed.error.errors);
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const data = parsed.data;

  const existing = await prisma.user.findFirst({
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
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.fullName,
      username: data.username,
      email: data.email ?? null,
      passwordHash,
      role: (data.role ?? EVANGELIZADOR_ROLE) as UserRole,
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
