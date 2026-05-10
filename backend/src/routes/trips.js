import { randomBytes } from "crypto";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { assertTripOwned } from "../lib/itineraryGuards.js";
import { duplicateTripForUser } from "../lib/duplicateTrip.js";
import { serializeItinerary } from "../lib/serializeItinerary.js";
import { serializeTrip } from "../lib/serializeTrip.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

/** All trip routes require JWT */
router.use(authMiddleware);

function parseDate(value, fieldName) {
  if (!value) return { error: `${fieldName} is required` };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { error: `${fieldName} must be a valid date` };
  return { date: d };
}

function validateTripBody(body, partial = false) {
  const { title, description, startDate, endDate, coverImage } = body;
  const errors = {};

  if (!partial || title !== undefined) {
    if (!title || typeof title !== "string" || !title.trim()) {
      errors.title = "Title is required";
    } else if (title.trim().length > 200) {
      errors.title = "Title must be 200 characters or less";
    }
  }

  if (description !== undefined && typeof description !== "string") {
    errors.description = "Description must be text";
  } else if (typeof description === "string" && description.length > 10000) {
    errors.description = "Description is too long";
  }

  if (coverImage !== undefined && coverImage !== null && typeof coverImage !== "string") {
    errors.coverImage = "Cover image must be a URL string";
  } else if (typeof coverImage === "string" && coverImage.length > 2000) {
    errors.coverImage = "Cover image URL is too long";
  }

  let start = null;
  let end = null;

  if (!partial || startDate !== undefined) {
    const s = parseDate(startDate, "startDate");
    if (s.error) errors.startDate = s.error;
    else start = s.date;
  }
  if (!partial || endDate !== undefined) {
    const e = parseDate(endDate, "endDate");
    if (e.error) errors.endDate = e.error;
    else end = e.date;
  }

  if (start && end && end < start) {
    errors.endDate = "End date must be on or after start date";
  }

  return { errors, title: title?.trim(), description, coverImage, start, end };
}

/** GET /api/trips?q=&filter=all|upcoming|past|current */
router.get("/", async (req, res) => {
  try {
    const userId = req.user.sub;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const filter = typeof req.query.filter === "string" ? req.query.filter : "all";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    /** Combine search + date filters with AND so q + filter work together */
    const clauses = [{ userId }];

    if (q) {
      clauses.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (filter === "upcoming") {
      clauses.push({ endDate: { gte: startOfToday } });
    } else if (filter === "past") {
      clauses.push({ endDate: { lt: startOfToday } });
    } else if (filter === "current") {
      clauses.push({ startDate: { lte: endOfToday } }, { endDate: { gte: startOfToday } });
    }

    const where = { AND: clauses };

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startDate: "asc" },
    });

    res.json({ trips: trips.map(serializeTrip) });
  } catch (err) {
    console.error("list trips:", err);
    res.status(500).json({ message: "Could not load trips" });
  }
});

/** POST /api/trips */
router.post("/", async (req, res) => {
  try {
    const v = validateTripBody(req.body, false);
    if (Object.keys(v.errors).length) {
      return res.status(400).json({ message: "Validation failed", errors: v.errors });
    }

    const trip = await prisma.trip.create({
      data: {
        userId: req.user.sub,
        title: v.title,
        description: typeof v.description === "string" ? v.description : "",
        startDate: v.start,
        endDate: v.end,
        coverImage: typeof v.coverImage === "string" ? v.coverImage.trim() : "",
      },
    });

    res.status(201).json({ trip: serializeTrip(trip) });
  } catch (err) {
    console.error("create trip:", err);
    res.status(500).json({ message: "Could not create trip" });
  }
});

const itineraryInclude = {
  stops: {
    orderBy: { sortOrder: "asc" },
    include: { city: true, activities: { orderBy: { sortOrder: "asc" } } },
  },
};

/** GET /api/trips/:tripId/itinerary — { itinerary } or { itinerary: null } */
router.get("/:tripId/itinerary", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const it = await prisma.itinerary.findUnique({
      where: { tripId: trip.id },
      include: itineraryInclude,
    });
    res.json({ itinerary: it ? serializeItinerary(it) : null });
  } catch (err) {
    console.error("get itinerary:", err);
    res.status(500).json({ message: "Could not load itinerary" });
  }
});

