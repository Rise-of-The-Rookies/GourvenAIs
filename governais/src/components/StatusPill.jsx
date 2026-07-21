const STATUS_CONFIG = {
  approved: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' },
  pending:  { dot: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Pending' },
  rejected: { dot: 'bg-rose-500',    bg: 'bg-rose-50',    text: 'text-rose-700',    label: 'Rejected' },
  flagged:  { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700',     label: 'Flagged' },
  active:   { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
  inactive: { dot: 'bg-slate-400',   bg: 'bg-slate-100',  text: 'text-slate-600',   label: 'Inactive' },
};

/**
 * Status pill with a leading dot indicator.
 *
 * @param {'approved' | 'pending' | 'rejected' | 'flagged' | 'active' | 'inactive'} status
 */
export default function StatusPill({ status = 'pending', className = '' }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tabular-nums ${cfg.bg} ${cfg.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
