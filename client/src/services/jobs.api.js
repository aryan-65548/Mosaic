import api from "./api.js";

export async function listJobs() {
  const res = await api.get("/jobs");
  return res.data.jobs;
}

export async function getMyJobs() {
  const res = await api.get("/jobs/mine");
  return res.data.jobs;
}

export async function createJob(job) {
  const res = await api.post("/jobs", job);
  return res.data.job;
}

export async function getJob(jobId) {
  const res = await api.get(`/jobs/${jobId}`);
  return res.data.job;
}

export async function getMyApplications() {
  const res = await api.get("/applications/me");
  return res.data.applications;
}

export async function applyToJob(jobId) {
  const res = await api.post(`/jobs/${jobId}/apply`);
  return res.data.application;
}
