import { prisma } from "./prisma.js";
import { serializeTrip } from "./serializeTrip.js";

/** Deep-clone a trip + itinerary (stops + activities) for a new owner */
export async function duplicateTripForUser(newUserId, sourceTripId) {
  const source = await prisma.trip.findUnique({
    where: { id: sourceTripId },
    include: {
      itinerary: {
        include: {
          stops: {
            orderBy: { sortOrder: "asc" },
            include: { activities: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  if (!source) {
    return { error: "not_found" };
  }

  const baseTitle = source.title.trim();
  const copySuffix = " (copy)";
  const title =
    baseTitle.length + copySuffix.length <= 200 ? `${baseTitle}${copySuffix}` : `${baseTitle.slice(0, 200 - copySuffix.length)}${copySuffix}`;

  const newTrip = await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.create({
      data: {
        userId: newUserId,
        title,
        description: source.description ?? "",
        startDate: source.startDate,
        endDate: source.endDate,
        coverImage: source.coverImage ?? "",
      },
    });

    if (!source.itinerary) {
      return trip;
    }

    const it = await tx.itinerary.create({
      data: { tripId: trip.id },
    });

    for (const stop of source.itinerary.stops) {
      const newStop = await tx.stop.create({
        data: {
          itineraryId: it.id,
          cityId: stop.cityId,
          sortOrder: stop.sortOrder,
          startDate: stop.startDate,
          endDate: stop.endDate,
          notes: stop.notes ?? "",
        },
      });
      for (const act of stop.activities) {
        await tx.activity.create({
          data: {
            stopId: newStop.id,
            title: act.title,
            description: act.description ?? "",
            sortOrder: act.sortOrder,
            startsAt: act.startsAt,
          },
        });
      }
    }

    return trip;
  });

  return { trip: serializeTrip(newTrip) };
}
