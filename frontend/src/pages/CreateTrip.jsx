import { useState } from "react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Badge } from "../components/ui/Badge.jsx";

/** Create Trip — form UI only; no persistence yet */
export default function CreateTrip() {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [errors, setErrors] = useState({});
  const [savedPreview, setSavedPreview] = useState(null);

  function validate() {
    const e = {};
    if (!title.trim()) e.title = "Give your trip a name";
    if (!destination.trim()) e.destination = "Where are you going?";
    if (!start) e.start = "Start date helps organize your plan";
    if (!end) e.end = "End date completes the window";
    if (start && end && start > end) e.end = "End must be after start";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    // Placeholder: show JSON preview instead of API call
    setSavedPreview({ title: title.trim(), destination: destination.trim(), start, end });
  }

  return (
    <>
      <PageHeader title="Create trip" subtitle="Capture the basics — persistence and invites arrive in a later milestone." />

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Input label="Trip title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kyoto spring escape" error={errors.title} />
            <Input
              label="Destination"
              name="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="City, region, or route"
              error={errors.destination}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="date" label="Start date" name="start" value={start} onChange={(e) => setStart(e.target.value)} error={errors.start} />
              <Input type="date" label="End date" name="end" value={end} onChange={(e) => setEnd(e.target.value)} error={errors.end} />
            </div>
            <Button type="submit">Save draft (local preview)</Button>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Preview</p>
            {!savedPreview ? (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Submit the form to see a local preview object — no server save yet.</p>
            ) : (
              <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-slate-900/90 p-4 text-xs text-emerald-300">{JSON.stringify(savedPreview, null, 2)}</pre>
            )}
          </Card>
          <Card>
            <Badge tone="warning">Placeholder</Badge>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Trip CRUD and collaborators will connect here.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
