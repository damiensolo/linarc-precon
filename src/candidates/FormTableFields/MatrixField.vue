<template>
  <!-- CANDIDATE 2026-10-09: FormV2 field type `matrix` (a fixed grid of values: EMR by year, TRIR/DART/hours by year,
       workforce by role), see docs/components/FormTableFields.md. Follows the FormV2 field contract.
       Hierarchy (2026-10-09): like RepeatField, the field is a subsection with its own 16px heading
       (field.props.title) and space above and below; the schema hides the form label (D-17). -->
  <div class="matrix-field flex flex-col gap-space-12 py-space-8">
    <h3 v-if="title" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">
      {{ title }}<span v-if="isRequired" class="text-text-error" aria-hidden="true"> *</span>
    </h3>
    <div class="overflow-x-auto">
      <table class="w-full border-separate border-spacing-0 font-label text-fontsize-14 leading-lineheight-20">
        <thead>
          <tr>
            <th v-for="c in columns" :key="c.key" scope="col" class="border-b border-border-subtle px-space-8 py-space-8 text-fontsize-12 font-bold uppercase leading-lineheight-16 tracking-letterspacing-4 text-text-subtle" :class="c.key === rowKey ? 'text-left' : 'text-right'">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td v-for="c in columns" :key="c.key" class="border-b border-border-subtle px-space-8 py-space-10 tabular-nums" :class="c.key === rowKey ? 'text-left text-text-subtle' : 'text-right text-text-default'">{{ cell(row, c) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { baseFieldProps } from '@/componentsV2/FormV2/fields/_baseFieldProps';
import { formatCell } from './format';

export default {
  name: 'MatrixField',
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
    rowKey() {
      return this.columns.length ? this.columns[0].key : '';
    },
    title() {
      return (this.field.props && this.field.props.title) || '';
    },
    isRequired() {
      return Boolean(this.required || (this.field.props && this.field.props.required));
    },
  },
  methods: {
    cell(row, c) {
      return formatCell(row, c, this.$moment);
    },
  },
};
</script>
