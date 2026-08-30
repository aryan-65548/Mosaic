import express from "express";
import authRoutes from "./routes/auth.routes.js";
import companiesRoutes from "./routes/companies.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "node-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/jobs", jobsRoutes);

export default app;