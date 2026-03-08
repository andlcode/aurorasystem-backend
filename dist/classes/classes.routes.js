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
exports.classesRoutes = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../middleware/asyncHandler");
const authJwt_1 = require("../middleware/authJwt");
const requireAuth_1 = require("../middleware/requireAuth");
const requireClassOwnerOrAdmin_1 = require("../middleware/requireClassOwnerOrAdmin");
const requireRole_1 = require("../middleware/requireRole");
const classesController = __importStar(require("./classes.controller"));
const router = (0, express_1.Router)();
router.use(authJwt_1.authJwt);
router.get("/responsibles", (0, requireRole_1.requireRole)("SUPER_ADMIN", "COORDENADOR"), (0, asyncHandler_1.asyncHandler)(classesController.listResponsibles));
router.post("/", (0, requireRole_1.requireRole)("SUPER_ADMIN", "COORDENADOR"), (0, asyncHandler_1.asyncHandler)(classesController.createClass));
router.get("/", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(classesController.listClasses));
router.get("/today", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(classesController.getTodayClass));
router.get("/:id/participants", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.listParticipants));
router.post("/:id/participants", (0, requireRole_1.requireRole)("SUPER_ADMIN", "COORDENADOR"), (0, asyncHandler_1.asyncHandler)(classesController.addParticipant));
router.delete("/:id/participants/:participantId", (0, requireRole_1.requireRole)("SUPER_ADMIN", "COORDENADOR"), (0, asyncHandler_1.asyncHandler)(classesController.removeParticipant));
router.get("/:id", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(classesController.getClassById));
router.patch("/:id", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.patchClass));
router.post("/:id/sessions/open", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.openSession));
router.post("/:id/sessions", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.createOrGetSession));
router.get("/:id/sessions", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.listSessions));
router.get("/:id/sessions/:sessionId", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.getSessionById));
router.put("/:id/sessions/:sessionId/attendance", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.putBulkAttendance));
exports.classesRoutes = router;
//# sourceMappingURL=classes.routes.js.map