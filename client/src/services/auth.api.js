import api from "./api.js";

export async function registerUser(email, password, role) {
  const res = await api.post("/auth/register", { email, password, role });
  return res.data;
}

export async function loginUser(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data;
}

export async function logoutUser(refreshToken) {
  const res = await api.post("/auth/logout", { refreshToken });
  return res.data;
}
