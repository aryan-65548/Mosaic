import prisma from "../config/db.postgres.js";

export async function applyToJob(jobId, candidateId) {
  return prisma.application.create({
    data: { jobId, candidateId },
  });
}

export async function findApplicationsByCandidate(candidateId) {
  return prisma.application.findMany({
    where: { candidateId },
    orderBy: { appliedAt: "desc" },
    include: {
      job: {
        select: { title: true, location: true, company: { select: { name: true } } },
      },
    },
  });
}

export async function findApplicantsByJob(jobId) {
  return prisma.application.findMany({
    where: { jobId },
    orderBy: { appliedAt: "desc" },
    include: {
      candidate: { select: { id: true, email: true } },
    },
  });
}

export async function findApplicationById(id) {
  return prisma.application.findUnique({
    where: { id },
    include: { job: { include: { company: true } } },
  });
}

export async function updateApplicationStatus(id, status) {
  return prisma.application.update({
    where: { id },
    data: { status },
  });
}

export async function findExistingApplication(jobId, candidateId) {
  return prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId } },
  });
}