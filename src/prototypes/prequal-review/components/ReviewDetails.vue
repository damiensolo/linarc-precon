<template>
  <!-- The four record tabs (Submission · Documents · Checks · History), each a heading + hairline rows (D-17).
       Checks hide passed results by default (spec: "hide passed checks"). -->
  <div>
    <section v-if="tab === 'submission'" class="flex flex-col gap-space-32">
      <div v-for="s in submission" :key="s.section" class="flex flex-col gap-space-8">
        <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ s.section }}</h2>
        <dl class="m-0 flex flex-col divide-y divide-border-subtle font-label text-fontsize-14 leading-lineheight-20">
          <div v-for="[k, v] in s.rows" :key="k" class="flex flex-col gap-space-2 py-space-8 sm:flex-row sm:gap-space-16">
            <dt class="shrink-0 text-text-subtle sm:basis-1/3">{{ k }}</dt>
            <dd class="m-0 text-text-default">{{ v }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section v-else-if="tab === 'documents'" class="flex flex-col gap-space-8">
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="d in documents" :key="d.id" class="flex flex-wrap items-center gap-x-space-16 gap-y-space-4 py-space-12 font-label">
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="text-fontsize-14 leading-lineheight-20" :class="d.status === 'superseded' ? 'text-text-subtle line-through' : 'text-text-default'">{{ d.label }}</span>
            <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ d.note }}<template v-if="d.validThrough"> · valid through {{ $moment(d.validThrough).format('D MMM YYYY') }}</template></span>
          </div>
          <StatusChip v-if="needsAction(d)" :label="docStatus(d).label" :status="toneToChipStatus(docStatus(d).tone)" fill-style="outline" type="default" :removable="false" />
          <span v-else class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ docStatus(d).label }}</span>
        </li>
      </ul>
    </section>

    <section v-else-if="tab === 'checks'" class="flex flex-col gap-space-12">
      <div class="flex flex-wrap items-center justify-between gap-space-8">
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
          {{ complete }} of {{ checks.length }} complete · {{ running }} running · {{ passed }} passed
        </p>
        <Checkbox :value="showPassed" :label="`Show passed (${passed})`" size="small" @input="showPassed = $event" />
      </div>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="k in visibleChecks" :key="k.id" class="flex flex-wrap items-center gap-x-space-16 gap-y-space-4 py-space-12 font-label">
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ k.label }}</span>
            <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ k.source }} · {{ k.result }}</span>
          </div>
          <span class="text-fontsize-12 leading-lineheight-16" :class="k.status === 'running' ? 'text-text-default' : 'text-text-subtle'">
            {{ k.status === 'complete' ? (k.passed ? 'Passed' : 'Needs review') : checkStatus(k).label }}
          </span>
        </li>
      </ul>
    </section>

    <section v-else-if="tab === 'history'">
      <ol class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="h in history" :key="h.at" class="flex flex-col gap-space-2 py-space-10 font-label sm:flex-row sm:gap-space-16">
          <span class="shrink-0 text-fontsize-12 leading-lineheight-20 tabular-nums text-text-subtle sm:basis-1/4">{{ $moment(h.at).format('D MMM YYYY · h:mm a') }}</span>
          <span class="text-fontsize-14 leading-lineheight-20 text-text-default"><strong>{{ h.actor }}</strong> {{ h.action.charAt(0).toLowerCase() + h.action.slice(1) }}</span>
        </li>
      </ol>
    </section>
  </div>
</template>

<script>
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import { CHECK, DOCUMENT, toneToChipStatus } from '~/modules/prequal/status';

export default {
  name: 'ReviewDetails',
  components: { Checkbox, StatusChip },
  props: {
    tab: { type: String, required: true },
    submission: { type: Array, required: true },
    documents: { type: Array, required: true },
    checks: { type: Array, required: true },
    history: { type: Array, required: true },
  },
  data() {
    return { showPassed: false };
  },
  computed: {
    complete() {
      return this.checks.filter((k) => k.status === 'complete').length;
    },
    running() {
      return this.checks.filter((k) => k.status === 'running').length;
    },
    passed() {
      return this.checks.filter((k) => k.passed).length;
    },
    visibleChecks() {
      return this.showPassed ? this.checks : this.checks.filter((k) => !k.passed);
    },
  },
  methods: {
    toneToChipStatus,
    docStatus(d) {
      return DOCUMENT[d.status];
    },
    needsAction(d) {
      return ['failed', 'rejected', 'expired', 'needs-review'].includes(d.status);
    },
    checkStatus(k) {
      return CHECK[k.status];
    },
  },
};
</script>
