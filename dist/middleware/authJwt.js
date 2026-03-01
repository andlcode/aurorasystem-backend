"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authJwt = authJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Middleware que lê o token JWT do header Authorization: Bearer <token>,
 * valida com JWT_SECRET e injeta req.user = { userId, personId, role }.
 * Também define req.userId e req.userRole para compatibilidade com controllers.
 */
function authJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;
    if (!token) {
        res.status(401).json({ error: "Token não informado" });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ error: "JWT_SECRET não configurado" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        req.userId = decoded.personId;
        req.userRole = decoded.role;
        next();
    }
    catch {
        res.status(401).json({ error: "Token inválido ou expirado" });
    }
}
//# sourceMappingURL=authJwt.js.map