<template>
  <!-- CANDIDATE 2026-10-09: FormV2 field type `repeat` (rows of a record: licenses, projects, references), see
       docs/components/FormTableFields.md. Follows the FormV2 field contract (_baseFieldProps). Rows are shown as a
       table with an Add action.
       Hierarchy (2026-10-09): the field is a subsection. It draws its own heading (field.props.title, 16px bold,
       with the required mark) instead of the 13px form label, and keeps space above and below so neighbouring
       subsections read as separate blocks (D-17). The schema sets labelPosition: 'hidden' for it. -->
  <!-- min-w-0 + overflow-x-auto (2026-10-11): a wide table scrolls inside the field instead of widening the form and
       squeezing the portal's section nav. -->
  <!-- Editable (CANDIDATE 2026-10-11): Add opens an inline row editor under the table (a FormV2 built from the
       columns: `input` text | number | date | select, `optional`), validated on Save; each row has Edit and Remove.
       The field emits `input` with the new rows and `blur`, like any FormV2 field, so the form's rules (required,
       minLength for minimums) and autosave see the change. Read-only: no actions. -->
  <div class="repeat-field flex min-w-0 flex-col gap-space-12 py-space-8">
    <h3 v-if="title" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">
      {{ title }}<span v-if="isRequired" class="text-text-error" aria-hidden="true"> *</span>
    </h3>
    <!-- `relative`: the sr-only "Actions" header is absolutely positioned; without a positioned scroller it escapes the
         scroll box and widens the page at 390px (2026-10-11). -->
    <div v-if="rows.length" class="relative overflow-x-auto">
      <table class="w-full border-separate border-spacing-0 font-label text-fontsize-14 leading-lineheight-20">
        <thead>
          <tr>
            <th v-for="c in columns" :key="c.key" scope="col" class="border-b border-border-subtle px-space-8 py-space-8 text-fontsize-12 font-bold uppercase leading-lineheight-16 tracking-letterspacing-4 text-text-subtle" :class="isNumeric(c) ? 'text-right' : 'text-left'">{{ c.label }}</th>
            <th v-if="editable" scope="col" class="border-b border-border-subtle px-space-8 py-space-8"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i" :class="{ 'bg-surface-container': editing === i }">
            <td v-for="c in columns" :key="c.key" class="border-b border-border-subtle px-space-8 py-space-10 align-top text-text-default" :class="isNumeric(c) ? 'whitespace-nowrap text-right tabular-nums' : 'text-left'">{{ cell(row, c) }}</td>
            <td v-if="editable" class="whitespace-nowrap border-b border-border-subtle px-space-8 py-space-4 text-right align-top">
              <span class="inline-flex gap-space-4">
                <Button native-type="button" label="Edit" color-scheme="primary" variant="text" size="small" :is-disabled="editing !== null" @onClick="startEdit(i)" />
                <Button native-type="button" label="Remove" color-scheme="secondary" variant="minimal" size="small" :is-disabled="editing !== null" @onClick="remove(i)" />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="editing === null" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-soft">None added yet.</p>

    <!-- Row editor: one container level (a hairline-boxed group), its own Save / Cancel. -->
    <div v-if="editing !== null" class="flex flex-col gap-space-12 rounded-radius-4 border border-border-subtle p-space-16">
      <span class="font-label text-fontsize-14 font-bold leading-lineheight-20 text-text-default">{{ editing === 'new' ? addLabel : `Edit ${singular}` }}</span>
      <FormV2 ref="rowForm" v-model="draft" :schema="rowSchema" :flat="true" mode="manual" label-position="top" @submit="commit">
        <template #footer="{ submit }">
          <span class="flex flex-wrap gap-space-8 pt-space-4">
            <Button native-type="button" :label="editing === 'new' ? 'Add' : 'Save'" color-scheme="primary" variant="solid" size="small" @onClick="submit" />
            <Button native-type="button" label="Cancel" color-scheme="secondary" variant="minimal" size="small" @onClick="cancel" />
          </span>
        </template>
      </FormV2>
    </div>

    <div v-if="editable && editing === null" class="flex flex-wrap items-center gap-space-12 pt-space-4">
      <Button native-type="button" :label="addLabel" color-scheme="secondary" variant="outline" size="small" @onClick="startAdd" />
      <span v-if="minimum" class="font-label text-fontsize-12 leading-lineheight-16" :class="rows.length < minimum ? 'text-text-warning-low' : 'text-text-subtle'">
        {{ rows.length }} of {{ minimum }} required
      </span>
    </div>
    <span v-else-if="!editable && minimum" class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ rows.length }} of {{ minimum }} required</span>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import { baseFieldProps } from '@/componentsV2/FormV2/fields/_baseFieldProps';
