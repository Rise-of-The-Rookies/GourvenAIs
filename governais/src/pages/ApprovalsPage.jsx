import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../components/Toast';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import StatusPill from '../components/StatusPill';
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

// ── Review Modal ──────────────────────────────────────

function ReviewModal({ open, onClose, request, action, onConfirm }) {
  const [note, setNote] = useState('');

  // Reset note when modal opens
  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  if (!request) return null;

  const isApprove = action === 'approve';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isApprove ? 'Approve Request' : 'Reject Request'}
      maxWidth="max-w-sm"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg px-4 py-3">
          <p className="text-[13px] font-semibold text-slate-800">{request.toolName}</p>
          <p className="text-[12px] text-slate-500 mt-0.5">by {request.vendor}</p>
        </div>

        <div>
          <label htmlFor="review-note" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Review note <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="review-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isApprove ? 'Reason for approval…' : 'Reason for rejection…'}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'primary' : 'danger'}
            size="md"
            onClick={() => onConfirm(note)}
          >
            {isApprove ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Request Detail Row ────────────────────────────────

function PendingRequestRow({ request, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      {/* Summary row */}
      <div
        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors duration-100 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
        aria-expanded={expanded}
      >
        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>

        <span className="flex-1 text-[13px] font-medium text-slate-800 truncate">
          {request.toolName}
        </span>
        <span className="w-28 text-[13px] text-slate-500 truncate hidden sm:block">
          {request.vendor}
        </span>
        <span className="w-28 text-[13px] text-slate-500 hidden md:block">
          {request.requestedBy}
        </span>
        <span className="w-24 text-[13px] text-slate-500 hidden md:block">
          {request.department}
        </span>
        <span className="w-28 text-[12px] text-slate-400 text-right hidden lg:block">
          {formatDate(request.submittedAt)}
        </span>
        <span className="w-24 flex justify-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="primary" size="sm" onClick={() => onApprove(request)}>
            Approve
          </Button>
          <Button variant="danger" size="sm" onClick={() => onReject(request)}>
            Reject
          </Button>
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-4 pl-12 space-y-2.5 animate-[details-expand_200ms_ease-out]">
          <div className="bg-slate-50/80 rounded-lg px-4 py-3 space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Purpose</p>
              <p className="text-[13px] text-slate-700 mt-0.5">{request.purpose}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Data types involved</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {request.dataTypesInvolved.map((dt) => (
                  <Badge
                    key={dt}
                    variant={dt === 'Customer data' || dt === 'Financial data' ? 'rose' : 'default'}
                  >
                    {dt}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Requested by</p>
                <p className="text-[13px] text-slate-700 mt-0.5">{request.requestedBy}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Department</p>
                <p className="text-[13px] text-slate-700 mt-0.5">{request.department}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Submitted</p>
                <p className="text-[13px] text-slate-700 mt-0.5">{formatDateTime(request.submittedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────

export default function ApprovalsPage() {
  const { currentUser, requests, approveRequest, rejectRequest } = useAppData();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  // ── Role guard ─────────────────────────────────────
  useEffect(() => {
    if (currentUser.role !== 'compliance_admin') {
      navigate('/', { replace: true });
    }
  }, [currentUser.role, navigate]);

  if (currentUser.role !== 'compliance_admin') return null;

  // ── Review modal state ─────────────────────────────
  const [reviewTarget, setReviewTarget] = useState(null); // { request, action }

  // ── Split requests ─────────────────────────────────
  const pendingRequests = useMemo(
    () =>
      requests
        .filter((r) => r.status === 'pending')
        .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)),
    [requests],
  );

  const historyRequests = useMemo(
    () =>
      requests
        .filter((r) => r.status !== 'pending')
        .sort((a, b) => new Date(b.reviewedAt || b.submittedAt) - new Date(a.reviewedAt || a.submittedAt)),
    [requests],
  );

  const handleConfirm = (note) => {
    if (!reviewTarget) return;
    const { request, action } = reviewTarget;

    if (action === 'approve') {
      approveRequest(request.id, note);
      showSuccess(`"${request.toolName}" approved and added to registry.`);
    } else {
      rejectRequest(request.id, note);
      showSuccess(`"${request.toolName}" has been rejected.`);
    }

    setReviewTarget(null);
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Approval Workflow</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Review and approve or reject pending AI tool requests.
          </p>
        </div>
        <Badge variant={pendingRequests.length > 0 ? 'amber' : 'emerald'}>
          {pendingRequests.length} pending
        </Badge>
      </div>

      {/* Pending requests */}
      <Card>
        {pendingRequests.length > 0 ? (
          <>
            {/* Table header */}
            <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              <span className="w-4" aria-hidden="true" />
              <span className="flex-1">Tool</span>
              <span className="w-28 hidden sm:block">Vendor</span>
              <span className="w-28 hidden md:block">Requested by</span>
              <span className="w-24 hidden md:block">Department</span>
              <span className="w-28 text-right hidden lg:block">Submitted</span>
              <span className="w-24 text-right">Actions</span>
            </div>

            {pendingRequests.map((req) => (
              <PendingRequestRow
                key={req.id}
                request={req}
                onApprove={(r) => setReviewTarget({ request: r, action: 'approve' })}
                onReject={(r) => setReviewTarget({ request: r, action: 'reject' })}
              />
            ))}
          </>
        ) : (
          <div className="py-14 flex flex-col items-center justify-center text-center">
            <svg className="w-10 h-10 text-emerald-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <p className="text-[13px] font-medium text-slate-500">All caught up — no pending reviews</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              New requests will appear here when team members submit them.
            </p>
          </div>
        )}
      </Card>

      {/* History (collapsed) */}
      {historyRequests.length > 0 && (
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
            Review History
            <Badge variant="default">{historyRequests.length}</Badge>
          </summary>

          <Card className="mt-2">
            {/* Table header */}
            <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              <span className="flex-1">Tool</span>
              <span className="w-28 hidden sm:block">Vendor</span>
              <span className="w-28 hidden md:block">Requested by</span>
              <span className="w-24">Status</span>
              <span className="w-28 hidden md:block">Reviewed by</span>
              <span className="w-28 text-right hidden lg:block">Reviewed</span>
            </div>

            {historyRequests.map((req) => (
              <div
                key={req.id}
                className="border-b border-slate-50 last:border-b-0"
              >
                <div className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/50 transition-colors duration-100">
                  <span className="flex-1 text-[13px] font-medium text-slate-800 truncate">
                    {req.toolName}
                  </span>
                  <span className="w-28 text-[13px] text-slate-500 truncate hidden sm:block">
                    {req.vendor}
                  </span>
                  <span className="w-28 text-[13px] text-slate-500 hidden md:block">
                    {req.requestedBy}
                  </span>
                  <span className="w-24">
                    <StatusPill status={req.status} />
                  </span>
                  <span className="w-28 text-[13px] text-slate-500 hidden md:block">
                    {req.reviewedBy || '—'}
                  </span>
                  <span className="w-28 text-[12px] text-slate-400 text-right hidden lg:block">
                    {req.reviewedAt ? formatDate(req.reviewedAt) : '—'}
                  </span>
                </div>

                {/* Review note */}
                {req.reviewNote && (
                  <div className="px-5 pb-3">
                    <div className="bg-slate-50/80 rounded-lg px-3 py-2 text-[12px] text-slate-600 flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <span className="italic">{req.reviewNote}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </details>
      )}

      {/* Review confirmation modal */}
      <ReviewModal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        request={reviewTarget?.request}
        action={reviewTarget?.action}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
