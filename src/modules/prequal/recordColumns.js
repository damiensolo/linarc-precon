// DataGrid rows, columns and filters for Qualified Subs (screen 7, prequal-qualified): the GC's qualified
// subcontractor list. PRD UX "Qualified subcontractor list" (docs/Prequal Full PRD UX.md, lines 1516–1529): Company,
// Qualification, Lifecycle, Trades, Limits, Conditions, Valid until, Next required renewal, Action (View record or
// request renewal). One row per company (the qualification record is keyed by GC and sub, PRD data model line 630).
// Assumptions A1–A4 are listed in docs/prequal/spec.md.
import './gridSlots';
import { TODAY } from './data';
import { recordRows } from './data/records';
import { LIFECYCLE, OUTCOME } from './status';
import { subcontractorColumn, actionColumn, BLANK } from './requestColumns';
import { toneToChipStatus } from './status';
import { currency } from '~/candidates/FormTableFields/format';

const fmt = (moment, iso) => (iso ? moment(iso).format('D MMM YYYY') : '—');

/** Status filter options: the lifecycle values plus Not approved (assumption A1: rejected companies stay listed). */
export const STATUS_OPTIONS = [
  ...Object.values(LIFECYCLE).map((s) => ({ label: s.label, value: s.key })),
  { label: OUTCOME['not-qualified'].label, value: 'not-qualified' },
];

/** Rows with the display fields the grid sorts and filters on. `moment` is the app's $moment. */
export function qualifiedRows(moment) {
  return recordRows().map((r) => ({
    ...r,
    statusLabel: r.status.label,
    limitsText: r.record ? `${currency(r.single)} · ${currency(r.aggregate)}` : '—',
    conditionsText: !r.record ? '—' : r.conditions.length ? `${r.conditions.length} · ${r.conditions[0].label}` : 'None',
    renewalText: r.nextRenewal ? `${fmt(moment, r.nextRenewal.date)} · ${r.nextRenewal.label}` : '—',
    decidedText: `${r.decidedByName} · ${fmt(moment, r.decidedOn)}`,
  }));
}

/** The lifecycle key or 'not-qualified', for the Status filter. */
export const statusKey = (row) => (row.lifecycle ? row.lifecycle.key : 'not-qualified');

/**
 * Row action: Request renewal for a reviewer on an Expiring / Expired record (assumption A3), View record for every
 * other record, View decision for a company that was not approved (the closed review).
 */
export const qualifiedActionLabel = (role) => (row) => {
  if (!row.record) return 'View decision';
  if (role === 'reviewer' && row.lifecycle && ['expiring', 'expired'].includes(row.lifecycle.key)) return 'Request renewal';
  return 'View record';
};

/**
 * @param {string} role  'reviewer' | 'estimator'
 * @param {(row) => void} onAction  row action handler (the label says which; see `qualifiedActionLabel`)
 */
export function qualifiedColumns(role, onAction) {
  return [
    subcontractorColumn(),
    { field: 'trade', label: 'TRADES', type: 'ShortText', width: 150, readonly: true },
    {
      field: 'statusLabel',
      label: 'STATUS',
      type: 'ShortText',
      width: 190,
      readonly: true,
      cell: {
        left: { type: 'status-chip', componentProps: { label: (r) => r.status.label, status: (r) => toneToChipStatus(r.status.tone), fillStyle: 'outline', type: 'default' } },
        center: BLANK,
      },
    },
    { field: 'limitsText', label: 'SINGLE · AGGREGATE', type: 'ShortText', width: 190, readonly: true },
    { field: 'conditionsText', label: 'CONDITIONS', type: 'ShortText', width: 220, readonly: true },
    { field: 'validUntil', label: 'VALID UNTIL', type: 'ShortText', width: 170, readonly: true, cell: { left: { type: 'expiry', componentProps: { date: (r) => r.validUntil, now: TODAY } }, center: BLANK } },
    { field: 'renewalText', label: 'NEXT RENEWAL', type: 'ShortText', width: 210, readonly: true },
    { field: 'decidedText', label: 'DECIDED', type: 'ShortText', width: 170, flex: 1, readonly: true },
    actionColumn(qualifiedActionLabel(role), onAction, 130),
  ];
}