import { formatCell } from './format';

const fid = (key) => key.replace(/\./g, '__');
const getPath = (o, key) => key.split('.').reduce((v, k) => (v == null ? v : v[k]), o);
function setPath(o, key, val) {
  const parts = key.split('.');
  let cur = o;
  parts.slice(0, -1).forEach((k) => { cur[k] = cur[k] && typeof cur[k] === 'object' ? { ...cur[k] } : {}; cur = cur[k]; });
  cur[parts[parts.length - 1]] = val;
}
const TYPE = { currency: 'number', percent: 'number', number: 'number', date: 'date' };

export default {
  name: 'RepeatField',
  components: { Button, FormV2 },
  props: { ...baseFieldProps },
  data() {
    return { editing: null, draft: {} };
  },
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
    minimum() {
      return (this.field.props && this.field.props.minimum) || 0;
    },
    addLabel() {
      return (this.field.props && this.field.props.addLabel) || 'Add';
    },
    singular() {
      return this.addLabel.replace(/^Add (a |an )?/i, '').toLowerCase() || 'row';
    },
    title() {
      return (this.field.props && this.field.props.title) || '';
    },
    isRequired() {
      return Boolean(this.required || (this.field.props && this.field.props.required));
    },
    /** One field per column; `input` and `options` override the type the column's format implies. */
    rowSchema() {
      const fields = this.columns.map((c) => {
        const type = c.input || TYPE[c.format] || 'text';
        const f = { id: fid(c.key), label: c.label.charAt(0) + c.label.slice(1).toLowerCase(), type, colSpan: c.wide ? 'full' : 1 };
        if (type === 'select') f.options = (c.options || []).map((o) => ({ label: o, value: o }));
        if (!c.optional) f.rules = [{ type: 'required' }];
        if (c.format === 'percent') f.help = 'Percent, 0–100';
        return f;
      });
      return { sections: [{ id: 'row', layout: { columns: 2, gap: '16px' }, fields }] };
    },
  },
  methods: {
    // Read-only numbers (value, ownership, years) right-aligned in their column, as in any data table (P-039, §7).
    isNumeric(c) {
      return ['currency', 'number', 'percent'].includes(c.format) || c.input === 'number';
    },
    cell(row, c) {
      return formatCell(row, c, this.$moment);
    },
    startAdd() {
      this.draft = Object.fromEntries(this.columns.map((c) => [fid(c.key), null]));
      this.editing = 'new';
    },
    startEdit(i) {
      this.draft = Object.fromEntries(this.columns.map((c) => [fid(c.key), getPath(this.rows[i], c.key) === undefined ? null : getPath(this.rows[i], c.key)]));
      this.editing = i;
    },
    cancel() {
      this.editing = null;
    },
    commit(values) {
      const base = this.editing === 'new' ? {} : { ...this.rows[this.editing] };
      this.columns.forEach((c) => {
        let v = values[fid(c.key)];
        if ((TYPE[c.format] === 'number' || c.input === 'number') && v !== null && v !== '' && v !== undefined) v = Number(String(v).replace(/[^0-9.-]/g, ''));
        setPath(base, c.key, v);
      });
      const next = this.editing === 'new' ? [...this.rows, base] : this.rows.map((r, i) => (i === this.editing ? base : r));
      this.editing = null;
      this.$emit('input', next);
      this.$emit('blur');
    },
    remove(i) {
      this.$emit('input', this.rows.filter((_, j) => j !== i));
      this.$emit('blur');
    },
  },
};
</script>
