import { z } from "zod";
export declare const createTeamMemberSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    username: z.ZodString;
    password: z.ZodString;
    function: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["evangelizador", "worker"]>>;
}, "strip", z.ZodTypeAny, {
    function: string;
    username: string;
    password: string;
    fullName: string;
    role: "evangelizador" | "worker";
    email?: string | undefined;
}, {
    function: string;
    username: string;
    password: string;
    fullName: string;
    email?: unknown;
    role?: "evangelizador" | "worker" | undefined;
}>;
export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export declare const listTeamQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    q?: string | undefined;
}, {
    q?: string | undefined;
}>;
export type ListTeamQuery = z.infer<typeof listTeamQuerySchema>;
export declare const patchTeamMemberSchema: z.ZodEffects<z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    email: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, string | null | undefined, unknown>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
    function: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["super_admin", "evangelizador", "worker"]>>;
}, "strip", z.ZodTypeAny, {
    function?: string | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "evangelizador" | "worker" | undefined;
}, {
    function?: string | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
    email?: unknown;
    role?: "super_admin" | "evangelizador" | "worker" | undefined;
}>, {
    function?: string | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "evangelizador" | "worker" | undefined;
}, {
    function?: string | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
    email?: unknown;
    role?: "super_admin" | "evangelizador" | "worker" | undefined;
}>;
export type PatchTeamMemberInput = z.infer<typeof patchTeamMemberSchema>;
//# sourceMappingURL=team.dto.d.ts.map