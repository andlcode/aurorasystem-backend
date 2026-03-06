import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authJwt } from "../middleware/authJwt";
import { requireRole } from "../middleware/requireRole";
import * as teamController from "./team.controller";

const router = Router();
router.use(authJwt);
router.use(requireRole("super_admin"));

router.get("/", asyncHandler(teamController.listTeam));
router.post("/", asyncHandler(teamController.createTeamMember));
router.get("/:id", asyncHandler(teamController.getTeamMemberById));
router.patch("/:id", asyncHandler(teamController.patchTeamMember));

export const teamRoutes = router;
