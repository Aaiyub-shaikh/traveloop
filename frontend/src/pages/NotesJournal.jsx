import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { tripNotesApi, tripsApi } from "../lib/api.js";
import { formatJournalDayHeading } from "../lib/tripUtils.js";
import { useToast } from "../contexts/ToastContext.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";

function isoDayUTC(iso) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayLocalInput() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTs(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotesJournal() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tripIdFromUrl = searchParams.get("tripId")?.trim() || "";

  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripId, setTripId] = useState(tripIdFromUrl);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [showComposer, setShowComposer] = useState(false);
  const [newDay, setNewDay] = useState(todayLocalInput);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editDay, setEditDay] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    setTripId(tripIdFromUrl);
  }, [tripIdFromUrl]);

  const loadTrips = useCallback(async () => {
    setTripsLoading(true);
    try {
      const data = await tripsApi.list({ filter: "all" });
      setTrips(data.trips || []);
      if (!tripIdFromUrl && data.trips?.length === 1) {
        const only = data.trips[0].id;
        setTripId(only);
        setSearchParams({ tripId: only }, { replace: true });
      }
    } catch (e) {
      toast.error(e.message || "Could not load trips");
    } finally {
      setTripsLoading(false);
    }
  }, [tripIdFromUrl, setSearchParams, toast]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const loadNotes = useCallback(async () => {
    if (!tripId) {
      setNotes([]);
      return;
    }
    setNotesLoading(true);
    try {
      const data = await tripNotesApi.list(tripId);
      setNotes(data.notes || []);
    } catch (e) {
      toast.error(e.message || "Could not load notes");
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [tripId, toast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const n of notes) {
      const key = isoDayUTC(n.dayDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(n);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [notes]);

  function onTripChange(id) {
    setTripId(id);
    setSearchParams(id ? { tripId: id } : {}, { replace: true });
    setEditing(null);
    setShowComposer(false);
  }

  async function createNote(ev) {
    ev.preventDefault();
    if (!tripId) return;
    if (!newBody.trim() && !newTitle.trim()) {
      toast.error("Add a title or some notes");
      return;
    }
    setSavingNew(true);
    try {
      await tripNotesApi.create(tripId, { dayDate: newDay, title: newTitle, body: newBody });
      setNewTitle("");
      setNewBody("");
      setNewDay(todayLocalInput());
      setShowComposer(false);
      await loadNotes();
      toast.success("Note added");
    } catch (e) {
      toast.error(e.message || "Could not save note");
    } finally {
      setSavingNew(false);
    }
  }

  function startEdit(note) {
    setEditing(note.id);
    setEditDay(isoDayUTC(note.dayDate));
    setEditTitle(note.title || "");
    setEditBody(note.body || "");
  }

  async function saveEdit(noteId) {
    if (!tripId) return;
    setSavingEdit(true);
    try {
      await tripNotesApi.update(tripId, noteId, {
        dayDate: editDay,
        title: editTitle,
        body: editBody,
      });
      setEditing(null);
      await loadNotes();
      toast.success("Note updated");
    } catch (e) {
      toast.error(e.message || "Could not update");
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeNote(noteId) {
    if (!tripId || !window.confirm("Delete this note?")) return;
    try {
      await tripNotesApi.remove(tripId, noteId);
      if (editing === noteId) setEditing(null);
      await loadNotes();
      toast.success("Note deleted");
    } catch (e) {
      toast.error(e.message || "Could not delete");
    }
  }

  const selectedTrip = trips.find((t) => t.id === tripId);

  return (
    <>
      <PageHeader
        title="Notes & journal"
        subtitle={selectedTrip ? `Trip: ${selectedTrip.title}` : "Pick a trip to capture memories by day"}
        actions={
          tripId ? (
            <Button type="button" className="gap-2" onClick={() => setShowComposer((s) => !s)}>
              <Plus className="h-4 w-4" />
              {showComposer ? "Close" : "New note"}
            </Button>
          ) : null
        }
      />

      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="p-4 sm:p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Trip</label>
          {tripsLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading trips…
            </div>
          ) : trips.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No trips yet.{" "}
              <Link to="/trips/create" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Create one
              </Link>
            </p>
          ) : (
            <select
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
              value={tripId}
              onChange={(e) => onTripChange(e.target.value)}
            >
              <option value="">Select a trip…</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
          {tripId && (
            <Link to={`/trips/${tripId}`} className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              Open trip summary →
            </Link>
          )}
        </Card>

        {!tripId && !tripsLoading && trips.length > 0 && (
          <EmptyState icon={FileText} title="Select a trip" description="Choose a trip above to view and add notes by day." />
        )}

        {tripId && showComposer && (
          <Card className="p-4 sm:p-6">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white">New note</h2>
            <form className="mt-4 space-y-4" onSubmit={createNote}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Day</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  required
                />
              </div>
              <Input label="Title (optional)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Museum day" />
              <Textarea label="Notes" rows={6} value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="What happened today?" />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={savingNew}>
                  {savingNew ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save note"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowComposer(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {tripId && notesLoading && (
          <div className="flex justify-center py-12 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        )}

        {tripId && !notesLoading && grouped.length === 0 && !showComposer && (
          <EmptyState
            icon={Calendar}
            title="No notes for this trip"
            description="Add your first note to build a day-by-day journal."
          />
        )}

        {tripId &&
          !notesLoading &&
          grouped.map(([dayKey, dayNotes]) => (
            <div key={dayKey} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
                <Calendar className="h-5 w-5 text-brand-500" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
                  {formatJournalDayHeading(dayKey)}
                </h3>
              </div>
              <ul className="space-y-3">
                {dayNotes.map((note) => (
                  <li key={note.id}>
                    <Card className="p-4 sm:p-5">
                      {editing === note.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Day</label>
                            <input
                              type="date"
                              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
                              value={editDay}
                              onChange={(e) => setEditDay(e.target.value)}
                            />
                          </div>
                          <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                          <Textarea label="Notes" rows={5} value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" size="sm" disabled={savingEdit} onClick={() => saveEdit(note.id)}>
                              {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              {note.title?.trim() ? (
                                <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{note.title}</h4>
                              ) : (
                                <h4 className="text-sm font-medium italic text-slate-500 dark:text-slate-400">Untitled</h4>
                              )}
                              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{note.body || "—"}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <Button type="button" size="sm" variant="ghost" className="gap-1" onClick={() => startEdit(note)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only sm:not-sr-only">Edit</span>
                              </Button>
                              <Button type="button" size="sm" variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => removeNote(note.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
                            Updated {formatTs(note.updatedAt)} · Created {formatTs(note.createdAt)}
                          </p>
                        </>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </>
  );
}
