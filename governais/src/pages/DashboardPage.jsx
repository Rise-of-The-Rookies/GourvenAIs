import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import Card from '../components/Card';
import Badge from '../components/Badge';
import StatusPill from '../components/StatusPill';
import OnboardingBanner from '../components/OnboardingBanner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Palette ────────────────────────────────────────────
const ACCENT = '#10B981';
const ACCENT_MUTED = 'rgba(16, 185, 129, 0.12)';
const FLAGGED = '#F43F5E';
const AMBER = '#F59E0B';
const GRID = '#f1f5f9';

// ── Helpers ────────────────────────────────────────────

/** Format a Date to "MMM DD" for chart axis labels. */
function fmtShort(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Relative time label, e.g. "2 h ago", "3 d ago", "just now". */
function timeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Build a 30-day series [{date, count}] from usage logs. */
function buildDailySeries(logs) {
  const now = new Date();
  const buckets = new Map();

  // Initialise 30 buckets so every day shows up even if count is 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    buckets.set(key, { date: fmtShort(d), count: 0 });
  }

  for (const log of logs) {
    const key = new Date(log.timestamp).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.get(key).count += 1;
    }
  }

  return [...buckets.values()];
}

/** Count usage per department. */
function buildDeptSeries(logs) {
  const counts = {};
  for (const log of logs) {
    counts[log.department] = (counts[log.department] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([dept, count]) => ({ department: dept, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Custom tooltip ─────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-[11px] font-semibold text-slate-300 mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-[12px] text-white">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Stat card icons ────────────────────────────────────

const STAT_ICONS = {
  tools: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
    </svg>
  ),
  pending: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  usage: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  flagged: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  ),
};

// ── Component ──────────────────────────────────────────

export default function DashboardPage() {
  const { currentUser, tools, requests, usageLogs, flags, simulateUsageEvent, currentSnippetIndex, totalSnippets, resetDemoData } = useAppData();
  const isAdmin = currentUser.role === 'compliance_admin';

  // Derived stats
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests],
  );

  const weekLogs = useMemo(
    () => usageLogs.filter((l) => new Date(l.timestamp) >= sevenDaysAgo),
    [usageLogs, sevenDaysAgo],
  );

  // Open flags count — uses flags state for accuracy after resolving
  const openFlagsCount = useMemo(
    () => flags.filter((f) => f.status === 'open').length,
    [flags],
  );

  const stats = [
    {
      label: 'Approved Tools',
      value: tools.length,
      border: 'border-l-emerald-500',
      iconColor: 'text-emerald-600',
      icon: STAT_ICONS.tools,
    },
    {
      label: 'Pending Requests',
      value: pendingCount,
      border: 'border-l-amber-500',
      iconColor: 'text-amber-600',
      icon: STAT_ICONS.pending,
    },
    {
      label: 'Usage This Week',
      value: weekLogs.length,
      border: 'border-l-blue-500',
      iconColor: 'text-blue-600',
      icon: STAT_ICONS.usage,
    },
    {
      label: 'Open Flags',
      value: openFlagsCount,
      border: 'border-l-rose-500',
      iconColor: 'text-rose-600',
      icon: STAT_ICONS.flagged,
      linkTo: isAdmin ? '/flags' : null,
    },
  ];

  // Chart data
  const dailySeries = useMemo(() => buildDailySeries(usageLogs), [usageLogs]);
  const deptSeries = useMemo(() => buildDeptSeries(usageLogs), [usageLogs]);

  // Recent activity — 5 most recent
  const recentLogs = useMemo(
    () =>
      [...usageLogs]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5),
    [usageLogs],
  );

  // Customs activity breakdown — green/yellow/red from last 7 days
  const customsCounts = useMemo(() => {
    const green = weekLogs.filter((l) => !l.sensitivityFlagged && !l.declared).length;
    const yellow = weekLogs.filter((l) => l.declared === true).length;
    const red = weekLogs.filter((l) => l.sensitivityFlagged === true).length;
    return [{ label: 'Green', count: green, fill: ACCENT }, { label: 'Yellow', count: yellow, fill: AMBER }, { label: 'Red', count: red, fill: FLAGGED }];
  }, [weekLogs]);

  return (
    <div className="space-y-5 page-enter">
      <OnboardingBanner />
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Overview of AI governance across your organisation.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-400">
                Next: snippet {currentSnippetIndex + 1} of {totalSnippets}
              </span>
              <button
                type="button"
                onClick={resetDemoData}
                className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Reset Demo
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={simulateUsageEvent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-ink text-white hover:bg-graphite transition-colors duration-150 shadow-sm cursor-pointer"
            id="simulate-usage-btn"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Simulate Event
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((card) => {
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {card.label}
                </p>
                <span className={`${card.iconColor} opacity-50`}>{card.icon}</span>
              </div>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
                {card.value}
              </p>
            </>
          );

          // Wrap in Link if card has a linkTo
          if (card.linkTo) {
            return (
              <Link
                key={card.label}
                to={card.linkTo}
                className={`stat-card-enter bg-white border border-slate-200/80 border-l-[3px] ${card.border} rounded-xl px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow duration-150 block no-underline`}
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={card.label}
              className={`stat-card-enter bg-white border border-slate-200/80 border-l-[3px] ${card.border} rounded-xl px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow duration-150`}
            >
              {inner}
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Usage trend — spans 2 cols */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <h2 className="text-sm font-semibold text-slate-900">Usage Trend — Last 30 Days</h2>
          </Card.Header>
          <Card.Body className="pr-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailySeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Events"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        {/* Department breakdown */}
        <Card>
          <Card.Header>
            <h2 className="text-sm font-semibold text-slate-900">By Department</h2>
          </Card.Header>
          <Card.Body className="pl-0 pr-4">
            {deptSeries.length === 0 ? (
              <p className="text-[12px] text-slate-400 font-medium text-center py-10">No department data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptSeries} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={85}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Events" fill={ACCENT} radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Customs Activity */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Customs Activity — Last 7 Days</h2>
            <Link
              to="/customs-check"
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors no-underline"
            >
              Open Customs Check →
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Summary stats */}
            <div className="flex flex-col gap-2.5 lg:col-span-1">
              {customsCounts.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-slate-50/60 border border-slate-100"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.fill }}
                    aria-hidden="true"
                  />
                  <span className="text-[12px] font-medium text-slate-600 flex-1">{item.label}</span>
                  <span className="text-[15px] font-bold text-slate-900 tabular-nums">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={customsCounts} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={55}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Prompts" radius={[0, 4, 4, 0]} barSize={20}>
                    {customsCounts.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
        </Card.Header>
        <Card.Body className="p-0">
          {recentLogs.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center px-5">
              <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[13px] font-medium text-slate-500">No activity yet</p>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Click "Simulate Event" to generate activity.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentLogs.map((log) => {
                const isFlaggedAdmin = log.sensitivityFlagged && isAdmin;

                const content = (
                  <>
                    {/* Tool icon circle */}
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-slate-900 truncate">{log.toolName}</span>
                        {log.sensitivityFlagged && (
                          <Badge variant="rose">
                            <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" clipRule="evenodd" />
                            </svg>
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 truncate">
                        {log.employeeName} · {log.department}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap tabular-nums">
                      {timeAgo(new Date(log.timestamp))}
                    </span>

                    {/* Link indicator for flagged admin items */}
                    {isFlaggedAdmin && (
                      <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    )}
                  </>
                );

                // Make flagged items clickable for admin — navigates to /flags
                if (isFlaggedAdmin) {
                  return (
                    <li key={log.id}>
                      <Link
                        to="/flags"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-rose-50/40 transition-colors duration-100 no-underline"
                      >
                        {content}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors duration-100">
                    {content}
                  </li>
                );
              })}
            </ul>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
