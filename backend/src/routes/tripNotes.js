import { Router } from "express";
import { assertTripOwned } from "../lib/itineraryGuards.js";
import { parseDayDateInput } from "../lib/dayDate.js";
import { prisma } from "../lib/prisma.js";
import { serializeTripNote } from "../lib/serializeUser.js";

const router = Router({ mergeParams: true });

/** GET /api/trips/:tripId/notes?day=YYYY-MM-DD */
router.get("/", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const day = typeof req.query.day === "string" ? req.query.day.trim() : "";
    const where = { tripId: trip.id };
    if (day) {
      const parsed = parseDayDateInput(day);
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error });
      }
      where.dayDate = parsed.date;
    }

    const notes = await prisma.tripNote.findMany({
      where,
      orderBy: [{ dayDate: "desc" }, { updatedAt: "desc" }],
    });
    res.json({ notes: notes.map(serializeTripNote) });
  } catch (err) {
    console.error("list notes:", err);
    res.status(500).json({ message: "Could not load notes" });
  }
});

/** POST /api/trips/:tripId/notes */
router.post("/", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const { dayDate, title, body } = req.body;
    const parsed = parseDayDateInput(dayDate);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const t = typeof title === "string" ? title.trim().slice(0, 200) : "";
    const b = typeof body === "string" ? body.slice(0, 50000) : "";

    const note = await prisma.tripNote.create({
      data: {
        tripId: trip.id,
        userId: req.user.sub,
        dayDate: parsed.date,
        title: t,
        body: b,
      },
    });
    res.status(201).json({ note: serializeTripNote(note) });
  } catch (err) {
    console.error("create note:", err);
    res.status(500).json({ message: "Could not create note" });
  }
});

/** PUT /api/trips/:tripId/notes/:noteId */
router.put("/:noteId", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const note = await prisma.tripNote.findFirst({
      where: { id: req.params.noteId, tripId: trip.id, userId: req.user.sub },
    });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const { dayDate, title, body } = req.body;
    const data = {};

    if (dayDate !== undefined) {
      const parsed = parseDayDateInput(dayDate);
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error });
      }
      data.dayDate = parsed.date;
    }
    if (title !== undefined) {
      if (typeof title !== "string") {
        return res.status(400).json({ message: "title must be a string" });
      }
      data.title = title.trim().slice(0, 200);
    }
    if (body !== undefined) {
      if (typeof body !== "string") {
        return res.status(400).json({ message: "body must be a string" });
      }
      data.body = body.slice(0, 50000);
    }

    if (Object.keys(data).length === 0) {
      return res.json({ note: serializeTripNote(note) });
    }

    const updated = await prisma.tripNote.update({
      where: { id: note.id },
      data,
    });
    res.json({ note: serializeTripNote(updated) });
  } catch (err) {
    console.error("update note:", err);
    res.status(500).json({ message: "Could not update note" });
  }
});

/** DELETE /api/trips/:tripId/notes/:noteId */
router.delete("/:noteId", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const note = await prisma.tripNote.findFirst({
      where: { id: req.params.noteId, tripId: trip.id, userId: req.user.sub },
    });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await prisma.tripNote.delete({ where: { id: note.id } });
    res.status(204).send();
  } catch (err) {
    console.error("delete note:", err);
    res.status(500).json({ message: "Could not delete note" });
  }
});

export default router;
