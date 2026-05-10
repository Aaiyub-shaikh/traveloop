import { Link } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { mockNotes } from "../data/mockData.js";

/** Notes list — static entries */
export default function NotesJournal() {
  const hasNotes = mockNotes.length > 0;

  return (
    <>
      <PageHeader
        title="Notes & journal"
        subtitle="Capture ideas beside your itinerary — CRUD backed by API later."
        actions={
          <Button className="gap-2" type="button" disabled title="Not implemented">
            <Plus className="h-4 w-4" />
            New note
          </Button>
        }
      />

      {!hasNotes ? (
        <EmptyState icon={FileText} title="No notes yet" description="Your journal entries will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mockNotes.map((note) => (
            <Link key={note.id} to="#" onClick={(e) => e.preventDefault()} className="block">
              <Card className="h-full transition hover:shadow-glass-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-8 w-8 shrink-0 text-brand-500" />
                  <div>
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white">{note.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{note.excerpt}</p>
                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">Updated {note.updatedAt}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
