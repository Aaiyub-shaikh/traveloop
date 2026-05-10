import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

// Fail fast when required env vars are missing (clearer than cryptic runtime errors)
const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`[traveloop] Missing environment variable: ${key}`);
    console.error("Copy backend/.env.example to backend/.env and set values.");
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Allow frontend origin(s) — Vite default + optional env
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: corsOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "traveloop-api" });
});

app.use("/api/auth", authRoutes);

// 404 for unknown API routes
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Traveloop API listening on http://localhost:${PORT}`);
});
