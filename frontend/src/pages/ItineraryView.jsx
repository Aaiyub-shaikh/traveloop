import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, PenLine } from "lucide-react";
import { itineraryApi, tripsApi } from "../lib/api.js";
import { formatTripRange } from "../lib/tripUtils.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { PageLoader } from "../components/ui/Spinner.jsx";
import { DayDivider } from "../components/itinerary/DayDivider.jsx";

function dayKey(iso) {
  return new Date(iso).toLocaleDateString("en-CA");
}

/** Read-only itinerary — uses saved itinerary when present */
export default function ItineraryView() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tData, iData] = await Promise.all([tripsApi.get(tripId), itineraryApi.getForTrip(tripId)]);
      setTrip(tData.trip);
      setItinerary(iData.itinerary);
    } catch (e) {
      setError(e.message || "Could not load trip");
      setTrip(null);
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const sortedStops = useMemo(() => {
    if (!itinerary?.stops?.length) return [];
    return [...itinerary.stops].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [itinerary]);

  if (loading) {
    return <PageLoader message="Loading itinerary..." />;
  }

  const title = trip?.title ?? "Trip";
  const subtitle = trip ? `${formatTripRange(trip.startDate, trip.endDate)}` : error || "Unknown trip";

  return (
    <>
      <PageHeader
        title={title}
        subtitle={trip?.description?.trim() ? `${subtitle} · ${trip.description.trim().slice(0, 80)}${trip.description.length > 80 ? "…" : ""}` : subtitle}
        actions={
          <Link to={`/itinerary/${tripId}/build`}>
            <Button variant="secondary" className="gap-2">
              <PenLine className="h-4 w-4" />
              Edit in builder
            </Button>
          </Link>
        }
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/30">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          <Button type="button" className="mt-3" variant="secondary" onClick={load}>
            Retry
          </Button>
        </Card>
      )}

      <Card className="mb-8 flex flex-wrap items-center gap-6 border-brand-200/50 dark:border-brand-800/40">
        <CalendarDays className="h-10 w-10 text-brand-500" />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">Itinerary</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {itinerary?.stops?.length
              ? `${sortedStops.length} stop${sortedStops.length === 1 ? "" : "s"} · read-only preview`
              : "Create an itinerary in the builder to see stops and activities here."}
          </p>
        </div>
        {trip && (
          <Link to={`/trips/${trip.id}`}>
            <Button variant="ghost" size="sm" type="button">
              Trip summary
            </Button>
          </Link>
        )}
      </Card>

      {!itinerary || sortedStops.length === 0 ? (
        <Card className="text-center">
          <p className="text-slate-600 dark:text-slate-400">No itinerary stops yet.</p>
          <Link to={`/itinerary/${tripId}/build`} className="mt-4 inline-block">
            <Button type="button">Open builder</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedStops.map((stop, idx) => {
            const prev = sortedStops[idx - 1];
            const showDay = !prev || dayKey(prev.startDate) !== dayKey(stop.startDate);
            const city = stop.city;
            const acts = [...(stop.activities || [])].sort((a, b) => a.sortOrder - b.sortOrder);
            return (
              <Fragment key={stop.id}>
                {showDay && (
                  <DayDivider
                    label={new Date(stop.startDate).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  />
                )}
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 font-display text-xl font-semibold text-slate-900 dark:text-white">
                        <span className="text-2xl">{city?.emoji || "📍"}</span>
                        {city?.name}
                        {city?.stateCode ? ` (${city.stateCode})` : ""}, {city?.country}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{formatTripRange(stop.startDate, stop.endDate)}</p>
                      {stop.notes?.trim() && <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{stop.notes}</p>}
                    </div>
                  </div>
                  {acts.length > 0 && (
                    <ul className="mt-6 divide-y divide-slate-200/80 dark:divide-slate-700">
                      {acts.map((a) => (
                        <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{a.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{a.description || "—"}</p>
                          </div>
                          {a.startsAt && <span className="text-sm text-brand-700 dark:text-brand-300">{a.startsAt}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </Fragment>
            );
          })}
        </div>
      )}
    </>
  );
}
