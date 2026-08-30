import { createJobSchema } from "../schemas/job.schema.js";
import { createJobPosting, listJobPostings, findJobPostingById } from "../services/job.service.js";
import { findCompanyById } from "../services/company.service.js";

export async function create(req, res) {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const company = await findCompanyById(parsed.data.companyId);
  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }
  if (company.ownerId !== req.user.id) {
    return res.status(403).json({ error: "You do not own this company" });
  }

  const job = await createJobPosting(parsed.data);

  res.status(201).json({ job });
}

export async function list(req, res) {
  const jobs = await listJobPostings();
  res.status(200).json({ jobs });
}

export async function getOne(req, res) {
  const job = await findJobPostingById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.status(200).json({ job });
}