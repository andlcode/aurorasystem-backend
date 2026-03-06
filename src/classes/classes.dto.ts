import { z } from "zod";
import { isValidTimeFormat } from "../utils/timeValidation";

const timeSchema = z.string().refine(isValidTimeFormat, "Use formato HH:mm");

export const createClassSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  day: z.number().int().min(0).max(6),
  time: timeSchema,
  responsibleUserId: z.string().uuid("responsibleUserId deve ser um UUID válido"),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;

export const patchClassSchema = z.object({
  name: z.string().min(1).optional(),
  day: z.number().int().min(0).max(6).optional(),
  time: timeSchema.optional(),
  responsibleUserId: z.string().uuid().optional(),
});

export type PatchClassInput = z.infer<typeof patchClassSchema>;

export const addParticipantSchema = z.object({
  participantId: z.string().uuid("participantId deve ser um UUID válido"),
});

export type AddParticipantInput = z.infer<typeof addParticipantSchema>;

export const openSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD").optional(),
});

export type OpenSessionInput = z.infer<typeof openSessionSchema>;

export const listSessionsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Use formato YYYY-MM").optional(),
});

export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;

export const createOrGetSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD"),
});

export type CreateOrGetSessionInput = z.infer<typeof createOrGetSessionSchema>;

const attendanceStatusSchema = z.enum(["presente", "ausente", "justificado"]);

export const putBulkAttendanceSchema = z.object({
  records: z.array(
    z.object({
      participantId: z.string().uuid("participantId deve ser um UUID válido"),
      status: attendanceStatusSchema,
      notes: z.string().optional().nullable(),
    })
  ),
});

export type PutBulkAttendanceInput = z.infer<typeof putBulkAttendanceSchema>;
