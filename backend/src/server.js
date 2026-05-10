import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import tripRoutes from "./routes/trips.js";
import citiesRoutes from "./routes/cities.js";
import itinerariesRoutes from "./routes/itineraries.js";
import stopsRoutes from "./routes/stops.js";
import activitiesRoutes from "./routes/activities.js";
import exploreRoutes from "./routes/explore.js";
import tripBudgetRoutes from "./routes/tripBudget.js";
import publicItineraryRoutes from "./routes/publicItinerary.js";
import packingRoutes from "./routes/packing.js";
import userRoutes from "./routes/user.js";
import tripNotesRoutes from "./routes/tripNotes.js";
import { warmupWorldCitiesIndex } from "./lib/worldCitiesSearch.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "traveloop-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/public", publicItineraryRoutes);
app.use("/api/packing", packingRoutes);
app.use("/api/trips/:tripId/notes", authMiddleware, tripNotesRoutes);
app.use("/api/trips", tripBudgetRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/cities", citiesRoutes);
app.use("/api/itineraries", itinerariesRoutes);
app.use("/api/stops", stopsRoutes);
app.use("/api/activities", activitiesRoutes);

// 404 for unknown API routes
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Traveloop API listening on http://localhost:${PORT}`);
  setImmediate(() => warmupWorldCitiesIndex());
});
