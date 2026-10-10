<template>
  <!-- Findings as hairline rows (D-17): severity, title, criterion, the three proof levels (EvidenceComparison,
       compact), impact, and "View evidence". Only Knockout and Missing carry a chip; the rest are muted words. -->
  <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
    <li v-for="f in findings" :key="f.id" class="flex flex-col gap-space-12 py-space-20">
      <div class="flex flex-wrap items-start justify-between gap-space-12">
        <div class="flex min-w-0 flex-1 flex-col gap-space-4 font-label">
          <div class="flex flex-wrap items-center gap-space-8">
            <StatusChip v-if="isUrgent(f)" :label="sev(f).label" :status="chipFor(f)" fill-style="outline" type="default" :removable="false" />
            <span v-else class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ sev(f).label }}</span>
            <span v-if="f.resolution !== 'unresolved'" class="text-fontsize-12 leading-lineheight-16 text-text-subtle">· {{ resolutionLabel(f) }}</span>
          </div>
          <h3 class="m-0 text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ f.title }}</h3>
          <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">Requirement: {{ f.criterion }}</p>
        </div>
        <Button label="View evidence" color-scheme="primary" variant="text" size="small" @onClick="$emit('evidence', f)" />
      </div>
      <EvidenceComparison :proof="f.proof" />
      <p class="m-0 font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ f.impact }}</p>
    </li>
  </ul>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import EvidenceComparison from '~/candidates/EvidenceComparison/EvidenceComparison.vue';
import { SEVERITY, toneToChipStatus, RESOLUTION } from '~/modules/prequal/status';


export default {
  name: 'FindingList',
  components: { Button, StatusChip, EvidenceComparison },
  props: { findings: { type: Array, required: true } },
  methods: {
    sev(f) {
      return SEVERITY[f.severity];
    },
    isUrgent(f) {
      return f.resolution === 'unresolved' && (f.severity === 'knockout' || f.severity === 'missing');
    },
    chipFor(f) {
      return toneToChipStatus(this.sev(f).tone, { strong: f.severity === 'missing' });
    },
    resolutionLabel(f) {
      return f.resolution && f.resolution !== 'unresolved' ? RESOLUTION[f.resolution].label : '';
    },
  },
};
</script>
