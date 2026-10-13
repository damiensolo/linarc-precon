// Cell formatting shared by RepeatField and MatrixField. A column is { key, label, format? } with format one of
// 'currency' | 'date' | 'yesno' | 'percent' | 'number'; `key` may be a dotted path ("reference.name").
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-US');

export function formatCell(row, column, moment) {
  const v = column.key.split('.').reduce((o, k) => (o == null ? o : o[k]), row);
  // A column's own display (template builder, 2026-10-12): the value and the row, e.g. a threshold in words.
  if (column.display) return column.display(v, row) || '—';
  if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) return '—';
  // Select options as { label, value } show the label (2026-10-12).
  if (column.options && column.options.length && typeof column.options[0] === 'object') {
    const o = column.options.find((x) => x.value === v);
    if (o) return o.label;
  }
  switch (column.format) {
    case 'list':
      return Array.isArray(v) ? v.join(' · ') : String(v);
    case 'currency':
      return usd.format(v);
    case 'number':
      return num.format(v);
    case 'percent':
      return `${v}%`;
    case 'yesno':
      return v ? 'Yes' : 'No';
    case 'date':
      return moment ? moment(v).format('MMM YYYY') : String(v);
    default:
      return String(v);
  }
}

export const currency = (v) => (v === null || v === undefined ? '' : usd.format(v));
