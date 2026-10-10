<template>
  <!-- Evidence for one finding, opened in the right panel (the library has no drawer; the panel the screen already
       has is reused, flagged for design in the record). Requirement, the three proof levels with sources, and the
       resolution actions with a reviewer note. -->
  <div class="flex flex-col gap-space-24 font-label">
    <div class="flex items-center gap-space-8">
      <Button label="" aria-label="Back to decision" color-scheme="secondary" variant="minimal" size="small" @onClick="$emit('close')">
        <template #leftIcon><ChevronLeft /></template>
      </Button>
      <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">Evidence</span>
    </div>

    <div class="flex flex-col gap-space-4">
      <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ severity.label }}<template v-if="finding.resolution !== 'unresolved'"> · {{ resolutionLabel }}</template></span>
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ finding.title }}</h2>
      <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">Requirement: {{ finding.criterion }}</p>
    </div>

    <EvidenceComparison :proof="finding.proof" :detailed="true" class="evidence-panel__proof" />

    <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-default">{{ finding.impact }}</p>

    <section v-if="finding.resolution === 'unresolved'" class="flex flex-col gap-space-12 border-t border-border-subtle pt-space-20">
      <h3 class="m-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Resolve</h3>
      <FormV2 :value="{ note }" :schema="schema" :flat="true" mode="manual" label-position="top" @input="note = $event.note">
        <template #footer><span /></template>
      </FormV2>
      <div class="flex flex-wrap items-center gap-space-8">
        <Button label="Request information" color-scheme="secondary" variant="outline" size="medium" @onClick="$emit('request-info', finding)" />
        <Button label="Override" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="!note" @onClick="$emit('resolve', { finding, resolution: 'overridden', note })" />
        <Button v-if="finding.severity !== 'knockout'" label="Dismiss" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="!note" @onClick="$emit('resolve', { finding, resolution: 'dismissed', note })" />
      </div>
      <p class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">Override and Dismiss need a reason. The original finding, its sources and the recommendation are kept in the history.</p>
    </section>
  </div>
</template>

<script>
import { ChevronLeft } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import EvidenceComparison from '~/candidates/EvidenceComparison/EvidenceComparison.vue';
import { SEVERITY } from '~/modules/prequal/status';

const RESOLUTION = { resolved: 'Resolved', dismissed: 'Dismissed', overridden: 'Overridden' };

export default {
  name: 'EvidencePanel',
  components: { Button, FormV2, EvidenceComparison, ChevronLeft },
  props: { finding: { type: Object, required: true } },
  data() {
    return {
      note: '',
      schema: { sections: [{ id: 'resolve', layout: { columns: 1, gap: '16px' }, fields: [{ id: 'note', type: 'textarea', label: 'Reason (kept in the history)', props: { rows: 3 } }] }] },
    };
  },
  computed: {
    severity() {
      return SEVERITY[this.finding.severity];
    },
    resolutionLabel() {
      return RESOLUTION[this.finding.resolution] || '';
    },
  },
  watch: {
    'finding.id'() {
      this.note = '';
    },
  },
};
</script>

<style scoped>
/* The panel is narrow: stack the three proof columns regardless of viewport width. */
.evidence-panel__proof ::v-deep dl {
  grid-template-columns: minmax(0, 1fr);
}
</style>
