"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSessionOwnerOrAdmin = requireSessionOwnerOrAdmin;
const prisma_1 = require("../lib/prisma");
/**
 * Middleware que exige evangelizador/super_admin OU ser o responsável da turma da sessão.
 * Deve ser usado após authJwt. Usa req.user. O :sessionId deve ser o sessionId.
 */
async function requireSessionOwnerOrAdmin(req, res, next) {
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: "Autenticação necessária" });
        return;
    }
    const sessionId = req.params.sessionId;
    if (user.role === "evangelizador" || user.role === "super_admin") {
        next();
        return;
    }
    const session = await prisma_1.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: { class_: { select: { responsibleUserId: true } } },
    });
    if (!session) {
        res.status(404).json({ error: "Sessão não encontrada" });
        return;
    }
    if (session.class_.responsibleUserId !== user.personId) {
        res.status(403).json({ error: "Sem permissão para esta sessão" });
        return;
    }
    next();
}
//# sourceMappingURL=requireSessionOwnerOrAdmin.js.map