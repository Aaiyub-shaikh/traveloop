import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { assertActivityOwned } from "../lib/itineraryGuards.js";
import { serializeActivity } from "../lib/serializeItinerary.js";

const router = Router();
router.use(authMiddleware);

/** PUT /api/activities/:activityId */
router.put("/:activityId", async (req, res) => {
  try {
    const existing = await assertActivityOwned(req.user.sub, req.params.activityId);
    if (!existing) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const { title, description, startsAt, sortOrder } = req.body;
    const data = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "title cannot be empty" });
      }
      data.title = title.trim();
    }
    if (description !== undefined) {
      data.description = typeof description === "string" ? description : "";
    }
    if (startsAt !== undefined) {
      data.startsAt = typeof startsAt === "string" && startsAt.trim() ? startsAt.trim() : null;
    }
    if (sortOrder !== undefined) {
      if (typeof sortOrder !== "number" || !Number.isInteger(sortOrder)) {
        return res.status(400).json({ message: "sortOrder must be an integer" });
      }
      data.sortOrder = sortOrder;
    }

    const activity = await prisma.activity.update({
      where: { id: existing.id },
      data,
    });

    res.json({ activity: serializeActivity(activity) });
  } catch (err) {
    console.error("update activity:", err);
    res.status(500).json({ message: "Could not update activity" });
  }
});

/** DELETE /api/activities/:activityId */
router.delete("/:activityId", async (req, res) => {
  try {
    const existing = await assertActivityOwned(req.user.sub, req.params.activityId);
    if (!existing) {
      return res.status(404).json({ message: "Activity not found" });
    }

    await prisma.activity.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    console.error("delete activity:", err);
    res.status(500).json({ message: "Could not delete activity" });
  }
});

export default router;
