import { z } from "zod";
export declare const createPeopleSchema: z.ZodEffects<z.ZodObject<{
    fullName: z.ZodString;
    birthDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodEnum<["worker", "participant"]>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
    function: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["SUPER_ADMIN", "COORDENADOR", "EVANGELIZADOR"]>>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    type: "worker" | "participant";
    function?: string | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    status?: "active" | "inactive" | undefined;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
}, {
    fullName: string;
    type: "worker" | "participant";
    function?: string | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    status?: "active" | "inactive" | undefined;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
}>, {
    fullName: string;
    type: "worker" | "participant";
    function?: string | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    status?: "active" | "inactive" | undefined;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
}, {
    fullName: string;
    type: "worker" | "participant";
    function?: string | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    status?: "active" | "inactive" | undefined;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
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
export declare const patchPeopleSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
    function: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["SUPER_ADMIN", "COORDENADOR", "EVANGELIZADOR"]>>;
}, "strip", z.ZodTypeAny, {
    function?: string | undefined;
    fullName?: string | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    status?: "active" | "inactive" | undefined;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
}, {
    function?: string | undefined;
    fullName?: string | undefined;
    birthDate?: string | null | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    status?: "active" | "inactive" | undefined;
    role?: "SUPER_ADMIN" | "COORDENADOR" | "EVANGELIZADOR" | undefined;
}>;
export type PatchPeopleInput = z.infer<typeof patchPeopleSchema>;
export declare const patchPeopleStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["active", "inactive"]>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive";
}, {
    status: "active" | "inactive";
}>;
export type PatchPeopleStatusInput = z.infer<typeof patchPeopleStatusSchema>;
export declare const assignParticipantClassSchema: z.ZodObject<{
    classId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    classId: string;
}, {
    classId: string;
}>;
export type AssignParticipantClassInput = z.infer<typeof assignParticipantClassSchema>;
//# sourceMappingURL=people.dto.d.ts.map