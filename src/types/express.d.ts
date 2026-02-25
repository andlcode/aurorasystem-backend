import type { WorkerRole } from "@prisma/client";

export interface AuthUser {
  userId: string;
  personId: string;
  role: WorkerRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userRole?: WorkerRole;
      userId?: string;
    }
  }
}
