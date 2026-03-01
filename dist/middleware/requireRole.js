"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
/**
 * Middleware que exige que o usuário tenha uma das roles permitidas.
 * Deve ser usado após authJwt. Usa req.user.
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: "Autenticação necessária" });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({ error: "Sem permissão para esta ação" });
            return;
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map