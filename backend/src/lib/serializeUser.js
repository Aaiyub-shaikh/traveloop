function envAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Safe JSON for clients — never includes password hash */
export function serializePublicUser(u) {
  const emails = envAdminEmails();
  const envGrant = emails.length > 0 && u.email && emails.includes(String(u.email).toLowerCase());
  const isAdmin = !!(u.isAdmin || envGrant);

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
    isAdmin,
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
