import { Router } from "express";
import { register, login, me, recruiterOnlyPing, refresh, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.get("/recruiter-ping", authenticate, requireRole("RECRUITER"), recruiterOnlyPing);

export default router;