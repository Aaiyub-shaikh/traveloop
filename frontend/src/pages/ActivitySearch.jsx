import { useMemo, useState } from "react";
import { Filter, Timer } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { mockActivities } from "../data/mockData.js";

/** Activity catalog UI — dummy rows */
export default function ActivitySearch() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => ["all", ...new Set(mockActivities.map((a) => a.category))], []);

  const filtered = useMemo(() => {
    let list = mockActivities;
    if (category !== "all") list = list.filter((a) => a.category === category);
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((a) => a.title.toLowerCase().includes(s) || a.city.toLowerCase().includes(s));
    return list;
  }, [q, category]);

  return (
    <>
      <PageHeader title="Activity search" subtitle="Browse placeholder experiences — booking integrations later." />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <Input label="Keyword" placeholder="Hike, food, wellness..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 lg:w-64">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category filter"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No activities" description="Adjust filters or search terms." />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" padding>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white">{a.title}</h3>
                  <Badge tone="brand">{a.category}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{a.city}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {a.duration}
                </span>
                <Badge tone="neutral">{a.priceHint}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
