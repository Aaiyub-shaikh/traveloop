import { Link, useNavigate } from "react-router-dom";
import { CalendarRange, ChevronRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { mockTrips } from "../data/mockData.js";

/** List trips from mock JSON */
export default function MyTrips() {
  const navigate = useNavigate();
  const showEmpty = mockTrips.length === 0;

  return (
    <>
      <PageHeader
        title="My trips"
        subtitle="Card grid fed by dummy JSON — swap with API later."
        actions={
          <Link to="/trips/create">
            <Button>New trip</Button>
          </Link>
        }
      />

      {showEmpty ? (
        <EmptyState title="No trips yet" description="Create a trip to populate this view." actionLabel="Create trip" onAction={() => navigate("/trips/create")} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {mockTrips.map((trip) => (
            <Link key={trip.id} to={`/itinerary/${trip.id}`} className="group block">
              <Card className="h-full overflow-hidden p-0 transition group-hover:shadow-glass-lg">
                <div className={`h-28 bg-gradient-to-br ${trip.coverGradient}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white">{trip.title}</h3>
                    <Badge tone={trip.status === "completed" ? "neutral" : "brand"}>{trip.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{trip.destination}</p>
                  <p className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarRange className="h-3.5 w-3.5" />
                    {trip.startDate} → {trip.endDate}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
                    Open itinerary <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
