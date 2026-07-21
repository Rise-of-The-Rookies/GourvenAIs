const VARIANT_CLASSES = {
  default: 'bg-slate-100 text-slate-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  blue: 'bg-blue-100 text-blue-700',
  // Risk-level aliases
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
};

/**
 * Small inline badge for labels, counts, and tags.
 *
 * @param {'default' | 'emerald' | 'amber' | 'rose' | 'blue'} variant
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
