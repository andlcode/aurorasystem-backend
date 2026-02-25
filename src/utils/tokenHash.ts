import { createHash } from "crypto";
import { randomBytes } from "crypto";

/**
 * Gera token aleatório seguro (32 bytes = 64 chars hex).
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash SHA256 do token para armazenamento seguro.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
