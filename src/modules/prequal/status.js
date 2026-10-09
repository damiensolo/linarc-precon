// Prequalification status vocabulary (D-16). Source of truth: docs/prequal/status-model.md.
// Every status rendered on a Prequal screen comes from here: a key → { label, tone }.
// Tones are colour roles, mapped to design-system tokens by the status component, never here:
//   neutral | info | success | warning | error
// Labels are the user-facing ones from the PRD ("Waiting for subcontractor"), not the internal names.

const def = (entries) =>
  Object.freeze(
    Object.fromEntries(entries.map(([key, label, tone, note]) => [key, Object.freeze({ key, label, tone, note })])),
  );

/** 1. Request workflow */
export const WORKFLOW = def([
  ['draft', 'Not sent', 'neutral'],
  ['invited', 'Waiting for subcontractor', 'neutral'],
  ['in-progress', 'Subcontractor is completing requirements', 'neutral'],
  ['submitted', 'Ready for review', 'info'],
  ['under-review', 'GC is reviewing', 'info'],
  ['info-requested', 'More information needed', 'warning'],
  ['closed', 'Decided', 'neutral', 'Terminal; see OUTCOME'],
]);

/** 2. Qualification outcome (set when workflow is closed) */
export const OUTCOME = def([
  ['qualified', 'Approved', 'success'],
  ['qualified-with-conditions', 'Approved with conditions', 'success', 'Show a conditions marker'],
  ['not-qualified', 'Not approved', 'error'],
]);

/** 3. Qualification lifecycle (only for approved outcomes) */
export const LIFECYCLE = def([
  ['current', 'Current', 'success'],
  ['expiring', 'Renewal needed soon', 'warning'],
  ['expired', 'No longer active', 'error'],
  ['suspended', 'Suspended', 'error'],
]);

/** 4. Check execution (per automated check) */
export const CHECK = def([
  ['queued', 'Queued', 'neutral'],
  ['running', 'Running', 'info'],
  ['complete', 'Complete', 'success'],
  ['failed-to-run', 'Failed to run', 'error'],
]);

/** 5. Document validation (per document slot) */
export const DOCUMENT = def([
  ['rejected', 'Rejected', 'error'],
  ['processing', 'Processing', 'info'],
  ['passed', 'Accepted', 'success'],
  ['failed', 'Action needed', 'error'],
  ['needs-review', 'Needs review', 'warning'],
  ['expiring', 'Expiring', 'warning'],
  ['expired', 'Expired', 'error'],
  ['superseded', 'Superseded', 'neutral'],
]);

/** Recommendation stamp */
export const RECOMMENDATION = def([
  ['accept', 'Accept', 'success'],
  ['review', 'Review', 'info'],
  ['not-recommended', 'Not recommended', 'error'],
]);

/** Finding severity, in reviewer-hierarchy order */
export const SEVERITY = def([
  ['knockout', 'Knockout', 'error'],
  ['missing', 'Missing or failed', 'warning', 'warning-high / orange'],
  ['finding', 'Open finding', 'warning', 'warning-low / yellow'],
  ['info', 'Informational', 'neutral'],
]);

/** Proof level per criterion value */
export const PROOF = def([
  ['declared', 'Declared', 'neutral'],
  ['evidenced', 'Evidenced', 'info'],
  ['verified', 'Verified', 'success'],
  ['contradicted', 'Contradicted', 'error'],
]);

/** Sub-portal section completion */
export const SECTION = def([
  ['not-started', 'Not started', 'neutral'],
  ['in-progress', 'In progress', 'info'],
  ['complete', 'Complete', 'success'],
  ['needs-attention', 'Needs attention', 'warning'],
  ['submitted', 'Submitted', 'success'],
]);

/**
 * The one status to show for a request in a list: lifecycle once approved, otherwise the outcome once
 * closed, otherwise the workflow stage. Returns a { key, label, tone } entry.
 */
export function requestStatus(request) {
  if (request.lifecycle && request.outcome && request.outcome !== 'not-qualified') return LIFECYCLE[request.lifecycle];
  if (request.workflow === 'closed' && request.outcome) return OUTCOME[request.outcome];
  return WORKFLOW[request.workflow];
}

/** Dashboard KPIs (docs/prequal/status-model.md › KPI definitions) */
export const KPI = Object.freeze({
  waitingForSubcontractor: (r) => ['invited', 'in-progress', 'info-requested'].includes(r.workflow),
  readyForReview: (r) => ['submitted', 'under-review'].includes(r.workflow),
  renewalNeededSoon: (r) => r.lifecycle === 'expiring',
});

/**
 * Tone → library StatusChip `status` (src/components/StatusChip/statusChipTokenMap.js; Figma Status Chip 40005082:4900).
 * `strong` picks the orange warning for the "missing / failed" severity; everything else uses yellow.
 */
export function toneToChipStatus(tone, { strong = false } = {}) {
  switch (tone) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'info':
      return 'info';
    case 'warning':
      return strong ? 'warning-medium' : 'warning-low';
    default:
      return 'warning-neutral';
  }
}

/** Role gating (PRD §10): fields only the reviewer sees */
export const ROLES = Object.freeze({
  reviewer: { seesScore: true, seesFindings: true, seesFinancials: true },
  estimator: { seesScore: false, seesFindings: false, seesFinancials: false },
});
