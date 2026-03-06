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
        const currentRole = user?.role ?? req.userRole;
        console.log("[requireRole] Verificando role:", { currentRole, allowedRoles, path: req.path });
        if (!user && currentRole === undefined) {
            console.log("[requireRole] 401: Usuário não autenticado (req.user ausente)");
            res.status(401).json({ error: "Autenticação necessária" });
            return;
        }
        if (!currentRole || !allowedRoles.includes(currentRole)) {
            console.log("[requireRole] 403: Role insuficiente. role:", currentRole, "permitidas:", allowedRoles);
            res.status(403).json({
                error: "Acesso negado: role insuficiente",
                details: { currentRole: currentRole ?? "nenhuma", requiredRoles: allowedRoles },
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map