import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

/** Profile screen — displays auth user; password change not wired */
export default function ProfileSettings() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Profile & settings" subtitle="Account fields reflect your authenticated user." />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="font-display font-semibold text-slate-900 dark:text-white">Account</h2>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input label="Full name" name="name" defaultValue={user?.name || ""} disabled />
            <Input label="Email" name="email" type="email" defaultValue={user?.email || ""} disabled />
            <p className="text-xs text-slate-500 dark:text-slate-400">Editing profile will require PATCH endpoints in a future release.</p>
            <Button type="button" variant="secondary" disabled>
              Save changes
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-slate-900 dark:text-white">Preferences</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Theme toggle lives in the navbar. Notifications and locale are placeholders.</p>
          <div className="mt-6 space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/50">
              <span className="text-sm text-slate-800 dark:text-slate-200">Email trip reminders</span>
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" disabled aria-disabled />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/50">
              <span className="text-sm text-slate-800 dark:text-slate-200">Weekly digest</span>
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" disabled aria-disabled />
            </label>
          </div>
        </Card>
      </div>
    </>
  );
}
