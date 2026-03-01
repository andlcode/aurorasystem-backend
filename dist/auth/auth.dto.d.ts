import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const forgotPasswordSchema: z.ZodObject<{
    usernameOrEmail: z.ZodString;
}, "strip", z.ZodTypeAny, {
    usernameOrEmail: string;
}, {
    usernameOrEmail: string;
}>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export declare const registerSchema: z.ZodObject<{
    fullName: z.ZodString;
    username: z.ZodString;
    email: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    password: z.ZodString;
    function: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["super_admin", "admin", "worker"]>>;
}, "strip", z.ZodTypeAny, {
    function: string;
    username: string;
    password: string;
    fullName: string;
    role: "super_admin" | "admin" | "worker";
    email?: string | undefined;
}, {
    function: string;
    username: string;
    password: string;
    fullName: string;
    email?: unknown;
    role?: "super_admin" | "admin" | "worker" | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
//# sourceMappingURL=auth.dto.d.ts.map