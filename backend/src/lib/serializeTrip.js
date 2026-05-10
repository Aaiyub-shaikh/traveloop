/** JSON shape for trip API responses */
export function serializeTrip(t) {
  return {
    id: t.id,
    userId: t.userId,
    title: t.title,
    description: t.description,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    coverImage: t.coverImage,
    createdAt: t.createdAt.toISOString(),
  };
}

/** Public share view — no owner id */
export function serializePublicTrip(t) {
  return {
    title: t.title,
    description: t.description,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    coverImage: t.coverImage,
  };
}
