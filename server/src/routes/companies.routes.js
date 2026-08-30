import { Router } from "express";
import { create } from "../controllers/company.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/", authenticate, requireRole("RECRUITER"), create);

export default router;