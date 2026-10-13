<template>
  <!-- Step 1: name, the Linarc baseline it starts from (with why), the work it applies to, validity (PRD UX
       l. 843–861). The baseline can be changed only on a new template: it rebuilds every other step. -->
  <div class="flex flex-col gap-space-32">
    <FormV2 :value="values" :schema="schema" :flat="true" mode="manual" label-position="top" @input="onInput">
      <template #footer><span /></template>
    </FormV2>
    <section class="flex flex-col gap-space-8">
      <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ isNew ? 'Why this baseline' : 'Started from' }}</h3>
      <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle"><strong class="text-text-default">{{ baseline.label }}.</strong> {{ baseline.why }}</p>
      <p v-if="!isNew" class="m-0 font-label text-fontsize-12 leading-lineheight-16 text-text-soft">The baseline is fixed once a template exists; duplicate it to start from another one.</p>
      <p class="m-0 font-label text-fontsize-12 leading-lineheight-16 text-text-soft">CSI divisions from the trades: {{ csi }}</p>
    </section>
  </div>
</template>

<script>
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import { TRADES, SIZE_BANDS } from '~/modules/prequal/data/wizard';
import { BASELINES, baselineById, PROJECT_TYPES } from '~/modules/prequal/data/templateCatalog';
import { csiOf } from '~/modules/prequal/data/templates';
import targetFocus from './targetFocus';

const opts = (list) => list.map((v) => ({ label: v, value: v }));

export default {
  name: 'StepBasics',
  mixins: [targetFocus],
  components: { FormV2 },
  props: { def: { type: Object, required: true }, isNew: { type: Boolean, default: false } },
  computed: {
    values() {
      const d = this.def;
      return { name: d.name, baseline: d.baseline, trades: d.trades, sizeBands: d.sizeBands, projectTypes: d.projectTypes, validityMonths: d.validityMonths };
    },
    csi() {
      return csiOf(this.def.trades).join(', ') || '—';
    },
    baseline() {
      return baselineById[this.def.baseline] || BASELINES[0];
    },
    schema() {
      return {
        sections: [{
          id: 'basics',
          layout: { columns: 2, gap: '24px' },
          fields: [
            { id: 'name', type: 'text', label: 'Template name', colSpan: 'full', help: 'As it appears to estimators when they start a request, e.g. “Electrical — Medium Projects”.', rules: [{ type: 'required' }] },
            // The baseline is chosen first on a new template (PRD UX l. 861) and fixed afterwards (shown below).
            ...(this.isNew ? [{ id: 'baseline', type: 'radio', label: 'Linarc baseline', colSpan: 'full', options: BASELINES.map((b) => ({ label: b.label, value: b.id })), props: { inline: true } }] : []),
            { id: 'trades', type: 'multiselect', label: 'Trade groups', options: opts(TRADES), help: 'A request matches this template on its trades.', rules: [{ type: 'required' }] },
            { id: 'sizeBands', type: 'multiselect', label: 'Project size', options: opts(SIZE_BANDS), help: 'Leave empty to match any size.' },
            { id: 'validityMonths', type: 'number', label: 'Default validity (months)', props: { width: 'short' }, help: 'From approval; an earlier document expiry shortens it.', rules: [{ type: 'required' }] },
            { id: 'projectTypes', type: 'checkbox-group', label: 'Project types', colSpan: 'full', options: PROJECT_TYPES.map((p) => ({ label: p.label, value: p.value })), help: 'Site security adds that section to every request on this template.' },
          ],
        }],
      };
    },
  },
  methods: {
    onInput(v) {
      if (v.baseline !== this.def.baseline && this.isNew) {
        this.$emit('baseline', v.baseline);
        return;
      }
      const patch = { name: v.name, trades: v.trades || [], csi: csiOf(v.trades || []), sizeBands: v.sizeBands || [], projectTypes: v.projectTypes || [], validityMonths: v.validityMonths === '' || v.validityMonths === null ? null : Number(v.validityMonths) };
      const changed = Object.keys(patch).some((k) => JSON.stringify(patch[k]) !== JSON.stringify(this.def[k]));
      if (changed) this.$emit('input', patch);
    },
  },
};
</script>
