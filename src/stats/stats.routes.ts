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

router.get(
  "/students",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(statsController.listStudents)
);

router.get(
  "/students/:id",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(statsController.getStudentById)
);

router.get(
  "/attendance/students/monthly",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(statsController.listMonthlyAttendance)
);

router.get(
  "/attendance/students/:participantId/monthly",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(statsController.getMonthlyAttendanceByStudent)
);

export const statsRoutes = router;
