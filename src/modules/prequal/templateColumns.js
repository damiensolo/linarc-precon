// DataGrid rows, columns and quick filters for the Templates list (screen 9, prequal-templates): the admin's
// requirement templates. PRD UX "Templates list" (docs/Prequal Full PRD UX.md, l. 797–822): name, trade group,
// size band, document count, check package, knockouts, status, last updated and editor, usage, actions.
// Rows come from src/modules/prequal/data/templates.js. Filters through the grid's Filter panel (D-30).
import './gridSlots';
import { templateRows } from './data/templates';
import { TEMPLATE, toneToChipStatus } from './status';
import { actionColumn, BLANK } from './requestColumns';
import { PROJECT_TYPES } from './data/templateCatalog';

export { templateRows };

export const statusOptions = Object.values(TEMPLATE).map((s) => ({ label: s.label, value: s.label }));
export const projectTypeOptions = PROJECT_TYPES.map((p) => ({ label: p.label, value: p.value }));
export const tradeOptions = (rows) => [...new Set(rows.flatMap((r) => r.trades))].sort().map((t) => ({ label: t, value: t }));

/** Quick filters in the Filter panel: the three statuses and "In use". The default view hides Archived. */
export const templateQuickFilters = [
  { label: TEMPLATE.active.label, field: 'statusLabel', operator: 'isAnyOf', value: [TEMPLATE.active.label] },
  { label: TEMPLATE.draft.label, field: 'statusLabel', operator: 'isAnyOf', value: [TEMPLATE.draft.label] },
  { label: TEMPLATE.archived.label, field: 'statusLabel', operator: 'isAnyOf', value: [TEMPLATE.archived.label] },
  { label: 'In use', field: 'usedBy', operator: 'greaterThan', value: 0 },
];
/** Row action: Edit a draft, Open an active or archived template (the builder on Review & publish). */
export const templateActionLabel = (row) => (row.status.key === 'draft' ? 'Edit' : 'Open');

/** @param {(row) => void} onOpen  row action handler */
export function templateColumns(onOpen, trades = []) {
  return [
    { field: 'name', label: 'TEMPLATE', type: 'ShortText', width: 260, readonly: true, frozen: true },
    { field: 'versionText', label: 'VERSION', type: 'ShortText', width: 130, readonly: true },
    {
      field: 'statusLabel',
      label: 'STATUS',
      type: 'ShortText',
      width: 130,
      readonly: true,
      // The Filter panel offers the status values (is / is any of …), not free text.
      customProps: { treatAsSelectFilter: true, options: statusOptions },
      cell: {
        left: { type: 'status-chip', componentProps: { label: (r) => r.status.label, status: (r) => toneToChipStatus(r.status.tone), fillStyle: 'outline', type: 'default' } },
        center: BLANK,
      },
    },
    // Filtered through the hidden `trades` list (a template matches on any of its trades), not this text.
    { field: 'tradesText', label: 'TRADES', type: 'ShortText', width: 220, readonly: true, filterable: false },
    { field: 'sizeText', label: 'PROJECT SIZE', type: 'ShortText', width: 190, readonly: true },
    { field: 'projectTypesText', label: 'PROJECT TYPES', type: 'ShortText', width: 190, readonly: true, filterable: false },
    { field: 'documentsText', label: 'DOCUMENTS', type: 'ShortText', width: 170, readonly: true, filterable: false },
    { field: 'checksText', label: 'CHECKS', type: 'ShortText', width: 110, readonly: true, filterable: false },
    { field: 'knockouts', label: 'KNOCKOUTS', type: 'Number', width: 110, readonly: true },
    { field: 'usedByText', label: 'USED BY', type: 'ShortText', width: 150, readonly: true, filterable: false },
    { field: 'updatedText', label: 'LAST UPDATED', type: 'ShortText', width: 200, flex: 1, readonly: true },
    actionColumn(templateActionLabel, onOpen, 90),
    // Filter-only, hidden.
    { field: 'trades', label: 'Trade', type: 'MultiSelect', invisible: true, readonly: true, customProps: { options: trades } },
    { field: 'projectTypes', label: 'Project type', type: 'MultiSelect', invisible: true, readonly: true, customProps: { options: projectTypeOptions } },
    { field: 'usedBy', label: 'Active requests', type: 'Number', invisible: true, readonly: true },
  ];
}
