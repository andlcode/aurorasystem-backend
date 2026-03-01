import { z } from "zod";
export declare const createClassSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    dayOfWeek: z.ZodNumber;
    startTime: z.ZodEffects<z.ZodString, string, string>;
    endTime: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    ownerWorkerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    dayOfWeek: number;
    startTime: string;
    ownerWorkerId: string;
    description?: string | null | undefined;
    endTime?: string | null | undefined;
}, {
    name: string;
    dayOfWeek: number;
    startTime: string;
    ownerWorkerId: string;
    description?: string | null | undefined;
    endTime?: string | null | undefined;
}>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export declare const patchClassSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    dayOfWeek: z.ZodOptional<z.ZodNumber>;
    startTime: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    endTime: z.ZodNullable<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    ownerWorkerId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "active" | "inactive" | undefined;
    description?: string | null | undefined;
    dayOfWeek?: number | undefined;
    startTime?: string | undefined;
    endTime?: string | null | undefined;
    ownerWorkerId?: string | undefined;
}, {
    name?: string | undefined;
    status?: "active" | "inactive" | undefined;
    description?: string | null | undefined;
    dayOfWeek?: number | undefined;
    startTime?: string | undefined;
    endTime?: string | null | undefined;
    ownerWorkerId?: string | undefined;
}>;
export type PatchClassInput = z.infer<typeof patchClassSchema>;
export declare const addMemberSchema: z.ZodObject<{
    personId: z.ZodString;
    active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    personId: string;
    active: boolean;
}, {
    personId: string;
    active?: boolean | undefined;
}>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
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