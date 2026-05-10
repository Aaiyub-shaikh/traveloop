import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { tripsApi } from "../../lib/api.js";
import { Button } from "../ui/Button.jsx";
import { Spinner } from "../ui/Spinner.jsx";

/**
 * Pick a trip then navigate with location.state (reliable with React Strict Mode)
 * + portal popover so parent overflow:hidden does not clip UI.
 */
export function AddToTripButton({ mode, city, activity, className = "" }) {
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tripId, setTripId] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 288 });

  useEffect(() => {
    if (!open) return;
    function place() {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = 288;
      let left = r.right - w;
      if (left < 8) left = 8;
      if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
      let top = r.bottom + 8;
      const estH = 280;
      if (top + estH > window.innerHeight - 8) {
        top = Math.max(8, r.top - estH - 8);
      }
      setPos({ top, left, width: w });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(ev) {
      if (ev.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(ev) {
      const a = anchorRef.current;
      const p = panelRef.current;
      if (a?.contains(ev.target) || p?.contains(ev.target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTripId("");
    setLoading(true);
    tripsApi
      .list()
      .then((d) => setTrips(d.trips || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, [open]);

  function go() {
    if (!tripId) return;
    if (mode === "city" && city) {
      navigate(`/itinerary/${tripId}/build`, {
        state: {
          explorePrefill: { city: city.name, country: city.country || "" },
        },
      });
    } else if (mode === "activity" && activity) {
      navigate("/budget", {
        state: {
          budgetPrefill: {
            tripId,
            suggestCategory: mapActivityCategory(activity.category),
            suggestAmount: String(activity.estimatedCost ?? 0),
            suggestLabel: activity.title,
          },
        },
      });
    }
    setOpen(false);
  }

  const panel =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Choose trip"
        className="fixed z-[200] max-h-[min(320px,70vh)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-glass-lg dark:border-slate-600 dark:bg-slate-900"
        style={{ top: pos.top, left: pos.left, width: pos.width }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Choose trip</p>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : trips.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">Create a trip under My trips first.</p>
        ) : (
          <>
            <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {trips.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setTripId(t.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      tripId === t.id
                        ? "bg-brand-500/20 font-medium text-brand-900 dark:text-brand-100"
                        : "text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
            <Button type="button" className="mt-4 w-full" size="sm" disabled={!tripId} onClick={go}>
              Continue
            </Button>
          </>
        )}
      </div>,
      document.body
    );

  return (
    <div className={`relative inline-flex ${className}`}>
      <span ref={anchorRef}>
        <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={() => setOpen((o) => !o)}>
          <Plus className="h-4 w-4" />
          Add to trip
        </Button>
      </span>
      {panel}
    </div>
  );
}

function mapActivityCategory(cat) {
  const c = (cat || "").toLowerCase();
  if (c === "food" || c === "wellness") return "food";
  if (c === "outdoors" || c === "culture") return "activities";
  return "activities";
}
