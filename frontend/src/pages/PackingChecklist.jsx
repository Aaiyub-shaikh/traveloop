import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Circle, Loader2, Plus, Trash2 } from "lucide-react";
import { packingApi, tripsApi } from "../lib/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";

const RING_C = 2 * Math.PI * 15.5;

const CATEGORIES = [
  { id: "essentials", label: "Essentials", hint: "Toiletries, meds, chargers" },
  { id: "clothing", label: "Clothing", hint: "Layers, shoes, swimwear" },
  { id: "electronics", label: "Electronics", hint: "Adapters, headphones" },
  { id: "documents", label: "Documents", hint: "ID, tickets, confirmations" },
];

export default function PackingChecklist() {
  const [searchParams] = useSearchParams();
  const tripIdParam = searchParams.get("tripId")?.trim() || "";

  const [items, setItems] = useState([]);
  const [tripTitle, setTripTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState("essentials");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [data, tripData] = await Promise.all([
        packingApi.list(tripIdParam || undefined),
        tripIdParam ? tripsApi.get(tripIdParam).catch(() => null) : Promise.resolve(null),
      ]);
      setItems(data.items || []);
      setTripTitle(tripData?.trip?.title || "");
    } catch (e) {
      setError(e.message || "Could not load checklist");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tripIdParam]);

  useEffect(() => {
    load();
  }, [load]);

  const byCategory = useMemo(() => {
    const map = Object.fromEntries(CATEGORIES.map((c) => [c.id, []]));
    for (const item of items) {
      if (map[item.category]) map[item.category].push(item);
      else map.essentials.push(item);
    }
    return map;
  }, [items]);

  const total = items.length;
  const packed = items.filter((i) => i.packed).length;
  const pct = total ? Math.round((packed / total) * 100) : 0;

  async function handleAdd(ev) {
    ev.preventDefault();
    if (!newLabel.trim()) return;
    setAdding(true);
    setError("");
    try {
      const body = { label: newLabel.trim(), category: newCategory };
      if (tripIdParam) body.tripId = tripIdParam;
      const { item } = await packingApi.create(body);
      setItems((prev) => [...prev, item].sort(sortItems));
      setNewLabel("");
    } catch (e) {
      setError(e.message || "Could not add item");
    } finally {
      setAdding(false);
    }
  }

  async function togglePacked(item) {
    setBusyId(item.id);
    setError("");
    try {
      const { item: updated } = await packingApi.update(item.id, { packed: !item.packed });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (e) {
      setError(e.message || "Could not update");
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(id) {
    if (!window.confirm("Remove this item?")) return;
    setBusyId(id);
    setError("");
    try {
      await packingApi.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      setError(e.message || "Could not delete");
    } finally {
      setBusyId(null);
    }
  }

  const subtitle =
    tripIdParam && tripTitle
      ? `${packed}/${total} packed · ${tripTitle}`
      : tripIdParam
        ? `${packed}/${total} packed · trip list`
        : `${packed}/${total} packed · general list`;

  return (
    <>
      <PageHeader
        title="Packing checklist"
        subtitle={loading ? "Loading…" : subtitle}
        actions={
          tripIdParam ? (
            <Link to={`/trips/${encodeURIComponent(tripIdParam)}`}>
              <Button variant="secondary" type="button" size="sm">
                Trip summary
              </Button>
            </Link>
          ) : null
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <span>Loading checklist…</span>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Progress</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {total === 0 ? "Add items below to track what’s packed." : `${packed} of ${total} items packed`}
                </p>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div
                className="relative flex h-16 w-16 shrink-0 items-center justify-center"
                title={total ? `${packed} of ${total} packed` : "No items"}
              >
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                  <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className="stroke-brand-500 transition-[stroke-dashoffset] duration-300"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - pct / 100)}
                  />
                </svg>
                <span className="relative text-sm font-bold text-brand-800 dark:text-brand-200">{total ? `${pct}%` : "—"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Add item</h2>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" onSubmit={handleAdd}>
              <div className="w-full flex-1 min-w-[12rem]">
                <Input
                  label="Item"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Rain jacket"
                  maxLength={500}
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-inner outline-none ring-brand-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={adding || !newLabel.trim()} className="w-full gap-2 sm:w-auto">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </form>
            {tripIdParam && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                New items are saved for this trip. Open Packing without a trip for a general list only.
              </p>
            )}
          </Card>

          <div className="space-y-8">
            {CATEGORIES.map((cat) => {
              const list = byCategory[cat.id] || [];
              if (list.length === 0) return null;
              return (
                <section key={cat.id}>
                  <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
                    {cat.label}
                  </h3>
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{cat.hint}</p>
                  <Card className="divide-y divide-slate-200/80 p-0 dark:divide-slate-700">
                    {list.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-stretch gap-2 px-3 py-2 sm:px-4 sm:py-3"
                      >
                        <button
                          type="button"
                          onClick={() => togglePacked(item)}
                          disabled={busyId === item.id}
                          className="flex min-h-[48px] flex-1 items-center gap-3 rounded-lg py-1 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          {busyId === item.id ? (
                            <Loader2 className="h-6 w-6 shrink-0 animate-spin text-brand-500" />
                          ) : item.packed ? (
                            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                          ) : (
                            <Circle className="h-6 w-6 shrink-0 text-slate-400" />
                          )}
                          <span
                            className={`text-base ${
                              item.packed ? "text-slate-500 line-through dark:text-slate-500" : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.tripId && (
                            <span className="ml-auto hidden shrink-0 rounded-md bg-brand-500/10 px-2 py-0.5 text-xs text-brand-800 dark:text-brand-200 sm:inline">
                              Trip
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={busyId === item.id}
                          className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          aria-label={`Delete ${item.label}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </Card>
                </section>
              );
            })}
          </div>

          {total === 0 && (
            <Card className="p-8 text-center text-slate-600 dark:text-slate-400">
              <p>No items yet. Add your first thing to pack above.</p>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function sortItems(a, b) {
  const o = (x) => CATEGORIES.findIndex((c) => c.id === x.category);
  const c = o(a) - o(b);
  if (c !== 0) return c;
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}
