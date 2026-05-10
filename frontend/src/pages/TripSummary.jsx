import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Pencil, Trash2, Compass } from "lucide-react";
import { tripsApi } from "../lib/api.js";
import { formatTripDate, formatTripRange } from "../lib/tripUtils.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { PageLoader } from "../components/ui/Spinner.jsx";

/** View Trip Summary — load one trip; edit / delete */
export default function TripSummary() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await tripsApi.get(tripId);
      setTrip(data.trip);
    } catch (e) {
      setError(e.message || "Could not load trip");
      setTrip(null);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!trip || !window.confirm(`Delete “${trip.title}”? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    try {
      await tripsApi.remove(trip.id);
      navigate("/trips", { replace: true });
    } catch (e) {
      setError(e.message || "Could not delete trip");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <PageLoader message="Loading trip..." />;
  }

  if (error && !trip) {
    return (
      <div className="space-y-6">
        <PageHeader title="Trip" subtitle="We couldn’t load this trip." />
        <Card>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={load}>
              Retry
            </Button>
            <Link to="/trips">
              <Button variant="secondary" type="button">
                Back to trips
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!trip) return null;

  const range = formatTripRange(trip.startDate, trip.endDate);

  return (
    <>
      <PageHeader
        title={trip.title}
        subtitle={range}
        actions={
          <>
            <Link to={`/itinerary/${trip.id}`}>
              <Button variant="secondary" type="button" className="gap-2">
                <Compass className="h-4 w-4" />
                Itinerary
              </Button>
            </Link>
            <Link to={`/trips/${trip.id}/edit`}>
              <Button variant="secondary" type="button" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="danger" type="button" className="gap-2" disabled={deleting} onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="aspect-[21/9] max-h-72 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            {trip.coverImage?.trim() ? (
              <img src={trip.coverImage.trim()} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-400/30 to-brand-700/40 text-slate-500 dark:text-slate-400">
                <MapPin className="h-16 w-16 opacity-50" />
              </div>
            )}
          </div>
          <div className="p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">About this trip</h2>
            <p className="mt-3 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
              {trip.description?.trim() || "No description added yet. Edit the trip to add details."}
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start gap-3">
              <CalendarDays className="h-8 w-8 shrink-0 text-brand-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Dates</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{range}</p>
              </div>
            </div>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{formatTripDate(trip.createdAt)}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
