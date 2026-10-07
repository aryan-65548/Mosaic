import { Router } from "express";
import { uploadResume, getResume, myResumes } from "../controllers/resume.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/upload", authenticate, requireRole("CANDIDATE"), upload.single("resume"), uploadResume);
router.get("/me", authenticate, requireRole("CANDIDATE"), myResumes);
router.get("/:id", authenticate, getResume);

export default router;