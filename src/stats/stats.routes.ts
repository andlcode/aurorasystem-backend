import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authJwt } from "../middleware/authJwt";
import { requireAuth } from "../middleware/requireAuth";
import { requireClassOwnerOrAdmin } from "../middleware/requireClassOwnerOrAdmin";
import { requireRole } from "../middleware/requireRole";
import * as statsController from "./stats.controller";

const router = Router();
router.use(authJwt);

router.get(
  "/dashboard",
  requireAuth,
  asyncHandler(statsController.getDashboard)
);

router.get(
  "/overview",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(statsController.getOverview)
);

router.get(
  "/classes",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(statsController.getClassesStats)
);

router.get(
  "/classes/:id",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(statsController.getClassDetailStats)
);

export const statsRoutes = router;
