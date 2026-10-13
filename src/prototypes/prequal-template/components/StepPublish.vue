<template>
  <!-- Step 6: before publishing (PRD UX l. 997–1007): what's missing, who is affected, the example subcontractor
       checklist, an example reviewer result from these weights and bands, the billing acknowledgement when paid checks
       are selected, the version history. Publish is in the footer; it stays disabled while something blocks. -->
  <div class="flex flex-col gap-space-40">
    <!-- Missing configuration: one notice each, what blocks publishing first. Warning tone for all of them (red is
         for knockout / expired / rejected, D-17); the disabled Publish button says what blocks. -->
    <section v-if="warnings.length" class="flex flex-col gap-space-8">
      <InlineNotice v-for="w in warnings" :key="w.id" tone="warning" :message="`${w.blocking ? 'Before publishing: ' : ''}${w.text}`">
        <template #actions>
          <Button :label="`Go to ${stepLabel(w.step)}`" color-scheme="primary" variant="text" size="small" @onClick="$emit('go', w.step)" />
        </template>
      </InlineNotice>
    </section>
    <p v-else class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">Nothing is missing. Publishing makes this version the one new requests use.</p>

    <section class="flex flex-col gap-space-12">
      <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Who is affected</h3>
      <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-default">{{ affectedText }}</p>
      <dl class="m-0 grid grid-cols-2 gap-x-space-24 gap-y-space-12 font-label text-fontsize-14 leading-lineheight-20 sm:grid-cols-4">
        <div v-for="d in facts" :key="d.label" class="flex flex-col gap-space-2">
          <dt class="text-fontsize-12 leading-lineheight-16 text-text-soft">{{ d.label }}</dt>
          <dd class="m-0 text-text-default">{{ d.value }}</dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-space-12">
      <div class="flex flex-col gap-space-2">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">What the subcontractor will be asked for</h3>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">As the request wizard and the portal show it.</p>
      </div>
      <div v-for="group in checklist" :key="group.pillar" class="flex flex-col">
        <span class="pb-space-4 font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ group.pillar }}</span>
        <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
          <li v-for="item in group.items" :key="item.label" class="flex flex-col gap-space-2 py-space-8 font-label sm:flex-row sm:gap-space-16">
            <span class="shrink-0 text-fontsize-14 leading-lineheight-20 text-text-default sm:basis-1/3">{{ item.label }}<span v-if="item.optional" class="text-text-soft"> · optional</span></span>
            <span class="text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ item.detail }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="flex flex-col gap-space-12">
      <div class="flex flex-col gap-space-2">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Example reviewer result</h3>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">A sample submission scored with these weights and bands: {{ sampleText }}.</p>
      </div>
      <p class="m-0 font-label text-fontsize-14 font-bold leading-lineheight-20 text-text-default">{{ stamp }}</p>
    </section>

    <section v-if="paidChecks.length" class="flex flex-col gap-space-8">
      <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Billing</h3>
      <Checkbox :value="def.billingAcknowledged" :label="billingText" size="small" @input="$emit('input', { billingAcknowledged: $event })" />
    </section>

    <section v-if="record && record.versions && record.versions.length" class="flex flex-col gap-space-8">
      <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Versions</h3>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="v in [...record.versions].reverse()" :key="v.version" class="flex flex-col gap-space-2 py-space-8 font-label text-fontsize-14 leading-lineheight-20 sm:flex-row sm:gap-space-16">
          <span class="shrink-0 text-text-default sm:basis-1/3">v{{ v.version }} · {{ $moment(v.on).format('D MMM YYYY') }}</span>
          <span class="text-text-subtle">{{ v.note }} · {{ v.by }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import { CHECKS } from '~/modules/prequal/data/wizard';
import { summaryOf, checklistOf } from '~/modules/prequal/data/templates';
import { WEIGHT_SECTIONS, weightLabel } from '~/modules/prequal/data/templateCatalog';
import { STEPS } from '../builderState';

// A sample subcontractor's section scores, fixed, so the stamp line shows what the weights and bands do.
const SAMPLE = { safety: 82, financial: 70, experience: 88, capacity: 65, insurance: 90, legal: 100 };
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default {
  name: 'StepPublish',
  components: { Button, Checkbox, InlineNotice },
  props: {
    def: { type: Object, required: true },
    record: { type: Object, default: null },
    version: { type: Number, required: true },
    usage: { type: Object, required: true },
    warnings: { type: Array, default: () => [] },
  },
  computed: {
    summary() {
      return summaryOf(this.def);
    },
    affectedText() {
      const name = this.def.name || 'This template';
      if (!this.record || !this.record.published) return `${name} becomes active at v1. New requests whose trades and project size match it will use it; nothing uses it yet.`;
      const n = this.usage.active;
      return `v${this.version} replaces v${this.record.version} for new requests. ${n ? `${n} active ${n === 1 ? 'request keeps' : 'requests keep'} v${this.record.version} as sent.` : 'No active request is affected.'}${this.record.status === 'archived' ? ' The template is archived; publishing restores it.' : ''}`;
    },
    facts() {
      const s = this.summary;
      return [
        { label: 'Sections', value: `${s.sectionsRequired} required · ${s.sectionsOn - s.sectionsRequired} optional` },
        { label: 'Fields', value: `${s.fieldsOn}${s.customFields ? ` · ${s.customFields} custom` : ''}` },
        { label: 'Documents', value: `${s.documentsRequired} required · ${s.documentsOptional} optional` },
        { label: 'Checks', value: `${s.checks}${s.paidChecks ? ` · ${s.paidChecks} paid` : ''}` },
        { label: 'Knockout rules', value: String(s.knockouts) },
        { label: 'Weights', value: `${s.weightTotal}%` },
        { label: 'Bands', value: `${this.def.bands.accept} / ${this.def.bands.review}` },
        { label: 'Valid for', value: `${this.def.validityMonths || '—'} months` },
      ];
    },
    /** The template's sections by portal pillar (shared with the wizard's step 3). */
    checklist() {
      return checklistOf(this.def);
    },
    sampleScore() {
      const total = Object.values(this.def.weights).reduce((a, b) => a + (Number(b) || 0), 0) || 100;
      return Math.round(WEIGHT_SECTIONS.reduce((n, w) => n + (Number(this.def.weights[w.id]) || 0) * SAMPLE[w.id], 0) / total);
    },
    sampleText() {
      return WEIGHT_SECTIONS.map((w) => `${weightLabel(w.id)} ${SAMPLE[w.id]}`).join(', ');
    },
    stamp() {
      const s = this.sampleScore;
      const band = s >= this.def.bands.accept ? 'RECOMMENDED: ACCEPT' : s >= this.def.bands.review ? 'RECOMMENDED: REVIEW' : 'NOT RECOMMENDED';
      return `${band} · Score ${s} · Confidence 71% · Knockouts 0`;
    },
    paidChecks() {
      return CHECKS.filter((k) => k.cost && this.def.checks.includes(k.id));
    },
    billingText() {
      return `I acknowledge that ${this.paidChecks.map((k) => `${k.label} (${usd.format(k.cost)})`).join(' and ')} ${this.paidChecks.length === 1 ? 'is' : 'are'} billed per request on this template.`;
    },
  },
  methods: {
    stepLabel(id) {
      return (STEPS.find((s) => s.id === id) || { label: id }).label;
    },
  },
};
</script>
