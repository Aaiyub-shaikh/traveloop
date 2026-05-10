/** Multi-line field aligned with Input styling */
export function Textarea({ label, id, error, hint, rows = 4, className = "", ...props }) {
  const tid = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={tid} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={tid}
        rows={rows}
        className={`w-full resize-y rounded-xl border bg-white/80 px-4 py-2.5 text-slate-900 shadow-inner outline-none ring-brand-500/30 transition placeholder:text-slate-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500 ${
          error ? "border-red-400 focus:ring-red-400/40" : "border-slate-200 dark:border-slate-600"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
