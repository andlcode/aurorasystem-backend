import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authJwt } from "../middleware/authJwt";
import { requireRole } from "../middleware/requireRole";
import * as peopleController from "./people.controller";

const router = Router();
router.use(authJwt);

router.post(
  "/",
  requireRole("admin", "super_admin"),
  asyncHandler(peopleController.createPeople)
);

router.get(
  "/",
  requireRole("admin", "super_admin"),
  asyncHandler(peopleController.listPeople)
);

router.patch(
  "/:id",
  requireRole("admin", "super_admin"),
  asyncHandler(peopleController.patchPeople)
);

export const peopleRoutes = router;
