/** Safe JSON for clients — never includes password hash */
export function serializePublicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    profilePhoto: u.profilePhoto ?? "",
    bio: u.bio ?? "",
    language: u.language ?? "en",
    theme: u.theme ?? "system",
    currency: u.currency ?? "USD",
    notificationsEnabled: u.notificationsEnabled ?? true,
    notifyTripReminders: u.notifyTripReminders ?? true,
    notifyWeeklyDigest: u.notifyWeeklyDigest ?? false,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

export function serializeSavedDestination(d) {
  return {
    id: d.id,
    cityName: d.cityName,
    country: d.country,
    imageUrl: d.imageUrl ?? "",
    createdAt: d.createdAt.toISOString(),
  };
}

export function serializeTripNote(n) {
  return {
    id: n.id,
    tripId: n.tripId,
    userId: n.userId,
    dayDate: n.dayDate.toISOString(),
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}
