import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Map as MapIcon, Share2 } from "lucide-react";
import { itineraryApi, tripsApi } from "../lib/api.js";
import { dayKeyFromIso, formatStopDayHeading, formatTripRange, toDateInputValue } from "../lib/tripUtils.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { PageLoader } from "../components/ui/Spinner.jsx";
import { DayDivider } from "../components/itinerary/DayDivider.jsx";
import { SortableStopRow } from "../components/itinerary/SortableStopRow.jsx";
import { AddStopForm } from "../components/itinerary/AddStopForm.jsx";
import { ShareTripModal } from "../components/trips/ShareTripModal.jsx";

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  /** Stable prefill from Add to trip (location.state) or legacy query string */
  const initialCityQuery = useMemo(() => {
    const s = location.state?.explorePrefill;
    if (s?.city) return s.country ? `${s.city} ${s.country}` : s.city;
    const qc = searchParams.get("exploreCity") || "";
    const qco = searchParams.get("exploreCountry") || "";
    if (qc) return qco ? `${qc} ${qco}` : qc;
    return "";
  }, [location.state, searchParams]);
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingItin, setCreatingItin] = useState(false);
  const [addStopBusy, setAddStopBusy] = useState(false);
  const [addStopErr, setAddStopErr] = useState("");
  const [activityDraft, setActivityDraft] = useState({});
  const [reordering, setReordering] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tData, iData] = await Promise.all([tripsApi.get(tripId), itineraryApi.getForTrip(tripId)]);
      setTrip(tData.trip);
      setItinerary(iData.itinerary);
    } catch (e) {
      setError(e.message || "Could not load builder");
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

  const stopIds = useMemo(() => sortedStops.map((s) => s.id), [sortedStops]);

  async function handleCreateItinerary() {
    setCreatingItin(true);
    setError("");
    try {
      const data = await itineraryApi.createForTrip(tripId);
      setItinerary(data.itinerary);
    } catch (e) {
      setError(e.message || "Could not create itinerary");
    } finally {
      setCreatingItin(false);
    }
  }

  async function handleAddStop(payload) {
    if (!itinerary) return;
    setAddStopBusy(true);
    setAddStopErr("");
    try {
      await itineraryApi.addStop(itinerary.id, payload);
      const iData = await itineraryApi.getForTrip(tripId);
      setItinerary(iData.itinerary);
    } catch (e) {
      setAddStopErr(e.message || "Could not add stop");
    } finally {
      setAddStopBusy(false);
    }
  }

  async function refreshItinerary() {
    const iData = await itineraryApi.getForTrip(tripId);
    setItinerary(iData.itinerary);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id || !itinerary) return;
    const ids = [...stopIds];
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextOrder = arrayMove(ids, oldIndex, newIndex);
    setReordering(true);
    setError("");
    try {
      const data = await itineraryApi.reorderStops(itinerary.id, nextOrder);
      setItinerary(data.itinerary);
    } catch (e) {
      setError(e.message || "Could not reorder");
    } finally {
      setReordering(false);
    }
  }

  async function handleSaveDates(stopId, patch) {
    const stop = itinerary?.stops?.find((s) => s.id === stopId);
    if (!stop) return;
    const start = patch.startDate ?? toDateInputValue(stop.startDate);
    const end = patch.endDate ?? toDateInputValue(stop.endDate);
    setError("");
    try {
      await itineraryApi.updateStop(stopId, { startDate: start, endDate: end });
      await refreshItinerary();
    } catch (e) {
      setError(e.message || "Could not update dates");
    }
  }

  async function handleSaveNotes(stopId, notes) {
    const stop = itinerary?.stops?.find((s) => s.id === stopId);
    if (!stop || notes === (stop.notes ?? "")) return;
    setError("");
    try {
      await itineraryApi.updateStop(stopId, { notes });
      await refreshItinerary();
    } catch (e) {
      setError(e.message || "Could not save notes");
    }
  }

  async function handleDeleteStop(stopId) {
    if (!window.confirm("Remove this stop and its activities?")) return;
    setError("");
    try {
      await itineraryApi.deleteStop(stopId);
      await refreshItinerary();
    } catch (e) {
      setError(e.message || "Could not delete stop");
    }
  }

  async function handleAddActivity(stopId) {
    const d = activityDraft[stopId] || {};
    if (!d.title?.trim()) return;
    setError("");
    try {
      await itineraryApi.addActivity(stopId, {
        title: d.title.trim(),
        description: d.description?.trim() || "",
        startsAt: d.startsAt?.trim() || undefined,
      });
      setActivityDraft((prev) => ({ ...prev, [stopId]: {} }));
      await refreshItinerary();
    } catch (e) {
      setError(e.message || "Could not add activity");
    }
  }

  async function handleDeleteActivity(activityId) {
    setError("");
    try {
      await itineraryApi.deleteActivity(activityId);
      await refreshItinerary();
    } catch (e) {
      setError(e.message || "Could not remove activity");
    }
  }

  async function handleMoveActivity(stop, activityId, dir) {
    const acts = [...(stop.activities || [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const ids = acts.map((a) => a.id);
    const i = ids.indexOf(activityId);
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    setError("");
    try {
      const data = await itineraryApi.reorderActivities(stop.id, next);
      setItinerary(data.itinerary);
    } catch (e) {
      setError(e.message || "Could not reorder activities");
    }
  }

  if (loading) {
    return <PageLoader message="Loading itinerary builder..." />;
  }

  if (!trip) {
    return (
      <>
        <PageHeader title="Itinerary builder" subtitle="Trip not found." />
        <Card>
          <p className="text-slate-600 dark:text-slate-400">{error || "This trip may have been deleted."}</p>
          <Link to="/trips" className="mt-4 inline-block">
            <Button variant="secondary" type="button">
              Back to trips
            </Button>
          </Link>
        </Card>
      </>
    );
  }

  const subtitle = `${formatTripRange(trip.startDate, trip.endDate)} · ${itinerary ? "drag stops to reorder" : "create an itinerary to begin"}`;

  return (
    <>
      <PageHeader
        title={trip.title}
        subtitle={subtitle}
        actions={
          <>
            <Button variant="secondary" size="sm" type="button" className="gap-2" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Link to={`/trips/${trip.id}`}>
              <Button variant="ghost" size="sm" type="button">
                Trip summary
              </Button>
            </Link>
            <Link to={`/itinerary/${trip.id}`}>
              <Button variant="secondary" size="sm" type="button">
                Read-only view
              </Button>
            </Link>
          </>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {!itinerary ? (
        <Card className="max-w-xl">
          <div className="flex items-start gap-3">
            <MapIcon className="h-10 w-10 shrink-0 text-brand-500" />
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Create your itinerary</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                One itinerary per trip. Add stops, cities, and activities — reorder anytime with drag and drop.
              </p>
              <Button type="button" className="mt-6" disabled={creatingItin} onClick={handleCreateItinerary}>
                {creatingItin ? "Creating…" : "Create itinerary"}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          <div className="relative">
            {reordering && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center rounded-2xl bg-white/50 pt-20 dark:bg-slate-950/50">
                <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-lg dark:bg-slate-900">Saving order…</span>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={stopIds} strategy={verticalListSortingStrategy}>
                <div className="relative space-y-4 before:absolute before:left-[1.15rem] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-brand-400/30 md:before:left-[1.35rem]">
                  {sortedStops.length === 0 ? (
                    <EmptyState title="No stops yet" description="Add your first city stop below." />
                  ) : (
                    sortedStops.map((stop, idx) => {
                      const prev = sortedStops[idx - 1];
                      const showDay = !prev || dayKeyFromIso(prev.startDate) !== dayKeyFromIso(stop.startDate);
                      return (
                        <Fragment key={stop.id}>
                          {showDay && <DayDivider label={formatStopDayHeading(stop.startDate)} />}
                          <SortableStopRow
                            stop={stop}
                            activityDraft={activityDraft}
                            setActivityDraft={setActivityDraft}
                            onSaveDates={handleSaveDates}
                            onSaveNotes={handleSaveNotes}
                            onDeleteStop={handleDeleteStop}
                            onAddActivity={handleAddActivity}
                            onDeleteActivity={handleDeleteActivity}
                            onMoveActivity={handleMoveActivity}
                          />
                        </Fragment>
                      );
                    })
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <AddStopForm
            trip={trip}
            submitting={addStopBusy}
            error={addStopErr}
            onSubmit={handleAddStop}
            initialCityQuery={initialCityQuery}
          />
        </div>
      )}

      <ShareTripModal tripId={trip.id} tripTitle={trip.title} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}

