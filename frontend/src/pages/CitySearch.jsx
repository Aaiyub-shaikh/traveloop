import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { mockCities } from "../data/mockData.js";

/** City browse + client-side filter over dummy list */
export default function CitySearch() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return mockCities;
    return mockCities.filter((c) => c.name.toLowerCase().includes(s) || c.country.toLowerCase().includes(s));
  }, [q]);

  return (
    <>
      <PageHeader title="City search" subtitle="Filter mock destinations — geospatial search arrives later." />

      <div className="mb-8 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Search cities or countries..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search cities"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try another keyword — data is static JSON." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((city) => (
            <Card key={city.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl" aria-hidden>
                  {city.image}
                </span>
                <MapPin className="h-5 w-5 text-brand-500" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{city.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{city.country}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{city.tagline}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
