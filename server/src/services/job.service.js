import prisma from "../config/db.postgres.js";

export async function createJobPosting(data) {
  return prisma.jobPosting.create({ data });
}

export async function listJobPostings() {
  return prisma.jobPosting.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true, industry: true } } },
  });
}

export async function findJobPostingById(id) {
  return prisma.jobPosting.findUnique({
    where: { id },
    include: { company: { select: { name: true, industry: true } } },
  });
}