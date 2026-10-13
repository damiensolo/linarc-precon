<template>
  <!-- Step 2: what the subcontractor is asked for, section by section in the portal's order (PRD UX l. 863–906).
       Each section: heading, whether it is asked (Required / Optional / Not asked, a select), then the requirements
       matrix (Requirement · Type · Required · Evidence · Threshold · Score impact · Minimum · Group) as an editable
       table: default fields are configured (switched off, not removed; name and type locked), custom fields are added
       with the row editor (label, type, required, evidence, score impact, help, options; the section they sit in; and,
       progressively, the group they belong to) and can be removed. The Documents block at the end lists the document
       types the same way, plus custom documents. Thresholds are set on step 3 and shown here. RepeatField (candidate,
       extended 2026-10-12) is the table and the editor.
       Custom sections and groups (user request 2026-10-12, revised the same day): Add custom section makes a section
       of the admin's own (title, nav group it sits under). A group is made from inside the custom field editor: "Put
       this field in a group" reveals a Group select (the section's groups, or New group), and a chosen or new group
       reveals its title and whether it has a container. Groups with no fields left are dropped. Custom fields can be
       dragged to reorder (RepeatField `reorderable`) and moved to another section from the editor. A Show filter at the
       top (All by default) narrows every table to Required, Optional, Not requested or Custom rows; it changes nothing. -->
  <div class="flex flex-col gap-space-40">
    <div class="flex flex-col gap-space-12">
      <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
        Sections appear to the subcontractor in this order. A field switched off is not asked; a custom field is asked and shown to the reviewer like any other. Drag a custom field to move it; Configure moves it to another section or into a group.
      </p>
      <div class="flex flex-wrap items-center gap-space-12">
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">Show</span>
        <SegmentedControl :value="filter" :options="FILTERS" aria-label="Show fields" size="md" @input="filter = $event" />
        <span v-if="filter !== 'all'" class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ shownCount }} of {{ totalCount }} fields</span>
      </div>
    </div>

    <section v-for="s in def.sections" :key="s.id" class="flex flex-col gap-space-12">
      <div class="flex flex-wrap items-start justify-between gap-space-8">
        <div class="flex min-w-0 flex-1 flex-col gap-space-4">
          <template v-if="s.custom">
            <div class="flex flex-wrap items-start gap-space-12">
              <InputV2 class="w-full sm:w-space-124 sm:min-w-fit sm:flex-1" size="small" placeholder="Section title" :value="s.label" aria-label="Section title" @input="setSection(s, { label: $event })" />
              <SelectV2 class="w-full sm:w-space-124 sm:min-w-fit" size="small" label="" :options="PILLAR_OPTIONS" :value="s.pillar || 'closing'" :allow-search="false" @input="setSection(s, { pillar: $event })" />
            </div>
            <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">Custom section · {{ countText(s) }} · shown under {{ pillarLabel(s.pillar) }}</span>
          </template>
          <template v-else>
            <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ s.label }}</h3>
            <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ countText(s) }}</span>
          </template>
        </div>
        <div class="flex items-center gap-space-8">
          <SelectV2 class="w-space-124 min-w-fit" size="small" label="" :options="SECTION_PICK" :value="s.mode" :allow-search="false" :aria-label="`${s.label}: requested?`" @input="setSection(s, { mode: $event })" />
          <Button v-if="s.custom" label="Remove section" color-scheme="secondary" variant="minimal" size="small" :is-disabled="s.fields.length > 0" @onClick="removeSection(s)" />
        </div>
      </div>

      <RepeatField v-if="s.mode !== 'off'" :field="fieldFor(s)" :value="visibleFields(s)" @input="setFields(s, $event)" />
      <p v-else class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-soft">Not asked on this template.</p>
    </section>

    <div class="flex flex-wrap items-center gap-space-12">
      <Button label="Add custom section" color-scheme="secondary" variant="outline" size="small" @onClick="addSection" />
      <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">A section of your own, with its title and the navigation group it sits under.</span>
    </div>

    <section class="flex flex-col gap-space-12 border-t border-border-subtle pt-space-24">
      <div class="flex min-w-0 flex-col">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Documents</h3>
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ documentsText }} · Each required document gets its own upload slot, shown under the field it evidences where there is one.</span>
      </div>
      <RepeatField :field="documentsField" :value="visibleDocuments" @input="setDocuments" />
    </section>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import InputV2 from '@/componentsV2/InputV2/InputV2.vue';
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import RepeatField from '~/candidates/FormTableFields/RepeatField.vue';
import { FIELD_MODES, FIELD_TYPES, WEIGHT_SECTIONS, weightLabel, thresholdText, fieldTypeLabel, EXPIRY_OPTIONS, DOCUMENT_CATALOG } from '~/modules/prequal/data/templateCatalog';
import { PILLAR_OPTIONS, newCustomSection } from '~/modules/prequal/data/templates';

