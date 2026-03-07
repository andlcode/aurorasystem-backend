"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardQuerySchema = void 0;
const zod_1 = require("zod");
exports.dashboardQuerySchema = zod_1.z.object({
    from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    classId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["all", "present", "absent", "justified"]).optional().default("all"),
});
//# sourceMappingURL=stats.dto.js.map