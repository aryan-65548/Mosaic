import { updateStatusSchema } from "../schemas/application.schema.js";
import {
  applyToJob,
  findApplicationsByCandidate,
  findApplicantsByJob,
  findApplicationById,
  updateApplicationStatus,
} from "../services/application.service.js";
import { findJobPostingById } from "../services/job.service.js";

export async function apply(req, res) {
  const jobId = req.params.id;

  const job = await findJobPostingById(jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId: req.user.id } },
  });
  if (existing) {
    return res.status(409).json({ error: "You have already applied to this job" });
  }

  const application = await applyToJob(jobId, req.user.id);
  res.status(201).json({ application });
}

export async function myApplications(req, res) {
  const applications = await findApplicationsByCandidate(req.user.id);
  res.status(200).json({ applications });
}

export async function applicantsForJob(req, res) {
  const jobId = req.params.id;

  const job = await findJobPostingById(jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  if (job.company.ownerId !== req.user.id) {
    return res.status(403).json({ error: "You do not own this job's company" });
  }

  const applicants = await findApplicantsByJob(jobId);
  res.status(200).json({ applicants });
}

export async function updateStatus(req, res) {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const application = await findApplicationById(req.params.id);
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }
  if (application.job.company.ownerId !== req.user.id) {
    return res.status(403).json({ error: "You do not own this job's company" });
  }

  const updated = await updateApplicationStatus(req.params.id, parsed.data.status);
  res.status(200).json({ application: updated });
}