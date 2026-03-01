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
exports.peopleRoutes = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../middleware/asyncHandler");
const authJwt_1 = require("../middleware/authJwt");
const requireRole_1 = require("../middleware/requireRole");
const peopleController = __importStar(require("./people.controller"));
const router = (0, express_1.Router)();
router.use(authJwt_1.authJwt);
router.post("/", (0, requireRole_1.requireRole)("admin", "super_admin"), (0, asyncHandler_1.asyncHandler)(peopleController.createPeople));
router.get("/", (0, requireRole_1.requireRole)("admin", "super_admin"), (0, asyncHandler_1.asyncHandler)(peopleController.listPeople));
router.patch("/:id", (0, requireRole_1.requireRole)("admin", "super_admin"), (0, asyncHandler_1.asyncHandler)(peopleController.patchPeople));
exports.peopleRoutes = router;
//# sourceMappingURL=people.routes.js.map