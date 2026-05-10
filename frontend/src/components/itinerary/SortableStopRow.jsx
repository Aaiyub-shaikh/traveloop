import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, MapPin, Trash2 } from "lucide-react";
import { formatTripRange, toDateInputValue } from "../../lib/tripUtils.js";
import { Button } from "../ui/Button.jsx";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { Textarea } from "../ui/Textarea.jsx";

/**
 * Single draggable stop card — city, dates, notes, activities
 */
export function SortableStopRow({
  stop,
  activityDraft,
  setActivityDraft,
  onSaveNotes,
  onSaveDates,
  onDeleteStop,
  onAddActivity,
  onDeleteActivity,
  onMoveActivity,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const city = stop.city;
  const acts = [...(stop.activities || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className={`border border-white/50 dark:border-white/10 ${isDragging ? "shadow-glass-lg ring-2 ring-brand-400/40" : ""}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <button
            type="button"
            className="mt-1 flex h-10 w-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label="Drag to reorder stop"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                  <span className="text-2xl" aria-hidden>
                    {city?.emoji || "📍"}
                  </span>
                  <span>
                    {city?.name}
                    {city?.stateCode ? ` (${city.stateCode})` : ""}, {city?.country}
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
                  {formatTripRange(stop.startDate, stop.endDate)}
                </p>
              </div>
              <Button variant="danger" size="sm" type="button" onClick={() => onDeleteStop(stop.id)}>
                <Trash2 className="h-4 w-4" />
                Remove stop
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                key={`${stop.id}-s-${stop.startDate}`}
                type="date"
                label="Start"
                defaultValue={toDateInputValue(stop.startDate)}
                onBlur={(e) => onSaveDates(stop.id, { startDate: e.target.value })}
              />
              <Input
                key={`${stop.id}-e-${stop.endDate}`}
                type="date"
                label="End"
                defaultValue={toDateInputValue(stop.endDate)}
                onBlur={(e) => onSaveDates(stop.id, { endDate: e.target.value })}
              />
            </div>

            <Textarea
              key={`${stop.id}-notes-${stop.notes ?? ""}`}
              label="Notes"
              rows={2}
              defaultValue={stop.notes ?? ""}
              onBlur={(e) => onSaveNotes(stop.id, e.target.value)}
              placeholder="Hotel, transport ideas…"
            />

            <div className="rounded-xl border border-slate-200/80 bg-white/40 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Activities</p>
              <ul className="mt-3 space-y-2">
                {acts.map((a, idx) => (
                  <li
                    key={a.id}
                    className="flex flex-col gap-2 rounded-lg border border-white/40 bg-white/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-slate-900/50"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{a.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {a.startsAt ? `${a.startsAt} · ` : ""}
                        {a.description || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                        disabled={idx === 0}
                        onClick={() => onMoveActivity(stop, a.id, "up")}
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
                        disabled={idx === acts.length - 1}
                        onClick={() => onMoveActivity(stop, a.id, "down")}
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <Button variant="ghost" size="sm" type="button" className="text-red-600 dark:text-red-400" onClick={() => onDeleteActivity(a.id)}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-700">
                <Input
                  placeholder="Activity title"
                  value={activityDraft[stop.id]?.title ?? ""}
                  onChange={(e) =>
                    setActivityDraft((d) => ({
                      ...d,
                      [stop.id]: { ...d[stop.id], title: e.target.value },
                    }))
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Time (e.g. 09:30)"
                    value={activityDraft[stop.id]?.startsAt ?? ""}
                    onChange={(e) =>
                      setActivityDraft((d) => ({
                        ...d,
                        [stop.id]: { ...d[stop.id], startsAt: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="Short detail"
                    value={activityDraft[stop.id]?.description ?? ""}
                    onChange={(e) =>
                      setActivityDraft((d) => ({
                        ...d,
                        [stop.id]: { ...d[stop.id], description: e.target.value },
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => onAddActivity(stop.id)}
                >
                  Add activity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
