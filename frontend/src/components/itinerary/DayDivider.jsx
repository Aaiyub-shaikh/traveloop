/** Visual separator between calendar days on the timeline */
export function DayDivider({ label }) {
  return (
    <div className="relative flex items-center gap-4 py-6 first:pt-0">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-400/40 to-transparent dark:via-brand-500/30" />
      <span className="shrink-0 rounded-full bg-brand-500/15 px-4 py-1.5 font-display text-sm font-semibold text-brand-800 dark:text-brand-200">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-400/40 to-transparent dark:via-brand-500/30" />
    </div>
  );
}
