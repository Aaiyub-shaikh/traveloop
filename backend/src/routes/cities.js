import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { serializeCity } from "../lib/serializeItinerary.js";
import { searchWorldCities } from "../lib/worldCitiesSearch.js";

const router = Router();
router.use(authMiddleware);

/**
 * GET /api/cities/search?q=&limit=
 * Worldwide substring search (country-state-city dataset). Min 2 chars on q.
 */
router.get("/search", (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitRaw) ? limitRaw : 50;
    const cities = searchWorldCities(q, limit);
    const hint = q.trim().length < 2 ? "Type at least 2 characters to search worldwide cities." : null;
    res.json({ cities, hint });
  } catch (err) {
    console.error("search cities:", err);
    res.status(500).json({ message: "City search failed" });
  }
});

/** GET /api/cities — cities saved in DB (featured seed + stops-created) */
router.get("/", async (_req, res) => {
  try {
    const cities = await prisma.city.findMany({ orderBy: [{ country: "asc" }, { name: "asc" }] });
    res.json({ cities: cities.map(serializeCity) });
  } catch (err) {
    console.error("list cities:", err);
    res.status(500).json({ message: "Could not load cities" });
  }
});

export default router;
