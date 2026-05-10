/** Stable day bucket for itinerary grouping (Canada locale = YYYY-MM-DD sortable) */
export function dayKeyFromIso(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA");
}

/** Long weekday heading for a stop’s calendar day */
export function formatStopDayHeading(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/** Journal timeline heading from YYYY-MM-DD (UTC noon interpretation) */
export function formatJournalDayHeading(yyyyMmDd) {
  if (!yyyyMmDd || typeof yyyyMmDd !== "string") return "";
  const [y, mo, da] = yyyyMmDd.split("-").map(Number);
  if (!y || !mo || !da) return yyyyMmDd;
  const d = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0));
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/** Format ISO date string for display in local timezone */
export function formatTripDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatTripRange(startIso, endIso) {
  return `${formatTripDate(startIso)} → ${formatTripDate(endIso)}`;
}

/** yyyy-mm-dd for `<input type="date" />` in local calendar */
export function toDateInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Deterministic gradient classes when no cover image URL */
const GRADIENTS = [
  "from-cyan-400/40 to-teal-600/45",
  "from-sky-400/35 to-indigo-600/45",
  "from-emerald-400/30 to-cyan-700/40",
  "from-violet-400/35 to-fuchsia-600/40",
  "from-amber-400/35 to-orange-600/40",
];

export function gradientClassForTripId(id) {
  if (!id) return GRADIENTS[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % GRADIENTS.length;
  return GRADIENTS[h];
}
