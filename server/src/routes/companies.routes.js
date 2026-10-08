import { Router } from "express";
import { create, mine } from "../controllers/company.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/me", authenticate, requireRole("RECRUITER"), mine);
router.post("/", authenticate, requireRole("RECRUITER"), create);

export default router;
