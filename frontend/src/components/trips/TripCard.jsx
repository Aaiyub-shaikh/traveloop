import { Link } from "react-router-dom";
import { CalendarRange, ChevronRight } from "lucide-react";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { formatTripRange, gradientClassForTripId } from "../../lib/tripUtils.js";

function tripMeta(trip) {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dayEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today > dayEnd) return "past";
  if (today < dayStart) return "upcoming";
  return "current";
}

/**
 * Trip preview card
 */
export function TripCard({ trip, showMetaBadge = true }) {
  const hrefSummary = `/trips/${trip.id}`;
  const range = formatTripRange(trip.startDate, trip.endDate);
  const gradient = gradientClassForTripId(trip.id);
  const desc = trip.description?.trim() ?? "";
  const excerpt = desc ? `${desc.slice(0, 120)}${desc.length > 120 ? "…" : ""}` : "No description yet";

  const meta = tripMeta(trip);

  return (
    <Link to={hrefSummary} className="group block">
      <Card className="h-full overflow-hidden p-0 transition group-hover:shadow-glass-lg">
        <div className="relative h-28 overflow-hidden">
          {trip.coverImage?.trim() ? (
            <img src={trip.coverImage.trim()} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white">{trip.title}</h3>
            {showMetaBadge && (
              <Badge tone={meta === "past" ? "neutral" : meta === "current" ? "success" : "brand"}>{meta}</Badge>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{excerpt}</p>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CalendarRange className="h-3.5 w-3.5 shrink-0" />
            {range}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
            View summary <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
