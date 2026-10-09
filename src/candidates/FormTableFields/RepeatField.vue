<template>
  <!-- CANDIDATE 2026-10-09: FormV2 field type `repeat` (rows of a record: licenses, projects, references), see
       docs/components/FormTableFields.md. Follows the FormV2 field contract (_baseFieldProps). Rows are shown as a
       table with an Add action; row editing is out of scope for the prototype.
       Hierarchy (2026-10-09): the field is a subsection. It draws its own heading (field.props.title, 16px bold,
       with the required mark) instead of the 13px form label, and keeps space above and below so neighbouring
       subsections read as separate blocks (D-17). The schema sets labelPosition: 'hidden' for it. -->
  <div class="repeat-field flex flex-col gap-space-12 py-space-8">
    <h3 v-if="title" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">
      {{ title }}<span v-if="isRequired" class="text-text-error" aria-hidden="true"> *</span>
    </h3>
    <table v-if="rows.length" class="w-full border-separate border-spacing-0 font-label text-fontsize-14 leading-lineheight-20">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key" scope="col" class="border-b border-border-subtle px-space-8 py-space-8 text-left text-fontsize-12 font-bold uppercase leading-lineheight-16 tracking-letterspacing-4 text-text-subtle">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="c in columns" :key="c.key" class="border-b border-border-subtle px-space-8 py-space-10 align-top text-text-default">{{ cell(row, c) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-soft">None added yet.</p>
    <div class="flex flex-wrap items-center gap-space-12 pt-space-4">
      <Button :label="addLabel" color-scheme="secondary" variant="outline" size="small" :is-disabled="readOnly || disabled" />
      <span v-if="minimum" class="font-label text-fontsize-12 leading-lineheight-16" :class="rows.length < minimum ? 'text-text-warning-low' : 'text-text-subtle'">
        {{ rows.length }} of {{ minimum }} required
      </span>
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import { baseFieldProps } from '@/componentsV2/FormV2/fields/_baseFieldProps';
import { formatCell } from './format';

export default {
  name: 'RepeatField',
  components: { Button },
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
    minimum() {
      return (this.field.props && this.field.props.minimum) || 0;
    },
    addLabel() {
      return (this.field.props && this.field.props.addLabel) || 'Add';
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
