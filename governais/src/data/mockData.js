/**
 * Mock data seed for GourvenAIs — in-memory only, no persistence.
 * Provides users, approved tools, tool requests, and usage logs across departments.
 */

export const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Finance', 'Compliance'];

export const DATA_TYPE_OPTIONS = [
  'Customer data',
  'Source code',
  'Internal docs',
  'Financial data',
  'None',
];

export const CATEGORY_OPTIONS = [
  'Code Assistant',
  'Writing Assistant',
  'Data Analysis',
  'Design Tool',
  'Productivity',
];

// ── Users ──────────────────────────────────────────────

export const mockUsers = [
  {
    id: 'u1',
    name: 'Alex Chen',
    email: 'alex.chen@governais.io',
    role: 'employee',
    department: 'Engineering',
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    email: 'priya.sharma@governais.io',
    role: 'compliance_admin',
    department: 'Compliance',
  },
  {
    id: 'u3',
    name: 'Marcus Lee',
    email: 'marcus.lee@governais.io',
    role: 'employee',
    department: 'Sales',
  },
  {
    id: 'u4',
    name: 'Dana Kim',
    email: 'dana.kim@governais.io',
    role: 'employee',
    department: 'Marketing',
  },
  {
    id: 'u5',
    name: 'Raj Mehta',
    email: 'raj.mehta@governais.io',
    role: 'employee',
    department: 'Finance',
  },
  {
    id: 'u6',
    name: 'Sophia Grant',
    email: 'sophia.grant@governais.io',
    role: 'compliance_admin',
    department: 'Compliance',
  },
];

// ── Approved Tools ─────────────────────────────────────

export const mockTools = [
  {
    id: 't1',
    name: 'GitHub Copilot',
    vendor: 'GitHub / Microsoft',
    category: 'Code Assistant',
    approvedFor: ['Engineering', 'Sales'],
    approvedAt: new Date('2026-05-10'),
    riskLevel: 'low',
  },
  {
    id: 't2',
    name: 'Grammarly Business',
    vendor: 'Grammarly Inc.',
    category: 'Writing Assistant',
    approvedFor: ['Engineering', 'Sales', 'Marketing', 'Finance'],
    approvedAt: new Date('2026-04-22'),
    riskLevel: 'low',
  },
  {
    id: 't3',
    name: 'Tableau AI',
    vendor: 'Salesforce',
    category: 'Data Analysis',
    approvedFor: ['Finance', 'Marketing'],
    approvedAt: new Date('2026-06-01'),
    riskLevel: 'medium',
  },
  {
    id: 't4',
    name: 'Notion AI',
    vendor: 'Notion Labs',
    category: 'Writing Assistant',
    approvedFor: ['Engineering', 'Marketing'],
    approvedAt: new Date('2026-06-15'),
    riskLevel: 'low',
  },
];

// ── Tool Requests ──────────────────────────────────────

