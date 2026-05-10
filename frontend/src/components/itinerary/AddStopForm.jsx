import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { citiesApi } from "../../lib/api.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { toDateInputValue } from "../../lib/tripUtils.js";
import { Button } from "../ui/Button.jsx";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Spinner } from "../ui/Spinner.jsx";

/** New stop — search worldwide cities, pick one, set dates */
export function AddStopForm({ trip, submitting, error, onSubmit, initialCityQuery = "" }) {
  const [query, setQuery] = useState(initialCityQuery);
  const debouncedQ = useDebouncedValue(query, 350);
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHint, setSearchHint] = useState(null);
  const [selected, setSelected] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (trip) {
      setStart(toDateInputValue(trip.startDate));
      setEnd(toDateInputValue(trip.endDate));
    }
  }, [trip]);

  useEffect(() => {
    if (initialCityQuery) {
      setQuery(initialCityQuery);
      setSelected(null);
      setOpen(true);
    }
  }, [initialCityQuery]);

  useEffect(() => {
    const q = debouncedQ.trim();
    if (q.length < 2) {
      setResults([]);
      setSearchHint(q.length === 0 ? null : "Type at least 2 characters…");
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchHint(null);

    citiesApi
      .search(q, 60)
      .then((data) => {
        if (cancelled) return;
        setResults(data.cities || []);
        setSearchHint(data.hint || null);
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
        setSearchHint("Search failed — try again.");
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  useEffect(() => {
    function handleClickOutside(ev) {
      if (wrapRef.current && !wrapRef.current.contains(ev.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!selected || !start || !end) return;
    onSubmit({
      worldCity: {
        name: selected.name,
        countryCode: selected.countryCode,
        stateCode: selected.stateCode || "",
      },
      startDate: start,
      endDate: end,
      notes,
    });
  }

  function formatPickLabel(c) {
    const region = c.stateCode ? `${c.stateCode} · ` : "";
    return `${c.name}, ${region}${c.countryName}`;
  }

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Add travel stop</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Search worldwide cities (dataset from{" "}
        <span className="font-medium text-brand-700 dark:text-brand-300">country-state-city</span>), pick one, then set dates.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div ref={wrapRef} className="relative">
          <label htmlFor="city-search" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            City
          </label>
          {selected ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200/60 bg-brand-500/5 px-4 py-3 dark:border-brand-800/50 dark:bg-brand-500/10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">Selected</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-white">{formatPickLabel(selected)}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setSelected(null); setOpen(true); }}>
                Change city
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="city-search"
                className="pl-10"
                placeholder="Search any city or country…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={open}
              />
            </div>
          )}

          {open && !selected && (
            <div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-glass-lg dark:border-slate-600 dark:bg-slate-900">
              {searchLoading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  <Spinner /> Searching…
                </div>
              )}
              {!searchLoading && searchHint && <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{searchHint}</p>}
              {!searchLoading &&
                !searchHint &&
                results.map((c, idx) => (
                  <button
                    key={`${c.countryCode}-${c.stateCode}-${c.name}-${idx}`}
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-brand-500/10 dark:hover:bg-brand-500/15"
                    onClick={() => {
                      setSelected(c);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{c.name}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {c.stateCode ? `${c.stateCode}, ` : ""}
                      {c.countryName}
                    </span>
                  </button>
                ))}
              {!searchLoading && debouncedQ.trim().length >= 2 && results.length === 0 && !searchHint && (
                <p className="px-4 py-3 text-sm text-slate-500">No matches — try another spelling.</p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input type="date" label="Arrival" name="start" value={start} onChange={(e) => setStart(e.target.value)} required />
          <Input type="date" label="Departure" name="end" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>

        <Textarea label="Notes (optional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Neighborhood, lodging…" />

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button type="submit" disabled={submitting || !selected} className="gap-2">
          {submitting ? (
            <>
              <Spinner className="text-white" /> Adding…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add stop
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
