import { BarChart3, Shield, Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";

/** Admin shell — analytics placeholders only */
export default function AdminDashboard() {
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Operational overview — role checks and metrics ship later." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="warning">Placeholder</Badge>
        <span className="text-sm text-slate-600 dark:text-slate-400">Access control not enforced yet — UI preview for admins.</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <Users className="h-8 w-8 text-brand-500" />
          <p className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">—</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Registered users (wire count)</p>
        </Card>
        <Card>
          <BarChart3 className="h-8 w-8 text-brand-500" />
          <p className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">—</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Active trips (mock)</p>
        </Card>
        <Card>
          <Shield className="h-8 w-8 text-brand-500" />
          <p className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">JWT</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Auth strategy in production shape</p>
        </Card>
      </div>

      <Card className="mt-8">
        <h2 className="font-display font-semibold text-slate-900 dark:text-white">Audit log</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Admin actions and impersonation will render here.</p>
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
          Empty state — no events recorded.
        </div>
      </Card>
    </>
  );
}
