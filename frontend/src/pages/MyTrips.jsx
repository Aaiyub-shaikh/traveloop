import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { tripsApi } from "../lib/api.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { PageLoader } from "../components/ui/Spinner.jsx";
import { TripCard } from "../components/trips/TripCard.jsx";

const FILTERS = [
  { value: "all", label: "All trips" },
  { value: "upcoming", label: "Upcoming" },
  { value: "current", label: "In progress" },
  { value: "past", label: "Past" },
];

/** My Trips — list + search/filters from API */
export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchDebounced = useDebouncedValue(searchInput, 400);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await tripsApi.list({
        q: searchDebounced.trim() || undefined,
        filter: filter === "all" ? undefined : filter,
      });
      setTrips(data.trips || []);
    } catch (e) {
      setError(e.message || "Could not load trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [searchDebounced, filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="My trips"
        subtitle="Search and filter trips saved to your account."
        actions={
          <Link to="/trips/create">
            <Button>New trip</Button>
          </Link>
        }
      />

      <Card className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Search title or description…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search trips"
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Filter className="h-4 w-4 shrink-0" />
              <label htmlFor="trip-filter" className="sr-only">
                Filter
              </label>
            </span>
            <select
              id="trip-filter"
              className="w-full min-w-[180px] rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white sm:w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">Search updates after you pause typing. Filters apply together.</p>
      </Card>

      {loading ? (
        <PageLoader message="Loading trips..." />
      ) : error ? (
        <Card>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button type="button" className="mt-4" onClick={() => load()}>
            Retry
          </Button>
        </Card>
      ) : trips.length === 0 ? (
        <EmptyState title="No trips match" description="Try another search or create a new trip." actionLabel="Create trip" onAction={() => navigate("/trips/create")} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </>
  );
}
