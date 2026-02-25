import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authJwt } from "../middleware/authJwt";
import { requireAuth } from "../middleware/requireAuth";
import { requireSessionOwnerOrAdmin } from "../middleware/requireSessionOwnerOrAdmin";
import * as sessionsController from "./sessions.controller";

const router = Router();
router.use(authJwt);

router.put(
  "/:sessionId/attendance",
  requireAuth,
  asyncHandler(requireSessionOwnerOrAdmin),
  asyncHandler(sessionsController.putAttendance)
);

router.get(
  "/:sessionId/attendance",
  requireAuth,
  asyncHandler(requireSessionOwnerOrAdmin),
  asyncHandler(sessionsController.listAttendance)
);

export const sessionsRoutes = router;
