import { Link, useParams } from "react-router-dom";
import { CalendarDays, PenLine } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { mockItineraryDays, mockTrips } from "../data/mockData.js";

/** Read-only itinerary presentation */
export default function ItineraryView() {
  const { tripId } = useParams();
  const trip = mockTrips.find((t) => t.id === tripId) || mockTrips[0];

  return (
    <>
      <PageHeader
        title={trip.title}
        subtitle={`${trip.destination} · ${trip.startDate} → ${trip.endDate}`}
        actions={
          <Link to={`/itinerary/${tripId}/build`}>
            <Button variant="secondary" className="gap-2">
              <PenLine className="h-4 w-4" />
              Edit in builder
            </Button>
          </Link>
        }
      />

      <Card className="mb-8 flex flex-wrap items-center gap-6 border-brand-200/50 dark:border-brand-800/40">
        <CalendarDays className="h-10 w-10 text-brand-500" />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">Itinerary preview</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Sharing links and PDF export are placeholders.</p>
        </div>
      </Card>

      <div className="space-y-6">
        {mockItineraryDays.map((day) => (
          <Card key={day.day}>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Day {day.day} · {day.date}
            </p>
            <ul className="mt-4 divide-y divide-slate-200/80 dark:divide-slate-700">
              {day.items.map((item, idx) => (
                <li key={idx} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.place}</p>
                  </div>
                  <span className="text-sm text-brand-700 dark:text-brand-300">{item.time}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
