import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tripsApi } from "../lib/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { PageLoader, Spinner } from "../components/ui/Spinner.jsx";

/** ISO date (yyyy-mm-dd) from trip ISO string for date inputs */
function toDateInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function EditTrip() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await tripsApi.get(tripId);
      const t = data.trip;
      setTitle(t.title);
      setDescription(t.description || "");
      setStart(toDateInputValue(t.startDate));
      setEnd(toDateInputValue(t.endDate));
      setCoverImage(t.coverImage || "");
    } catch (e) {
      setLoadError(e.message || "Could not load trip");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  function validate() {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!start) e.startDate = "Start date is required";
    if (!end) e.endDate = "End date is required";
    if (start && end && start > end) e.endDate = "End must be on or after start";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setFormError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      await tripsApi.update(tripId, {
        title: title.trim(),
        description,
        startDate: start,
        endDate: end,
        coverImage: coverImage.trim(),
      });
      navigate(`/trips/${tripId}`, { replace: true });
    } catch (err) {
      if (err.data?.errors) {
        setFieldErrors(err.data.errors);
      }
      setFormError(err.message || "Could not save trip");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PageLoader message="Loading trip..." />;
  }

  if (loadError) {
    return (
      <>
        <PageHeader title="Edit trip" subtitle="Something went wrong." />
        <Card>
          <p className="text-red-600 dark:text-red-400">{loadError}</p>
          <div className="mt-4 flex gap-2">
            <Button type="button" onClick={load}>
              Retry
            </Button>
            <Link to="/trips">
              <Button variant="secondary" type="button">
                My trips
              </Button>
            </Link>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Edit trip" subtitle="Update details — changes save to your account." />

      <div className="mx-auto max-w-3xl">
        <Card>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Input label="Trip title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} error={fieldErrors.title} />
            <Textarea
              label="Description"
              name="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Destinations, notes, ideas…"
              error={fieldErrors.description}
            />
            <Input
              label="Cover image URL"
              name="coverImage"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
              hint="Optional — shown on cards and summary"
              error={fieldErrors.coverImage}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="date" label="Start date" name="startDate" value={start} onChange={(e) => setStart(e.target.value)} error={fieldErrors.startDate} />
              <Input type="date" label="End date" name="endDate" value={end} onChange={(e) => setEnd(e.target.value)} error={fieldErrors.endDate} />
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
                    <Spinner className="text-white" /> Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
              <Link to={`/trips/${tripId}`}>
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
