import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tripsApi } from "../lib/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";

/** Create Trip — POST /api/trips */
export default function CreateTrip() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function validate() {
    const e = {};
    if (!title.trim()) e.title = "Give your trip a name";
    if (!start) e.startDate = "Start date is required";
    if (!end) e.endDate = "End date is required";
    if (start && end && start > end) e.endDate = "End must be on or after start";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setFormError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await tripsApi.create({
        title: title.trim(),
        description,
        coverImage: coverImage.trim(),
        startDate: start,
        endDate: end,
      });
      navigate(`/trips/${res.trip.id}`, { replace: true });
    } catch (err) {
      if (err.data?.errors) {
        setErrors(err.data.errors);
      }
      setFormError(err.message || "Could not create trip");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Create trip" subtitle="Save to your account — edit anytime from My trips." />

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Input label="Trip title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kyoto spring escape" error={errors.title} />
            <Textarea
              label="Description"
              name="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Destinations, notes, ideas…"
              error={errors.description}
            />
            <Input
              label="Cover image URL"
              name="coverImage"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
              hint="Optional"
              error={errors.coverImage}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="date" label="Start date" name="startDate" value={start} onChange={(e) => setStart(e.target.value)} error={errors.startDate} />
              <Input type="date" label="End date" name="endDate" value={end} onChange={(e) => setEnd(e.target.value)} error={errors.endDate} />
            </div>

            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                {formError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner className="text-white" /> Creating…
                  </>
                ) : (
                  "Create trip"
                )}
              </Button>
              <Link to="/trips">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Tips</p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Add a cover URL for richer cards (optional).</li>
              <li>Use the description for destinations and loose plans.</li>
              <li>After saving, open Itinerary from the summary.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
