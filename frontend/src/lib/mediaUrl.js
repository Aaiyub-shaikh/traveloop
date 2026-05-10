import { env } from "../config/env.js";

/** Resolve uploaded asset path for <img src> (Vite proxy or absolute API host) */
export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  if (env.apiBaseUrl) return `${env.apiBaseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  return path;
}
