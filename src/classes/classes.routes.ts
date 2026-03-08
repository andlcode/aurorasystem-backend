import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authJwt } from "../middleware/authJwt";
import { requireAuth } from "../middleware/requireAuth";
import { requireClassOwnerOrAdmin } from "../middleware/requireClassOwnerOrAdmin";
import { requireRole } from "../middleware/requireRole";
import * as classesController from "./classes.controller";

const router = Router();
router.use(authJwt);

router.get(
  "/responsibles",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(classesController.listResponsibles)
);

router.post(
  "/",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(classesController.createClass)
);

router.get(
  "/",
  requireAuth,
  asyncHandler(classesController.listClasses)
);

router.get(
  "/today",
  requireAuth,
  asyncHandler(classesController.getTodayClass)
);

router.get(
  "/:id/participants",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.listParticipants)
);

router.post(
  "/:id/participants",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(classesController.addParticipant)
);

router.delete(
  "/:id/participants/:participantId",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(classesController.removeParticipant)
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(classesController.getClassById)
);

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.patchClass)
);

router.post(
  "/:id/sessions/open",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.openSession)
);

router.post(
  "/:id/sessions",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.createOrGetSession)
);

router.get(
  "/:id/sessions",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.listSessions)
);

router.get(
  "/:id/sessions/:sessionId",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.getSessionById)
);

router.put(
  "/:id/sessions/:sessionId/attendance",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.putBulkAttendance)
);

export const classesRoutes = router;
