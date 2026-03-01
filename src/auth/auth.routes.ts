import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireRegisterSecret } from "../middleware/requireRegisterSecret";
import * as authController from "./auth.controller";

const router = Router();

router.post("/login", asyncHandler(authController.login));
router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.post("/reset-password", asyncHandler(authController.resetPassword));
router.post("/register", requireRegisterSecret, asyncHandler(authController.register));

export const authRoutes = router;
