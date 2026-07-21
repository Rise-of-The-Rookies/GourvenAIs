/**
 * Reusable Button component.
 *
 * @param {'primary' | 'secondary' | 'ghost' | 'danger'} variant
 * @param {'sm' | 'md' | 'lg'} size
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';

  const variants = {
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/50 shadow-sm',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400/50',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400/50',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/50 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-4 py-2 text-[13px]',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
