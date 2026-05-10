import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { mockPackingItems } from "../data/mockData.js";

/** Interactive checklist — local state only */
export default function PackingChecklist() {
  const [items, setItems] = useState(mockPackingItems);

  function toggle(id) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  const doneCount = items.filter((i) => i.done).length;

  return (
    <>
      <PageHeader
        title="Packing checklist"
        subtitle={`${doneCount}/${items.length} packed — state stays in this browser tab only.`}
        actions={
          <Button variant="secondary" type="button" disabled title="Lists sync later">
            Sync lists
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <ul className="divide-y divide-slate-200/80 dark:divide-slate-700">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="flex w-full items-center gap-4 py-4 text-left transition hover:bg-white/50 dark:hover:bg-slate-800/40"
              >
                {item.done ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-6 w-6 shrink-0 text-slate-400" />
                )}
                <span className={`text-base ${item.done ? "text-slate-500 line-through dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
