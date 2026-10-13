<template>
  <!-- Step 3: what the subcontractor will be asked for and which independent checks run. The template is chosen
       for them (and says why); request-specific changes are listed apart from the template so a reviewer can tell
       them apart later. One container level: headings, hairline rows, whitespace (D-17).
       Wired to the templates (2026-10-12): the match, the checklist and the starting checks come from the template
       definitions (data/templates.js, Configure › Templates); no match → "No matching template" and a pick, never a
       silent default (PRD UX l. 1135). -->
  <div class="flex flex-col gap-space-40">
    <section class="flex flex-col gap-space-8">
      <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">Requirement template</span>
      <div class="flex flex-wrap items-baseline justify-between gap-space-8">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ templateName }}</h3>
        <Button v-if="template" :label="changing ? 'Keep this template' : 'Change template'" color-scheme="primary" variant="text" size="small" @onClick="changing = !changing" />
      </div>
      <p v-if="template" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ reasonLine }}</p>
      <InlineNotice v-else tone="warning" title="No template matches this work" message="No active template covers these trades for this owner and project type. Pick one below, or ask a Prequalification admin to add one under Configure › Templates." />
      <div v-if="changing || !template" class="pt-space-8">
        <SelectV2 label="Template" :options="templateOptions" :value="template" :allow-search="false" @input="$emit('template', $event); changing = false" />
      </div>
    </section>

    <section v-if="requirements.length" class="flex flex-col gap-space-16">
      <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">What {{ companyName }} will be asked for</h3>
      <div v-for="group in requirements" :key="group.pillar" class="flex flex-col">
        <span class="pb-space-4 font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ group.pillar }}</span>
        <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
          <li v-for="item in group.items" :key="item.label" class="flex flex-col gap-space-2 py-space-8 font-label sm:flex-row sm:gap-space-16">
            <span class="shrink-0 text-fontsize-14 leading-lineheight-20 text-text-default sm:basis-1/3">{{ item.label }}<span v-if="item.optional" class="text-text-soft"> · optional</span></span>
            <span class="text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ item.detail }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section v-if="changes.length" class="flex flex-col gap-space-12">
      <div class="flex flex-col gap-space-2">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Changes for this request</h3>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">From the work context. The template itself is not changed.</p>
      </div>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="c in changes" :key="c.id" class="flex flex-col gap-space-2 py-space-8 font-label">
          <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ c.label }}</span>
          <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ c.reason }}</span>
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-space-12">
      <div class="flex flex-col gap-space-2">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Independent checks</h3>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">Run by Linarc against outside sources once the application is submitted. The template's checks are selected; change them for this request only.</p>
      </div>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="k in CHECKS" :key="k.id" class="flex items-start gap-space-12 py-space-8">
          <Checkbox :value="checks.includes(k.id)" :label="k.label" size="small" class="min-w-0 flex-1" @input="toggle(k.id, $event)" />
          <span class="hidden shrink-0 font-label text-fontsize-12 leading-lineheight-20 text-text-subtle sm:inline">{{ k.source }} · {{ k.availability }}</span>
          <span class="w-space-72 shrink-0 text-right font-label text-fontsize-14 leading-lineheight-20 tabular-nums" :class="k.cost ? 'text-text-default' : 'text-text-subtle'">{{ k.cost ? money(k.cost) : 'Included' }}</span>
        </li>
      </ul>
      <p class="m-0 flex justify-between font-label text-fontsize-14 leading-lineheight-20">
        <span class="text-text-subtle">{{ checks.length }} of {{ CHECKS.length }} checks</span>
        <span class="text-text-default">Estimated cost <strong class="tabular-nums">{{ money(cost) }}</strong></span>
      </p>
    </section>
  </div>
</template>

<script>
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import Button from '@/components/Button/Button.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import { templates } from '~/modules/prequal/data';
import { CHECKS, requestChanges } from '~/modules/prequal/data/wizard';
import { activeTemplateOptions, definitionFor, matchTemplate, checklistOf } from '~/modules/prequal/data/templates';
import { currency } from '~/candidates/FormTableFields/format';

export default {
  name: 'StepRequirements',
  components: { SelectV2, Button, Checkbox, InlineNotice },
  props: {
    work: { type: Object, required: true },
    template: { type: String, default: null },
    checks: { type: Array, required: true },
    companyName: { type: String, default: 'The subcontractor' },
    /** The estimator picked the template by hand (wizardState.templateChosen). */
    chosen: { type: Boolean, default: false },
  },
  data() {
    return { CHECKS, changing: false };
  },
  computed: {
    templateOptions() {
      return activeTemplateOptions();
    },
    templateName() {
      return this.template ? templates[this.template] : 'No matching template';
    },
    reasonLine() {
      if (this.chosen) return 'Chosen for this request.';
      const m = matchTemplate(this.work);
      return m && m.id === this.template ? `Suggested from ${m.reasons.join(' · ')}` : 'Chosen for this request.';
    },
    requirements() {
      const def = this.template ? definitionFor(this.template) : null;
      return def ? checklistOf(def) : [];
    },
    changes() {
      return requestChanges(this.work);
    },
    cost() {
      return CHECKS.filter((k) => this.checks.includes(k.id)).reduce((s, k) => s + k.cost, 0);
    },
  },
  methods: {
    money: currency,
    toggle(id, on) {
      const next = on ? [...new Set([...this.checks, id])] : this.checks.filter((c) => c !== id);
      this.$emit('checks', next);
    },
  },
};
</script>
