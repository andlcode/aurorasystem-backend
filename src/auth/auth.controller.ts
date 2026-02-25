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
} from "./auth.dto";

const JWT_EXPIRES_IN = "7d";

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { username, password } = parsed.data;

  const authUser = await prisma.authUser.findFirst({
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

  const valid = await verifyPassword(password, authUser.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  if (!authUser.person.worker) {
    res.status(403).json({ error: "Pessoa não é um trabalhador" });
    return;
  }

  await prisma.authUser.update({
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

  const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });

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

export async function forgotPassword(req: Request, res: Response) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
    return;
  }
  const { usernameOrEmail } = parsed.data;

  const authUser = await prisma.authUser.findFirst({
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
    message:
      "Se o usuário existir, você receberá um e-mail com instruções para redefinir sua senha.",
  });

  if (!authUser) return;

  const emailTo = authUser.email ?? authUser.person.email;
  if (!emailTo) {
    return;
  }

  const token = generateResetToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  await prisma.passwordResetToken.create({
    data: {
      userId: authUser.id,
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
    prisma.authUser.update({
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
