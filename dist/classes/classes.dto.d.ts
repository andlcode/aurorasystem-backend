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
    month: z.ZodString;
}, "strip", z.ZodTypeAny, {
    month: string;
}, {
    month: string;
}>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
//# sourceMappingURL=classes.dto.d.ts.map