<template>
  <!-- CANDIDATE 2026-10-09: FormV2 field type `matrix` (a fixed grid of values: EMR by year, TRIR/DART/hours by year,
       workforce by role), see docs/components/FormTableFields.md. Follows the FormV2 field contract.
       Hierarchy (2026-10-09): like RepeatField, the field is a subsection with its own 16px heading
       (field.props.title) and space above and below; the schema hides the form label (D-17).
       Editable (CANDIDATE 2026-10-11): unless read-only, every value cell is a small InputV2 (numbers); the field
       emits `input` with the new rows and `blur`. Empty cells make the field incomplete (`incomplete` rule in
       portalFields.js). The first column (year / role) stays a label.
       Alignment (2026-10-11, P-039, docs/5-ui-patterns.md §7): the table hugs its content instead of spanning the form.
       Editable: 124px left-aligned inputs at form size, headers left over them, so each value sits next to its year.
       Read-only: values right-aligned with tabular digits (compared down a column). -->
  <div class="matrix-field flex min-w-0 flex-col gap-space-12 py-space-8">
    <h3 v-if="title" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">
      {{ title }}<span v-if="isRequired" class="text-text-error" aria-hidden="true"> *</span>
    </h3>
    <div class="relative overflow-x-auto">
      <table class="w-auto border-separate border-spacing-0 font-label text-fontsize-14 leading-lineheight-20">
        <thead>
          <tr>
            <th v-for="c in columns" :key="c.key" scope="col" class="border-b border-border-subtle px-space-8 py-space-8 text-fontsize-12 font-bold uppercase leading-lineheight-16 tracking-letterspacing-4 text-text-subtle" :class="c.key === rowKey || editable ? 'text-left' : 'text-right'">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td v-for="c in columns" :key="c.key" class="whitespace-nowrap border-b border-border-subtle px-space-8 tabular-nums" :class="[c.key === rowKey ? 'pr-space-24 text-left text-text-subtle' : editable ? 'text-left' : 'text-right', c.readOnly ? 'text-text-soft' : 'text-text-default', editable && c.key !== rowKey && !c.readOnly ? 'py-space-4' : 'py-space-10']">
              <InputV2
                v-if="editable && c.key !== rowKey && !c.readOnly"
                class="w-space-124"
                type="number"
                :value="row[c.key] === null || row[c.key] === undefined ? '' : row[c.key]"
                :aria-label="`${row[rowKey]} ${c.label}`"
                :state="row[c.key] === null || row[c.key] === undefined || row[c.key] === '' ? (errors.length ? 'error' : 'default') : 'default'"
                @input="setCell(i, c.key, $event)"
                @blur="$emit('blur')"
              />
              <template v-else>{{ cell(row, c) }}</template>
            </td>
          </tr>
        </tbody>
        <!-- Total line (extension 2026-10-12, template builder): props.total = { label, target, suffix }. The editable
             columns are summed; off target the line says what to add or remove (warning tone, text not colour alone). -->
        <tfoot v-if="total">
          <tr>
            <td class="px-space-8 pt-space-10 text-left font-bold text-text-default">{{ total.label || 'Total' }}</td>
            <td v-for="c in columns.slice(1)" :key="c.key" class="whitespace-nowrap px-space-8 pt-space-10 text-left font-bold tabular-nums" :class="c.readOnly ? 'text-text-soft' : totalOk(c) ? 'text-text-default' : 'text-text-warning-low'">
              {{ sum(c) }}{{ total.suffix || '' }}<template v-if="!c.readOnly && total.target !== undefined"> {{ totalOk(c) ? '✓' : total.target > sum(c) ? `· add ${total.target - sum(c)}${total.suffix || ''}` : `· remove ${sum(c) - total.target}${total.suffix || ''}` }}</template>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import InputV2 from '@/componentsV2/InputV2/InputV2.vue';
import { baseFieldProps } from '@/componentsV2/FormV2/fields/_baseFieldProps';
import { formatCell } from './format';

export default {
  name: 'MatrixField',
  components: { InputV2 },
  props: { ...baseFieldProps },
  computed: {
    rows() {
      return Array.isArray(this.value) ? this.value : [];
    },
    columns() {
      const p = this.field.props || {};
      if (p.columns) return p.columns;
      const first = this.rows[0] || {};
      return Object.keys(first).map((key) => ({ key, label: key }));
    },
    editable() {
      return !this.readOnly && !this.disabled;
    },
    rowKey() {
      return this.columns.length ? this.columns[0].key : '';
    },
    title() {
      return (this.field.props && this.field.props.title) || '';
    },
    isRequired() {
      return Boolean(this.required || (this.field.props && this.field.props.required));
    },
    total() {
      return (this.field.props && this.field.props.total) || null;
    },
  },
  methods: {
    sum(c) {
      return this.rows.reduce((n, r) => n + (Number(r[c.key]) || 0), 0);
    },
    totalOk(c) {
      return this.total.target === undefined || this.sum(c) === this.total.target;
    },
    cell(row, c) {
      return formatCell(row, c, this.$moment);
    },
    setCell(i, key, raw) {
      const v = raw === '' || raw === null ? null : Number(raw);
      this.$emit('input', this.rows.map((r, j) => (j === i ? { ...r, [key]: Number.isNaN(v) ? null : v } : r)));
    },
  },
};
</script>
