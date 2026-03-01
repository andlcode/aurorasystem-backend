import { z } from "zod";
export declare const putAttendanceSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    participantId: z.ZodString;
    status: z.ZodEnum<["present", "absent", "justified"]>;
    justificationReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "present" | "absent" | "justified";
    participantId: string;
    justificationReason?: string | null | undefined;
}, {
    status: "present" | "absent" | "justified";
    participantId: string;
    justificationReason?: string | null | undefined;
}>, {
    status: "present" | "absent" | "justified";
    participantId: string;
    justificationReason?: string | null | undefined;
}, {
    status: "present" | "absent" | "justified";
    participantId: string;
    justificationReason?: string | null | undefined;
}>, {
    status: "present" | "absent" | "justified";
    participantId: string;
    justificationReason?: string | null | undefined;
}, {
    status: "present" | "absent" | "justified";
    participantId: string;
    justificationReason?: string | null | undefined;
}>;
export type PutAttendanceInput = z.infer<typeof putAttendanceSchema>;
//# sourceMappingURL=sessions.dto.d.ts.map