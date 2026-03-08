"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignParticipantClassSchema = exports.patchPeopleStatusSchema = exports.patchPeopleSchema = exports.listPeopleQuerySchema = exports.createPeopleSchema = void 0;
const zod_1 = require("zod");
const roles_1 = require("../constants/roles");
const personTypeEnum = zod_1.z.enum(["worker", "participant"]);
const personStatusEnum = zod_1.z.enum(["active", "inactive"]);
const workerRoleEnum = zod_1.z.enum(roles_1.WORKER_ROLE_VALUES);
const emailSchema = zod_1.z.string().email("Email inválido").optional().nullable();
const phoneSchema = zod_1.z.string().optional().nullable();
exports.createPeopleSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().min(1, "Nome é obrigatório"),
    birthDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD").optional().nullable(),
    phone: phoneSchema,
    email: emailSchema,
    type: personTypeEnum,
    status: personStatusEnum.optional(),
    function: zod_1.z.string().min(1).optional(),
    role: workerRoleEnum.optional(),
})
    .refine((data) => {
    if (data.type === "worker") {
        return data.function != null && data.function.trim() !== "";
    }
    return true;
}, { message: "function é obrigatório quando type=worker", path: ["function"] });
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
});
exports.patchPeopleStatusSchema = zod_1.z.object({
    status: personStatusEnum,
});
exports.assignParticipantClassSchema = zod_1.z.object({
    classId: zod_1.z.string().uuid("classId deve ser um UUID válido"),
});
//# sourceMappingURL=people.dto.js.map