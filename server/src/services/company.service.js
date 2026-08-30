import prisma from "../config/db.postgres.js";

export async function createCompany(ownerId, data) {
  return prisma.company.create({
    data: { ...data, ownerId },
  });
}

export async function findCompanyById(id) {
  return prisma.company.findUnique({ where: { id } });
}