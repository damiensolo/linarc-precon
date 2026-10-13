<template>
  <!-- Step 5: an editable weight table with the total always shown, the recommendation bands, and the knockout rules
       as a dedicated list (PRD UX l. 958–995). MatrixField (candidate, `total` extension 2026-10-12) is the table. -->
  <div class="flex flex-col gap-space-40">
    <section class="flex flex-col gap-space-4">
      <MatrixField :field="weightsField" :value="weightRows" @input="setWeights" />
      <p class="m-0 font-label text-fontsize-12 leading-lineheight-16 text-text-soft">Score = Σ section score × weight. Confidence is the weighted share of criteria at Evidenced or Verified level and is not configured here.</p>
    </section>

    <section class="flex flex-col gap-space-12">
      <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Recommendation bands</h3>
      <FormV2 :value="bands" :schema="bandsSchema" :flat="true" mode="manual" label-position="top" @input="setBands">
        <template #footer><span /></template>
      </FormV2>
      <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">Accept {{ def.bands.accept }}+ · Review {{ def.bands.review }}–{{ def.bands.accept - 1 }} · Not recommended below {{ def.bands.review }}</p>
    </section>

    <section class="flex flex-col gap-space-12">
      <div class="flex flex-col gap-space-2">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Knockout rules</h3>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">Any confirmed knockout sets the recommendation to Not recommended regardless of score. A fuzzy match never knocks out on its own; the reviewer sees it side by side.</p>
      </div>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="k in KNOCKOUT_RULES" :key="k.id" class="py-space-8">
          <Checkbox :value="def.knockouts.includes(k.id)" :label="k.label" size="small" @input="toggle(k.id, $event)" />
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import MatrixField from '~/candidates/FormTableFields/MatrixField.vue';
import { WEIGHT_SECTIONS, KNOCKOUT_RULES } from '~/modules/prequal/data/templateCatalog';

export default {
  name: 'StepScoring',
  components: { Checkbox, FormV2, MatrixField },
  props: { def: { type: Object, required: true } },
  data() {
    return {
      KNOCKOUT_RULES,
      weightsField: {
        id: 'weights',
        props: {
          title: 'Section weights',
          columns: [{ key: 'section', label: 'Section' }, { key: 'weight', label: 'Weight %' }, { key: 'default', label: 'Linarc default', readOnly: true, format: 'percent' }],
          total: { label: 'Total', target: 100, suffix: '%' },
        },
      },
      bandsSchema: {
        sections: [{
          id: 'bands',
          layout: { columns: 2, gap: '24px' },
          fields: [
            { id: 'accept', type: 'number', label: 'Accept from', props: { width: 'short' }, help: 'Score at or above', rules: [{ type: 'required' }] },
            { id: 'review', type: 'number', label: 'Review from', props: { width: 'short' }, help: 'Below this: Not recommended', rules: [{ type: 'required' }] },
          ],
        }],
      },
    };
  },
  computed: {
    weightRows() {
      return WEIGHT_SECTIONS.map((w) => ({ id: w.id, section: w.label, weight: this.def.weights[w.id], default: w.default }));
    },
    bands() {
      return { ...this.def.bands };
    },
  },
  methods: {
    setWeights(rows) {
      this.$emit('input', { weights: Object.fromEntries(rows.map((r) => [r.id, r.weight === null ? 0 : r.weight])) });
    },
    setBands(v) {
      const bands = { accept: Number(v.accept) || 0, review: Number(v.review) || 0 };
      if (bands.accept !== this.def.bands.accept || bands.review !== this.def.bands.review) this.$emit('input', { bands });
    },
    toggle(id, on) {
      const knockouts = on ? [...new Set([...this.def.knockouts, id])] : this.def.knockouts.filter((x) => x !== id);
      this.$emit('input', { knockouts });
    },
  },
};
</script>
