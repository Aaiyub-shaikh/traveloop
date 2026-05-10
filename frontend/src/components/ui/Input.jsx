/** Form input with label + validation message slot */
export function Input({ label, id, error, hint, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border bg-white/80 px-4 py-2.5 text-slate-900 shadow-inner outline-none ring-brand-500/30 transition placeholder:text-slate-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white dark:placeholder:text-slate-500 ${
          error ? "border-red-400 focus:ring-red-400/40" : "border-slate-200 dark:border-slate-600"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
