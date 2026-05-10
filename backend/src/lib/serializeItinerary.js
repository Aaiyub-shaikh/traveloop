/** JSON shapes for itinerary API responses */

export function serializeCity(c) {
  return {
    id: c.id,
    worldKey: c.worldKey,
    name: c.name,
    country: c.country,
    countryCode: c.countryCode,
    stateCode: c.stateCode,
    tagline: c.tagline,
    emoji: c.emoji,
  };
}

export function serializeActivity(a) {
  return {
    id: a.id,
    stopId: a.stopId,
    title: a.title,
    description: a.description,
    sortOrder: a.sortOrder,
    startsAt: a.startsAt,
  };
}

export function serializeStop(s) {
  const acts = (s.activities || []).slice().sort((x, y) => x.sortOrder - y.sortOrder);
  return {
    id: s.id,
    itineraryId: s.itineraryId,
    cityId: s.cityId,
    city: s.city ? serializeCity(s.city) : null,
    sortOrder: s.sortOrder,
    startDate: s.startDate.toISOString(),
    endDate: s.endDate.toISOString(),
    notes: s.notes,
    activities: acts.map(serializeActivity),
  };
}

export function serializeItinerary(i) {
  const stops = (i.stops || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: i.id,
    tripId: i.tripId,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
    stops: stops.map(serializeStop),
  };
}
