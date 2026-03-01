"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchPeopleSchema = exports.listPeopleQuerySchema = exports.createPeopleSchema = void 0;
const zod_1 = require("zod");
const personTypeEnum = zod_1.z.enum(["worker", "participant"]);
const personStatusEnum = zod_1.z.enum(["active", "inactive"]);
const workerRoleEnum = zod_1.z.enum(["super_admin", "admin", "worker"]);
const emailSchema = zod_1.z.string().email("Email inválido").optional().nullable();
const phoneSchema = zod_1.z.string().optional().nullable();
exports.createPeopleSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().min(1, "Nome é obrigatório"),
    birthDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD").optional().nullable(),
    phone: phoneSchema,
    email: emailSchema,
    type: personTypeEnum,
    function: zod_1.z.string().min(1).optional(),
    role: workerRoleEnum.optional(),
})
    .refine((data) => {
    if (data.type === "worker") {
        return data.function != null && data.function.trim() !== "";
    }
    return true;
}, { message: "function é obrigatório quando type=worker", path: ["function"] })
    .refine((data) => {
    if (data.type === "worker" && data.role === "super_admin")
        return false;
    return true;
}, { message: "Não é possível criar super_admin via API", path: ["role"] });
exports.listPeopleQuerySchema = zod_1.z.object({
    type: personTypeEnum.optional(),
    q: zod_1.z.string().optional(),
});
exports.patchPeopleSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().min(1).optional(),
    birthDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    phone: phoneSchema,
    email: emailSchema,
    status: personStatusEnum.optional(),
    function: zod_1.z.string().min(1).optional(),
    role: workerRoleEnum.optional(),
})
    .refine((data) => {
    if (data.role === "super_admin")
        return false;
    return true;
}, { message: "Não é possível promover para super_admin via PATCH", path: ["role"] });
//# sourceMappingURL=people.dto.js.map