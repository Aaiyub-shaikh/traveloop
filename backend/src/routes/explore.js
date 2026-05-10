import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();
router.use(authMiddleware);

let citiesCache = null;
let activitiesCache = null;

function loadCities() {
  if (!citiesCache) {
    const raw = readFileSync(join(__dirname, "../data/exploreCities.json"), "utf8");
    citiesCache = JSON.parse(raw);
  }
  return citiesCache;
}

function loadActivities() {
  if (!activitiesCache) {
    const raw = readFileSync(join(__dirname, "../data/exploreActivities.json"), "utf8");
    activitiesCache = JSON.parse(raw);
  }
  return activitiesCache;
}

/** GET /api/explore/cities/meta — filter options */
router.get("/cities/meta", (_req, res) => {
  const cities = loadCities();
  const countries = [...new Set(cities.map((c) => c.country))].sort();
  const regions = [...new Set(cities.map((c) => c.region))].sort();
  res.json({ countries, regions });
});

/**
 * GET /api/explore/cities?q=&country=&region=
 * Static mock catalog — substring search + optional filters
 */
router.get("/cities", (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    const country = typeof req.query.country === "string" ? req.query.country.trim() : "";
    const region = typeof req.query.region === "string" ? req.query.region.trim() : "";

    let list = loadCities();
    if (country && country !== "all") {
      list = list.filter((c) => c.country === country);
    }
    if (region && region !== "all") {
      list = list.filter((c) => c.region === region);
    }
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          (c.tagline && c.tagline.toLowerCase().includes(q))
      );
    }

    res.json({ cities: list, total: list.length });
  } catch (err) {
    console.error("explore cities:", err);
    res.status(500).json({ message: "City search failed" });
  }
});

/** GET /api/explore/activities/meta */
router.get("/activities/meta", (_req, res) => {
  const acts = loadActivities();
  const categories = [...new Set(acts.map((a) => a.category))].sort();
  const costTiers = [...new Set(acts.map((a) => a.costTier))].sort();
  res.json({ categories, costTiers });
});

/**
 * GET /api/explore/activities?q=&category=&costTier=
 */
router.get("/activities", (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const costTier = typeof req.query.costTier === "string" ? req.query.costTier.trim() : "";

    let list = loadActivities();
    if (category && category !== "all") {
      list = list.filter((a) => a.category === category);
    }
    if (costTier && costTier !== "all") {
      list = list.filter((a) => a.costTier === costTier);
    }
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    res.json({ activities: list, total: list.length });
  } catch (err) {
    console.error("explore activities:", err);
    res.status(500).json({ message: "Activity search failed" });
  }
});

export default router;
