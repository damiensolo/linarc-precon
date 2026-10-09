<template>
  <!-- CANDIDATE 2026-10-09: FormV2 field type `repeat` (rows of a record: licenses, projects, references), see
       docs/components/FormTableFields.md. Follows the FormV2 field contract (_baseFieldProps). Rows are shown as a
       table with an Add action; row editing is out of scope for the prototype. -->
  <div class="repeat-field flex flex-col gap-space-8">
    <table v-if="rows.length" class="w-full border-separate border-spacing-0 font-label text-fontsize-14 leading-lineheight-20">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key" scope="col" class="border-b border-border-subtle px-space-8 py-space-4 text-left text-fontsize-12 font-bold uppercase leading-lineheight-16 tracking-letterspacing-4 text-text-subtle">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="c in columns" :key="c.key" class="border-b border-border-subtle px-space-8 py-space-8 align-top text-text-default">{{ cell(row, c) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-soft">None added yet.</p>
    <div class="flex flex-wrap items-center gap-space-12">
      <Button :label="addLabel" color-scheme="secondary" variant="outline" size="small" :is-disabled="readOnly || disabled">
        <template #leftIcon><Plus /></template>
      </Button>
      <span v-if="minimum" class="font-label text-fontsize-12 leading-lineheight-16" :class="rows.length < minimum ? 'text-text-warning-low' : 'text-text-subtle'">
        {{ rows.length }} of {{ minimum }} required
      </span>
    </div>
  </div>
</template>

<script>
import { Plus } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import { baseFieldProps } from '@/componentsV2/FormV2/fields/_baseFieldProps';
import { formatCell } from './format';

export default {
  name: 'RepeatField',
  components: { Button, Plus },
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
  },
  methods: {
    cell(row, c) {
      return formatCell(row, c, this.$moment);
    },
  },
};
</script>
