import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { mockTrips } from "../data/mockData.js";

/** Home dashboard — summary cards + quick links */
export default function Dashboard() {
  const { user } = useAuth();
  const upcoming = mockTrips.filter((t) => t.status !== "completed");

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] || "traveler"}`}
        subtitle="Your trip workspace is ready. Below is mock data until backend trip APIs ship."
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
              <h2 className="mt-2 font-display text-xl font-semibold text-slate-900 dark:text-white">Active trips</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{upcoming.length} trips in planning or draft (demo).</p>
            </div>
            <Sparkles className="h-10 w-10 text-brand-400/80" />
          </div>
          <ul className="mt-6 space-y-3">
            {upcoming.map((trip) => (
              <li key={trip.id}>
                <Link
                  to={`/itinerary/${trip.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/40 bg-white/50 px-4 py-3 transition hover:bg-white/80 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-800/60"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{trip.title}</p>
                    <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {trip.destination}
                    </p>
                  </div>
                  <Badge tone="neutral">{trip.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Calendar className="h-8 w-8 text-brand-500" />
          <h2 className="mt-4 font-display font-semibold text-slate-900 dark:text-white">Next steps</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>• Explore city & activity search (mock)</li>
            <li>• Open itinerary builder UI shell</li>
            <li>• Sketch budget & packing placeholders</li>
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
