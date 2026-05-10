import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { exploreApi } from "../lib/api.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { AddToTripButton } from "../components/explore/AddToTripButton.jsx";

/** City search — mock static JSON + filters (country / region) */
export default function CitySearch() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);
  const [country, setCountry] = useState("all");
  const [region, setRegion] = useState("all");
  const [meta, setMeta] = useState({ countries: [], regions: [] });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    exploreApi
      .citiesMeta()
      .then((d) => setMeta({ countries: d.countries || [], regions: d.regions || [] }))
      .catch(() => setMeta({ countries: [], regions: [] }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    exploreApi
      .cities({ q: debouncedQ, country: country === "all" ? "" : country, region: region === "all" ? "" : region })
      .then((d) => {
        if (cancelled) return;
        setResults(d.cities || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message || "Search failed");
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, country, region]);

  return (
    <>
      <PageHeader
        title="City search"
        subtitle="Browse mock destinations with photos — static JSON on the server, no paid APIs."
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="relative min-w-[200px] flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Search city, country, or tagline…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search cities"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[320px]">
          <select
            className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            aria-label="Filter by region"
          >
            <option value="all">All regions</option>
            {meta.regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Filter by country"
          >
            <option value="all">All countries</option>
            {meta.countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mb-6 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="scale-125" label="Loading cities" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState title="No cities match" description="Try different filters or a shorter search." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((city) => (
            <Card key={city.id} className="flex flex-col overflow-visible p-0" padding={false}>
              <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-slate-200 dark:bg-slate-800">
                <img src={city.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute left-3 top-3">
                  <Badge tone="brand">{city.region}</Badge>
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{city.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                      {city.country}
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-300">{city.tagline}</p>
                <div className="mt-4 flex justify-end border-t border-slate-200/80 pt-4 dark:border-slate-700">
                  <AddToTripButton mode="city" city={{ name: city.name, country: city.country }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
