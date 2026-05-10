import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { mockBudgetCategories } from "../data/mockData.js";

/** Budget breakdown UI — no calculations */
export default function Budget() {
  const totalAllocated = mockBudgetCategories.reduce((s, c) => s + c.allocated, 0);

  return (
    <>
      <PageHeader title="Budget" subtitle="Visual breakdown using static numbers — expense tracking comes later." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Categories</h2>
            <Badge tone="warning">Preview</Badge>
          </div>
          <div className="space-y-4">
            {mockBudgetCategories.map((cat) => (
              <div key={cat.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{cat.label}</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    ${cat.spent} / ${cat.allocated}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                    style={{ width: `${Math.min(100, (cat.spent / cat.allocated) * 100 || 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Summary</p>
          <p className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white">${totalAllocated}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Total allocated (static demo).</p>
          <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">Currency conversion and receipts are out of scope for this phase.</p>
        </Card>
      </div>
    </>
  );
}
