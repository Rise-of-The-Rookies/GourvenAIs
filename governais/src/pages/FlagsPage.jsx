import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';

// ── Helpers ────────────────────────────────────────────

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relative time label, e.g. "2 h ago", "3 d ago", "just now". */
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Category badge config ──────────────────────────────

const CATEGORY_CONFIG = {
  PII: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  Financial: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  'Confidential/Internal': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  Credentials: {
    bg: 'bg-rose-200',
    text: 'text-rose-900',
    border: 'border-rose-300',
    dot: 'bg-rose-700',
  },
};

function CategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.PII;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {category}
    </span>
  );
}

// ── Status pill for resolved flags ─────────────────────

function FlagStatusPill({ status }) {
  if (status === 'reviewed_safe') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        No Violation
      </span>
    );
  }
  if (status === 'reviewed_violation') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        Policy Violation
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
      Open
    </span>
  );
}

// ── Review Modal ──────────────────────────────────────

function FlagReviewModal({ open, onClose, flag, onResolve }) {
  const [note, setNote] = useState('');

  // Reset note when modal opens
  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  if (!flag) return null;

  const config = CATEGORY_CONFIG[flag.sensitivityCategory] || CATEGORY_CONFIG.PII;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Flag Detail"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Flag summary */}
        <div className="bg-slate-50 rounded-lg px-4 py-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-slate-800">{flag.toolName}</p>
            <CategoryBadge category={flag.sensitivityCategory} />
          </div>
          <div className="flex gap-5 text-[12px] text-slate-500">
            <span>{flag.employeeName}</span>
            <span>{flag.department}</span>
            <span>{formatDateTime(flag.timestamp)}</span>
          </div>
        </div>

        {/* Matched terms */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Matched Patterns
          </p>
          <div className="flex flex-wrap gap-1.5">
            {flag.matchedTerms.map((term) => (
              <span
                key={term}
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border ${config.bg} ${config.text} ${config.border}`}
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-lg px-4 py-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-[12px] text-blue-800 leading-relaxed">
              Flagged because this content matched patterns associated with <strong>{flag.sensitivityCategory}</strong>.
              The classifier detected {flag.matchedTerms.length} pattern{flag.matchedTerms.length !== 1 ? 's' : ''} that may indicate sensitive data handling.
            </p>
          </div>
        </div>

        {/* Review note */}
        <div>
          <label htmlFor="flag-review-note" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Review note <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="flag-review-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context about your review decision…"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="!bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100"
            onClick={() => onResolve('reviewed_safe', note)}
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No Violation
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => onResolve('reviewed_violation', note)}
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Policy Violation
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Open Flag Row ─────────────────────────────────────

function OpenFlagRow({ flag, onSelect }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors duration-100 cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(flag)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(flag); } }}
      aria-label={`Review flag for ${flag.toolName} — ${flag.sensitivityCategory}`}
    >
      {/* Category indicator dot */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${(CATEGORY_CONFIG[flag.sensitivityCategory] || CATEGORY_CONFIG.PII).dot}`}
        aria-hidden="true"
      />

      {/* Tool + employee */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-800 truncate">{flag.toolName}</p>
        <p className="text-[12px] text-slate-500 truncate">{flag.employeeName} · {flag.department}</p>
      </div>

      {/* Category badge */}
      <span className="hidden sm:block">
        <CategoryBadge category={flag.sensitivityCategory} />
      </span>

      {/* Matched terms pills */}
      <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
        {flag.matchedTerms.slice(0, 3).map((term) => (
          <span
            key={term}
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
          >
            {term}
          </span>
        ))}
        {flag.matchedTerms.length > 3 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400">
            +{flag.matchedTerms.length - 3}
          </span>
        )}
      </div>

      {/* Timestamp */}
      <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap tabular-nums shrink-0">
        {timeAgo(flag.timestamp)}
      </span>

      {/* Chevron */}
      <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────

export default function FlagsPage() {
  const { currentUser, flags, resolveFlag } = useAppData();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  // ── Role guard ─────────────────────────────────────
  useEffect(() => {
    if (currentUser.role !== 'compliance_admin') {
      navigate('/', { replace: true });
    }
  }, [currentUser.role, navigate]);

  // ── Modal state ────────────────────────────────────
  const [selectedFlag, setSelectedFlag] = useState(null);

  // ── Derived data ───────────────────────────────────
  const openFlags = useMemo(
    () => flags
      .filter((f) => f.status === 'open')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [flags],
  );

  const resolvedFlags = useMemo(
    () => flags
      .filter((f) => f.status !== 'open')
      .sort((a, b) => new Date(b.reviewedAt || b.timestamp) - new Date(a.reviewedAt || a.timestamp)),
    [flags],
  );

  // Reviewed this week
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const reviewedThisWeek = useMemo(
    () => flags.filter(
      (f) => f.status !== 'open' && f.reviewedAt && new Date(f.reviewedAt) >= sevenDaysAgo,
    ).length,
    [flags, sevenDaysAgo],
  );

  // Category breakdown for open flags
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    for (const flag of openFlags) {
      counts[flag.sensitivityCategory] = (counts[flag.sensitivityCategory] || 0) + 1;
    }
    return counts;
  }, [openFlags]);

  // ── Handlers ───────────────────────────────────────

  const handleResolve = (resolution, reviewNote) => {
    if (!selectedFlag) return;
    resolveFlag(selectedFlag.id, resolution, reviewNote);

    const label = resolution === 'reviewed_safe'
      ? 'marked as no violation'
      : 'marked as policy violation';
    showSuccess(`Flag for "${selectedFlag.toolName}" ${label}.`);

    setSelectedFlag(null);
  };

  // ── Render ─────────────────────────────────────────

  if (currentUser.role !== 'compliance_admin') return null;

  return (
    <div className="space-y-6 page-enter">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sensitivity Flags</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Review flagged AI tool interactions that may involve sensitive data.
          </p>
        </div>
        <Badge variant={openFlags.length > 0 ? 'rose' : 'emerald'}>
          {openFlags.length} open
        </Badge>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Open flags */}
        <div className="stat-card-enter bg-white border border-slate-200/80 border-l-[3px] border-l-rose-500 rounded-xl px-4 py-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Open Flags</p>
            <svg className="w-5 h-5 text-rose-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          </div>
          <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">{openFlags.length}</p>
        </div>

        {/* Reviewed this week */}
        <div className="stat-card-enter bg-white border border-slate-200/80 border-l-[3px] border-l-emerald-500 rounded-xl px-4 py-3.5 shadow-sm" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Reviewed This Week</p>
            <svg className="w-5 h-5 text-emerald-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">{reviewedThisWeek}</p>
        </div>

        {/* By category */}
        <div className="stat-card-enter bg-white border border-slate-200/80 border-l-[3px] border-l-blue-500 rounded-xl px-4 py-3.5 shadow-sm" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">By Category</p>
            <svg className="w-5 h-5 text-blue-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(CATEGORY_CONFIG).map((cat) => {
              const count = categoryBreakdown[cat] || 0;
              if (count === 0) return null;
              return <CategoryBadge key={cat} category={`${cat} (${count})`} />;
            })}
            {Object.keys(categoryBreakdown).length === 0 && (
              <span className="text-[12px] text-slate-400 font-medium">No open flags</span>
            )}
          </div>
        </div>
      </div>

      {/* Open flags list */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Open Flags</h2>
            <span className="text-[11px] font-medium text-slate-400 tabular-nums">
              {openFlags.length} pending review
            </span>
          </div>
        </Card.Header>

        {openFlags.length > 0 ? (
          <>
            {/* Table header */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              <span className="w-2" aria-hidden="true" />
              <span className="flex-1">Tool / Employee</span>
              <span className="w-32 hidden sm:block">Category</span>
              <span className="w-[200px] hidden md:block">Matched Terms</span>
              <span className="w-16 text-right">When</span>
              <span className="w-4" aria-hidden="true" />
            </div>

            {openFlags.map((flag) => (
              <OpenFlagRow key={flag.id} flag={flag} onSelect={setSelectedFlag} />
            ))}
          </>
        ) : (
          <div className="py-14 flex flex-col items-center justify-center text-center">
            <svg className="w-10 h-10 text-emerald-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-[13px] font-medium text-slate-500">No open flags — all clear</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Flagged interactions will appear here when detected by the sensitivity classifier.
            </p>
          </div>
        )}
      </Card>

      {/* Resolved history (collapsed) */}
      {resolvedFlags.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 text-sm font-semibold text-slate-700 py-2 hover:text-slate-900 transition-colors duration-150">
            <svg
              className="w-4 h-4 text-slate-400 transition-transform duration-200 group-open:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Resolved History
            <Badge variant="default">{resolvedFlags.length}</Badge>
          </summary>

          <Card className="mt-2">
            {/* Table header */}
            <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              <span className="flex-1">Tool</span>
              <span className="w-28 hidden sm:block">Employee</span>
              <span className="w-24">Category</span>
              <span className="w-28">Status</span>
              <span className="w-28 hidden md:block">Reviewed by</span>
              <span className="w-28 text-right hidden lg:block">Reviewed</span>
            </div>

            {resolvedFlags.map((flag) => (
              <div
                key={flag.id}
                className="border-b border-slate-50 last:border-b-0"
              >
                <div className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/50 transition-colors duration-100">
                  <span className="flex-1 text-[13px] font-medium text-slate-800 truncate">
                    {flag.toolName}
                  </span>
                  <span className="w-28 text-[13px] text-slate-500 truncate hidden sm:block">
                    {flag.employeeName}
                  </span>
                  <span className="w-24">
                    <CategoryBadge category={flag.sensitivityCategory} />
                  </span>
                  <span className="w-28">
                    <FlagStatusPill status={flag.status} />
                  </span>
                  <span className="w-28 text-[13px] text-slate-500 hidden md:block">
                    {flag.reviewedBy || '—'}
                  </span>
                  <span className="w-28 text-[12px] text-slate-400 text-right hidden lg:block">
                    {flag.reviewedAt ? formatDate(flag.reviewedAt) : '—'}
                  </span>
                </div>

                {/* Review note */}
                {flag.reviewNote && (
                  <div className="px-5 pb-3">
                    <div className="bg-slate-50/80 rounded-lg px-3 py-2 text-[12px] text-slate-600 flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <span className="italic">{flag.reviewNote}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </details>
      )}

      {/* Review modal */}
      <FlagReviewModal
        open={!!selectedFlag}
        onClose={() => setSelectedFlag(null)}
        flag={selectedFlag}
        onResolve={handleResolve}
      />
    </div>
  );
}
