<template>
  <!-- Overview tab, in the reviewer hierarchy (spec): the AI summary (visibly AI, kept apart from evidence),
       the findings that need a decision, then section scores. Passes are not listed here. -->
  <div class="flex flex-col gap-space-40">
    <section class="flex flex-col gap-space-8" aria-labelledby="lintel-h">
      <div class="flex items-center gap-space-8">
        <h2 id="lintel-h" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Summary</h2>
        <StatusChip label="Lintel AI" status="ai" fill-style="outline" type="default" :removable="false" />
      </div>
      <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-default">{{ summary }}</p>
      <p class="m-0 font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">Generated from the submission and check results. The evidence below is the record; this summary is not.</p>
    </section>

    <section class="flex flex-col gap-space-4" aria-labelledby="priority-h">
      <div class="flex flex-wrap items-baseline justify-between gap-space-8">
        <h2 id="priority-h" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">
          {{ heading }} <span class="font-normal text-text-soft">{{ priority.length }}</span>
        </h2>
        <Button :label="`All findings (${total})`" color-scheme="primary" variant="text" size="small" @onClick="$emit('tab', 'findings')" />
      </div>
      <FindingList :findings="priority" @evidence="$emit('evidence', $event)" />
    </section>

    <section class="flex flex-col gap-space-12" aria-labelledby="sections-h">
      <h2 id="sections-h" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Section scores</h2>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="s in sections" :key="s.id" class="grid grid-cols-2 items-center gap-x-space-16 gap-y-space-4 py-space-10 font-label sm:grid-cols-12">
          <span class="text-fontsize-14 leading-lineheight-20 text-text-default sm:col-span-4">{{ s.label }} <span class="text-text-soft">· {{ s.weight }}%</span></span>
          <span class="text-right text-fontsize-14 font-bold leading-lineheight-20 tabular-nums text-text-default sm:order-last sm:col-span-1">{{ s.score }}</span>
          <ProgressBar class="col-span-2 sm:col-span-5" :progress="s.score" :bar-only="true" :aria-label="`${s.label} score ${s.score} of 100`" />
          <span class="col-span-2 text-fontsize-12 leading-lineheight-16 text-text-subtle sm:col-span-2">{{ s.findings ? `${s.findings} finding${s.findings > 1 ? 's' : ''}` : 'No findings' }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import ProgressBar from '@/components/ProgressBar/ProgressBar.vue';
import FindingList from './FindingList.vue';

export default {
  name: 'ReviewOverview',
  components: { Button, StatusChip, ProgressBar, FindingList },
  props: {
    summary: { type: String, required: true },
    findings: { type: Array, required: true },
    sections: { type: Array, required: true },
    /** "Needs your decision" while the request is open; a decided review lists what was open at the decision. */
    heading: { type: String, default: 'Needs your decision' },
  },
  computed: {
    priority() {
      return this.findings.filter((f) => f.resolution === 'unresolved' && f.severity !== 'info');
    },
    total() {
      return this.findings.length;
    },
  },
};
</script>
