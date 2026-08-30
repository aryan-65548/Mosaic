import { Router } from "express";
import { myApplications, updateStatus } from "../controllers/application.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/me", authenticate, requireRole("CANDIDATE"), myApplications);
router.patch("/:id/status", authenticate, requireRole("RECRUITER"), updateStatus);

export default router;