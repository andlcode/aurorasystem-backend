import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authJwt } from "../middleware/authJwt";
import { requireAuth } from "../middleware/requireAuth";
import { requireClassOwnerOrAdmin } from "../middleware/requireClassOwnerOrAdmin";
import { requireRole } from "../middleware/requireRole";
import * as classesController from "./classes.controller";

const router = Router();
router.use(authJwt);

router.post(
  "/",
  requireRole("admin", "super_admin"),
  asyncHandler(classesController.createClass)
);

router.get(
  "/",
  requireAuth,
  asyncHandler(classesController.listClasses)
);

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.patchClass)
);

router.post(
  "/:id/members",
  requireRole("admin", "super_admin"),
  asyncHandler(classesController.addMember)
);

router.get(
  "/:id/members",
  requireAuth,
  asyncHandler(classesController.listMembers)
);

router.delete(
  "/:id/members/:personId",
  requireRole("admin", "super_admin"),
  asyncHandler(classesController.removeMember)
);

router.post(
  "/:id/sessions/open",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.openSession)
);

router.get(
  "/:id/sessions",
  requireAuth,
  asyncHandler(requireClassOwnerOrAdmin),
  asyncHandler(classesController.listSessions)
);

export const classesRoutes = router;
