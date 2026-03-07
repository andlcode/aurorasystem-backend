import { z } from "zod";
export declare const dashboardQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    classId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["all", "present", "absent", "justified"]>>>;
}, "strip", z.ZodTypeAny, {
    status: "present" | "absent" | "justified" | "all";
    from?: string | undefined;
    to?: string | undefined;
    classId?: string | undefined;
}, {
    from?: string | undefined;
    to?: string | undefined;
    status?: "present" | "absent" | "justified" | "all" | undefined;
    classId?: string | undefined;
}>;
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
//# sourceMappingURL=stats.dto.d.ts.map