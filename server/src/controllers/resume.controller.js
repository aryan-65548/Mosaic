import { createResumeRecord, findResumeById, findResumesByUser } from "../services/resume.service.js";

export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const resume = await createResumeRecord(req.user.id, req.file.buffer);

  res.status(201).json({
    resume: { id: resume._id, status: resume.status, createdAt: resume.createdAt },
  });
}

export async function getResume(req, res) {
  const resume = await findResumeById(req.params.id);

  if (!resume) {
    return res.status(404).json({ error: "Resume not found" });
  }
  if (resume.userId !== req.user.id) {
    return res.status(403).json({ error: "Not your resume" });
  }

  res.status(200).json({ resume });
}

export async function myResumes(req, res) {
  const resumes = await findResumesByUser(req.user.id);
  res.status(200).json({ resumes });
}