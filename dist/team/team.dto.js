"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchTeamMemberSchema = exports.listTeamQuerySchema = exports.createTeamMemberSchema = void 0;
const zod_1 = require("zod");
const workerRoleSchema = zod_1.z.enum(["evangelizador", "worker"]);
const personStatusSchema = zod_1.z.enum(["active", "inactive"]);
const passwordStrength = zod_1.z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[a-zA-Z]/, "Senha deve conter letras")
    .regex(/\d/, "Senha deve conter números");
exports.createTeamMemberSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Nome é obrigatório"),
    email: zod_1.z.preprocess((v) => (v === "" ? undefined : v), zod_1.z.string().email().optional()),
    username: zod_1.z.string().min(1, "Username é obrigatório"),
    password: passwordStrength,
    function: zod_1.z.string().min(1, "Função é obrigatória"),
    role: workerRoleSchema.default("worker"),
});
exports.listTeamQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
});
const patchRoleSchema = zod_1.z.enum(["super_admin", "evangelizador", "worker"]);
exports.patchTeamMemberSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1).optional(),
    email: zod_1.z.preprocess((v) => (v === "" ? null : v), zod_1.z.string().email().optional().nullable()),
    status: personStatusSchema.optional(),
    function: zod_1.z.string().min(1).optional(),
    role: patchRoleSchema.optional(),
}).refine((data) => data.role !== "super_admin", { message: "Não é possível alterar role para super_admin via edição", path: ["role"] });
//# sourceMappingURL=team.dto.js.map