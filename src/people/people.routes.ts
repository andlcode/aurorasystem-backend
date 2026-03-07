import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authJwt } from "../middleware/authJwt";
import { requireRole } from "../middleware/requireRole";
import * as peopleController from "./people.controller";

const router = Router();
router.use(authJwt);

router.post(
  "/",
  requireRole("evangelizador", "super_admin", "worker"),
  asyncHandler(peopleController.createPeople)
);

router.get(
  "/",
  requireRole("evangelizador", "super_admin", "worker"),
  asyncHandler(peopleController.listPeople)
);

router.get(
  "/responsaveis",
  requireRole("evangelizador", "super_admin", "worker"),
  asyncHandler(peopleController.listResponsaveis)
);

router.get(
  "/:id",
  requireRole("evangelizador", "super_admin", "worker"),
  asyncHandler(peopleController.getPeopleById)
);

router.patch(
  "/:id",
  requireRole("evangelizador", "super_admin"),
  asyncHandler(peopleController.patchPeople)
);

export const peopleRoutes = router;
