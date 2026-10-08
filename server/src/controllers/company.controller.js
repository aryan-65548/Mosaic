import { createCompanySchema } from "../schemas/company.schema.js";
import { createCompany, findCompaniesByOwner } from "../services/company.service.js";

export async function create(req, res) {
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const company = await createCompany(req.user.id, parsed.data);

  res.status(201).json({ company });
}

export async function mine(req, res) {
  const companies = await findCompaniesByOwner(req.user.id);
  res.status(200).json({ companies });
}
