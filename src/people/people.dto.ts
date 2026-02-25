import { z } from "zod";

const personTypeEnum = z.enum(["worker", "participant"]);
const personStatusEnum = z.enum(["active", "inactive"]);
const workerRoleEnum = z.enum(["super_admin", "admin", "worker"]);

const emailSchema = z.string().email("Email inválido").optional().nullable();
const phoneSchema = z.string().optional().nullable();

export const createPeopleSchema = z
  .object({
    fullName: z.string().min(1, "Nome é obrigatório"),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use formato YYYY-MM-DD").optional().nullable(),
    phone: phoneSchema,
    email: emailSchema,
    type: personTypeEnum,
    function: z.string().min(1).optional(),
    role: workerRoleEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.type === "worker") {
        return data.function != null && data.function.trim() !== "";
      }
      return true;
    },
    { message: "function é obrigatório quando type=worker", path: ["function"] }
  )
  .refine(
    (data) => {
      if (data.type === "worker" && data.role === "super_admin") return false;
      return true;
    },
    { message: "Não é possível criar super_admin via API", path: ["role"] }
  );

export type CreatePeopleInput = z.infer<typeof createPeopleSchema>;

export const listPeopleQuerySchema = z.object({
  type: personTypeEnum.optional(),
  q: z.string().optional(),
});

export type ListPeopleQuery = z.infer<typeof listPeopleQuerySchema>;

export const patchPeopleSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    phone: phoneSchema,
    email: emailSchema,
    status: personStatusEnum.optional(),
    function: z.string().min(1).optional(),
    role: workerRoleEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.role === "super_admin") return false;
      return true;
    },
    { message: "Não é possível promover para super_admin via PATCH", path: ["role"] }
  );

export type PatchPeopleInput = z.infer<typeof patchPeopleSchema>;
