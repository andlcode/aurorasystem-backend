import type { UserRole } from "@prisma/client";

export interface AuthUser {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userRole?: UserRole;
      userId?: string;
    }
  }
}
