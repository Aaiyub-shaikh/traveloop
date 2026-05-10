import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { duplicateTripForUser } from "../lib/duplicateTrip.js";
import { serializeItinerary } from "../lib/serializeItinerary.js";
import { serializePublicTrip } from "../lib/serializeTrip.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const itineraryInclude = {
  stops: {
    orderBy: { sortOrder: "asc" },
    include: { city: true, activities: { orderBy: { sortOrder: "asc" } } },
  },
};

/** GET /api/public/itinerary/:token — no auth */
router.get("/itinerary/:token", async (req, res) => {
  try {
    const token = req.params.token?.trim();
    if (!token) {
      return res.status(400).json({ message: "Invalid link" });
    }

    const link = await prisma.tripShareLink.findUnique({
      where: { token },
      include: { trip: true },
    });
    if (!link) {
      return res.status(404).json({ message: "Link not found or sharing was disabled" });
    }

    const it = await prisma.itinerary.findUnique({
      where: { tripId: link.tripId },
      include: itineraryInclude,
    });

    res.json({
      trip: serializePublicTrip(link.trip),
      itinerary: it ? serializeItinerary(it) : null,
    });
  } catch (err) {
    console.error("public itinerary:", err);
    res.status(500).json({ message: "Could not load shared trip" });
  }
});

/** POST /api/public/itinerary/:token/copy — copy into current user account */
router.post("/itinerary/:token/copy", authMiddleware, async (req, res) => {
  try {
    const token = req.params.token?.trim();
    if (!token) {
      return res.status(400).json({ message: "Invalid link" });
    }

    const link = await prisma.tripShareLink.findUnique({ where: { token } });
    if (!link) {
      return res.status(404).json({ message: "Link not found or sharing was disabled" });
    }

    const result = await duplicateTripForUser(req.user.sub, link.tripId);
    if (result.error) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("copy shared trip:", err);
    res.status(500).json({ message: "Could not copy trip" });
  }
});

export default router;
