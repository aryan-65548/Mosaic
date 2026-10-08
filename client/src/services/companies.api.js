import api from "./api.js";

export async function getMyCompanies() {
  const res = await api.get("/companies/me");
  return res.data.companies;
}

export async function createCompany(company) {
  const res = await api.post("/companies", company);
  return res.data.company;
}
