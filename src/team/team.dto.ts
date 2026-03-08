import { z } from "zod";
import {
  EVANGELIZADOR_ROLE,
  WORKER_ROLE_VALUES,
} from "../constants/roles";

const workerRoleSchema = z.enum(WORKER_ROLE_VALUES);
const personStatusSchema = z.enum(["active", "inactive"]);

const passwordStrength = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[a-zA-Z]/, "Senha deve conter letras")
  .regex(/\d/, "Senha deve conter números");

export const createTeamMemberSchema = z.object({
  fullName: z.string().min(1, "Nome é obrigatório"),
  email: z.preprocess((v) => (v === "" ? undefined : v), z.string().email().optional()),
  username: z.string().min(1, "Username é obrigatório"),
  password: passwordStrength,
  role: workerRoleSchema.default(EVANGELIZADOR_ROLE),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;

export const listTeamQuerySchema = z.object({
  q: z.string().optional(),
});

export type ListTeamQuery = z.infer<typeof listTeamQuerySchema>;

const patchRoleSchema = z.enum(WORKER_ROLE_VALUES);

export const patchTeamMemberSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.preprocess((v) => (v === "" ? null : v), z.string().email().optional().nullable()),
  status: personStatusSchema.optional(),
  role: patchRoleSchema.optional(),
});

export type PatchTeamMemberInput = z.infer<typeof patchTeamMemberSchema>;
