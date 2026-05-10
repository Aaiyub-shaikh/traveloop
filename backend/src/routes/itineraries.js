import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { assertItineraryOwned } from "../lib/itineraryGuards.js";
import { resolveCityFromWorldPick } from "../lib/resolveWorldCity.js";
import { serializeItinerary, serializeStop } from "../lib/serializeItinerary.js";

const router = Router();
router.use(authMiddleware);

const itineraryInclude = {
  stops: {
    orderBy: { sortOrder: "asc" },
    include: { city: true, activities: { orderBy: { sortOrder: "asc" } } },
  },
};

function parseDate(value, fieldName) {
  if (!value) return { error: `${fieldName} is required` };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { error: `${fieldName} must be a valid date` };
  return { date: d };
}

/** POST /api/itineraries/:itineraryId/stops */
router.post("/:itineraryId/stops", async (req, res) => {
  try {
    const it = await assertItineraryOwned(req.user.sub, req.params.itineraryId);
    if (!it) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    const { cityId, worldCity, startDate, endDate, notes } = req.body;

    let city = null;
    if (cityId && typeof cityId === "string") {
      city = await prisma.city.findUnique({ where: { id: cityId } });
      if (!city) {
        return res.status(400).json({ message: "Unknown city id" });
      }
    } else if (worldCity && typeof worldCity === "object") {
      city = await resolveCityFromWorldPick(worldCity);
      if (!city) {
        return res.status(400).json({
          message: "Invalid worldCity — use { name, countryCode, stateCode? } from search results",
        });
      }
    } else {
      return res.status(400).json({
        message: "Provide cityId or worldCity: { name, countryCode, stateCode? } from search results",
      });
    }

    const sd = parseDate(startDate, "startDate");
    const ed = parseDate(endDate, "endDate");
    if (sd.error) return res.status(400).json({ message: sd.error });
    if (ed.error) return res.status(400).json({ message: ed.error });
    if (ed.date < sd.date) {
      return res.status(400).json({ message: "endDate must be on or after startDate" });
    }

    const maxOrder = await prisma.stop.aggregate({
      where: { itineraryId: it.id },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const stop = await prisma.stop.create({
      data: {
        itineraryId: it.id,
        cityId: city.id,
        sortOrder,
        startDate: sd.date,
        endDate: ed.date,
        notes: typeof notes === "string" ? notes : "",
      },
      include: { city: true, activities: true },
    });

    res.status(201).json({ stop: serializeStop(stop) });
  } catch (err) {
    console.error("add stop:", err);
    res.status(500).json({ message: "Could not add stop" });
  }
});

/** PUT /api/itineraries/:itineraryId/stops/reorder — body: { orderedStopIds: string[] } */
router.put("/:itineraryId/stops/reorder", async (req, res) => {
  try {
    const it = await assertItineraryOwned(req.user.sub, req.params.itineraryId);
    if (!it) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    const { orderedStopIds } = req.body;
    if (!Array.isArray(orderedStopIds) || orderedStopIds.some((id) => typeof id !== "string")) {
      return res.status(400).json({ message: "orderedStopIds must be an array of strings" });
    }

    const stops = await prisma.stop.findMany({ where: { itineraryId: it.id } });
    if (orderedStopIds.length !== stops.length) {
      return res.status(400).json({ message: "Must include every stop exactly once" });
    }

    const ids = new Set(stops.map((s) => s.id));
    for (const id of orderedStopIds) {
      if (!ids.has(id)) {
        return res.status(400).json({ message: "Invalid stop id in ordered list" });
      }
    }

    await prisma.$transaction(
      orderedStopIds.map((id, index) => prisma.stop.update({ where: { id }, data: { sortOrder: index } }))
    );

    const full = await prisma.itinerary.findUnique({
      where: { id: it.id },
      include: itineraryInclude,
    });

    res.json({ itinerary: serializeItinerary(full) });
  } catch (err) {
    console.error("reorder stops:", err);
    res.status(500).json({ message: "Could not reorder stops" });
  }
});

export default router;
