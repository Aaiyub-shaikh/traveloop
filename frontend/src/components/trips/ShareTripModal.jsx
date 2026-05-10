import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Link2, RefreshCw, Share2, Trash2, X } from "lucide-react";
import { shareApi } from "../../lib/api.js";
import { Button } from "../ui/Button.jsx";

/** Modal: create / copy / regenerate public read-only itinerary link */
export function ShareTripModal({ tripId, tripTitle, open, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [share, setShare] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fullUrl = share ? `${window.location.origin}${share.path}` : "";

  const load = useCallback(async () => {
    if (!tripId || !open) return;
    setLoading(true);
    setError("");
    try {
      const data = await shareApi.get(tripId);
      setShare(data.share);
    } catch (e) {
      setError(e.message || "Could not load");
    } finally {
      setLoading(false);
    }
  }, [tripId, open]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function enableShare() {
    setSaving(true);
    setError("");
    try {
      const data = await shareApi.create(tripId, {});
      setShare(data.share);
    } catch (e) {
      setError(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function regenerate() {
    if (!window.confirm("Generate a new link? The old link will stop working.")) return;
    setSaving(true);
    setError("");
    try {
      const data = await shareApi.create(tripId, { regenerate: true });
      setShare(data.share);
    } catch (e) {
      setError(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function disableShare() {
    if (!window.confirm("Stop sharing? The public link will no longer work.")) return;
    setSaving(true);
    setError("");
    try {
      await shareApi.remove(tripId);
      setShare(null);
    } catch (e) {
      setError(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  async function nativeShare() {
    if (!navigator.share || !share) return;
    try {
      await navigator.share({
        title: tripTitle || "Trip",
        text: "View my itinerary on Traveloop",
        url: fullUrl,
      });
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Share failed");
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close dialog" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/20 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Share itinerary</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Anyone with the link can view this itinerary. They cannot edit your trip.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : !share ? (
          <div className="mt-6">
            <Button type="button" onClick={enableShare} disabled={saving} className="gap-2">
              <Link2 className="h-4 w-4" />
              {saving ? "…" : "Create public link"}
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="break-all rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {fullUrl}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={copyLink} className="gap-2">
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy link"}
              </Button>
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <Button type="button" variant="secondary" size="sm" onClick={nativeShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share…
                </Button>
              )}
              <a
                href={`mailto:?subject=${encodeURIComponent(`Itinerary: ${tripTitle || "Trip"}`)}&body=${encodeURIComponent(fullUrl)}`}
                className="inline-flex"
              >
                <Button variant="ghost" size="sm" type="button">
                  Email
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={regenerate} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                New link
              </Button>
              <Button type="button" variant="danger" size="sm" disabled={saving} onClick={disableShare} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Stop sharing
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
