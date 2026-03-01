"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
/**
 * Middleware que exige usuário autenticado (qualquer role).
 * Deve ser usado após authJwt. Usa req.user.
 */
function requireAuth(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Autenticação necessária" });
        return;
    }
    next();
}
//# sourceMappingURL=requireAuth.js.map