"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentsQuerySchema = exports.dashboardQuerySchema = void 0;
const zod_1 = require("zod");
exports.dashboardQuerySchema = zod_1.z.object({
    from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    classId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["all", "present", "absent", "justified"]).optional().default("all"),
});
exports.studentsQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    classId: zod_1.z.string().uuid().optional(),
    from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: zod_1.z.enum(["all", "active", "inactive"]).optional().default("all"),
    participantIds: zod_1.z.string().optional(), // comma-separated UUIDs
});
//# sourceMappingURL=stats.dto.js.map