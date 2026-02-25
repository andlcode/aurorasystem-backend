import { z } from "zod";
import { isValidTimeFormat } from "../utils/timeValidation";

const timeSchema = z.string().refine(isValidTimeFormat, "Use formato HH:mm");
const classStatusEnum = z.enum(["active", "inactive"]);

export const createClassSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().nullable(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: timeSchema,
  endTime: timeSchema.optional().nullable(),
  ownerWorkerId: z.string().uuid("ownerWorkerId deve ser um UUID válido"),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;

export const patchClassSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional().nullable(),
  ownerWorkerId: z.string().uuid().optional(),
  status: classStatusEnum.optional(),
});

export type PatchClassInput = z.infer<typeof patchClassSchema>;

export const addMemberSchema = z.object({
  personId: z.string().uuid("personId deve ser um UUID válido"),
  active: z.boolean().optional().default(true),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;

export const openSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD").optional(),
});

export type OpenSessionInput = z.infer<typeof openSessionSchema>;

export const listSessionsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Use formato YYYY-MM"),
});

export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
