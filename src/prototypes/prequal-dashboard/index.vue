<template>
  <!-- Preconstruction › Prequalification › Overview: the GC Request Dashboard (docs/prequal/screens.md §1).
       KPI cards filter the table; rows open the review screen or the qualification record (router.js).
       Reviewer sees Score · Confidence; the Estimator/PM view hides it (PRD §10). Rows and columns:
       src/modules/prequal/requestColumns.js. Figma reference: prd-to-prototype step 6.
       Loading (docs/5-ui-patterns.md §6): counts and rows come from one (mock) request; the shell and title bar stay
       put. First load: KPI and grid skeletons appear only if the answer takes > 200ms. A KPI click re-queries the rows
       and keeps the current cards and rows, with "Updating…" beside the title. Try the sandbox Latency select. -->
  <PrequalShell screen="dashboard" title="Overview">
    <!-- Title Bar / Page title, plus the page's load indicator (no meta line on this screen; empty when idle). -->
    <template #header>
      <span class="flex min-w-0 items-center gap-space-12">
        <span class="font-label font-bold text-fontsize-16 leading-lineheight-24 text-text-default">Overview</span>
        <LoadStatus :load="load" @retry="fetch" />
      </span>
    </template>
    <template #header-actions>
      <span class="hidden sm:inline-flex items-center gap-space-8">
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">View as</span>
        <SegmentedControl v-model="role" :options="roleOptions" aria-label="View as" size="md" />
      </span>
      <Button label="New request" color-scheme="primary" variant="solid" size="medium" @onClick="newRequest" />
    </template>

    <template #content>
      <!-- One request for the page (counts + rows), so one region: one live region, one error notice, one Retry. -->
      <LoadRegion v-slot="{ skeleton }" class="h-full min-h-0" :load="load" content-loads @retry="fetch">
        <div class="flex h-full min-h-0 flex-col gap-space-16">
          <!-- The KPI cards stay mounted: on the first load they are KpiCard `loading` (real labels, value and hint as
               skeleton line boxes, not clickable), invisible until the indicator delay passes, so neither their arrival
               nor the counts move anything. Hidden after a failed first load (the notice + Retry replace them). -->
          <section
            v-if="load.hasData || !firstLoadFailed"
            class="grid grid-cols-1 gap-space-16 sm:grid-cols-3"
            :class="{ invisible: !load.hasData && !skeleton }"
            :aria-hidden="load.hasData ? null : 'true'"
            aria-label="Pipeline summary"
          >
            <KpiCard
              v-for="k in kpis"
              :key="k.id"
              :label="k.label"
              :value="k.count"
              :hint="k.hint"
              :tone="k.tone"
              :icon="k.icon"
              :selected="selectedKpi === k.id"
              :loading="!load.hasData"
              :interactive="load.hasData"
              @click="toggleKpi(k.id)"
            />
          </section>

          <DataGrid
            class="min-h-0 w-full min-w-0 flex-1"
            :data="rows"
            :loading="skeleton"
            :header="columns"
            id-field="id"
            :views="['grid', 'list']"
            default-view="list"
            :views-feature-enabled="true"
            :view-tabs="[]"
            :show-print="true"
            :show-save-template="false"
            :application-should-handle-download="true"
            :row-height="40"
            height="100%"
            @row-click="openRow"
          />
        </div>
      </LoadRegion>
    </template>
  </PrequalShell>
</template>

<script>
// Clock (not Hourglass) for "Waiting": the ☉ Icons set in Figma has clock, clipboard-check and calendar-clock masters
// but no hourglass, and the icon must exist on both sides.
import { Clock, ClipboardCheck, CalendarClock } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import KpiCard from '~/candidates/KpiCard/KpiCard.vue';
import LoadRegion from '~/candidates/LoadRegion/LoadRegion.vue';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import { requestGridRows, requestColumns, screenFor } from '~/modules/prequal/requestColumns';
import { KPI } from '~/modules/prequal/status';
import { go } from '~/modules/prequal/router';

export default {
  name: 'PrequalDashboard',
  prototype: {
    title: 'Preconstruction › Prequalification › Overview',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3769-6402',
  },
  components: { PrequalShell, Button, DataGrid, SegmentedControl, KpiCard, LoadRegion, LoadStatus },
  data() {
    return {
      role: 'reviewer',
      roleOptions: [
        { label: 'Reviewer', value: 'reviewer' },
        { label: 'Estimator', value: 'estimator' },
      ],
      selectedKpi: null,
      /** Every request (the KPI counts are over all of them) and the rows the table shows (filtered by the KPI). */
      allRows: [],
      rows: [],
      load: createLoad({ label: 'overview' }),
    };
  },
  computed: {
    firstLoadFailed() {
      return !this.load.hasData && (this.load.status === 'error' || this.load.status === 'cancelled');
    },
    kpis() {
      const rows = this.allRows;
      const waiting = rows.filter(KPI.waitingForSubcontractor);
      const ready = rows.filter(KPI.readyForReview);
      const renewal = rows.filter(KPI.renewalNeededSoon);
      const infoRequested = waiting.filter((r) => r.workflow === 'info-requested').length;
      const unassigned = ready.filter((r) => !r.reviewer).length;
      const next = renewal.map((r) => r.validUntil).sort()[0];
      return [
        { id: 'waitingForSubcontractor', label: 'Waiting for subcontractor', count: waiting.length, tone: 'neutral', icon: Clock, hint: infoRequested ? `${infoRequested} answering an information request` : 'No information requests open' },
        { id: 'readyForReview', label: 'Ready for review', count: ready.length, tone: 'info', icon: ClipboardCheck, hint: unassigned ? `${unassigned} not yet assigned` : 'All assigned' },
        { id: 'renewalNeededSoon', label: 'Renewal needed soon', count: renewal.length, tone: 'warning', icon: CalendarClock, hint: next ? `Next expiry ${this.$moment(next).format('D MMM')}` : 'Nothing expiring in 30 days' },
      ];
    },
    columns() {
      return requestColumns(this.role, (row) => this.openRow({ row }));
    },
  },
  watch: {
    // The KPI filter is queried, as it would be on the server: the card selects at once, the rows follow.
    selectedKpi: 'fetch',
  },
  created() {
    this.fetch();
  },
  beforeDestroy() {
    this.load.destroy();
  },
  methods: {
    fetch() {
      const { selectedKpi } = this;
      this.load.run(
        (signal) =>
          mockRequest(() => {
            const all = requestGridRows(this.$moment);
            return { all, rows: selectedKpi ? all.filter(KPI[selectedKpi]) : all };
          }, { signal }),
        ({ all, rows }) => {
          this.allRows = all;
          this.rows = rows;
        },
      );
    },
    toggleKpi(id) {
      this.selectedKpi = this.selectedKpi === id ? null : id;
    },
    openRow({ row }) {
      if (row) go(screenFor(row), row.id);
    },
    newRequest() {
      go('wizard');
    },
  },
};
</script>
