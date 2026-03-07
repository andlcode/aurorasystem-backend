import { z } from "zod";

export const dashboardQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  classId: z.string().uuid().optional(),
  status: z.enum(["all", "present", "absent", "justified"]).optional().default("all"),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
