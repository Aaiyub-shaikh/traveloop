/** Canonical key for upserts — must match seed `country-state-city` picks */

export function buildWorldKey(countryCode, stateCode, name) {
  const cc = (countryCode || "").trim().toUpperCase();
  const sc = (stateCode || "").trim();
  const n = (name || "").trim();
  return `${cc}|${sc}|${n}`;
}
