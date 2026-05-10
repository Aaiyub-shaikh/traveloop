import { useEffect, useState } from "react";
import { Filter, Search, Timer } from "lucide-react";
import { exploreApi } from "../lib/api.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { AddToTripButton } from "../components/explore/AddToTripButton.jsx";

/** Activity search — mock JSON + category & cost tier filters */
export default function ActivitySearch() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);
  const [category, setCategory] = useState("all");
  const [costTier, setCostTier] = useState("all");
  const [meta, setMeta] = useState({ categories: [], costTiers: [] });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    exploreApi
      .activitiesMeta()
      .then((d) =>
        setMeta({
          categories: d.categories || [],
          costTiers: d.costTiers || [],
        })
      )
      .catch(() => setMeta({ categories: [], costTiers: [] }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    exploreApi
      .activities({
        q: debouncedQ,
        category: category === "all" ? "" : category,
        costTier: costTier === "all" ? "" : costTier,
      })
      .then((d) => {
        if (cancelled) return;
        setResults(d.activities || []);
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
  }, [debouncedQ, category, costTier]);

  return (
    <>
      <PageHeader
        title="Activity search"
        subtitle="Mock experiences with photos — filter by category and cost tier; add cost ideas to a trip budget."
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="relative min-w-[200px] flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Search title, city, description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search activities"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="hidden h-4 w-4 text-slate-500 sm:block" />
          <select
            className="min-w-[160px] rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          >
            <option value="all">All categories</option>
            {meta.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="min-w-[140px] rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
            value={costTier}
            onChange={(e) => setCostTier(e.target.value)}
            aria-label="Cost tier"
          >
            <option value="all">All costs</option>
            {meta.costTiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mb-6 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="scale-125" label="Loading activities" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState title="No activities" description="Adjust filters or search terms." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((a) => (
            <Card key={a.id} className="flex flex-col overflow-visible p-0" padding={false}>
              <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-slate-200 dark:bg-slate-800">
                <img src={a.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <Badge tone="brand">{a.category}</Badge>
                  <Badge tone="neutral">{a.costTier}</Badge>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{a.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{a.city}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{a.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {a.duration}
                    </span>
                    <span className="font-medium text-brand-700 dark:text-brand-300">~${a.estimatedCost}</span>
                  </div>
                  <AddToTripButton mode="activity" activity={a} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
