/** Pulse placeholder — use for loading layouts */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/90 dark:bg-slate-700/80 motion-reduce:animate-none ${className}`}
      role="presentation"
      {...props}
    />
  );
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="glass-panel p-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      {lines > 1 && <Skeleton className="mt-2 h-4 w-5/6" />}
      {lines > 2 && <Skeleton className="mt-2 h-4 w-2/3" />}
    </div>
  );
}

/** Full-page route suspense fallback */
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="space-y-3">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-5 w-1/2 max-w-sm" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
