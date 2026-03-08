"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSessionOwnerOrAdmin = requireSessionOwnerOrAdmin;
const prisma_1 = require("../lib/prisma");
/**
 * Permite acesso total apenas a SUPER_ADMIN.
 * Demais usuários só acessam sessões de turmas em que são o responsável.
 */
async function requireSessionOwnerOrAdmin(req, res, next) {
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: "Autenticação necessária" });
        return;
    }
    const sessionId = req.params.sessionId;
    if (user.role === "SUPER_ADMIN") {
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
    if (session.class_.responsibleUserId !== user.userId) {
        res.status(403).json({ error: "Sem permissão para acessar esta sessão" });
        return;
    }
    next();
}
//# sourceMappingURL=requireSessionOwnerOrAdmin.js.map