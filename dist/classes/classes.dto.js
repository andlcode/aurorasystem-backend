"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSessionsQuerySchema = exports.openSessionSchema = exports.addMemberSchema = exports.patchClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
const timeValidation_1 = require("../utils/timeValidation");
const timeSchema = zod_1.z.string().refine(timeValidation_1.isValidTimeFormat, "Use formato HH:mm");
const classStatusEnum = zod_1.z.enum(["active", "inactive"]);
exports.createClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    description: zod_1.z.string().optional().nullable(),
    dayOfWeek: zod_1.z.number().int().min(0).max(6),
    startTime: timeSchema,
    endTime: timeSchema.optional().nullable(),
    ownerWorkerId: zod_1.z.string().uuid("ownerWorkerId deve ser um UUID válido"),
});
exports.patchClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    dayOfWeek: zod_1.z.number().int().min(0).max(6).optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional().nullable(),
    ownerWorkerId: zod_1.z.string().uuid().optional(),
    status: classStatusEnum.optional(),
});
exports.addMemberSchema = zod_1.z.object({
    personId: zod_1.z.string().uuid("personId deve ser um UUID válido"),
    active: zod_1.z.boolean().optional().default(true),
});
exports.openSessionSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD").optional(),
});
exports.listSessionsQuerySchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Use formato YYYY-MM"),
});
//# sourceMappingURL=classes.dto.js.map