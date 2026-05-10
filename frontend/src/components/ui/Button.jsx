/**
 * Primary action button — variants for glass/travel UI
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:from-brand-400 hover:to-brand-500 disabled:opacity-50",
    secondary:
      "glass-panel border-brand-200/50 text-brand-800 hover:bg-white/90 dark:text-brand-100 dark:hover:bg-slate-800/80",
    ghost: "text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-slate-800/60",
    danger: "bg-red-500/90 text-white hover:bg-red-600",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2.5 text-sm font-medium rounded-xl",
    lg: "px-6 py-3 text-base font-semibold rounded-xl",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
