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
router.post("/", (0, requireRole_1.requireRole)("admin", "super_admin"), (0, asyncHandler_1.asyncHandler)(classesController.createClass));
router.get("/", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(classesController.listClasses));
router.patch("/:id", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.patchClass));
router.post("/:id/members", (0, requireRole_1.requireRole)("admin", "super_admin"), (0, asyncHandler_1.asyncHandler)(classesController.addMember));
router.get("/:id/members", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(classesController.listMembers));
router.delete("/:id/members/:personId", (0, requireRole_1.requireRole)("admin", "super_admin"), (0, asyncHandler_1.asyncHandler)(classesController.removeMember));
router.post("/:id/sessions/open", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.openSession));
router.get("/:id/sessions", requireAuth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(requireClassOwnerOrAdmin_1.requireClassOwnerOrAdmin), (0, asyncHandler_1.asyncHandler)(classesController.listSessions));
exports.classesRoutes = router;
//# sourceMappingURL=classes.routes.js.map