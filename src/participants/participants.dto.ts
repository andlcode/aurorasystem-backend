import { z } from "zod";

const participantStatusEnum = z.enum(["active", "inactive"]);

export const createParticipantSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.preprocess((v) => (v === "" ? undefined : v), z.string().email().optional()),
  phone: z.string().optional().nullable(),
});

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;

export const listParticipantsQuerySchema = z.object({
  q: z.string().optional(),
  status: participantStatusEnum.optional(),
});

export type ListParticipantsQuery = z.infer<typeof listParticipantsQuerySchema>;

export const patchParticipantSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.preprocess((v) => (v === "" ? null : v), z.string().email().optional().nullable()),
  phone: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
  notes: z.string().optional().nullable(),
  status: participantStatusEnum.optional(),
});

export type PatchParticipantInput = z.infer<typeof patchParticipantSchema>;

export const patchParticipantStatusSchema = z.object({
  status: participantStatusEnum,
});

export type PatchParticipantStatusInput = z.infer<typeof patchParticipantStatusSchema>;

export const assignParticipantClassSchema = z.object({
  classId: z.string().uuid("classId deve ser um UUID válido"),
});

export type AssignParticipantClassInput = z.infer<typeof assignParticipantClassSchema>;
