"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSessionsQuerySchema = exports.openSessionSchema = exports.addParticipantSchema = exports.patchClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
const timeValidation_1 = require("../utils/timeValidation");
const timeSchema = zod_1.z.string().refine(timeValidation_1.isValidTimeFormat, "Use formato HH:mm");
exports.createClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    day: zod_1.z.number().int().min(0).max(6),
    time: timeSchema,
    responsibleUserId: zod_1.z.string().uuid("responsibleUserId deve ser um UUID válido"),
});
exports.patchClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    day: zod_1.z.number().int().min(0).max(6).optional(),
    time: timeSchema.optional(),
    responsibleUserId: zod_1.z.string().uuid().optional(),
});
exports.addParticipantSchema = zod_1.z.object({
    participantId: zod_1.z.string().uuid("participantId deve ser um UUID válido"),
});
exports.openSessionSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD").optional(),
});
exports.listSessionsQuerySchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Use formato YYYY-MM"),
});
//# sourceMappingURL=classes.dto.js.map