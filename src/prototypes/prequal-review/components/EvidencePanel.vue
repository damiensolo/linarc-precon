<template>
  <!-- Evidence for one finding, opened in the right panel (the library has no drawer; the panel the screen already
       has is reused, flagged for design in the record). Requirement, the three proof levels with sources, and the
       resolution actions with a reviewer note. Override / Dismiss save through a (mock) request: the buttons disable at
       once, the finding changes only after it resolves, a failure keeps the note with an error and Retry (§6;
       shared LoadStatus on an action controller). -->
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

    <section v-if="finding.resolution === 'unresolved' && !readonly" class="flex flex-col gap-space-12 border-t border-border-subtle pt-space-20">
      <h3 class="m-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Resolve</h3>
      <FormV2 :value="{ note }" :schema="schema" :flat="true" mode="manual" label-position="top" @input="note = $event.note">
        <template #footer><span /></template>
      </FormV2>
      <div class="flex flex-wrap items-center gap-space-8">
        <Button label="Request information" color-scheme="secondary" variant="outline" size="medium" :is-disabled="busy" @onClick="$emit('request-info', finding)" />
        <Button label="Override" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="!note || busy" @onClick="save('overridden')" />
        <Button v-if="finding.severity !== 'knockout'" label="Dismiss" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="!note || busy" @onClick="save('dismissed')" />
      </div>
      <LoadStatus :load="submit" :active="!!saving" variant="notice" @retry="save(saving)" />
      <p class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">Override and Dismiss need a reason. The original finding, its sources and the recommendation are kept in the history.</p>
    </section>
  </div>
</template>

<script>
import { ChevronLeft } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import EvidenceComparison from '~/candidates/EvidenceComparison/EvidenceComparison.vue';
import { SEVERITY, RESOLUTION } from '~/modules/prequal/status';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';

export default {
  name: 'EvidencePanel',
  components: { Button, FormV2, EvidenceComparison, ChevronLeft, LoadStatus },
  props: {
    finding: { type: Object, required: true },
    /** A decided request: evidence only, nothing to resolve. */
    readonly: { type: Boolean, default: false },
  },
  data() {
    return {
      note: '',
      /** Resolution being saved ('overridden' | 'dismissed'), or null. */
      saving: null,
      submit: createLoad({ label: 'resolution', action: { busy: 'Saving', done: 'Saved', error: "Couldn't save the resolution. The finding is unchanged." } }),
      schema: { sections: [{ id: 'resolve', layout: { columns: 1, gap: '16px' }, fields: [{ id: 'note', type: 'textarea', label: 'Reason (kept in the history)', props: { rows: 3 } }] }] },
    };
  },
  computed: {
    busy() {
      return this.submit.status === 'loading';
    },
    severity() {
      return SEVERITY[this.finding.severity];
    },
    resolutionLabel() {
      return this.finding.resolution && this.finding.resolution !== 'unresolved' ? RESOLUTION[this.finding.resolution].label : '';
    },
  },
  watch: {
    'finding.id'() {
      this.note = '';
      this.saving = null;
    },
  },
  beforeDestroy() {
    this.submit.destroy();
  },
  methods: {
    save(resolution) {
      if (this.busy) return;
      this.saving = resolution;
      const { finding, note } = this;
      this.submit.run(
        (signal) => mockRequest(() => resolution, { signal }),
        () => this.$emit('resolve', { finding, resolution, note }),
      );
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