export const mockRequests = [
  {
    id: 'r1',
    toolName: 'Jasper AI',
    vendor: 'Jasper',
    purpose: 'Generate marketing copy and social media content for campaigns.',
    dataTypesInvolved: ['Internal docs'],
    requestedBy: 'Dana Kim',
    department: 'Marketing',
    status: 'pending',
    submittedAt: new Date('2026-07-18T09:30:00'),
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  },
  {
    id: 'r2',
    toolName: 'Cursor IDE',
    vendor: 'Anysphere',
    purpose: 'AI-powered code editor for faster development cycles and pair programming.',
    dataTypesInvolved: ['Source code'],
    requestedBy: 'Alex Chen',
    department: 'Engineering',
    status: 'pending',
    submittedAt: new Date('2026-07-19T14:15:00'),
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  },
  {
    id: 'r3',
    toolName: 'ChatGPT Enterprise',
    vendor: 'OpenAI',
    purpose: 'General-purpose AI assistant for research, drafting, and summarisation.',
    dataTypesInvolved: ['Customer data', 'Internal docs'],
    requestedBy: 'Marcus Lee',
    department: 'Sales',
    status: 'approved',
    submittedAt: new Date('2026-07-05T10:00:00'),
    reviewedBy: 'Priya Sharma',
    reviewNote: 'Approved with standard data handling agreement in place.',
    reviewedAt: new Date('2026-07-06T11:30:00'),
  },
  {
    id: 'r4',
    toolName: 'Midjourney',
    vendor: 'Midjourney Inc.',
    purpose: 'Generate visual assets and mockups for marketing materials.',
    dataTypesInvolved: ['None'],
    requestedBy: 'Dana Kim',
    department: 'Marketing',
    status: 'approved',
    submittedAt: new Date('2026-07-02T08:45:00'),
    reviewedBy: 'Priya Sharma',
    reviewNote: 'Low risk — no sensitive data involved. Approved for Marketing.',
    reviewedAt: new Date('2026-07-03T09:00:00'),
  },
  {
    id: 'r5',
    toolName: 'DeepSeek Coder',
    vendor: 'DeepSeek',
    purpose: 'Open-source code completion model for internal tooling.',
    dataTypesInvolved: ['Source code', 'Internal docs'],
    requestedBy: 'Alex Chen',
    department: 'Engineering',
    status: 'rejected',
    submittedAt: new Date('2026-06-28T16:20:00'),
    reviewedBy: 'Priya Sharma',
    reviewNote: 'Data residency concerns — vendor does not guarantee data stays in-region.',
    reviewedAt: new Date('2026-06-30T10:45:00'),
  },
  {
    id: 'r6',
    toolName: 'SupportBot AI',
    vendor: 'Intercom',
    purpose: 'AI chatbot for first-line customer support resolution.',
    dataTypesInvolved: ['Customer data'],
    requestedBy: 'Marcus Lee',
    department: 'Sales',
    status: 'pending',
    submittedAt: new Date('2026-07-20T11:05:00'),
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  },
];

// ── Usage Logs ─────────────────────────────────────────
// ~35 entries spread across tools, departments, and the last 30 days.
// Dates are deliberately non-uniform so the time-series chart looks realistic.

