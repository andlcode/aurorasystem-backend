import { z } from "zod";

export const dashboardQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  classId: z.string().uuid().optional(),
  status: z.enum(["all", "present", "absent", "justified"]).optional().default("all"),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;

export const studentsQuerySchema = z.object({
  q: z.string().optional(),
  classId: z.string().uuid().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  participantIds: z.string().optional(), // comma-separated UUIDs
});

export type StudentsQueryInput = z.infer<typeof studentsQuerySchema>;
