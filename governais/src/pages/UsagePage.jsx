import { useState, useMemo, useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { DEPARTMENTS } from '../data/mockData';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ── Palette for donut chart ────────────────────────────
const DONUT_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

// ── Helpers ────────────────────────────────────────────

/** Format timestamp to readable string. */
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Build usage-by-tool series for donut chart. */
function buildToolBreakdown(logs) {
  const counts = {};
  for (const log of logs) {
    counts[log.toolName] = (counts[log.toolName] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ── Custom donut tooltip ───────────────────────────────

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="chart-tooltip">
      <p className="text-[11px] font-semibold text-slate-300 mb-0.5">{name}</p>
      <p className="text-[12px] text-white">
        Events: <span className="font-bold">{value}</span>
      </p>
    </div>
  );
}

// ── Custom donut legend ────────────────────────────────

function DonutLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
            aria-hidden="true"
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

// ── Sortable table header ──────────────────────────────

const SORT_ICON_UP = (
  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <path d="M6 2L10 8H2L6 2Z" />
  </svg>
);

const SORT_ICON_DOWN = (
  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <path d="M6 10L2 4H10L6 10Z" />
  </svg>
);

const SORT_ICON_NEUTRAL = (
  <svg className="w-3 h-3 opacity-30" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <path d="M6 2L9 6H3L6 2ZM6 10L3 6H9L6 10Z" />
  </svg>
);

function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors cursor-pointer"
    >
      {label}
      {active ? (sortDir === 'asc' ? SORT_ICON_UP : SORT_ICON_DOWN) : SORT_ICON_NEUTRAL}
    </button>
  );
}

// ── Constants ──────────────────────────────────────────
const DATE_RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

const PAGE_SIZE = 10;

// ── Component ──────────────────────────────────────────