/** Helper — returns a Date that is `daysAgo` days before now, at an approximate hour. */
function daysAgoAt(daysAgo, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

// Employee pool for simulation (includes the mock users + a few extras)
export const MOCK_EMPLOYEES = [
  { name: 'Alex Chen', department: 'Engineering' },
  { name: 'Marcus Lee', department: 'Sales' },
  { name: 'Dana Kim', department: 'Marketing' },
  { name: 'Jordan Patel', department: 'Finance' },
  { name: 'Samira Obi', department: 'Engineering' },
  { name: 'Tyler Brooks', department: 'Sales' },
  { name: 'Lisa Tran', department: 'Marketing' },
  { name: 'Noah Fischer', department: 'Finance' },
  { name: 'Raj Mehta', department: 'Finance' },
  { name: 'Sophia Grant', department: 'Compliance' },
];

export const mockUsageLogs = [
  // ── Day 1 (yesterday) — light cluster ────────────────
  { id: 'ul1',  toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Alex Chen',     department: 'Engineering', timestamp: daysAgoAt(1, 9),  dataTypeShared: 'Source code',    sensitivityFlagged: false },
  { id: 'ul2',  toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Marcus Lee',    department: 'Sales',       timestamp: daysAgoAt(1, 11), dataTypeShared: 'Customer data',  sensitivityFlagged: true },
  { id: 'ul3',  toolId: 't4', toolName: 'Notion AI',            employeeName: 'Dana Kim',      department: 'Marketing',   timestamp: daysAgoAt(1, 14), dataTypeShared: 'Internal docs',  sensitivityFlagged: false },

  // ── Day 2 ────────────────────────────────────────────
  { id: 'ul4',  toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Samira Obi',    department: 'Engineering', timestamp: daysAgoAt(2, 10), dataTypeShared: 'Source code',    sensitivityFlagged: false },
  { id: 'ul5',  toolId: 't3', toolName: 'Tableau AI',           employeeName: 'Jordan Patel',  department: 'Finance',     timestamp: daysAgoAt(2, 15), dataTypeShared: 'Financial data', sensitivityFlagged: true },

  // ── Day 3 ────────────────────────────────────────────
  { id: 'ul6',  toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Lisa Tran',     department: 'Marketing',   timestamp: daysAgoAt(3, 9),  dataTypeShared: 'None',           sensitivityFlagged: false },
  { id: 'ul7',  toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Alex Chen',     department: 'Engineering', timestamp: daysAgoAt(3, 13), dataTypeShared: 'Source code',    sensitivityFlagged: false },
  { id: 'ul8',  toolId: 't4', toolName: 'Notion AI',            employeeName: 'Samira Obi',    department: 'Engineering', timestamp: daysAgoAt(3, 16), dataTypeShared: 'Internal docs',  sensitivityFlagged: false },

  // ── Day 5 (skip day 4 — weekend feel) ───────────────
  { id: 'ul9',  toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Tyler Brooks',  department: 'Sales',       timestamp: daysAgoAt(5, 10), dataTypeShared: 'Customer data',  sensitivityFlagged: true },
  { id: 'ul10', toolId: 't3', toolName: 'Tableau AI',           employeeName: 'Noah Fischer',  department: 'Finance',     timestamp: daysAgoAt(5, 11), dataTypeShared: 'Financial data', sensitivityFlagged: false },
  { id: 'ul11', toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Alex Chen',     department: 'Engineering', timestamp: daysAgoAt(5, 14), dataTypeShared: 'Source code',    sensitivityFlagged: false },

  // ── Day 7 ────────────────────────────────────────────
  { id: 'ul12', toolId: 't4', toolName: 'Notion AI',            employeeName: 'Dana Kim',      department: 'Marketing',   timestamp: daysAgoAt(7, 9),  dataTypeShared: 'Internal docs',  sensitivityFlagged: false },
  { id: 'ul13', toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Samira Obi',    department: 'Engineering', timestamp: daysAgoAt(7, 12), dataTypeShared: 'Source code',    sensitivityFlagged: true },
  { id: 'ul14', toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Marcus Lee',    department: 'Sales',       timestamp: daysAgoAt(7, 15), dataTypeShared: 'None',           sensitivityFlagged: false },

  // ── Day 9 ────────────────────────────────────────────
  { id: 'ul15', toolId: 't3', toolName: 'Tableau AI',           employeeName: 'Jordan Patel',  department: 'Finance',     timestamp: daysAgoAt(9, 10), dataTypeShared: 'Financial data', sensitivityFlagged: false },

  // ── Day 11 — busy day ───────────────────────────────
  { id: 'ul16', toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Alex Chen',     department: 'Engineering', timestamp: daysAgoAt(11, 8),  dataTypeShared: 'Source code',    sensitivityFlagged: false },
  { id: 'ul17', toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Dana Kim',      department: 'Marketing',   timestamp: daysAgoAt(11, 10), dataTypeShared: 'Internal docs',  sensitivityFlagged: false },
  { id: 'ul18', toolId: 't4', toolName: 'Notion AI',            employeeName: 'Lisa Tran',     department: 'Marketing',   timestamp: daysAgoAt(11, 12), dataTypeShared: 'Internal docs',  sensitivityFlagged: false },
  { id: 'ul19', toolId: 't3', toolName: 'Tableau AI',           employeeName: 'Noah Fischer',  department: 'Finance',     timestamp: daysAgoAt(11, 14), dataTypeShared: 'Customer data',  sensitivityFlagged: true },

  // ── Day 14 ───────────────────────────────────────────
  { id: 'ul20', toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Samira Obi',    department: 'Engineering', timestamp: daysAgoAt(14, 9),  dataTypeShared: 'Source code',    sensitivityFlagged: false },
  { id: 'ul21', toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Tyler Brooks',  department: 'Sales',       timestamp: daysAgoAt(14, 11), dataTypeShared: 'Customer data',  sensitivityFlagged: true },

  // ── Day 17 ───────────────────────────────────────────
  { id: 'ul22', toolId: 't4', toolName: 'Notion AI',            employeeName: 'Alex Chen',     department: 'Engineering', timestamp: daysAgoAt(17, 10), dataTypeShared: 'Internal docs',  sensitivityFlagged: false },
  { id: 'ul23', toolId: 't3', toolName: 'Tableau AI',           employeeName: 'Jordan Patel',  department: 'Finance',     timestamp: daysAgoAt(17, 14), dataTypeShared: 'Financial data', sensitivityFlagged: false },
  { id: 'ul24', toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Alex Chen',     department: 'Engineering', timestamp: daysAgoAt(17, 16), dataTypeShared: 'Source code',    sensitivityFlagged: false },

  // ── Day 20 ───────────────────────────────────────────
  { id: 'ul25', toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Lisa Tran',     department: 'Marketing',   timestamp: daysAgoAt(20, 9),  dataTypeShared: 'None',           sensitivityFlagged: false },
  { id: 'ul26', toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Samira Obi',    department: 'Engineering', timestamp: daysAgoAt(20, 13), dataTypeShared: 'Source code',    sensitivityFlagged: false },

  // ── Day 22 — spike ──────────────────────────────────
  { id: 'ul27', toolId: 't4', toolName: 'Notion AI',            employeeName: 'Dana Kim',      department: 'Marketing',   timestamp: daysAgoAt(22, 9),  dataTypeShared: 'Internal docs',  sensitivityFlagged: false },
  { id: 'ul28', toolId: 't3', toolName: 'Tableau AI',           employeeName: 'Noah Fischer',  department: 'Finance',     timestamp: daysAgoAt(22, 10), dataTypeShared: 'Financial data', sensitivityFlagged: true },
  { id: 'ul29', toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Alex Chen',     department: 'Engineering', timestamp: daysAgoAt(22, 11), dataTypeShared: 'Source code',    sensitivityFlagged: false },
  { id: 'ul30', toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Marcus Lee',    department: 'Sales',       timestamp: daysAgoAt(22, 14), dataTypeShared: 'Customer data',  sensitivityFlagged: false },

  // ── Day 25 ───────────────────────────────────────────
  { id: 'ul31', toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Jordan Patel',  department: 'Finance',     timestamp: daysAgoAt(25, 10), dataTypeShared: 'Financial data', sensitivityFlagged: false },
  { id: 'ul32', toolId: 't4', toolName: 'Notion AI',            employeeName: 'Samira Obi',    department: 'Engineering', timestamp: daysAgoAt(25, 15), dataTypeShared: 'Internal docs',  sensitivityFlagged: false },

  // ── Day 27 ───────────────────────────────────────────
  { id: 'ul33', toolId: 't1', toolName: 'GitHub Copilot',      employeeName: 'Alex Chen',     department: 'Engineering', timestamp: daysAgoAt(27, 9),  dataTypeShared: 'Source code',    sensitivityFlagged: true },
  { id: 'ul34', toolId: 't3', toolName: 'Tableau AI',           employeeName: 'Noah Fischer',  department: 'Finance',     timestamp: daysAgoAt(27, 13), dataTypeShared: 'Financial data', sensitivityFlagged: false },

  // ── Day 29 ───────────────────────────────────────────
  { id: 'ul35', toolId: 't2', toolName: 'Grammarly Business',   employeeName: 'Tyler Brooks',  department: 'Sales',       timestamp: daysAgoAt(29, 11), dataTypeShared: 'Customer data',  sensitivityFlagged: false },
  { id: 'ul36', toolId: 't4', toolName: 'Notion AI',            employeeName: 'Lisa Tran',     department: 'Marketing',   timestamp: daysAgoAt(29, 14), dataTypeShared: 'Internal docs',  sensitivityFlagged: false },
];

// ── Sensitivity Flags ──────────────────────────────────
// Seeded from usage logs that already have sensitivityFlagged: true.

export const mockFlags = [
  {
    id: 'fl1',
    usageLogId: 'ul2',
    toolName: 'Grammarly Business',
    employeeName: 'Marcus Lee',
    department: 'Sales',
    timestamp: daysAgoAt(1, 11),
    matchedTerms: ['customer email', 'phone number pattern'],
    sensitivityCategory: 'PII',
    status: 'open',
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  },
  {
    id: 'fl2',
    usageLogId: 'ul5',
    toolName: 'Tableau AI',
    employeeName: 'Jordan Patel',
    department: 'Finance',
    timestamp: daysAgoAt(2, 15),
    matchedTerms: ['salary', 'bank account'],
    sensitivityCategory: 'Financial',
    status: 'open',
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  },
  {
    id: 'fl3',
    usageLogId: 'ul9',
    toolName: 'Grammarly Business',
    employeeName: 'Tyler Brooks',
    department: 'Sales',
    timestamp: daysAgoAt(5, 10),
    matchedTerms: ['customer email', 'date of birth'],
    sensitivityCategory: 'PII',
    status: 'open',
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  },
  {
    id: 'fl4',
    usageLogId: 'ul13',
    toolName: 'GitHub Copilot',
    employeeName: 'Samira Obi',
    department: 'Engineering',
    timestamp: daysAgoAt(7, 12),
    matchedTerms: ['API key', 'access token'],
    sensitivityCategory: 'Credentials',
    status: 'reviewed_safe',
    reviewedBy: 'Priya Sharma',
    reviewNote: 'Test credentials used in staging environment — no production exposure.',
    reviewedAt: daysAgoAt(6, 14),
  },
  {
    id: 'fl5',
    usageLogId: 'ul19',
    toolName: 'Tableau AI',
    employeeName: 'Noah Fischer',
    department: 'Finance',
    timestamp: daysAgoAt(11, 14),
    matchedTerms: ['credit card', '16-digit number (possible card)', 'customer email'],
    sensitivityCategory: 'Financial',
    status: 'reviewed_violation',
    reviewedBy: 'Priya Sharma',
    reviewNote: 'Customer payment data included in analytics export without redaction. Escalated to DPO.',
    reviewedAt: daysAgoAt(10, 9),
  },
  {
    id: 'fl6',
    usageLogId: 'ul21',
    toolName: 'Grammarly Business',
    employeeName: 'Tyler Brooks',
    department: 'Sales',
    timestamp: daysAgoAt(14, 11),
    matchedTerms: ['email address', 'Social Security number'],
    sensitivityCategory: 'PII',
    status: 'open',
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  },
  {
    id: 'fl7',
    usageLogId: 'ul28',
    toolName: 'Tableau AI',
    employeeName: 'Noah Fischer',
    department: 'Finance',
    timestamp: daysAgoAt(22, 10),
    matchedTerms: ['salary', 'invoice number'],
    sensitivityCategory: 'Financial',
    status: 'open',
    reviewedBy: null,
    reviewNote: null,
    reviewedAt: null,
  },
  {
    id: 'fl8',
    usageLogId: 'ul33',
    toolName: 'GitHub Copilot',
    employeeName: 'Alex Chen',
    department: 'Engineering',
    timestamp: daysAgoAt(27, 9),
    matchedTerms: ['confidential', 'roadmap', 'internal only'],
    sensitivityCategory: 'Confidential/Internal',
    status: 'reviewed_safe',
    reviewedBy: 'Priya Sharma',
    reviewNote: 'Internal feature planning doc — appropriate use with Copilot for code scaffolding.',
    reviewedAt: daysAgoAt(26, 10),
  },
];

export const demoSnippets = [
  "Can you help me summarize this meeting agenda?",
  "Draft a LinkedIn post announcing our product update.",
  "Please reach out to the customer email john.doe@example.com at 555-019-2039 regarding the recent outage.",
  "Generate test data for the onboarding flow.",
  "Here is the invoice number INV-1092 with the credit card 4242 4242 4242 4242 for the payment.",
  "Our staging environment uses api_key: sk_live_xyz123abc456 for integration testing."
];
