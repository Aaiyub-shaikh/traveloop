import { City, Country } from "country-state-city";

/**
 * In-memory index built from country-state-city (~150k+ places).
 * First search pays parse cost; afterwards scans until `limit` matches.
 */

let index = null;

function buildIndex() {
  if (index) return index;
  const all = City.getAllCities();
  index = all.map((c) => ({
    name: c.name,
    countryCode: c.countryCode,
    stateCode: c.stateCode || "",
    countryName: Country.getCountryByCode(c.countryCode)?.name || c.countryCode,
    latitude: c.latitude,
    longitude: c.longitude,
  }));
  return index;
}

/** Warm index at startup so first user search isn’t slow */
export function warmupWorldCitiesIndex() {
  try {
    buildIndex();
    console.log("[traveloop] World cities index ready (" + index.length + " places)");
  } catch (e) {
    console.error("[traveloop] World cities index failed:", e.message);
  }
}

/**
 * Substring match on city name or country name (case-insensitive).
 * Minimum query length avoids scanning on single-letter requests.
 */
export function searchWorldCities(query, limit = 50) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return [];
  }
  const max = Math.min(Math.max(limit, 1), 100);
  const rows = buildIndex();
  /** Prefer prefix matches so typing “par” surfaces Paris before random substring hits */
  const starts = [];
  const contains = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const ln = r.name.toLowerCase();
    const lc = r.countryName.toLowerCase();
    if (ln.startsWith(q) || lc.startsWith(q)) {
      starts.push(r);
    } else if (ln.includes(q) || lc.includes(q)) {
      contains.push(r);
    }
  }
  const picked = [...starts, ...contains].slice(0, max);
  return picked.map((r) => ({
    name: r.name,
    countryCode: r.countryCode,
    stateCode: r.stateCode,
    countryName: r.countryName,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}
