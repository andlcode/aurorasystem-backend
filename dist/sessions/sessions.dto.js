"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putAttendanceSchema = void 0;
const zod_1 = require("zod");
const attendanceStatusEnum = zod_1.z.enum(["present", "absent", "justified"]);
exports.putAttendanceSchema = zod_1.z
    .object({
    participantId: zod_1.z.string().uuid("participantId deve ser um UUID válido"),
    status: attendanceStatusEnum,
    justificationReason: zod_1.z.string().min(3).optional().nullable(),
})
    .refine((data) => {
    if (data.status === "justified") {
        return (data.justificationReason != null &&
            data.justificationReason.trim().length >= 3);
    }
    return true;
}, {
    message: "justificationReason é obrigatório (mín. 3 caracteres) quando status=justified",
    path: ["justificationReason"],
})
    .refine((data) => {
    if (data.status !== "justified") {
        return (data.justificationReason == null ||
            data.justificationReason.trim() === "");
    }
    return true;
}, {
    message: "justificationReason deve ser removido quando status != justified",
    path: ["justificationReason"],
});
//# sourceMappingURL=sessions.dto.js.map