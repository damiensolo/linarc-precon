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
       columns: `input` text | number | date | select | textarea, `optional`), validated on Save; each row has Edit and
       Remove. The field emits `input` with the new rows and `blur`, like any FormV2 field, so the form's rules
       (required, minLength for minimums) and autosave see the change. Read-only: no actions. -->
  <!-- Configured rows (extension 2026-10-12, template builder): rows that ship with the table and are configured
       rather than entered. Column flags: `editOnly` (in the editor, not the table: help text, options), `readOnly`
       (in the table, not the editor: a derived value), `lockedFor(row)` (not editable for that row: a default
       field's name and type), `visibleIf` (FormV2 rule: options only for selects), `default` (value for a new row),
       `toInput` / `fromInput` (one option per line ⇄ array), options as { label, value }. Field props:
       `removable(row)` (Remove only for rows that may go), `rowTitle(row)` (editor title), `muted(row)` (a row that
       is switched off), `emptyText`. -->
  <!-- Reorder (extension 2026-10-12, user request): `props.reorderable(row)` rows carry a grip and can be dragged onto
       any row to take its place (native drag and drop; the row moves before or after the target by where it is
       dropped). Emits `input` with the new order and `blur`. -->
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
            <th v-if="hasReorder" scope="col" class="w-space-24 border-b border-border-subtle px-space-4 py-space-8"><span class="sr-only">Reorder</span></th>
            <th v-for="c in tableColumns" :key="c.key" scope="col" class="border-b border-border-subtle px-space-8 py-space-8 text-fontsize-12 font-bold uppercase leading-lineheight-16 tracking-letterspacing-4 text-text-subtle" :class="isNumeric(c) ? 'text-right' : 'text-left'">{{ c.label }}</th>
            <th v-if="editable" scope="col" class="border-b border-border-subtle px-space-8 py-space-8"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in rows"
            :key="rowKey(row, i)"
            :class="[{ 'bg-surface-container': editing === i || dragOver === i }, canDrag(row) && editing === null ? 'cursor-grab' : '']"
            :draggable="canDrag(row) && editing === null ? 'true' : null"
            @dragstart="onDragStart(i, $event)"
            @dragover="onDragOver(i, $event)"
            @dragleave="dragOver === i && (dragOver = null)"
            @drop="onDrop(i, $event)"
            @dragend="dragging = null; dragOver = null"
          >
            <td v-if="hasReorder" class="border-b border-border-subtle px-space-4 py-space-10 align-top text-text-soft">
              <span v-if="canDrag(row)" class="inline-flex" :aria-label="`Drag to reorder ${rowLabel(row)}`" role="img"><GripVertical :size="16" :stroke-width="2" aria-hidden="true" /></span>
            </td>
            <td v-for="c in tableColumns" :key="c.key" class="border-b border-border-subtle px-space-8 py-space-10 align-top" :class="[isNumeric(c) ? 'whitespace-nowrap text-right tabular-nums' : 'text-left', isMuted(row) ? 'text-text-soft' : 'text-text-default']">{{ cell(row, c) }}</td>
            <td v-if="editable" class="whitespace-nowrap border-b border-border-subtle px-space-8 py-space-4 text-right align-top">
              <span class="inline-flex gap-space-4">
                <Button native-type="button" :label="editLabel" color-scheme="primary" variant="text" size="small" :is-disabled="editing !== null" @onClick="startEdit(i)" />
                <Button v-if="canRemove(row)" native-type="button" label="Remove" color-scheme="secondary" variant="minimal" size="small" :is-disabled="editing !== null" @onClick="remove(i)" />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="editing === null" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-soft">{{ emptyText }}</p>

    <!-- Row editor: one container level (a hairline-boxed group), its own Save / Cancel. It opens and closes with a
         short fade and slide and scrolls into the middle of the view, so Add / Cancel are never below the fold
         (user request 2026-10-12); both respect prefers-reduced-motion. -->
    <transition name="repeat-editor">
    <div v-if="editing !== null" ref="editor" class="repeat-editor flex flex-col gap-space-12 rounded-radius-4 border border-border-subtle p-space-16">
      <span class="font-label text-fontsize-14 font-bold leading-lineheight-20 text-text-default">{{ editorTitle }}</span>
      <FormV2 ref="rowForm" v-model="draft" :schema="rowSchema" :flat="true" mode="manual" label-position="top" @submit="commit">
        <template #footer="{ submit }">
          <span class="flex flex-wrap gap-space-8 pt-space-4">
            <Button native-type="button" :label="editing === 'new' ? 'Add' : 'Save'" color-scheme="primary" variant="solid" size="small" @onClick="submit" />
            <Button native-type="button" label="Cancel" color-scheme="secondary" variant="minimal" size="small" @onClick="cancel" />
          </span>
        </template>
      </FormV2>
    </div>
    </transition>

    <div v-if="editable && editing === null && addLabel" class="flex flex-wrap items-center gap-space-12 pt-space-4">
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
import { GripVertical } from '@development/linarc-icons';
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
const asOption = (o) => (typeof o === 'object' ? o : { label: o, value: o });

export default {
  name: 'RepeatField',
  components: { Button, FormV2, GripVertical },
  props: { ...baseFieldProps },
  data() {
    return { editing: null, draft: {}, locked: [], dragging: null, dragOver: null };
  },
  computed: {
    p() {
      return this.field.props || {};
    },
    rows() {
      return Array.isArray(this.value) ? this.value : [];
    },
    columns() {
      if (this.p.columns) return this.p.columns;
      const first = this.rows[0] || {};
      return Object.keys(first).map((key) => ({ key, label: key }));
    },
    tableColumns() {
      return this.columns.filter((c) => !c.editOnly);
    },
    editable() {
      return !this.readOnly && !this.disabled;
    },
    hasReorder() {
      return this.editable && !!this.p.reorderable && this.rows.some((r) => this.p.reorderable(r));
    },
    minimum() {
      return this.p.minimum || 0;
    },
    addLabel() {
      return this.p.addLabel === undefined ? 'Add' : this.p.addLabel;
    },
    editLabel() {
      return this.p.editLabel || 'Edit';
    },
    emptyText() {
      return this.p.emptyText || 'None added yet.';
    },
    singular() {
      return (this.addLabel || '').replace(/^Add (a |an )?/i, '').toLowerCase() || 'row';
    },
    title() {
      return this.p.title || '';
    },
    isRequired() {
      return Boolean(this.required || this.p.required);
    },
    editorTitle() {
      if (this.editing === 'new') return this.addLabel;
      const row = this.rows[this.editing];
      return this.p.rowTitle ? this.p.rowTitle(row) : `${this.editLabel} ${this.singular}`;
    },
    /** One field per editable column; `input` and `options` override the type the column's format implies. */
    rowSchema() {
      const fields = this.columns
        .filter((c) => !c.readOnly && !this.locked.includes(c.key))
        .map((c) => {
          const type = c.input || TYPE[c.format] || 'text';
          const f = { id: fid(c.key), label: c.label.charAt(0) + c.label.slice(1).toLowerCase(), type, colSpan: c.wide || type === 'textarea' ? 'full' : 1 };
          if (type === 'select' || type === 'multiselect') f.options = (c.options || []).map(asOption);
          // A checkbox column: the column label is the checkbox's own label (no field label above it).
          if (type === 'checkbox') { f.label = ''; f.colSpan = 'full'; f.props = { checkboxLabel: c.label }; }
          if (type === 'textarea') f.props = { rows: c.rows || 3 };
          if (type === 'number') f.props = { width: 'short' };
          if (!c.optional) f.rules = [{ type: 'required' }];
          if (c.help) f.help = c.help;
          else if (c.format === 'percent') f.help = 'Percent, 0–100';
          if (c.visibleIf) f.visibleIf = c.visibleIf;
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
    isMuted(row) {
      return Boolean(this.p.muted && this.p.muted(row));
    },
    canRemove(row) {
      return this.p.removable ? this.p.removable(row) : true;
    },
    canDrag(row) {
      return Boolean(this.hasReorder && this.p.reorderable(row));
    },
    rowKey(row, i) {
      return row && row.id !== undefined ? `${row.id}` : i;
    },
    rowLabel(row) {
      return (this.p.rowTitle && this.p.rowTitle(row)) || this.cell(row, this.tableColumns[0]);
    },
    cell(row, c) {
      return formatCell(row, c, this.$moment);
    },
    toInput(c, v) {
      return c.toInput ? c.toInput(v) : v;
    },
    startAdd() {
      this.locked = [];
      this.draft = Object.fromEntries(this.columns.map((c) => [fid(c.key), c.default === undefined ? null : this.toInput(c, c.default)]));
      this.editing = 'new';
      this.revealEditor();
    },
    /** Centre the editor in the scroll view once it exists (smooth unless motion is reduced). */
    revealEditor() {
      this.$nextTick(() => {
        const el = this.$refs.editor;
        if (!el || typeof el.scrollIntoView !== 'function') return;
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      });
    },
    startEdit(i) {
      const row = this.rows[i];
      this.locked = this.columns.filter((c) => c.lockedFor && c.lockedFor(row)).map((c) => c.key);
      this.draft = Object.fromEntries(this.columns.map((c) => {
        const v = getPath(row, c.key);
        return [fid(c.key), v === undefined ? null : this.toInput(c, v)];
      }));
      this.editing = i;
      this.revealEditor();
    },
    cancel() {
      this.editing = null;
    },
    commit(values) {
      // `props.newRow()` seeds what a new row carries beyond its columns (an id, `custom: true`).
      const base = this.editing === 'new' ? (this.p.newRow ? this.p.newRow() : {}) : { ...this.rows[this.editing] };
      this.columns.forEach((c) => {
        if (c.readOnly || this.locked.includes(c.key)) return;
        let v = values[fid(c.key)];
        if ((TYPE[c.format] === 'number' || c.input === 'number') && v !== null && v !== '' && v !== undefined) v = Number(String(v).replace(/[^0-9.-]/g, ''));
        if (c.fromInput) v = c.fromInput(v);
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
    onDragStart(i, e) {
      if (!this.canDrag(this.rows[i]) || this.editing !== null) { e.preventDefault(); return; }
      this.dragging = i;
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', String(i)); } catch (err) { /* some browsers need no data */ }
    },
    onDragOver(i, e) {
      if (this.dragging === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.dragOver = i;
    },
    onDrop(i, e) {
      if (this.dragging === null) return;
      e.preventDefault();
      const from = this.dragging;
      const rect = e.currentTarget.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      this.dragging = null;
      this.dragOver = null;
      this.move(from, i, after);
    },
    /** Move row `from` before (or after) row `to`. */
    move(from, to, after) {
      if (from === to) return;
      const next = [...this.rows];
      const [row] = next.splice(from, 1);
      let at = to + (after ? 1 : 0);
      if (from < at) at -= 1;
      next.splice(at, 0, row);
      this.$emit('input', next);
      this.$emit('blur');
    },
  },
};
</script>

<style scoped>
/* Open / close: a short fade and slide (opacity and transform only, D-24 timings: 160ms). */
.repeat-editor-enter-active,
.repeat-editor-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}
.repeat-editor-enter,
.repeat-editor-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .repeat-editor-enter-active,
  .repeat-editor-leave-active {
    transition: none;
  }
}
</style>
