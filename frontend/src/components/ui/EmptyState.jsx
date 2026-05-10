import { Compass } from "lucide-react";
import { Button } from "./Button.jsx";

/** Illustrative empty state for lists and searches */
export function EmptyState({
  icon: Icon = Compass,
  title = "Nothing here yet",
  description = "Try creating something new or adjust your filters.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/40 px-6 py-14 text-center dark:border-slate-600 dark:bg-slate-900/30">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
