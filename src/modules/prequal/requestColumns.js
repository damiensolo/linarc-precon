// DataGrid rows and columns for the Overview's list of prequalification requests (the Requests screen that shared
// them was removed, D-23). The Review Queue (./queueColumns.js) and Qualified Subs (./recordColumns.js) lists reuse
// the pieces exported here. Columns use the candidate slot types registered in ./gridSlots.js (score-confidence,
// expiry) and the library status-chip and button slots.
import './gridSlots';
import { requestRows, TODAY } from './data';
import { KPI, ROLES, toneToChipStatus } from './status';

/** Rows with the display fields the grid sorts and filters on. `moment` is the app's $moment. */
export function requestGridRows(moment) {
  return requestRows().map((r) => ({
    ...r,
    statusLabel: r.status.label,
    activityText: `${moment(r.activity[0]).format('D MMM')} · ${r.activity[1]}`,
  }));
}

/** Where a row leads: approved → the qualification record; anything with a submission → the review screen. */
export const screenFor = (row) => (row.outcome && row.outcome !== 'not-qualified' ? 'record' : 'review');

export const actionLabel = (row) => {
  if (KPI.readyForReview(row)) return 'Review now';
  if (row.outcome && row.outcome !== 'not-qualified') return 'View record';
  return 'Open';
};

// A cell with only a `center` slot is centred by DecoratedCell; pin the slot `left` (or `right`) and blank the centre
// text so the column value stays available for sorting and filtering without rendering twice.
export const BLANK = { type: 'text', componentProps: { value: '' } };

/** The frozen first column every Prequal list starts with. */
export const subcontractorColumn = () => ({ field: 'companyName', label: 'SUBCONTRACTOR', type: 'ShortText', width: 210, readonly: true, frozen: true });

/** The pinned row-action column (see the note on `frozen` below). `label` is a string or a per-row function. */
export const actionColumn = (label, onClick, width = 110) => ({
  field: 'action',
  label: '',
  type: 'Actions',
  frozen: true,
  width,
  readonly: true,
  cell: { center: BLANK, right: { type: 'button', componentProps: { label, variant: 'text', colorScheme: 'primary', size: 'small' }, onClick } },
});

/**
 * @param {string} role   'reviewer' | 'estimator' (Score · Confidence only for the reviewer, PRD §10)
 * @param {(row) => void} onOpen  row action handler
 */
export function requestColumns(role, onOpen) {
  const cols = [
    { field: 'companyName', label: 'SUBCONTRACTOR', type: 'ShortText', width: 210, readonly: true, frozen: true },
    { field: 'trade', label: 'TRADE', type: 'ShortText', width: 130, readonly: true },
    { field: 'project', label: 'PROJECT', type: 'ShortText', width: 155, readonly: true },
    { field: 'templateName', label: 'TEMPLATE', type: 'ShortText', width: 210, readonly: true },
    {
      field: 'statusLabel',
      label: 'STATUS',
      type: 'ShortText',
      width: 275,
      readonly: true,
      cell: {
        left: {
          type: 'status-chip',
          componentProps: { label: (r) => r.status.label, status: (r) => toneToChipStatus(r.status.tone), fillStyle: 'outline', type: 'default' },
        },
        center: BLANK,
      },
    },
  ];
  if (ROLES[role].seesScore) {
    cols.push({
      field: 'score',
      label: 'SCORE · CONFIDENCE',
      type: 'ShortText',
      width: 150,
      readonly: true,
      cell: {
        left: { type: 'score-confidence', componentProps: { score: (r) => r.score, confidence: (r) => r.confidence, recommendation: (r) => r.recommendation } },
        center: BLANK,
      },
    });
  }
  cols.push(
    { field: 'validUntil', label: 'EXPIRATION', type: 'ShortText', width: 190, readonly: true, cell: { left: { type: 'expiry', componentProps: { date: (r) => r.validUntil, now: TODAY } }, center: BLANK } },
    { field: 'activityText', label: 'LAST ACTIVITY', type: 'ShortText', width: 180, flex: 1, readonly: true },
    {
      // Pinned to the right edge (DataGrid's `Actions` type + `frozen` is sticky right in list and grid views), so the
      // row action stays visible when the table scrolls sideways. The `cell` button still renders (cell wins over type).
      field: 'action',
      label: '',
      type: 'Actions',
      frozen: true,
      width: 110,
      readonly: true,
      cell: { center: BLANK, right: { type: 'button', componentProps: { label: actionLabel, variant: 'text', colorScheme: 'primary', size: 'small' }, onClick: onOpen } },
    },
  );
  return cols;
}
