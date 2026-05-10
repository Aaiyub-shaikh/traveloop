import { prisma } from "./prisma.js";

export async function assertTripOwned(userId, tripId) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });
  return trip;
}

export async function assertItineraryOwned(userId, itineraryId) {
  const it = await prisma.itinerary.findFirst({
    where: { id: itineraryId, trip: { userId } },
    include: { trip: true },
  });
  return it;
}

export async function assertStopOwned(userId, stopId) {
  const stop = await prisma.stop.findFirst({
    where: { id: stopId, itinerary: { trip: { userId } } },
    include: { itinerary: true },
  });
  return stop;
}

export async function assertActivityOwned(userId, activityId) {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, stop: { itinerary: { trip: { userId } } } },
    include: { stop: true },
  });
  return activity;
}
