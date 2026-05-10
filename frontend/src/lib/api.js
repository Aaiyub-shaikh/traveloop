/**
 * Domain API clients — HTTP via httpClient (single place for errors & base URL)
 */
import { apiFetch, apiUpload } from "./httpClient.js";

export { apiFetch, apiUpload, ApiError, getErrorMessage } from "./httpClient.js";

export const authApi = {
  register: (body) => apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiFetch("/api/auth/me"),
};

export const adminApi = {
  analytics: () => apiFetch("/api/admin/analytics"),
};

export const userApi = {
  getProfile: () => apiFetch("/api/user/profile"),
  updateProfile: (body) => apiFetch("/api/user/profile", { method: "PUT", body: JSON.stringify(body) }),
  uploadPhoto: (formData) => apiUpload("/api/user/profile/photo", formData),
  updatePreferences: (body) => apiFetch("/api/user/preferences", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body) => apiFetch("/api/user/password", { method: "PUT", body: JSON.stringify(body) }),
  deleteAccount: (body) => apiFetch("/api/user/account", { method: "DELETE", body: JSON.stringify(body) }),
  savedDestinations: () => apiFetch("/api/user/saved-destinations"),
  addSavedDestination: (body) => apiFetch("/api/user/saved-destinations", { method: "POST", body: JSON.stringify(body) }),
  removeSavedDestination: (id) =>
    apiFetch(`/api/user/saved-destinations/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const tripNotesApi = {
  list: (tripId, params = {}) => {
    const q = new URLSearchParams();
    if (params.day) q.set("day", params.day);
    const qs = q.toString();
    return apiFetch(`/api/trips/${encodeURIComponent(tripId)}/notes${qs ? `?${qs}` : ""}`);
  },
  create: (tripId, body) =>
    apiFetch(`/api/trips/${encodeURIComponent(tripId)}/notes`, { method: "POST", body: JSON.stringify(body) }),
  update: (tripId, noteId, body) =>
    apiFetch(`/api/trips/${encodeURIComponent(tripId)}/notes/${encodeURIComponent(noteId)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (tripId, noteId) =>
    apiFetch(`/api/trips/${encodeURIComponent(tripId)}/notes/${encodeURIComponent(noteId)}`, { method: "DELETE" }),
};

export const tripsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.q) q.set("q", params.q);
    if (params.filter) q.set("filter", params.filter);
    const qs = q.toString();
    return apiFetch(`/api/trips${qs ? `?${qs}` : ""}`);
  },
  get: (id) => apiFetch(`/api/trips/${encodeURIComponent(id)}`),
  create: (body) => apiFetch("/api/trips", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/api/trips/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => apiFetch(`/api/trips/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const shareApi = {
  get: (tripId) => apiFetch(`/api/trips/${encodeURIComponent(tripId)}/share`),
  create: (tripId, body = {}) =>
    apiFetch(`/api/trips/${encodeURIComponent(tripId)}/share`, { method: "POST", body: JSON.stringify(body) }),
  remove: (tripId) => apiFetch(`/api/trips/${encodeURIComponent(tripId)}/share`, { method: "DELETE" }),
  duplicateTrip: (tripId) => apiFetch(`/api/trips/${encodeURIComponent(tripId)}/duplicate`, { method: "POST" }),
};

export const publicShareApi = {
  getItinerary: (token) => apiFetch(`/api/public/itinerary/${encodeURIComponent(token)}`),
  copyToMyTrips: (token) =>
    apiFetch(`/api/public/itinerary/${encodeURIComponent(token)}/copy`, { method: "POST" }),
};

export const packingApi = {
  list: (tripId) => {
    const q = tripId ? `?tripId=${encodeURIComponent(tripId)}` : "";
    return apiFetch(`/api/packing/items${q}`);
  },
  create: (body) => apiFetch("/api/packing/items", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    apiFetch(`/api/packing/items/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => apiFetch(`/api/packing/items/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const citiesApi = {
  list: () => apiFetch("/api/cities"),
  search: (q, limit = 50) => {
    const params = new URLSearchParams();
    if (q != null && q !== "") params.set("q", q);
    params.set("limit", String(limit));
    return apiFetch(`/api/cities/search?${params.toString()}`);
  },
};

export const exploreApi = {
  citiesMeta: () => apiFetch("/api/explore/cities/meta"),
  cities: (params = {}) => {
    const q = new URLSearchParams();
    if (params.q) q.set("q", params.q);
    if (params.country) q.set("country", params.country);
    if (params.region) q.set("region", params.region);
    const qs = q.toString();
    return apiFetch(`/api/explore/cities${qs ? `?${qs}` : ""}`);
  },
  activitiesMeta: () => apiFetch("/api/explore/activities/meta"),
  activities: (params = {}) => {
    const q = new URLSearchParams();
    if (params.q) q.set("q", params.q);
    if (params.category) q.set("category", params.category);
    if (params.costTier) q.set("costTier", params.costTier);
    const qs = q.toString();
    return apiFetch(`/api/explore/activities${qs ? `?${qs}` : ""}`);
  },
};

export const budgetApi = {
  get: (tripId) => apiFetch(`/api/trips/${encodeURIComponent(tripId)}/budget`),
  update: (tripId, body) =>
    apiFetch(`/api/trips/${encodeURIComponent(tripId)}/budget`, { method: "PUT", body: JSON.stringify(body) }),
  addExpense: (tripId, body) =>
    apiFetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses`, { method: "POST", body: JSON.stringify(body) }),
  deleteExpense: (tripId, expenseId) =>
    apiFetch(`/api/trips/${encodeURIComponent(tripId)}/budget/expenses/${encodeURIComponent(expenseId)}`, {
      method: "DELETE",
    }),
};

export const itineraryApi = {
  getForTrip: (tripId) => apiFetch(`/api/trips/${encodeURIComponent(tripId)}/itinerary`),
  createForTrip: (tripId) => apiFetch(`/api/trips/${encodeURIComponent(tripId)}/itinerary`, { method: "POST" }),
  addStop: (itineraryId, body) =>
    apiFetch(`/api/itineraries/${encodeURIComponent(itineraryId)}/stops`, { method: "POST", body: JSON.stringify(body) }),
  reorderStops: (itineraryId, orderedStopIds) =>
    apiFetch(`/api/itineraries/${encodeURIComponent(itineraryId)}/stops/reorder`, {
      method: "PUT",
      body: JSON.stringify({ orderedStopIds }),
    }),
  updateStop: (stopId, body) => apiFetch(`/api/stops/${encodeURIComponent(stopId)}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteStop: (stopId) => apiFetch(`/api/stops/${encodeURIComponent(stopId)}`, { method: "DELETE" }),
  addActivity: (stopId, body) =>
    apiFetch(`/api/stops/${encodeURIComponent(stopId)}/activities`, { method: "POST", body: JSON.stringify(body) }),
  reorderActivities: (stopId, orderedActivityIds) =>
    apiFetch(`/api/stops/${encodeURIComponent(stopId)}/activities/reorder`, {
      method: "PUT",
      body: JSON.stringify({ orderedActivityIds }),
    }),
  updateActivity: (activityId, body) =>
    apiFetch(`/api/activities/${encodeURIComponent(activityId)}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteActivity: (activityId) => apiFetch(`/api/activities/${encodeURIComponent(activityId)}`, { method: "DELETE" }),
};
