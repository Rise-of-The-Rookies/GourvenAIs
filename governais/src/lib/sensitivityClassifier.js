/**
 * Rule-based sensitivity classifier for AI tool usage content.
 *
 * Runs keyword / regex pattern matching against four severity-ranked categories.
 * Designed for explainability — judges can see exactly which terms triggered a flag.
 *
 * Severity order (highest → lowest):
 *   Credentials > Financial > PII > Confidential/Internal
 */

// ── Category definitions ──────────────────────────────

const CATEGORIES = [
  {
    name: 'Credentials',
    severity: 4, // highest
    patterns: [
      { type: 'keyword', value: 'password', label: 'password' },
      { type: 'keyword', value: 'api key', label: 'API key' },
      { type: 'keyword', value: 'api_key', label: 'API key' },
      { type: 'keyword', value: 'secret key', label: 'secret key' },
      { type: 'keyword', value: 'secret_key', label: 'secret key' },
      { type: 'keyword', value: 'access token', label: 'access token' },
      { type: 'keyword', value: 'access_token', label: 'access token' },
      { type: 'keyword', value: 'private key', label: 'private key' },
      { type: 'regex', value: /sk_live_[a-zA-Z0-9]+/i, label: 'live secret key pattern' },
    ],
  },
  {
    name: 'Financial',
    severity: 3,
    patterns: [
      { type: 'keyword', value: 'credit card', label: 'credit card' },
      { type: 'keyword', value: 'bank account', label: 'bank account' },
      { type: 'keyword', value: 'invoice number', label: 'invoice number' },
      { type: 'keyword', value: 'salary', label: 'salary' },
      { type: 'keyword', value: 'routing number', label: 'routing number' },
      { type: 'keyword', value: 'account number', label: 'account number' },
      { type: 'regex', value: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, label: '16-digit number (possible card)' },
    ],
  },
  {
    name: 'PII',
    severity: 2,
    patterns: [
      { type: 'regex', value: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, label: 'email address' },
      { type: 'regex', value: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, label: 'phone number pattern' },
      { type: 'keyword', value: 'ssn', label: 'SSN' },
      { type: 'keyword', value: 'social security', label: 'Social Security number' },
      { type: 'keyword', value: 'passport', label: 'passport' },
      { type: 'keyword', value: 'date of birth', label: 'date of birth' },
      { type: 'keyword', value: 'customer email', label: 'customer email' },
      { type: 'keyword', value: 'home address', label: 'home address' },
    ],
  },
  {
    name: 'Confidential/Internal',
    severity: 1, // lowest
    patterns: [
      { type: 'keyword', value: 'confidential', label: 'confidential' },
      { type: 'keyword', value: 'internal only', label: 'internal only' },
      { type: 'keyword', value: 'do not distribute', label: 'do not distribute' },
      { type: 'keyword', value: 'unreleased', label: 'unreleased' },
      { type: 'keyword', value: 'roadmap', label: 'roadmap' },
      { type: 'keyword', value: 'trade secret', label: 'trade secret' },
      { type: 'keyword', value: 'under nda', label: 'under NDA' },
    ],
  },
];

// ── Classifier ────────────────────────────────────────

/**
 * Classify a text string for sensitivity.
 *
 * @param {string} text — The content to scan.
 * @returns {{ flagged: boolean, category: string | null, matchedTerms: string[] }}
 */
export function classifyContent(text) {
  if (!text || typeof text !== 'string') {
    return { flagged: false, category: null, matchedTerms: [] };
  }

  const lower = text.toLowerCase();
  let highestSeverity = 0;
  let topCategory = null;
  const allMatchedTerms = [];

  for (const category of CATEGORIES) {
    for (const pattern of category.patterns) {
      let matched = false;

      if (pattern.type === 'keyword') {
        matched = lower.includes(pattern.value);
      } else if (pattern.type === 'regex') {
        matched = pattern.value.test(text);
      }

      if (matched && !allMatchedTerms.includes(pattern.label)) {
        allMatchedTerms.push(pattern.label);

        if (category.severity > highestSeverity) {
          highestSeverity = category.severity;
          topCategory = category.name;
        }
      }
    }
  }

  return {
    flagged: allMatchedTerms.length > 0,
    category: topCategory,
    matchedTerms: allMatchedTerms,
  };
}
