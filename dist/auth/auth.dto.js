"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username é obrigatório"),
    password: zod_1.z.string().min(1, "Senha é obrigatória"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    usernameOrEmail: zod_1.z.string().min(1, "Username ou e-mail é obrigatório"),
});
const passwordStrength = zod_1.z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[a-zA-Z]/, "Senha deve conter letras")
    .regex(/\d/, "Senha deve conter números");
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token é obrigatório"),
    newPassword: passwordStrength,
});
const workerRoleSchema = zod_1.z.enum(["super_admin", "admin", "worker"]);
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1, "Nome completo é obrigatório"),
    username: zod_1.z.string().min(1, "Username é obrigatório"),
    email: zod_1.z.preprocess((v) => (v === "" ? undefined : v), zod_1.z.string().email().optional()),
    password: passwordStrength,
    function: zod_1.z.string().min(1, "Função é obrigatória"),
    role: workerRoleSchema.default("worker"),
});
//# sourceMappingURL=auth.dto.js.map