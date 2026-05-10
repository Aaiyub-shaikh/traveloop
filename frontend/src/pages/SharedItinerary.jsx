import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, Copy, Loader2, Share2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { publicShareApi } from "../lib/api.js";
import { formatTripRange } from "../lib/tripUtils.js";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { DayDivider } from "../components/itinerary/DayDivider.jsx";

function dayKey(iso) {
  return new Date(iso).toLocaleDateString("en-CA");
}

/** Public read-only itinerary — token in URL; copy requires login */
export default function SharedItinerary() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copying, setCopying] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const load = useCallback(async () => {
    if (!token?.trim()) {
      setError("Invalid link");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await publicShareApi.getItinerary(token.trim());
      setTrip(data.trip);
      setItinerary(data.itinerary);
    } catch (e) {
      setError(e.message || "Could not load shared trip");
      setTrip(null);
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const sortedStops = useMemo(() => {
    if (!itinerary?.stops?.length) return [];
    return [...itinerary.stops].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [itinerary]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  async function handleCopyTrip() {
    if (!token?.trim()) return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(shareUrl)}`);
      return;
    }
    setCopying(true);
    try {
      const data = await publicShareApi.copyToMyTrips(token.trim());
      navigate(`/trips/${data.trip.id}`, { replace: false });
    } catch (e) {
      setError(e.message || "Could not copy trip");
    } finally {
      setCopying(false);
    }
  }

  async function copyPageLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setError("Could not copy link");
    }
  }

  async function nativeShare() {
    if (!navigator.share || !trip) return;
    try {
      await navigator.share({
        title: trip.title,
        text: "View this itinerary on Traveloop",
        url: shareUrl,
      });
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Share failed");
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-sm">Loading shared itinerary…</p>
      </div>
    );
  }

  const title = trip?.title ?? "Shared itinerary";
  const subtitle = trip ? formatTripRange(trip.startDate, trip.endDate) : error || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Shared with you</p>
          <h1 className="font-display mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
          {trip?.description?.trim() && (
            <p className="mt-3 max-w-xl text-sm text-slate-700 dark:text-slate-300">{trip.description.trim()}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={copyPageLink} className="gap-2">
            <Copy className="h-4 w-4" />
            {copiedUrl ? "Copied" : "Copy link"}
          </Button>
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <Button type="button" variant="secondary" size="sm" onClick={nativeShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
          <Button type="button" size="sm" disabled={copying} onClick={handleCopyTrip} className="gap-2">
            {copying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {user ? (copying ? "Copying…" : "Copy to my trips") : "Sign in to copy"}
          </Button>
        </div>
      </header>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/30">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          <Button type="button" variant="secondary" className="mt-3" size="sm" onClick={load}>
            Retry
          </Button>
        </Card>
      )}

      {trip && (
        <Card className="mb-8 flex flex-wrap items-center gap-6 border-brand-200/50 dark:border-brand-800/40">
          <CalendarDays className="h-10 w-10 text-brand-500" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Itinerary</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {sortedStops.length
                ? `${sortedStops.length} stop${sortedStops.length === 1 ? "" : "s"} · read-only`
                : "No stops on this itinerary yet."}
            </p>
          </div>
        </Card>
      )}

      {!itinerary || sortedStops.length === 0 ? (
        trip && (
          <Card className="text-center text-slate-600 dark:text-slate-400">
            <p>No itinerary stops to show.</p>
          </Card>
        )
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

      <p className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
        Planning your own trip?{" "}
        <Link to="/signup" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Create an account
        </Link>
      </p>
    </div>
  );
}
