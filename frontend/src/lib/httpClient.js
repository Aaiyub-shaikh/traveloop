import { env } from "../config/env.js";

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getErrorMessage(err, fallback = "Something went wrong") {
  if (err == null) return fallback;
  if (typeof err === "string") {
    const s = err.trim();
    return s || fallback;
  }
  if (err instanceof ApiError || err instanceof Error) {
    const msg = err.message?.trim();
    return msg || fallback;
  }
  return fallback;
}

function getStoredToken() {
  return localStorage.getItem("traveloop_token");
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || "Invalid response" };
  }
}

/**
 * JSON API fetch — Bearer token when logged in
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

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const data = await parseBody(res);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data.message) || res.statusText || "Request failed";
    throw new ApiError(String(message), { status: res.status, data });
  }

  return data;
}

/** Multipart upload — never set Content-Type (browser sets boundary) */
export async function apiUpload(path, formData) {
  const headers = {};
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: "POST",
    body: formData,
    headers,
  });

  const data = await parseBody(res);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data.message) || res.statusText || "Upload failed";
    throw new ApiError(String(message), { status: res.status, data });
  }

  return data;
}
