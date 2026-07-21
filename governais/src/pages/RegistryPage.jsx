import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../components/Toast';
import { DEPARTMENTS, DATA_TYPE_OPTIONS, CATEGORY_OPTIONS } from '../data/mockData';
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

const RISK_LABELS = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' };

// ── Request Form (inside modal) ────────────────────────

const INITIAL_FORM = {
  toolName: '',
  vendor: '',
  purpose: '',
  dataTypesInvolved: [],
  department: '',
};

function RequestForm({ onSubmit, onCancel, departments }) {
  const [form, setForm] = useState({ ...INITIAL_FORM, department: departments[0] || '' });
  const [errors, setErrors] = useState({});

  const handleCheckbox = (value) => {
    setForm((prev) => {
      const has = prev.dataTypesInvolved.includes(value);
      // If selecting "None", clear others. If selecting a specific type, remove "None".
      if (value === 'None') {
        return { ...prev, dataTypesInvolved: has ? [] : ['None'] };
      }
      const without = prev.dataTypesInvolved.filter((v) => v !== 'None' && v !== value);
      return {
        ...prev,
        dataTypesInvolved: has ? without : [...without, value],
      };
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.toolName.trim()) errs.toolName = 'Tool name is required';
    if (!form.vendor.trim()) errs.vendor = 'Vendor is required';
    if (!form.purpose.trim()) errs.purpose = 'Purpose is required';
    if (form.dataTypesInvolved.length === 0) errs.dataTypes = 'Select at least one data type';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tool Name */}
      <div>
        <label htmlFor="req-tool-name" className="block text-[13px] font-medium text-slate-700 mb-1.5">
          Tool name
        </label>
        <input
          id="req-tool-name"
          type="text"
          value={form.toolName}
          onChange={(e) => setForm((f) => ({ ...f, toolName: e.target.value }))}
          placeholder="e.g. GitHub Copilot"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150"
        />
        {errors.toolName && <p className="text-[12px] text-rose-600 mt-1">{errors.toolName}</p>}
      </div>

      {/* Vendor */}
      <div>
        <label htmlFor="req-vendor" className="block text-[13px] font-medium text-slate-700 mb-1.5">
          Vendor
        </label>
        <input
          id="req-vendor"
          type="text"
          value={form.vendor}
          onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
          placeholder="e.g. Microsoft"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150"
        />
        {errors.vendor && <p className="text-[12px] text-rose-600 mt-1">{errors.vendor}</p>}
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="req-purpose" className="block text-[13px] font-medium text-slate-700 mb-1.5">
          Purpose
        </label>
        <textarea
          id="req-purpose"
          rows={3}
          value={form.purpose}
          onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
          placeholder="Describe how this tool will be used…"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150 resize-none"
        />
        {errors.purpose && <p className="text-[12px] text-rose-600 mt-1">{errors.purpose}</p>}
      </div>

      {/* Data Types */}
      <fieldset>
        <legend className="block text-[13px] font-medium text-slate-700 mb-2">
          Data types involved
        </legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {DATA_TYPE_OPTIONS.map((dt) => (
            <label key={dt} className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={form.dataTypesInvolved.includes(dt)}
                onChange={() => handleCheckbox(dt)}
              />
              {dt}
            </label>
          ))}
        </div>
        {errors.dataTypes && <p className="text-[12px] text-rose-600 mt-1">{errors.dataTypes}</p>}
      </fieldset>

      {/* Department */}
      <div>
        <label htmlFor="req-department" className="block text-[13px] font-medium text-slate-700 mb-1.5">
          Department
        </label>
        <select
          id="req-department"
          value={form.department}
          onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150 cursor-pointer"
        >
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md">
          Submit request
        </Button>
      </div>
    </form>
  );
}

// ── Page ───────────────────────────────────────────────

export default function RegistryPage() {
  const { currentUser, tools, requests, addToolRequest } = useAppData();
  const { showSuccess } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const isAdmin = currentUser.role === 'compliance_admin';

  // ── Filter tools ────────────────────────────────────
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        !search ||
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.vendor.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || tool.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [tools, search, categoryFilter]);

  // ── My requests ─────────────────────────────────────
  const myRequests = useMemo(
    () => requests.filter((r) => r.requestedBy === currentUser.name),
    [requests, currentUser.name],
  );

  // ── Unique categories from tools ────────────────────
  const categories = useMemo(
    () => ['All', ...new Set(tools.map((t) => t.category))],
    [tools],
  );

  const handleSubmitRequest = (formData) => {
    addToolRequest(formData);
    setModalOpen(false);
    showSuccess("Request submitted — it's now pending review.");
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AI Tool Registry</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Browse approved tools and submit requests for new ones.
          </p>
        </div>
        {!isAdmin && (
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            <svg className="w-4 h-4 mr-1.5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Request a new AI tool
          </Button>
        )}
      </div>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools or vendors…"
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150"
            aria-label="Search approved tools"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-colors duration-150 cursor-pointer"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Approved tools grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="flex flex-col hover:-translate-y-[1px] transition-transform duration-200">
              <Card.Body className="flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{tool.name}</h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">{tool.vendor}</p>
                  </div>
                  <Badge variant={tool.riskLevel} className="shrink-0">
                    {RISK_LABELS[tool.riskLevel]}
                  </Badge>
                </div>

                <div>
                  <Badge variant="blue">{tool.category}</Badge>
                </div>

                <div className="mt-auto pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                    Approved for
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tool.approvedFor.map((dept) => (
                      <Badge key={dept} variant="default">{dept}</Badge>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Approved {formatDate(tool.approvedAt)}
                </p>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="py-14 flex flex-col items-center justify-center text-center">
            <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
            </svg>
            <p className="text-[13px] font-medium text-slate-500">No matching tools found</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </Card>
      )}

      {/* My Requests section (non-admin only) */}
      {!isAdmin && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">My Requests</h2>

          {myRequests.length > 0 ? (
            <Card>
              {/* Table header */}
              <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                <span className="flex-1">Tool</span>
                <span className="w-32 hidden sm:block">Vendor</span>
                <span className="w-28 hidden sm:block">Department</span>
                <span className="w-24">Status</span>
                <span className="w-28 text-right hidden md:block">Submitted</span>
              </div>

              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors duration-100"
                >
                  <span className="flex-1 text-[13px] font-medium text-slate-800 truncate">
                    {req.toolName}
                  </span>
                  <span className="w-32 text-[13px] text-slate-500 truncate hidden sm:block">
                    {req.vendor}
                  </span>
                  <span className="w-28 text-[13px] text-slate-500 hidden sm:block">
                    {req.department}
                  </span>
                  <span className="w-24">
                    <StatusPill status={req.status} />
                  </span>
                  <span className="w-28 text-[12px] text-slate-400 text-right hidden md:block">
                    {formatDate(req.submittedAt)}
                  </span>
                </div>
              ))}
            </Card>
          ) : (
            <Card>
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <svg className="w-9 h-9 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-[13px] font-medium text-slate-500">You haven't requested any tools yet.</p>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Click "Request a new AI tool" to get started.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Request modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request a New AI Tool"
        maxWidth="max-w-md"
      >
        <RequestForm
          onSubmit={handleSubmitRequest}
          onCancel={() => setModalOpen(false)}
          departments={DEPARTMENTS}
        />
      </Modal>
    </div>
  );
}
