"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listResponsibles = listResponsibles;
exports.createClass = createClass;
exports.listClasses = listClasses;
exports.getClassById = getClassById;
exports.patchClass = patchClass;
exports.addParticipant = addParticipant;
exports.removeParticipant = removeParticipant;
exports.listParticipants = listParticipants;
exports.openSession = openSession;
exports.listSessions = listSessions;
const classes_dto_1 = require("./classes.dto");
const dateUtils_1 = require("../utils/dateUtils");
const classesService = __importStar(require("./classes.service"));
async function listResponsibles(req, res) {
    const responsibles = await classesService.listResponsibles();
    res.json(responsibles);
}
async function createClass(req, res) {
    const parsed = classes_dto_1.createClassSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    try {
        const class_ = await classesService.createClass(parsed.data, req.userId ?? null);
        res.status(201).json(class_);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao criar turma";
        res.status(400).json({ error: msg });
    }
}
async function listClasses(req, res) {
    const role = req.userRole;
    const personId = req.userId;
    const classes = await classesService.listClasses(role, personId);
    res.json(classes);
}
async function getClassById(req, res) {
    const { id: classId } = req.params;
    const role = req.userRole;
    const personId = req.userId;
    const class_ = await classesService.getClassById(classId, role, personId);
    if (!class_) {
        res.status(404).json({ error: "Turma não encontrada" });
        return;
    }
    res.json(class_);
}
async function patchClass(req, res) {
    const { id: classId } = req.params;
    const parsed = classes_dto_1.patchClassSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    try {
        const class_ = await classesService.patchClass(classId, parsed.data, req.userRole, req.userId);
        if (!class_) {
            res.status(404).json({ error: "Turma não encontrada" });
            return;
        }
        res.json(class_);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao atualizar turma";
        res.status(err instanceof Error && msg.includes("permissão") ? 403 : 400).json({
            error: msg,
        });
    }
}
async function addParticipant(req, res) {
    const { id: classId } = req.params;
    const parsed = classes_dto_1.addParticipantSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    try {
        const cp = await classesService.addParticipant(classId, parsed.data);
        res.status(201).json(cp);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao vincular participante";
        const status = msg.includes("não encontrad") ? 404 : 400;
        res.status(status).json({ error: msg });
    }
}
async function removeParticipant(req, res) {
    const { id: classId, participantId } = req.params;
    try {
        await classesService.removeParticipant(classId, participantId);
        res.status(204).send();
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao remover participante";
        res.status(404).json({ error: msg });
    }
}
async function listParticipants(req, res) {
    const { id: classId } = req.params;
    try {
        const participants = await classesService.listParticipants(classId);
        res.json(participants);
    }
    catch {
        res.status(404).json({ error: "Turma não encontrada" });
    }
}
async function openSession(req, res) {
    const { id: classId } = req.params;
    const parsed = classes_dto_1.openSessionSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const dateString = parsed.data.date ?? (0, dateUtils_1.getLocalDateStringAmericaBahia)();
    try {
        const session = await classesService.openSession(classId, dateString, req.userId);
        res.status(201).json(session);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao abrir sessão";
        res.status(404).json({ error: msg });
    }
}
async function listSessions(req, res) {
    const { id: classId } = req.params;
    const parsed = classes_dto_1.listSessionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    try {
        const sessions = await classesService.listSessions(classId, parsed.data.month);
        res.json(sessions);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao listar sessões";
        res.status(404).json({ error: msg });
    }
}
//# sourceMappingURL=classes.controller.js.map