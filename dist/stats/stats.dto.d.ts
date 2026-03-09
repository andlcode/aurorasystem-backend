import { z } from "zod";
export declare const dashboardQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    classId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["all", "present", "absent", "justified"]>>>;
}, "strip", z.ZodTypeAny, {
    status: "present" | "absent" | "justified" | "all";
    classId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    status?: "present" | "absent" | "justified" | "all" | undefined;
    classId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}>;
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
export declare const studentsQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    classId: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["all", "active", "inactive"]>>>;
    participantIds: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "all";
    classId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    q?: string | undefined;
    participantIds?: string | undefined;
}, {
    status?: "active" | "inactive" | "all" | undefined;
    classId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    q?: string | undefined;
    participantIds?: string | undefined;
}>;
export type StudentsQueryInput = z.infer<typeof studentsQuerySchema>;
export declare const monthlyAttendanceQuerySchema: z.ZodObject<{
    classId: z.ZodOptional<z.ZodString>;
    participantId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["all", "active", "inactive"]>>>;
    q: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "all";
    classId?: string | undefined;
    participantId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    q?: string | undefined;
}, {
    status?: "active" | "inactive" | "all" | undefined;
    classId?: string | undefined;
    participantId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    q?: string | undefined;
}>;
export type MonthlyAttendanceQueryInput = z.infer<typeof monthlyAttendanceQuerySchema>;
//# sourceMappingURL=stats.dto.d.ts.map