import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as authController from "./auth.controller";

const router = Router();

router.post("/login", asyncHandler(authController.login));
router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.post("/reset-password", asyncHandler(authController.resetPassword));

export const authRoutes = router;
