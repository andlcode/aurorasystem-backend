import { z } from "zod";
export declare const createClassSchema: z.ZodObject<{
    name: z.ZodString;
    day: z.ZodNumber;
    time: z.ZodEffects<z.ZodString, string, string>;
    responsibleUserId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    day: number;
    time: string;
    responsibleUserId: string;
}, {
    name: string;
    day: number;
    time: string;
    responsibleUserId: string;
}>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export declare const patchClassSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    day: z.ZodOptional<z.ZodNumber>;
    time: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    responsibleUserId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    day?: number | undefined;
    time?: string | undefined;
    responsibleUserId?: string | undefined;
}, {
    name?: string | undefined;
    day?: number | undefined;
    time?: string | undefined;
    responsibleUserId?: string | undefined;
}>;
export type PatchClassInput = z.infer<typeof patchClassSchema>;
export declare const addParticipantSchema: z.ZodObject<{
    participantId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    participantId: string;
}, {
    participantId: string;
}>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export declare const openSessionSchema: z.ZodObject<{
    date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date?: string | undefined;
}, {
    date?: string | undefined;
}>;
export type OpenSessionInput = z.infer<typeof openSessionSchema>;
export declare const listSessionsQuerySchema: z.ZodObject<{
    month: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    month?: string | undefined;
}, {
    month?: string | undefined;
}>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
export declare const createOrGetSessionSchema: z.ZodObject<{
    date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
}, {
    date: string;
}>;
export type CreateOrGetSessionInput = z.infer<typeof createOrGetSessionSchema>;
export declare const putBulkAttendanceSchema: z.ZodObject<{
    records: z.ZodArray<z.ZodObject<{
        participantId: z.ZodString;
        status: z.ZodEnum<["presente", "ausente", "justificado"]>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        status: "presente" | "ausente" | "justificado";
        participantId: string;
        notes?: string | null | undefined;
    }, {
        status: "presente" | "ausente" | "justificado";
        participantId: string;
        notes?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    records: {
        status: "presente" | "ausente" | "justificado";
        participantId: string;
        notes?: string | null | undefined;
    }[];
}, {
    records: {
        status: "presente" | "ausente" | "justificado";
        participantId: string;
        notes?: string | null | undefined;
    }[];
}>;
export type PutBulkAttendanceInput = z.infer<typeof putBulkAttendanceSchema>;
//# sourceMappingURL=classes.dto.d.ts.map