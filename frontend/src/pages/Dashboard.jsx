import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { tripsApi } from "../lib/api.js";
import { formatTripRange } from "../lib/tripUtils.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";

/** Home dashboard — trips from API */
export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await tripsApi.list({ filter: "upcoming" });
      setTrips((data.trips || []).slice(0, 6));
    } catch (e) {
      setError(e.message || "Could not load trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] || "traveler"}`}
        subtitle="Your upcoming trips from the server."
        actions={
          <Link to="/trips/create">
            <Button className="gap-2">
              New trip <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Snapshot</p>
              <h2 className="mt-2 font-display text-xl font-semibold text-slate-900 dark:text-white">Upcoming trips</h2>
              {loading ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading…</p>
              ) : error ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{trips.length} trip{trips.length === 1 ? "" : "s"} with end date today or later.</p>
              )}
            </div>
            <Sparkles className="h-10 w-10 text-brand-400/80" />
          </div>

          {loading ? (
            <div className="mt-8 flex justify-center py-8">
              <Spinner className="scale-125" label="Loading trips" />
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {trips.map((trip) => (
                <li key={trip.id}>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="flex items-center justify-between rounded-xl border border-white/40 bg-white/50 px-4 py-3 transition hover:bg-white/80 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-800/60"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{trip.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{trip.description?.trim() || "No description"}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {formatTripRange(trip.startDate, trip.endDate)}
                      </p>
                    </div>
                    <Badge tone="brand">view</Badge>
                  </Link>
                </li>
              ))}
              {!error && trips.length === 0 && (
                <li className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-600 dark:text-slate-400">
                  No upcoming trips.{" "}
                  <Link to="/trips/create" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                    Create one
                  </Link>
                </li>
              )}
            </ul>
          )}
        </Card>

        <Card>
          <Calendar className="h-8 w-8 text-brand-500" />
          <h2 className="mt-4 font-display font-semibold text-slate-900 dark:text-white">Next steps</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>• Refine trips under My trips</li>
            <li>• Open itinerary builder (demo content)</li>
            <li>• Explore city & activity search</li>
          </ul>
          <Link to="/trips" className="mt-6 inline-block">
            <Button variant="secondary" size="sm" className="w-full">
              View all trips
            </Button>
          </Link>
        </Card>
      </div>
    </>
  );
}
