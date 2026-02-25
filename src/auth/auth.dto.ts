import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username ou e-mail é obrigatório"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const passwordStrength = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[a-zA-Z]/, "Senha deve conter letras")
  .regex(/\d/, "Senha deve conter números");

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: passwordStrength,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
