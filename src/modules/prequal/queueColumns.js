// DataGrid rows, columns and quick filters for the Review Queue (screen 8, prequal-queue): the reviewer's work list.
// PRD UX "Review queue" (docs/Prequal Full PRD UX.md, lines 1390–1406): Subcontractor, Request state, Recommendation,
// Score, Confidence, Findings, Checks, Assigned reviewer, Last activity; filters Needs review, Confirmed knockouts,
// Awaiting subcontractor, Checks pending, Assigned to me. Only requests with a submission are in the queue.
import './gridSlots';
import { requestGridRows, actionLabel, subcontractorColumn, actionColumn, BLANK } from './requestColumns';
import { RECOMMENDATION, WORKFLOW, toneToChipStatus } from './status';

/** Workflow stages that put a request in the queue (PRD: Submitted, Info Requested, Under Review). */
export const QUEUE_STAGES = ['submitted', 'under-review', 'info-requested'];

/** PRD's five quick filters. "Assigned to me" is a separate toggle (see `ME`). */
export const QUEUE_FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'needs-review', label: 'Needs review', test: (r) => ['submitted', 'under-review'].includes(r.workflow) },
  { id: 'knockouts', label: 'Knockouts', test: (r) => r.knockouts > 0 },
  { id: 'awaiting', label: 'Awaiting subcontractor', test: (r) => r.workflow === 'info-requested' },
  { id: 'checks', label: 'Checks pending', test: (r) => r.checks[0] < r.checks[1] },
];

// PLACEHOLDER DATA — the signed-in reviewer for "Assigned to me". The shell's top nav shows Alex Morgan (an Estimator
// in the mock); the reviewer persona in the data is Jordan Lee. Assignment itself is a proposed PRD field (assumption
// A5 in docs/prequal/spec.md): shown as a column, no assignment flow.
export const ME = 'jordan';

/** Queue rows: requests with a submission, plus the display fields the grid sorts and filters on. */
export function queueRows(moment) {
  return requestGridRows(moment)
    .filter((r) => QUEUE_STAGES.includes(r.workflow))
    .map((r) => ({
      ...r,
      stateLabel: WORKFLOW[r.workflow].label,
      recommendationLabel: r.recommendation ? RECOMMENDATION[r.recommendation].label : '—',
      findingsText: r.findings ? `${r.findings} open${r.knockouts ? ` · ${r.knockouts} knockout` : ''}` : 'None',
      checksText: `${r.checks[0]} / ${r.checks[1]}`,
      assignedName: r.reviewerName || 'Unassigned',
    }));
}

/** @param {(row) => void} onOpen  row action handler (Review now / Open → the review screen) */
export function queueColumns(onOpen) {
  return [
    subcontractorColumn(),
    { field: 'trade', label: 'TRADE', type: 'ShortText', width: 130, readonly: true },
    {
      field: 'stateLabel',
      label: 'REQUEST STATE',
      type: 'ShortText',
      width: 230,
      readonly: true,
      cell: {
        left: { type: 'status-chip', componentProps: { label: (r) => r.status.label, status: (r) => toneToChipStatus(r.status.tone), fillStyle: 'outline', type: 'default' } },
        center: BLANK,
      },
    },
    {
      field: 'recommendationLabel',
      label: 'RECOMMENDATION',
      type: 'ShortText',
      width: 160,
      readonly: true,
      cell: {
        left: {
          type: 'status-chip',
          componentProps: {
            label: (r) => r.recommendationLabel,
            status: (r) => (r.recommendation ? toneToChipStatus(RECOMMENDATION[r.recommendation].tone) : 'warning-neutral'),
            fillStyle: 'outline',
            type: 'default',
          },
        },
        center: BLANK,
      },
    },
    {
      field: 'score',
      label: 'SCORE · CONFIDENCE',
      type: 'ShortText',
      width: 150,
      readonly: true,
      cell: {
        left: { type: 'score-confidence', componentProps: { score: (r) => r.score, confidence: (r) => r.confidence, recommendation: (r) => r.recommendation } },
        center: BLANK,
      },
    },
    { field: 'findingsText', label: 'FINDINGS', type: 'ShortText', width: 150, readonly: true },
    { field: 'checksText', label: 'CHECKS', type: 'ShortText', width: 110, readonly: true },
    { field: 'assignedName', label: 'ASSIGNED REVIEWER', type: 'ShortText', width: 170, readonly: true },
    { field: 'activityText', label: 'LAST ACTIVITY', type: 'ShortText', width: 180, flex: 1, readonly: true },
    actionColumn(actionLabel, onOpen),
  ];
}
