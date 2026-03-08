"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchTeamMemberSchema = exports.listTeamQuerySchema = exports.createTeamMemberSchema = void 0;
const zod_1 = require("zod");
const roles_1 = require("../constants/roles");
const workerRoleSchema = zod_1.z.enum(roles_1.WORKER_ROLE_VALUES);
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
    role: workerRoleSchema.default(roles_1.EVANGELIZADOR_ROLE),
});
exports.listTeamQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
});
const patchRoleSchema = zod_1.z.enum(roles_1.WORKER_ROLE_VALUES);
exports.patchTeamMemberSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1).optional(),
    email: zod_1.z.preprocess((v) => (v === "" ? null : v), zod_1.z.string().email().optional().nullable()),
    status: personStatusSchema.optional(),
    role: patchRoleSchema.optional(),
});
//# sourceMappingURL=team.dto.js.map