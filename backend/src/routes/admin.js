import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

/** GET /api/admin/analytics — aggregate metrics (admin only; guard applied at mount) */
router.get("/analytics", async (_req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      userCount,
      tripCount,
      stopCount,
      activityCount,
      itineraryCount,
      expenseAgg,
      popularStops,
      topActivityTitles,
      tripsByMonth,
      usersByMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.stop.count(),
      prisma.activity.count(),
      prisma.itinerary.count(),
      prisma.expense.aggregate({ _sum: { amount: true }, _count: { id: true } }),
      prisma.stop.groupBy({
        by: ["cityId"],
        _count: { cityId: true },
        orderBy: { _count: { cityId: "desc" } },
        take: 12,
      }),
      prisma.activity.groupBy({
        by: ["title"],
        _count: { title: true },
        orderBy: { _count: { title: "desc" } },
        take: 15,
      }),
      prisma.$queryRaw`
        SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*)::int AS count
        FROM "Trip"
        WHERE "createdAt" >= ${twelveMonthsAgo}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.$queryRaw`
        SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*)::int AS count
        FROM "User"
        WHERE "createdAt" >= ${twelveMonthsAgo}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ]);

    const cityIds = popularStops.map((r) => r.cityId);
    const cities =
      cityIds.length > 0
        ? await prisma.city.findMany({
            where: { id: { in: cityIds } },
            select: { id: true, name: true, country: true, emoji: true },
          })
        : [];
    const cityMap = Object.fromEntries(cities.map((c) => [c.id, c]));

    const popularCities = popularStops.map((row) => {
      const c = cityMap[row.cityId];
      return {
        cityId: row.cityId,
        name: c?.name ?? "Unknown",
        country: c?.country ?? "",
        emoji: c?.emoji ?? "📍",
        stopCount: row._count.cityId,
      };
    });

    const activitiesByTitle = topActivityTitles.map((row) => ({
      title: row.title || "(untitled)",
      count: row._count.title,
    }));

    const avgActivitiesPerStop = stopCount > 0 ? Math.round((activityCount / stopCount) * 100) / 100 : 0;

    res.json({
      generatedAt: now.toISOString(),
      users: { total: userCount },
      trips: { total: tripCount },
      itineraries: { total: itineraryCount },
      stops: { total: stopCount },
      activities: {
        total: activityCount,
        avgPerStop: avgActivitiesPerStop,
        topTitles: activitiesByTitle,
      },
      expenses: {
        count: expenseAgg._count.id,
        totalAmount: expenseAgg._sum.amount != null ? Number(expenseAgg._sum.amount) : 0,
      },
      popularCities,
      tripsByMonth: tripsByMonth.map((r) => ({ month: String(r.month), count: Number(r.count) })),
      usersByMonth: usersByMonth.map((r) => ({ month: String(r.month), count: Number(r.count) })),
    });
  } catch (err) {
    console.error("admin analytics:", err);
    res.status(500).json({ message: "Could not load analytics" });
  }
});

export default router;
