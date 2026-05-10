import { Loader2 } from "lucide-react";

/** Loading indicator — inline or fullscreen overlay */
export function Spinner({ className = "", label = "Loading" }) {
  return (
    <span className={`inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 ${className}`} role="status" aria-label={label}>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner className="scale-125" />
      <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}