const modeLabel = (v) => (FIELD_MODES.find((m) => m.value === v) || { label: v }).label;
const lines = (v) => (Array.isArray(v) ? v.join('\n') : v || '');
const unlines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const SCORE_OPTIONS = [...WEIGHT_SECTIONS.map((w) => ({ label: w.label, value: w.id })), { label: 'Review only', value: 'review' }];
const GROUPS = [...new Set(DOCUMENT_CATALOG.map((d) => d.group)), 'Custom'];
const FILTERS = [{ label: 'All', value: 'all' }, { label: 'Required', value: 'required' }, { label: 'Optional', value: 'optional' }, { label: 'Not requested', value: 'off' }, { label: 'Custom', value: 'custom' }];
// The section's own control: short labels so the select fits beside the heading.
const SECTION_PICK = [{ label: 'Required', value: 'required' }, { label: 'Optional', value: 'optional' }, { label: 'Not asked', value: 'off' }];
// Editor-only keys (stripped on commit): the section to move to, and the group's switch, title and container.
const MOVE = '__section';
const GROUPED = '__grouped';
const GTITLE = '__groupTitle';
const GBOXED = '__groupBoxed';
const NEW_GROUP = 'new';
const matches = (filter, row) => filter === 'all' || (filter === 'custom' ? !!row.custom : row.mode === filter);
const stripEditorKeys = (f) => { const { [MOVE]: a, [GROUPED]: b, [GTITLE]: c, [GBOXED]: d, ...rest } = f; return rest; };

