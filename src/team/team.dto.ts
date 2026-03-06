import { z } from "zod";

const workerRoleSchema = z.enum(["evangelizador", "worker"]);
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
  function: z.string().min(1, "Função é obrigatória"),
  role: workerRoleSchema.default("worker"),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;

export const listTeamQuerySchema = z.object({
  q: z.string().optional(),
});

export type ListTeamQuery = z.infer<typeof listTeamQuerySchema>;

const patchRoleSchema = z.enum(["super_admin", "evangelizador", "worker"]);

export const patchTeamMemberSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.preprocess((v) => (v === "" ? null : v), z.string().email().optional().nullable()),
  status: personStatusSchema.optional(),
  function: z.string().min(1).optional(),
  role: patchRoleSchema.optional(),
}).refine(
  (data) => data.role !== "super_admin",
  { message: "Não é possível alterar role para super_admin via edição", path: ["role"] }
);

export type PatchTeamMemberInput = z.infer<typeof patchTeamMemberSchema>;
