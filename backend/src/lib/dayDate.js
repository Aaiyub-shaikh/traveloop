/** Parse YYYY-MM-DD to UTC noon for stable calendar-day storage */
export function parseDayDateInput(value) {
  if (!value || typeof value !== "string") return { error: "dayDate is required (YYYY-MM-DD)" };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return { error: "dayDate must be YYYY-MM-DD" };
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo, d, 12, 0, 0, 0));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo || dt.getUTCDate() !== d) {
    return { error: "Invalid calendar date" };
  }
  return { date: dt };
}

export function formatDayDateISO(d) {
  const x = d instanceof Date ? d : new Date(d);
  const y = x.getUTCFullYear();
  const mo = String(x.getUTCMonth() + 1).padStart(2, "0");
  const day = String(x.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}
