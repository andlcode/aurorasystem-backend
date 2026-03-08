"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignParticipantClassSchema = exports.patchParticipantStatusSchema = exports.patchParticipantSchema = exports.listParticipantsQuerySchema = exports.createParticipantSchema = void 0;
const zod_1 = require("zod");
const participantStatusEnum = zod_1.z.enum(["active", "inactive"]);
exports.createParticipantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    email: zod_1.z.preprocess((v) => (v === "" ? undefined : v), zod_1.z.string().email().optional()),
    phone: zod_1.z.string().optional().nullable(),
});
exports.listParticipantsQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    status: participantStatusEnum.optional(),
});
exports.patchParticipantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.preprocess((v) => (v === "" ? null : v), zod_1.z.string().email().optional().nullable()),
    phone: zod_1.z.preprocess((v) => (v === "" ? null : v), zod_1.z.string().optional().nullable()),
    notes: zod_1.z.string().optional().nullable(),
    status: participantStatusEnum.optional(),
});
exports.patchParticipantStatusSchema = zod_1.z.object({
    status: participantStatusEnum,
});
exports.assignParticipantClassSchema = zod_1.z.object({
    classId: zod_1.z.string().uuid("classId deve ser um UUID válido"),
});
//# sourceMappingURL=participants.dto.js.map