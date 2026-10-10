<template>
  <!-- CANDIDATE 2026-10-09: proposed design-system component, see docs/components/EvidenceComparison.md.
       One value at its three levels of proof (declared · document · independent check). Columns separated by
       space; colour only for Contradicted and the verified mark (D-17). -->
  <div class="evidence-comparison flex flex-col gap-space-8 font-label">
    <p v-if="allVerified" class="m-0 flex items-center gap-space-4 text-fontsize-12 leading-lineheight-16 text-text-default">
      <Check :size="14" :stroke-width="2" class="shrink-0 text-icon-success" aria-hidden="true" /> Verified at all three levels
    </p>
    <dl class="m-0 grid grid-cols-1 gap-space-12 sm:grid-cols-3 sm:gap-space-24">
      <div v-for="col in columns" :key="col.key" class="flex min-w-0 flex-col gap-space-2">
        <dt class="text-fontsize-12 leading-lineheight-16 text-text-soft">{{ col.label }}</dt>
        <dd class="m-0 break-words text-fontsize-14 leading-lineheight-20 text-text-default">{{ col.level.value || '—' }}</dd>
        <dd class="m-0 flex items-center gap-space-4 text-fontsize-12 leading-lineheight-16" :class="stateClass(col.level.state)">
          <Check v-if="col.level.state === 'verified'" :size="12" :stroke-width="2.5" class="shrink-0 text-icon-success" aria-hidden="true" />
          {{ stateLabel(col.level.state) }}
          <span v-if="detailed && col.level.confidence" class="text-text-subtle"> · read with {{ col.level.confidence }}% confidence</span>
        </dd>
        <dd v-if="detailed && col.level.source" class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">
          {{ col.level.source }}<template v-if="col.level.at"> · {{ $moment(col.level.at).format('D MMM YYYY') }}</template>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script>
import { Check } from '@development/linarc-icons';
import { PROOF } from '~/modules/prequal/status';

const EMPTY = { value: null, state: 'none' };

export default {
  name: 'EvidenceComparison',
  components: { Check },
  props: {
    /** { declared, evidenced, verified }: each { value, state (PROOF key), source?, at?, confidence? } */
    proof: { type: Object, required: true },
    /** Adds source, date and extraction confidence under each value. */
    detailed: { type: Boolean, default: false },
  },
  computed: {
    columns() {
      return [
        { key: 'declared', label: 'Declared', level: this.proof.declared || EMPTY },
        { key: 'evidenced', label: 'Document', level: this.proof.evidenced || EMPTY },
        { key: 'verified', label: 'Independent check', level: this.proof.verified || EMPTY },
      ];
    },
    allVerified() {
      return this.columns.every((c) => c.level.state === 'verified');
    },
  },
  methods: {
    stateLabel(state) {
      return PROOF[state] ? PROOF[state].label : '';
    },
    stateClass(state) {
      if (state === 'contradicted') return 'text-text-error';
      if (state === 'verified') return 'text-text-default';
      return 'text-text-subtle';
    },
  },
};
</script>
