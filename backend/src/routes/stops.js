import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { assertStopOwned } from "../lib/itineraryGuards.js";
import { resolveCityFromWorldPick } from "../lib/resolveWorldCity.js";
import { serializeActivity, serializeItinerary, serializeStop } from "../lib/serializeItinerary.js";

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

/** PUT /api/stops/:stopId/activities/reorder — register before /:stopId alone */
router.put("/:stopId/activities/reorder", async (req, res) => {
  try {
    const stop = await assertStopOwned(req.user.sub, req.params.stopId);
    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    const { orderedActivityIds } = req.body;
    if (!Array.isArray(orderedActivityIds) || orderedActivityIds.some((id) => typeof id !== "string")) {
      return res.status(400).json({ message: "orderedActivityIds must be an array of strings" });
    }

    const activities = await prisma.activity.findMany({ where: { stopId: stop.id } });
    if (orderedActivityIds.length !== activities.length) {
      return res.status(400).json({ message: "Must include every activity exactly once" });
    }

    const ids = new Set(activities.map((a) => a.id));
    for (const id of orderedActivityIds) {
      if (!ids.has(id)) {
        return res.status(400).json({ message: "Invalid activity id in ordered list" });
      }
    }

    await prisma.$transaction(
      orderedActivityIds.map((id, index) => prisma.activity.update({ where: { id }, data: { sortOrder: index } }))
    );

    const full = await prisma.itinerary.findUnique({
      where: { id: stop.itineraryId },
      include: itineraryInclude,
    });

    res.json({ itinerary: serializeItinerary(full) });
  } catch (err) {
    console.error("reorder activities:", err);
    res.status(500).json({ message: "Could not reorder activities" });
  }
});

/** POST /api/stops/:stopId/activities */
router.post("/:stopId/activities", async (req, res) => {
  try {
    const stop = await assertStopOwned(req.user.sub, req.params.stopId);
    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    const { title, description, startsAt } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "title is required" });
    }

    const maxOrder = await prisma.activity.aggregate({
      where: { stopId: stop.id },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const activity = await prisma.activity.create({
      data: {
        stopId: stop.id,
        title: title.trim(),
        description: typeof description === "string" ? description : "",
        startsAt: typeof startsAt === "string" && startsAt.trim() ? startsAt.trim() : null,
        sortOrder,
      },
    });

    res.status(201).json({ activity: serializeActivity(activity) });
  } catch (err) {
    console.error("add activity:", err);
    res.status(500).json({ message: "Could not add activity" });
  }
});

/** PUT /api/stops/:stopId */
router.put("/:stopId", async (req, res) => {
  try {
    const existing = await assertStopOwned(req.user.sub, req.params.stopId);
    if (!existing) {
      return res.status(404).json({ message: "Stop not found" });
    }

    const { cityId, worldCity, startDate, endDate, notes } = req.body;
    const data = {};

    if (cityId !== undefined && typeof cityId === "string") {
      const city = await prisma.city.findUnique({ where: { id: cityId } });
      if (!city) {
        return res.status(400).json({ message: "Unknown city" });
      }
      data.cityId = cityId;
    } else if (worldCity !== undefined && typeof worldCity === "object" && worldCity !== null) {
      const city = await resolveCityFromWorldPick(worldCity);
      if (!city) {
        return res.status(400).json({ message: "Invalid worldCity — use search results shape" });
      }
      data.cityId = city.id;
    }

    let nextStart = existing.startDate;
    let nextEnd = existing.endDate;

    if (startDate !== undefined) {
      const sd = parseDate(startDate, "startDate");
      if (sd.error) return res.status(400).json({ message: sd.error });
      nextStart = sd.date;
      data.startDate = sd.date;
    }
    if (endDate !== undefined) {
      const ed = parseDate(endDate, "endDate");
      if (ed.error) return res.status(400).json({ message: ed.error });
      nextEnd = ed.date;
      data.endDate = ed.date;
    }

    if (nextEnd < nextStart) {
      return res.status(400).json({ message: "endDate must be on or after startDate" });
    }

    if (notes !== undefined) {
      data.notes = typeof notes === "string" ? notes : "";
    }

    const updated = await prisma.stop.update({
      where: { id: existing.id },
      data,
      include: { city: true, activities: { orderBy: { sortOrder: "asc" } } },
    });

    res.json({ stop: serializeStop(updated) });
  } catch (err) {
    console.error("update stop:", err);
    res.status(500).json({ message: "Could not update stop" });
  }
});

/** DELETE /api/stops/:stopId */
router.delete("/:stopId", async (req, res) => {
  try {
    const existing = await assertStopOwned(req.user.sub, req.params.stopId);
    if (!existing) {
      return res.status(404).json({ message: "Stop not found" });
    }

    await prisma.stop.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    console.error("delete stop:", err);
    res.status(500).json({ message: "Could not delete stop" });
  }
});

export default router;
