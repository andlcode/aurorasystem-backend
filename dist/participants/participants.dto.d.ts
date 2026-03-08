import { z } from "zod";
export declare const createParticipantSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email?: string | undefined;
    phone?: string | null | undefined;
}, {
    name: string;
    email?: unknown;
    phone?: string | null | undefined;
}>;
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export declare const listParticipantsQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | undefined;
    q?: string | undefined;
}, {
    status?: "active" | "inactive" | undefined;
    q?: string | undefined;
}>;
export type ListParticipantsQuery = z.infer<typeof listParticipantsQuerySchema>;
export declare const patchParticipantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, string | null | undefined, unknown>;
    phone: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, string | null | undefined, unknown>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | null | undefined;
    status?: "active" | "inactive" | undefined;
    phone?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    name?: string | undefined;
    email?: unknown;
    status?: "active" | "inactive" | undefined;
    phone?: unknown;
    notes?: string | null | undefined;
}>;
export type PatchParticipantInput = z.infer<typeof patchParticipantSchema>;
export declare const patchParticipantStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["active", "inactive"]>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive";
}, {
    status: "active" | "inactive";
}>;
export type PatchParticipantStatusInput = z.infer<typeof patchParticipantStatusSchema>;
export declare const assignParticipantClassSchema: z.ZodObject<{
    classId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    classId: string;
}, {
    classId: string;
}>;
export type AssignParticipantClassInput = z.infer<typeof assignParticipantClassSchema>;
//# sourceMappingURL=participants.dto.d.ts.map