export default function UsagePage() {
  const { currentUser, tools, usageLogs } = useAppData();
  const isAdmin = currentUser.role === 'compliance_admin';

  // ── Filter state ─────────────────────────────────────
  const [deptFilter, setDeptFilter] = useState('all');
  const [toolFilter, setToolFilter] = useState('all');
  const [rangeDays, setRangeDays] = useState(30);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  // ── Sort state ───────────────────────────────────────
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');

  // ── Pagination ───────────────────────────────────────
  const [page, setPage] = useState(1);

  const handleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
      setPage(1);
    },
    [sortField],
  );

  // ── Filter + sort logic ──────────────────────────────

  const rangeStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - rangeDays);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [rangeDays]);

  const filteredLogs = useMemo(() => {
    let logs = usageLogs;

    // Role scoping — employees only see their own logs
    if (!isAdmin) {
      logs = logs.filter((l) => l.employeeName === currentUser.name);
    }

    // Department filter (admin only)
    if (isAdmin && deptFilter !== 'all') {
      logs = logs.filter((l) => l.department === deptFilter);
    }

    // Tool filter
    if (toolFilter !== 'all') {
      logs = logs.filter((l) => l.toolName === toolFilter);
    }

    // Date range
    logs = logs.filter((l) => new Date(l.timestamp) >= rangeStart);

    // Flagged only
    if (flaggedOnly) {
      logs = logs.filter((l) => l.sensitivityFlagged);
    }

    // Sort
    const dir = sortDir === 'asc' ? 1 : -1;
    logs = [...logs].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal instanceof Date || sortField === 'timestamp') {
        return dir * (new Date(aVal) - new Date(bVal));
      }
      if (typeof aVal === 'boolean') {
        return dir * (Number(aVal) - Number(bVal));
      }
      return dir * String(aVal).localeCompare(String(bVal));
    });

    return logs;
  }, [usageLogs, isAdmin, currentUser.name, deptFilter, toolFilter, rangeStart, flaggedOnly, sortField, sortDir]);

  // Donut data uses filtered logs
  const toolBreakdown = useMemo(() => buildToolBreakdown(filteredLogs), [filteredLogs]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const pagedLogs = useMemo(
    () => filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredLogs, page],
  );

  // Reset page when filters change
  const setFilterAndReset = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  // Unique tool names for filter dropdown
  const toolNames = useMemo(
    () => [...new Set(usageLogs.map((l) => l.toolName))].sort(),
    [usageLogs],
  );

  // Departments for filter (excluding current user's if employee)
  const deptOptions = useMemo(
    () => DEPARTMENTS.filter((d) => d !== 'Compliance'),
    [],
  );

  return (
    <div className="space-y-5 page-enter">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Usage Monitoring</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">
          {isAdmin
            ? 'Track AI tool usage across departments and monitor compliance thresholds.'
            : 'View your AI tool usage history.'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <Card.Body>
          <div className="flex flex-wrap items-center gap-3">
            {/* Department filter — admin only */}
            {isAdmin && (
              <div className="flex flex-col gap-1">
                <label htmlFor="dept-filter" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Department
                </label>
                <select
                  id="dept-filter"
                  className="select-field"
                  value={deptFilter}
                  onChange={(e) => setFilterAndReset(setDeptFilter)(e.target.value)}
                >
                  <option value="all">All departments</option>
                  {deptOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tool filter */}
            <div className="flex flex-col gap-1">
              <label htmlFor="tool-filter" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Tool
              </label>
              <select
                id="tool-filter"
                className="select-field"
                value={toolFilter}
                onChange={(e) => setFilterAndReset(setToolFilter)(e.target.value)}
              >
                <option value="all">All tools</option>
                {toolNames.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Date Range
              </span>
              <div className="flex">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r.days}
                    type="button"
                    onClick={() => setFilterAndReset(setRangeDays)(r.days)}
                    className={`range-btn ${rangeDays === r.days ? 'range-active' : ''}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flagged only toggle */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Flagged only
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={flaggedOnly}
                className="toggle-switch"
                onClick={() => setFilterAndReset(setFlaggedOnly)(!flaggedOnly)}
              />
            </div>

            {/* Result count */}
            <div className="ml-auto flex items-end pb-0.5">
              <span className="text-[12px] font-medium text-slate-400 tabular-nums">
                {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Donut chart */}
      <Card>
        <Card.Header>
          <h2 className="text-sm font-semibold text-slate-900">Usage by Tool</h2>
        </Card.Header>
        <Card.Body>
          {toolBreakdown.length === 0 ? (
            <p className="text-[12px] text-slate-400 font-medium text-center py-10">
              No usage data for this filter
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={toolBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {toolBreakdown.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
                <Legend content={<DonutLegend />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card.Body>
      </Card>

      {/* Usage logs table */}
      <Card>
        <Card.Header>
          <h2 className="text-sm font-semibold text-slate-900">Usage Logs</h2>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-5">
              <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="text-[13px] font-medium text-slate-500">No usage data for this filter</p>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Try broadening your date range or removing filters.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3">
                        <SortHeader label="Tool" field="toolName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      </th>
                      <th className="px-5 py-3">
                        <SortHeader label="Employee" field="employeeName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      </th>
                      <th className="px-5 py-3">
                        <SortHeader label="Department" field="department" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      </th>
                      <th className="px-5 py-3">
                        <SortHeader label="Data Type" field="dataTypeShared" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      </th>
                      <th className="px-5 py-3">
                        <SortHeader label="Timestamp" field="timestamp" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      </th>
                      <th className="px-5 py-3">
                        <SortHeader label="Flagged" field="sensitivityFlagged" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pagedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors duration-100">
                        <td className="px-5 py-2.5 text-[13px] font-medium text-slate-900 whitespace-nowrap">
                          {log.toolName}
                        </td>
                        <td className="px-5 py-2.5 text-[13px] text-slate-600 whitespace-nowrap">
                          {log.employeeName}
                        </td>
                        <td className="px-5 py-2.5 text-[13px] text-slate-600 whitespace-nowrap">
                          {log.department}
                        </td>
                        <td className="px-5 py-2.5 text-[13px] text-slate-600 whitespace-nowrap">
                          {log.dataTypeShared}
                        </td>
                        <td className="px-5 py-2.5 text-[12px] text-slate-500 whitespace-nowrap tabular-nums">
                          {fmtDate(log.timestamp)}
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {log.sensitivityFlagged ? (
                              <Badge variant="rose">
                                <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                Flagged
                              </Badge>
                            ) : log.declared ? (
                              <Badge variant="amber">
                                <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Declared
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                  <span className="text-[12px] text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="page-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`page-btn ${p === page ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="page-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
