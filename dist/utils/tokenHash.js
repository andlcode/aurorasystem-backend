"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetToken = generateResetToken;
exports.hashToken = hashToken;
const crypto_1 = require("crypto");
const crypto_2 = require("crypto");
/**
 * Gera token aleatório seguro (32 bytes = 64 chars hex).
 */
function generateResetToken() {
    return (0, crypto_2.randomBytes)(32).toString("hex");
}
/**
 * Hash SHA256 do token para armazenamento seguro.
 */
function hashToken(token) {
    return (0, crypto_1.createHash)("sha256").update(token).digest("hex");
}
//# sourceMappingURL=tokenHash.js.map