export default {
  name: 'StepRequirements',
  components: { Button, InputV2, SelectV2, SegmentedControl, RepeatField },
  props: { def: { type: Object, required: true } },
  data() {
    return { SECTION_PICK, PILLAR_OPTIONS, FILTERS, filter: 'all' };
  },
  computed: {
    documentsText() {
      const req = this.def.documents.filter((d) => d.mode === 'required').length;
      const opt = this.def.documents.filter((d) => d.mode === 'optional').length;
      return `${req} required · ${opt} optional`;
    },
    totalCount() {
      return this.def.sections.reduce((n, s) => n + s.fields.length, 0);
    },
    shownCount() {
      return this.def.sections.reduce((n, s) => n + s.fields.filter((f) => matches(this.filter, f)).length, 0);
    },
    visibleDocuments() {
      return this.def.documents.filter((d) => matches(this.filter, d));
    },
    evidenceOptions() {
      return [{ label: 'None', value: '' }, ...this.def.documents.filter((d) => d.mode !== 'off').map((d) => ({ label: d.label, value: d.id }))];
    },
    sectionOptions() {
      return this.def.sections.filter((s) => s.mode !== 'off').map((s) => ({ label: s.label || 'Untitled section', value: s.id }));
    },
    thresholdById() {
      return Object.fromEntries(this.def.thresholds.map((t) => [t.id, t]));
    },
    documentsField() {
      const locked = (row) => !row.custom;
      return {
        id: 'documents',
        props: {
          columns: [
            { key: 'label', label: 'Document', lockedFor: locked, wide: true },
            { key: 'group', label: 'Group', input: 'select', options: GROUPS, lockedFor: locked, default: 'Custom' },
            { key: 'mode', label: 'Required', input: 'select', options: FIELD_MODES, default: 'required', display: (v) => modeLabel(v) },
            { key: 'requirements', label: 'What’s required', input: 'textarea', optional: true, rows: 3, format: 'list', help: 'One line per requirement; the subcontractor sees them before uploading.', toInput: lines, fromInput: unlines },
            { key: 'expiry', label: 'Expires', input: 'select', options: EXPIRY_OPTIONS, lockedFor: locked, default: 'None' },
          ],
          addLabel: 'Add custom document',
          editLabel: 'Configure',
          removable: (row) => Boolean(row.custom),
          rowTitle: (row) => row.label,
          muted: (row) => row.mode === 'off',
          newRow: () => ({ id: uid('custom-doc'), custom: true, count: null }),
          emptyText: 'No documents match the filter.',
        },
      };
    },
  },
  methods: {
    pillarLabel(v) {
      return (PILLAR_OPTIONS.find((p) => p.value === (v || 'closing')) || PILLAR_OPTIONS[0]).label;
    },
    countText(s) {
      const on = s.fields.filter((f) => f.mode !== 'off').length;
      const custom = s.fields.filter((f) => f.custom && f.mode !== 'off').length;
      const groups = (s.groups || []).length;
      return `${on} of ${s.fields.length} fields asked${custom ? ` · ${custom} custom` : ''}${groups ? ` · ${groups} ${groups === 1 ? 'group' : 'groups'}` : ''}`;
    },
    groupOptions(s) {
      return [...(s.groups || []).map((g) => ({ label: g.label || 'Untitled group', value: g.id })), { label: 'New group…', value: NEW_GROUP }];
    },
    groupLabel(s, id) {
      const g = (s.groups || []).find((x) => x.id === id);
      return g ? g.label || 'Untitled group' : '—';
    },
    columns(s) {
      const locked = (row) => !row.custom;
      const grouped = { field: GROUPED, op: 'truthy' };
      const chosen = { and: [grouped, { field: 'group', op: 'neq', value: '' }, { field: 'group', op: 'neq', value: null }] };
      return [
        { key: 'label', label: 'Requirement', lockedFor: locked, wide: true },
        { key: 'type', label: 'Type', input: 'select', options: FIELD_TYPES, lockedFor: locked, default: 'text', display: (v) => fieldTypeLabel(v) },
        { key: 'mode', label: 'Required', input: 'select', options: FIELD_MODES, default: 'required', display: (v) => modeLabel(v) },
        { key: 'evidence', label: 'Evidence', input: 'select', options: this.evidenceOptions, optional: true, toInput: (v) => v || '', fromInput: (v) => v || null, display: (v) => (v ? (this.def.documents.find((d) => d.id === v) || { label: v }).label : '—') },
        { key: 'threshold', label: 'Threshold', readOnly: true, display: (v) => (v && this.thresholdById[v] ? thresholdText(this.thresholdById[v]) : '—') },
        { key: 'score', label: 'Score impact', input: 'select', options: SCORE_OPTIONS, default: 'review', display: (v) => weightLabel(v) },
        { key: 'minimum', label: 'Minimum', input: 'number', optional: true, visibleIf: { field: 'type', op: 'in', value: ['repeat', 'matrix'] }, help: 'Rows the subcontractor must enter (projects, references, years).', display: (v, row) => (v ? `${v} ${row.unit || ''}`.trim() : '—') },
        { key: MOVE, label: 'Section', input: 'select', options: this.sectionOptions, editOnly: true, optional: true, default: s.id, lockedFor: locked, toInput: () => s.id, help: 'Move this field to another section.' },
        // Grouping, progressively: the switch, then the group, then its title and container.
        { key: GROUPED, label: 'Put this field in a group (a titled block inside the section)', input: 'checkbox', editOnly: true, optional: true, default: false, lockedFor: locked, toInput: (v) => !!v },
        { key: 'group', label: 'Group', input: 'select', options: this.groupOptions(s), optional: true, lockedFor: locked, visibleIf: grouped, default: '', toInput: (v) => v || '', display: (v) => this.groupLabel(s, v), help: (s.groups || []).length ? 'An existing group, or a new one.' : 'This section has no groups yet; New group makes one.' },
        { key: GTITLE, label: 'Group title', editOnly: true, optional: true, lockedFor: locked, visibleIf: chosen, help: 'The heading the subcontractor sees above the group’s fields.' },
        { key: GBOXED, label: 'Container', input: 'select', options: [{ label: 'Heading only', value: 'no' }, { label: 'With a container', value: 'yes' }], editOnly: true, optional: true, default: 'no', lockedFor: locked, visibleIf: chosen, help: 'A hairline box around the group’s fields.' },
        { key: 'help', label: 'Help text', input: 'textarea', optional: true, editOnly: true, rows: 2, help: 'Shown under the field in the portal.' },
        { key: 'options', label: 'Options', input: 'textarea', optional: true, editOnly: true, rows: 4, visibleIf: { field: 'type', op: 'in', value: ['select', 'multiselect'] }, help: 'One option per line.', toInput: lines, fromInput: unlines },
      ];
    },
    fieldFor(s) {
      return {
        id: `fields-${s.id}`,
        props: {
          columns: this.columns(s),
          addLabel: 'Add custom field',
          editLabel: 'Configure',
          removable: (row) => Boolean(row.custom),
          reorderable: (row) => Boolean(row.custom),
          rowTitle: (row) => row.label,
          muted: (row) => row.mode === 'off',
          newRow: () => ({ id: uid('custom'), custom: true, threshold: null, unit: null }),
          emptyText: this.filter === 'all' ? 'No fields. Add a custom field, or switch the section off.' : 'No fields match the filter.',
        },
      };
    },
    /** The table's rows: the filtered fields, with the editor-only values a grouped field opens with. */
    visibleFields(s) {
      return s.fields.filter((f) => matches(this.filter, f)).map((f) => {
        if (!f.custom) return f;
        const g = f.group ? (s.groups || []).find((x) => x.id === f.group) : null;
        return { ...f, [GROUPED]: !!f.group, [GTITLE]: g ? g.label : '', [GBOXED]: g && g.boxed ? 'yes' : 'no' };
      });
    },
    replaceSection(section, patch) {
      this.$emit('input', { sections: this.def.sections.map((s) => (s.id === section.id ? { ...s, ...patch } : s)) });
    },
    setSection(s, patch) {
      this.replaceSection(s, patch);
    },
    /**
     * The table's edits back into the section: the editor-only values make or update a group (a new group from
     * "New group…", title and container from the editor), fields whose Section changed move, groups with no fields
     * left go, and with a filter on the visible rows are merged into the full list.
     */
    setFields(s, rows) {
      let groups = [...(s.groups || [])];
      const prepared = rows.map((r) => {
        if (!r.custom) return r;
        let group = r.group || null;
        if (r[GROUPED] && group === NEW_GROUP) {
          const g = { id: uid('group'), label: (r[GTITLE] || '').trim() || 'Untitled group', boxed: r[GBOXED] === 'yes' };
          groups.push(g);
          group = g.id;
        } else if (r[GROUPED] && group) {
          groups = groups.map((g) => (g.id === group ? { ...g, label: (r[GTITLE] || '').trim() || g.label, boxed: r[GBOXED] === undefined ? g.boxed : r[GBOXED] === 'yes' } : g));
        } else if (!r[GROUPED]) group = null;
        return { ...stripEditorKeys(r), group, [MOVE]: r[MOVE] };
      });
      let merged = this.filter === 'all' ? prepared : this.mergeFiltered(s.fields, prepared);
      const moving = merged.filter((f) => f[MOVE] && f[MOVE] !== s.id);
      merged = merged.filter((f) => !moving.includes(f)).map((f) => stripEditorKeys(f));
      groups = groups.filter((g) => merged.some((f) => f.group === g.id));
      const sections = this.def.sections.map((x) => {
        if (x.id === s.id) return { ...x, fields: merged, groups };
        const incoming = moving.filter((f) => f[MOVE] === x.id).map((f) => ({ ...stripEditorKeys(f), group: null }));
        return incoming.length ? { ...x, fields: [...x.fields, ...incoming] } : x;
      });
      this.$emit('input', { sections });
    },
    /** With a filter on, the table holds a subset: edited / reordered visible rows replace the visible ones in place,
     *  new rows append, removed ones go. */
    mergeFiltered(all, rows) {
      const visibleIds = new Set(all.filter((f) => matches(this.filter, f)).map((f) => f.id));
      const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
      const kept = rows.filter((r) => visibleIds.has(r.id));
      const added = rows.filter((r) => !visibleIds.has(r.id));
      let k = 0;
      const out = [];
      for (const f of all) {
        if (!visibleIds.has(f.id)) { out.push(f); continue; }
        if (byId[f.id] === undefined) continue; // removed
        out.push(kept[k++] || byId[f.id]);
      }
      return [...out, ...added];
    },
    setDocuments(rows) {
      const documents = this.filter === 'all' ? rows : this.mergeFiltered(this.def.documents, rows);
      this.$emit('input', { documents });
    },
    addSection() {
      this.$emit('input', { sections: [...this.def.sections, newCustomSection()] });
    },
    removeSection(s) {
      if (s.fields.length) return;
      this.$emit('input', { sections: this.def.sections.filter((x) => x.id !== s.id) });
    },
  },
};
</script>
