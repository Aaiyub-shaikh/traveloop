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
import adminRoutes from "./routes/admin.js";
import { adminMiddleware } from "./middleware/admin.js";
import { serverConfig } from "./config/env.js";
import { warmupWorldCitiesIndex } from "./lib/worldCitiesSearch.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!serverConfig.databaseUrl || !serverConfig.jwtSecret) {
  console.error("[traveloop] DATABASE_URL and JWT_SECRET are required.");
  console.error("Copy backend/.env.example to backend/.env and set values.");
  process.exit(1);
}

const app = express();

if (serverConfig.trustProxy) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (serverConfig.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`[traveloop] CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "traveloop-api", env: serverConfig.nodeEnv });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);
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

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(serverConfig.port, () => {
  console.log(`Traveloop API listening on port ${serverConfig.port} (${serverConfig.nodeEnv})`);
  setImmediate(() => warmupWorldCitiesIndex());
});
