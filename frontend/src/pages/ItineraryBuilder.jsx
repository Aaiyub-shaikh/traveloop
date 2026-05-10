import { useParams } from "react-router-dom";
import { GripVertical, Plus } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { mockItineraryDays } from "../data/mockData.js";

/** Drag-drop style UI shell — no reorder persistence */
export default function ItineraryBuilder() {
  const { tripId } = useParams();

  return (
    <>
      <PageHeader
        title="Itinerary builder"
        subtitle={`Trip ID: ${tripId} — timeline is static mock data for now.`}
        actions={
          <Button variant="secondary" className="gap-2" type="button" disabled title="Coming soon">
            <Plus className="h-4 w-4" />
            Add block
          </Button>
        }
      />

      <div className="space-y-6">
        {mockItineraryDays.map((day) => (
          <Card key={day.day}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/40 pb-4 dark:border-white/10">
              <div>
                <Badge tone="brand">Day {day.day}</Badge>
                <span className="ml-3 font-display text-lg font-semibold text-slate-900 dark:text-white">{day.date}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Placeholder scheduling</span>
            </div>
            <ul className="mt-4 space-y-3">
              {day.items.map((item, idx) => (
                <li
                  key={`${day.day}-${idx}`}
                  className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-white/40 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/40"
                >
                  <GripVertical className="mt-1 h-5 w-5 shrink-0 cursor-grab text-slate-400" aria-hidden />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.place}</p>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{item.time}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
