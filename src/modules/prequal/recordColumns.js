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
    // Filter-only fields (2026-10-12): the grid's Filter panel matches a company on any of its trades, and "Has
    // conditions" counts them.
    trades: r.trade.split(' · '),
    conditionCount: r.record ? r.conditions.length : 0,
  }));
}

/** Every trade on the roster, for the Trade filter's options (a server would return them with the filter). */
export const tradeOptions = (rows) =>
  [...new Set(rows.flatMap((r) => r.trades))].sort().map((t) => ({ label: t, value: t }));

/**
 * Quick filters in the grid's Filter panel (agreed 2026-10-12): one click adds the condition, which can then be
 * edited or removed like any other. Status filters on the visible STATUS column's label.
 */
export function qualifiedQuickFilters(moment) {
  const day = (n) => moment(TODAY).add(n, 'days').format('YYYY-MM-DD');
  return [
    { label: LIFECYCLE.expiring.label, field: 'statusLabel', operator: 'isAnyOf', value: [LIFECYCLE.expiring.label] },
    { label: LIFECYCLE.current.label, field: 'statusLabel', operator: 'isAnyOf', value: [LIFECYCLE.current.label] },
    { label: LIFECYCLE.expired.label, field: 'statusLabel', operator: 'isAnyOf', value: [LIFECYCLE.expired.label] },
    { label: 'Has conditions', field: 'conditionCount', operator: 'greaterThan', value: 0 },
    { label: 'Expires in 30 days', field: 'validUntil', operator: 'isBetween', value: { start: day(0), end: day(30) } },
  ];
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
export function qualifiedColumns(role, onAction, trades = []) {
  return [
    subcontractorColumn(),
    // Filtered through the hidden `trades` list below (a company matches on any of its trades), not this text.
    { field: 'trade', label: 'TRADES', type: 'ShortText', width: 150, readonly: true, filterable: false },
    {
      field: 'statusLabel',
      label: 'STATUS',
      type: 'ShortText',
      width: 190,
      readonly: true,
      // The Filter panel offers the status values (is / is any of …), not free text.
      customProps: { treatAsSelectFilter: true, options: STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.label })) },
      cell: {
        left: { type: 'status-chip', componentProps: { label: (r) => r.status.label, status: (r) => toneToChipStatus(r.status.tone), fillStyle: 'outline', type: 'default' } },
        center: BLANK,
      },
    },
    { field: 'limitsText', label: 'SINGLE · AGGREGATE', type: 'ShortText', width: 190, readonly: true },
    { field: 'conditionsText', label: 'CONDITIONS', type: 'ShortText', width: 220, readonly: true },
    // DateInput so the Filter panel offers date conditions (before / after / between, "Expires in 30 days").
    { field: 'validUntil', label: 'VALID UNTIL', type: 'DateInput', width: 170, readonly: true, cell: { left: { type: 'expiry', componentProps: { date: (r) => r.validUntil, now: TODAY } }, center: BLANK } },
    { field: 'renewalText', label: 'NEXT RENEWAL', type: 'ShortText', width: 210, readonly: true },
    { field: 'decidedText', label: 'DECIDED', type: 'ShortText', width: 170, flex: 1, readonly: true },
    actionColumn(qualifiedActionLabel(role), onAction, 130),
    // Filter-only columns, hidden in the grid.
    { field: 'trades', label: 'Trade', type: 'MultiSelect', invisible: true, readonly: true, customProps: { options: trades } },
    { field: 'conditionCount', label: 'Number of conditions', type: 'NumberInput', invisible: true, readonly: true },
  ];
}
