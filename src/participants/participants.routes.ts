import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authJwt } from "../middleware/authJwt";
import { requireRole } from "../middleware/requireRole";
import * as participantsController from "./participants.controller";

const router = Router();
router.use(authJwt);

router.post(
  "/",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(participantsController.createParticipant)
);

router.get(
  "/",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(participantsController.listParticipants)
);

router.get(
  "/:id",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(participantsController.getParticipantById)
);

router.patch(
  "/:id/status",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(participantsController.patchParticipantStatus)
);

router.patch(
  "/:id/class",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(participantsController.assignParticipantClass)
);

router.put(
  "/:id",
  requireRole("SUPER_ADMIN", "COORDENADOR"),
  asyncHandler(participantsController.patchParticipant)
);

export const participantsRoutes = router;
