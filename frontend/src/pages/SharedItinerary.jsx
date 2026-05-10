import { Link, useParams } from "react-router-dom";
import { Lock, Share2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { mockItineraryDays, mockTrips } from "../data/mockData.js";

/** Public-style shared view — mock token in URL */
export default function SharedItinerary() {
  const { token } = useParams();
  const trip = mockTrips[0];

  return (
    <>
      <PageHeader
        title="Shared itinerary"
        subtitle={`Link token: ${token || "demo"} — permission model not implemented.`}
        actions={
          <Button variant="ghost" className="gap-2" type="button" disabled>
            <Share2 className="h-4 w-4" />
            Copy link
          </Button>
        }
      />

      <Card className="mb-8 flex items-start gap-4 border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/30">
        <Lock className="h-6 w-6 shrink-0 text-amber-700 dark:text-amber-400" />
        <div>
          <p className="font-medium text-amber-950 dark:text-amber-100">Preview mode</p>
          <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-200/90">Real sharing, revocable links, and viewers will plug in here.</p>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">{trip.title}</h2>
        {mockItineraryDays.map((day) => (
          <Card key={day.day}>
            <p className="text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">
              Day {day.day} · {day.date}
            </p>
            <ul className="mt-3 space-y-2">
              {day.items.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium text-brand-700 dark:text-brand-400">{item.time}</span> · {item.title} — {item.place}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
        Want the full app?{" "}
        <Link to="/signup" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Create an account
        </Link>
      </p>
    </>
  );
}
