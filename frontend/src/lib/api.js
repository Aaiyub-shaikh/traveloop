/**
 * API base URL: empty string uses same-origin `/api` (Vite proxy in dev).
 * Set VITE_API_URL for direct backend calls if needed.
 */
const BASE = import.meta.env.VITE_API_URL ?? "";

function getStoredToken() {
  return localStorage.getItem("traveloop_token");
}

/**
 * JSON fetch helper with optional Bearer token
 */
export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || "Invalid response" };
  }

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const authApi = {
  register: (body) => apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiFetch("/api/auth/me"),
};

/** Trip CRUD — requires Bearer token (stored after login) */
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

export const citiesApi = {
  /** Cities persisted in DB (featured + created from stops) */
  list: () => apiFetch("/api/cities"),
  /** Worldwide search — requires q length ≥ 2 on server */
  search: (q, limit = 50) => {
    const params = new URLSearchParams();
    if (q != null && q !== "") params.set("q", q);
    params.set("limit", String(limit));
    return apiFetch(`/api/cities/search?${params.toString()}`);
  },
};

/** Mock explore catalog — static JSON on server */
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

/** Itinerary & builder — all routes require JWT */
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