/** POST /api/trips/:tripId/itinerary — create (one per trip) */
router.post("/:tripId/itinerary", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const existing = await prisma.itinerary.findUnique({ where: { tripId: trip.id } });
    if (existing) {
      return res.status(409).json({ message: "Itinerary already exists for this trip" });
    }
    const it = await prisma.itinerary.create({
      data: { tripId: trip.id },
      include: itineraryInclude,
    });
    res.status(201).json({ itinerary: serializeItinerary(it) });
  } catch (err) {
    console.error("create itinerary:", err);
    res.status(500).json({ message: "Could not create itinerary" });
  }
});

function makeShareToken() {
  return randomBytes(24).toString("base64url");
}

/** GET /api/trips/:tripId/share — { share: { token, path, createdAt } | null } */
router.get("/:tripId/share", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const link = await prisma.tripShareLink.findUnique({ where: { tripId: trip.id } });
    if (!link) {
      return res.json({ share: null });
    }
    res.json({
      share: {
        token: link.token,
        path: `/shared/${link.token}`,
        createdAt: link.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("get share:", err);
    res.status(500).json({ message: "Could not load share link" });
  }
});

/** POST /api/trips/:tripId/share — body: { regenerate?: boolean } */
router.post("/:tripId/share", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const regenerate = !!req.body?.regenerate;
    let link = await prisma.tripShareLink.findUnique({ where: { tripId: trip.id } });

    if (!link) {
      link = await prisma.tripShareLink.create({
        data: { tripId: trip.id, token: makeShareToken() },
      });
    } else if (regenerate) {
      link = await prisma.tripShareLink.update({
        where: { tripId: trip.id },
        data: { token: makeShareToken() },
      });
    }

    res.json({
      share: {
        token: link.token,
        path: `/shared/${link.token}`,
        createdAt: link.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("create share:", err);
    res.status(500).json({ message: "Could not create share link" });
  }
});

/** DELETE /api/trips/:tripId/share */
router.delete("/:tripId/share", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    await prisma.tripShareLink.deleteMany({ where: { tripId: trip.id } });
    res.status(204).send();
  } catch (err) {
    console.error("delete share:", err);
    res.status(500).json({ message: "Could not disable sharing" });
  }
});

/** POST /api/trips/:tripId/duplicate — clone trip + itinerary for same user */
router.post("/:tripId/duplicate", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    const result = await duplicateTripForUser(req.user.sub, trip.id);
    if (result.error) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("duplicate trip:", err);
    res.status(500).json({ message: "Could not duplicate trip" });
  }
});

/** GET /api/trips/:id */
router.get("/:id", async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user.sub },
    });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json({ trip: serializeTrip(trip) });
  } catch (err) {
    console.error("get trip:", err);
    res.status(500).json({ message: "Could not load trip" });
  }
});

/** PUT /api/trips/:id */
router.put("/:id", async (req, res) => {
  try {
    const existing = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user.sub },
    });
    if (!existing) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const merged = {
      title: req.body.title !== undefined ? req.body.title : existing.title,
      description: req.body.description !== undefined ? req.body.description : existing.description,
      startDate: req.body.startDate !== undefined ? req.body.startDate : existing.startDate.toISOString(),
      endDate: req.body.endDate !== undefined ? req.body.endDate : existing.endDate.toISOString(),
      coverImage: req.body.coverImage !== undefined ? req.body.coverImage : existing.coverImage,
    };

    const v = validateTripBody(merged, false);
    if (Object.keys(v.errors).length) {
      return res.status(400).json({ message: "Validation failed", errors: v.errors });
    }

    const trip = await prisma.trip.update({
      where: { id: existing.id },
      data: {
        title: v.title,
        description: typeof v.description === "string" ? v.description : merged.description,
        startDate: v.start,
        endDate: v.end,
        coverImage: typeof v.coverImage === "string" ? v.coverImage.trim() : merged.coverImage ?? "",
      },
    });

    res.json({ trip: serializeTrip(trip) });
  } catch (err) {
    console.error("update trip:", err);
    res.status(500).json({ message: "Could not update trip" });
  }
});

/** DELETE /api/trips/:id */
router.delete("/:id", async (req, res) => {
  try {
    const existing = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user.sub },
    });
    if (!existing) {
      return res.status(404).json({ message: "Trip not found" });
    }

    await prisma.trip.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    console.error("delete trip:", err);
    res.status(500).json({ message: "Could not delete trip" });
  }
});

export default router;
