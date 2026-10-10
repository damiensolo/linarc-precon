<template>
  <!-- The record itself: key facts, approved parameters (trade × scope × limits), conditions and, for reviewers, the
       overrides made at approval. Headings + hairline rows, no boxes (D-17). The PRD's "Qualification card" is this
       composition, not a component (backlog, closed for screen 6). -->
  <div class="flex flex-col gap-space-40 font-label">
    <dl class="m-0 grid grid-cols-1 gap-space-20 sm:grid-cols-2 xl:grid-cols-4">
      <!-- The title bar shows Status from md up; below that it lives here. -->
      <div v-if="status" class="flex flex-col gap-space-4 md:hidden">
        <dt class="text-fontsize-12 leading-lineheight-16 text-text-subtle">Status</dt>
        <dd class="m-0 text-fontsize-14 leading-lineheight-20 text-text-default">{{ status.label }}</dd>
      </div>
      <div class="flex flex-col gap-space-4">
        <dt class="text-fontsize-12 leading-lineheight-16 text-text-subtle">Outcome</dt>
        <dd class="m-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">{{ outcome.label }}</dd>
      </div>
      <div class="flex flex-col gap-space-4">
        <dt class="text-fontsize-12 leading-lineheight-16 text-text-subtle">Valid until</dt>
        <dd class="m-0 flex flex-col gap-space-2">
          <!-- timeline variant without a start date: "Expires … · in N days", wraps in a narrow column, no bar -->
          <ExpiryIndicator variant="timeline" :date="record.validUntil" :now="now" />
          <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">Earliest key document: {{ record.validUntilDriver.toLowerCase() }}</span>
        </dd>
      </div>
      <div class="flex flex-col gap-space-4">
        <dt class="text-fontsize-12 leading-lineheight-16 text-text-subtle">Approved</dt>
        <dd class="m-0 text-fontsize-14 leading-lineheight-20 text-text-default">
          {{ record.approvedByName }} · {{ $moment(record.approvedOn).format('D MMM YYYY') }}
        </dd>
      </div>
      <div class="flex flex-col gap-space-4">
        <dt class="text-fontsize-12 leading-lineheight-16 text-text-subtle">Recommendation at approval</dt>
        <dd class="m-0 text-fontsize-14 leading-lineheight-20 text-text-default">
          {{ stamp.label }}<template v-if="reviewer && record.recommendation.score !== null"> · {{ record.recommendation.score }} / 100 · confidence {{ record.recommendation.confidence }}%</template>
        </dd>
      </div>
    </dl>

    <section class="flex flex-col gap-space-8" aria-labelledby="record-parameters">
      <h2 id="record-parameters" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Approved for</h2>
      <div role="table" aria-labelledby="record-parameters" class="flex flex-col">
        <div role="row" class="hidden grid-cols-12 gap-space-16 border-0 border-b border-solid border-border-subtle py-space-8 text-fontsize-12 leading-lineheight-16 text-text-subtle sm:grid">
          <span role="columnheader" class="col-span-4">Trade</span>
          <span role="columnheader" class="col-span-4">Scope</span>
          <span role="columnheader" class="col-span-2 text-right">Single project</span>
          <span role="columnheader" class="col-span-2 text-right">Aggregate</span>
        </div>
        <div
          v-for="t in record.trades"
          :key="t.trade"
          role="row"
          class="grid grid-cols-2 gap-x-space-16 gap-y-space-2 border-0 border-b border-solid border-border-subtle py-space-12 text-fontsize-14 leading-lineheight-20 sm:grid-cols-12"
        >
          <span role="cell" class="col-span-2 text-text-default sm:col-span-4">{{ t.trade }} <span class="text-text-soft">· CSI {{ t.csi }}</span></span>
          <span role="cell" class="col-span-2 text-text-subtle sm:col-span-4 sm:text-text-default">{{ t.scope }}</span>
          <span role="cell" class="tabular-nums text-text-default sm:col-span-2 sm:text-right"><span class="text-text-subtle sm:hidden">Single </span>{{ money(t.single) }}</span>
          <span role="cell" class="tabular-nums text-text-default sm:col-span-2 sm:text-right"><span class="text-text-subtle sm:hidden">Aggregate </span>{{ money(t.aggregate) }}</span>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-space-8" aria-labelledby="record-conditions">
      <h2 id="record-conditions" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Conditions</h2>
      <p v-if="!record.conditions.length" class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">None. Approved without conditions.</p>
      <ul v-else class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="c in record.conditions" :key="c.id" class="flex flex-wrap items-start gap-x-space-16 gap-y-space-4 py-space-12">
          <span class="flex w-full min-w-0 flex-col sm:w-auto sm:flex-1">
            <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ c.label }}</span>
            <span v-if="c.note" class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ c.note }}</span>
          </span>
          <!-- One signal per status: a chip only when it needs action (open); otherwise a muted word. -->
          <StatusChip
            v-if="condition(c).tone === 'warning'"
            :label="condition(c).label"
            :status="toneToChipStatus(condition(c).tone)"
            fill-style="outline"
            type="default"
            :removable="false"
          />
          <span v-else class="text-fontsize-12 leading-lineheight-20 text-text-subtle">{{ condition(c).label }}</span>
        </li>
      </ul>
    </section>

    <section v-if="reviewer && record.overrides.length" class="flex flex-col gap-space-8" aria-labelledby="record-overrides">
      <h2 id="record-overrides" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Overrides at approval</h2>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="o in record.overrides" :key="o.at" class="flex flex-col gap-space-2 py-space-12">
          <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ o.finding }}</span>
          <span class="text-fontsize-14 leading-lineheight-20 text-text-subtle">“{{ o.reason }}”</span>
          <span class="text-fontsize-12 leading-lineheight-16 text-text-soft">{{ o.actor }} · {{ $moment(o.at).format('D MMM YYYY') }} · the original finding and its sources are kept in the review</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import ExpiryIndicator from '~/candidates/ExpiryIndicator/ExpiryIndicator.vue';
import { currency } from '~/candidates/FormTableFields/format';
import { CONDITION, OUTCOME, RECOMMENDATION, toneToChipStatus } from '~/modules/prequal/status';

export default {
  name: 'RecordSummary',
  components: { StatusChip, ExpiryIndicator },
  props: {
    record: { type: Object, required: true },
    /** Reviewer sees score, confidence and overrides; Estimator/PM sees the stamp only (PRD §10). */
    reviewer: { type: Boolean, default: true },
    now: { type: String, required: true },
    /** Lifecycle status entry ({ label, tone }) for small screens, where the title bar hides it. */
    status: { type: Object, default: null },
  },
  computed: {
    outcome() {
      return OUTCOME[this.record.outcome];
    },
    stamp() {
      return RECOMMENDATION[this.record.recommendation.stamp];
    },
  },
  methods: {
    toneToChipStatus,
    money: currency,
    condition(c) {
      return CONDITION[c.status];
    },
  },
};
</script>
