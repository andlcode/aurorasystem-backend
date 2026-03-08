import { z } from "zod";
export declare const createTeamMemberSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    username: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["SUPER_ADMIN", "COORDENADOR", "EVANGELIZADOR"]>>;
}, "strip", z.ZodTypeAny, {
    username: string;
    role: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR";
    password: string;
    fullName: string;
    email?: string | undefined;
}, {
    username: string;
    password: string;
    fullName: string;
    email?: unknown;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
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
export declare const patchTeamMemberSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    email: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, string | null | undefined, unknown>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
    role: z.ZodOptional<z.ZodEnum<["SUPER_ADMIN", "COORDENADOR", "EVANGELIZADOR"]>>;
}, "strip", z.ZodTypeAny, {
    email?: string | null | undefined;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
}, {
    email?: unknown;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
}>;
export type PatchTeamMemberInput = z.infer<typeof patchTeamMemberSchema>;
//# sourceMappingURL=team.dto.d.ts.map