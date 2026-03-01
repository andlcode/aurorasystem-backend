import { z } from "zod";
export declare const createPeopleSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    fullName: z.ZodString;
    birthDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodEnum<["worker", "participant"]>;
    function: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["super_admin", "admin", "worker"]>>;
}, "strip", z.ZodTypeAny, {
    type: "worker" | "participant";
    fullName: string;
    function?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}, {
    type: "worker" | "participant";
    fullName: string;
    function?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}>, {
    type: "worker" | "participant";
    fullName: string;
    function?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}, {
    type: "worker" | "participant";
    fullName: string;
    function?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}>, {
    type: "worker" | "participant";
    fullName: string;
    function?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}, {
    type: "worker" | "participant";
    fullName: string;
    function?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}>;
export type CreatePeopleInput = z.infer<typeof createPeopleSchema>;
export declare const listPeopleQuerySchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["worker", "participant"]>>;
    q: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "worker" | "participant" | undefined;
    q?: string | undefined;
}, {
    type?: "worker" | "participant" | undefined;
    q?: string | undefined;
}>;
export type ListPeopleQuery = z.infer<typeof listPeopleQuerySchema>;
export declare const patchPeopleSchema: z.ZodEffects<z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
    function: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["super_admin", "admin", "worker"]>>;
}, "strip", z.ZodTypeAny, {
    function?: string | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}, {
    function?: string | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}>, {
    function?: string | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}, {
    function?: string | undefined;
    status?: "active" | "inactive" | undefined;
    fullName?: string | undefined;
    email?: string | null | undefined;
    role?: "super_admin" | "admin" | "worker" | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
}>;
export type PatchPeopleInput = z.infer<typeof patchPeopleSchema>;
//# sourceMappingURL=people.dto.d.ts.map