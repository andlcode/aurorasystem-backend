import { z } from "zod";

const attendanceStatusEnum = z.enum(["present", "absent", "justified"]);

export const putAttendanceSchema = z
  .object({
    participantId: z.string().uuid("participantId deve ser um UUID válido"),
    status: attendanceStatusEnum,
    justificationReason: z.string().min(3).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === "justified") {
        return (
          data.justificationReason != null &&
          data.justificationReason.trim().length >= 3
        );
      }
      return true;
    },
    {
      message:
        "justificationReason é obrigatório (mín. 3 caracteres) quando status=justified",
      path: ["justificationReason"],
    }
  )
  .refine(
    (data) => {
      if (data.status !== "justified") {
        return (
          data.justificationReason == null ||
          data.justificationReason.trim() === ""
        );
      }
      return true;
    },
    {
      message: "justificationReason deve ser removido quando status != justified",
      path: ["justificationReason"],
    }
  );

export type PutAttendanceInput = z.infer<typeof putAttendanceSchema>;
