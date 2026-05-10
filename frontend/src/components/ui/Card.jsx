/** Glass-style card wrapper */
export function Card({ children, className = "", padding = true }) {
  return (
    <div className={`glass-panel ${padding ? "p-5 sm:p-6" : ""} ${className}`}>{children}</div>
  );
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`font-display text-lg font-semibold text-slate-900 dark:text-white ${className}`}>{children}</h3>;
}
