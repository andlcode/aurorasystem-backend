"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClassOwnerOrAdmin = requireClassOwnerOrAdmin;
const prisma_1 = require("../lib/prisma");
/**
 * Permite acesso total apenas a SUPER_ADMIN.
 * Demais usuários (COORDENADOR, EVANGELIZADOR) só acessam turmas
 * em que são o responsável (responsibleUserId === user.userId).
 */
async function requireClassOwnerOrAdmin(req, res, next) {
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: "Autenticação necessária" });
        return;
    }
    const classId = req.params.id;
    if (user.role === "SUPER_ADMIN") {
        next();
        return;
    }
    const class_ = await prisma_1.prisma.class.findUnique({
        where: { id: classId },
        select: { responsibleUserId: true },
    });
    if (!class_) {
        res.status(404).json({ error: "Turma não encontrada" });
        return;
    }
    if (class_.responsibleUserId !== user.userId) {
        res.status(403).json({ error: "Sem permissão para acessar esta turma" });
        return;
    }
    next();
}
//# sourceMappingURL=requireClassOwnerOrAdmin.js.map