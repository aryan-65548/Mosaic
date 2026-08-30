import { Router } from "express";
import { create, list, getOne } from "../controllers/job.controller.js";
import { apply, applicantsForJob } from "../controllers/application.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", list);
router.get("/:id", getOne);
router.post("/", authenticate, requireRole("RECRUITER"), create);
router.post("/:id/apply", authenticate, requireRole("CANDIDATE"), apply);
router.get("/:id/applicants", authenticate, requireRole("RECRUITER"), applicantsForJob);

export default router;