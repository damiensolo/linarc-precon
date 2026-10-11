<template>
  <!-- Request tracking (PRD UX l. 1186, "completion progress" as its own indicator) for a request the subcontractor
       hasn't submitted: how far they've got through the portal's sections, by group. The GC sees progress, not answers
       (those arrive with the submission). Hairline rows and muted state words (D-17); a chip only on Needs attention,
       the one state worth a nudge. Data: src/modules/prequal/data/tracking.js. -->
  <div class="flex flex-col gap-space-24 font-label">
    <section class="flex flex-col gap-space-8" aria-labelledby="progress-h">
      <div class="flex flex-wrap items-baseline justify-between gap-x-space-16 gap-y-space-4">
        <h2 id="progress-h" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Subcontractor progress</h2>
        <span class="text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ summary }}</span>
      </div>
      <ProgressBar :progress="tracking.percent" :bar-only="true" :aria-label="`${tracking.percent}% of the requirements complete`" />
      <p v-if="tracking.note" class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ tracking.note }}</p>
    </section>

    <section v-for="g in groups" :key="g.label" class="flex flex-col gap-space-4" :aria-label="g.label">
      <h3 class="m-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">{{ g.label }}</h3>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="s in g.items" :key="s.id" class="flex flex-wrap items-center justify-between gap-x-space-16 gap-y-space-4 py-space-10">
          <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ s.label }}</span>
          <StatusChip
            v-if="s.state === 'needs-attention'"
            :label="state(s).label"
            :status="toneToChipStatus(state(s).tone)"
            fill-style="outline"
            type="default"
            :removable="false"
          />
          <span v-else class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ state(s).label }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import ProgressBar from '@/components/ProgressBar/ProgressBar.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import { SECTION, toneToChipStatus } from '~/modules/prequal/status';

export default {
  name: 'RequestProgress',
  components: { ProgressBar, StatusChip },
  props: {
    /** trackingFor(id) from src/modules/prequal/data/tracking.js */
    tracking: { type: Object, required: true },
  },
  computed: {
    groups() {
      const out = [];
      this.tracking.sections.forEach((s) => {
        let g = out.find((x) => x.label === s.pillar);
        if (!g) out.push((g = { label: s.pillar, items: [] }));
        g.items.push(s);
      });
      return out;
    },
    summary() {
      const t = this.tracking;
      if (t.stage === 'draft') return 'Not sent yet';
      const done = t.sections.filter((s) => s.state === 'complete').length;
      if (!t.opened) return 'Invitation not opened yet';
      if (!done && !t.lastSaved) return `Opened ${this.$moment(t.opened).format('D MMM')}; nothing completed yet`;
      const saved = t.lastSaved ? ` · last saved ${this.$moment(t.lastSaved).format('D MMM, h:mm a')}` : '';
      return `${done} of ${t.sections.length} sections complete · ${t.percent}%${saved}`;
    },
  },
  methods: {
    toneToChipStatus,
    state(s) {
      return SECTION[s.state];
    },
  },
};
</script>
