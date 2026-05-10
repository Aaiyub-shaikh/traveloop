/** Resolve uploaded asset path for <img src> (Vite proxy or absolute API host) */
export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const base = import.meta.env.VITE_API_URL ?? "";
  if (base) return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  return path;
}
