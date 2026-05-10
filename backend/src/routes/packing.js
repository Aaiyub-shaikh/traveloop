import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { assertTripOwned } from "../lib/itineraryGuards.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

const CATS = new Set(["clothing", "electronics", "documents", "essentials"]);

function serializeItem(i) {
  return {
    id: i.id,
    userId: i.userId,
    tripId: i.tripId,
    label: i.label,
    category: i.category,
    packed: i.packed,
    sortOrder: i.sortOrder,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

/** GET /api/packing/items?tripId= — tripId omitted: global list only; with tripId: that trip + global (null trip) items */
router.get("/items", async (req, res) => {
  try {
    const tripId = typeof req.query.tripId === "string" && req.query.tripId.trim() ? req.query.tripId.trim() : null;
    const userId = req.user.sub;
    const where = tripId
      ? { userId, OR: [{ tripId }, { tripId: null }] }
      : { userId, tripId: null };

    const items = await prisma.packingItem.findMany({
      where,
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });
    res.json({ items: items.map(serializeItem) });
  } catch (err) {
    console.error("packing list:", err);
    res.status(500).json({ message: "Could not load checklist" });
  }
});

/** POST /api/packing/items */
router.post("/items", async (req, res) => {
  try {
    const { label, category, tripId } = req.body;
    if (!label || typeof label !== "string" || !label.trim()) {
      return res.status(400).json({ message: "label is required" });
    }
    if (!category || typeof category !== "string" || !CATS.has(category)) {
      return res.status(400).json({ message: "category must be clothing|electronics|documents|essentials" });
    }

    let tid = null;
    if (tripId != null && tripId !== "") {
      if (typeof tripId !== "string") {
        return res.status(400).json({ message: "Invalid tripId" });
      }
      const trip = await assertTripOwned(req.user.sub, tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      tid = tripId;
    }

    const maxOrder = await prisma.packingItem.aggregate({
      where: { userId: req.user.sub, category, tripId: tid },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const item = await prisma.packingItem.create({
      data: {
        userId: req.user.sub,
        tripId: tid,
        label: label.trim().slice(0, 500),
        category,
        sortOrder,
      },
    });
    res.status(201).json({ item: serializeItem(item) });
  } catch (err) {
    console.error("packing create:", err);
    res.status(500).json({ message: "Could not add item" });
  }
});

/** PUT /api/packing/items/:id */
router.put("/items/:id", async (req, res) => {
  try {
    const item = await prisma.packingItem.findFirst({
      where: { id: req.params.id, userId: req.user.sub },
    });
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    const { label, category, packed, tripId } = req.body;
    const data = {};

    if (label !== undefined) {
      if (typeof label !== "string" || !label.trim()) {
        return res.status(400).json({ message: "label invalid" });
      }
      data.label = label.trim().slice(0, 500);
    }
    if (category !== undefined) {
      if (typeof category !== "string" || !CATS.has(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      data.category = category;
    }
    if (packed !== undefined) {
      if (typeof packed !== "boolean") {
        return res.status(400).json({ message: "packed must be boolean" });
      }
      data.packed = packed;
    }
    if (tripId !== undefined) {
      if (tripId === null || tripId === "") {
        data.tripId = null;
      } else if (typeof tripId === "string") {
        const trip = await assertTripOwned(req.user.sub, tripId);
        if (!trip) {
          return res.status(404).json({ message: "Trip not found" });
        }
        data.tripId = tripId;
      } else {
        return res.status(400).json({ message: "Invalid tripId" });
      }
    }

    const updated = await prisma.packingItem.update({
      where: { id: item.id },
      data,
    });
    res.json({ item: serializeItem(updated) });
  } catch (err) {
    console.error("packing update:", err);
    res.status(500).json({ message: "Could not update item" });
  }
});

/** DELETE /api/packing/items/:id */
router.delete("/items/:id", async (req, res) => {
  try {
    const item = await prisma.packingItem.findFirst({
      where: { id: req.params.id, userId: req.user.sub },
    });
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }
    await prisma.packingItem.delete({ where: { id: item.id } });
    res.status(204).send();
  } catch (err) {
    console.error("packing delete:", err);
    res.status(500).json({ message: "Could not delete item" });
  }
});

export default router;
