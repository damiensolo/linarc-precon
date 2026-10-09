// Cell formatting shared by RepeatField and MatrixField. A column is { key, label, format? } with format one of
// 'currency' | 'date' | 'yesno' | 'percent' | 'number'; `key` may be a dotted path ("reference.name").
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-US');

export function formatCell(row, column, moment) {
  const v = column.key.split('.').reduce((o, k) => (o == null ? o : o[k]), row);
  if (v === null || v === undefined || v === '') return '—';
  switch (column.format) {
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
