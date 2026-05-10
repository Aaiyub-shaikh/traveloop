export function Badge({ children, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-500/15 text-brand-800 dark:text-brand-200",
    neutral: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
    success: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
    warning: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
  );
}
