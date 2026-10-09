<template>
  <!-- Preconstruction › Prequalification › Overview: the GC Request Dashboard (docs/prequal/screens.md §1).
       KPI cards filter the table; rows open the review screen or the qualification record (router.js).
       Reviewer sees Score · Confidence; the Estimator/PM view hides it (PRD §10). Rows and columns are shared with the
       Requests screen (src/modules/prequal/requestColumns.js). Figma reference: prd-to-prototype step 6. -->
  <PrequalShell screen="dashboard" title="Overview">
    <template #header-actions>
      <span class="hidden sm:inline-flex items-center gap-space-8">
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">View as</span>
        <SegmentedControl v-model="role" :options="roleOptions" aria-label="View as" size="md" />
      </span>
      <Button label="New request" color-scheme="primary" variant="solid" size="medium" @onClick="newRequest" />
    </template>

    <template #content>
      <div class="flex h-full min-h-0 flex-col gap-space-16">
        <section class="grid grid-cols-1 gap-space-16 sm:grid-cols-3" aria-label="Pipeline summary">
          <KpiCard
            v-for="k in kpis"
            :key="k.id"
            :label="k.label"
            :value="k.count"
            :hint="k.hint"
            :tone="k.tone"
            :icon="k.icon"
            :selected="selectedKpi === k.id"
            @click="toggleKpi(k.id)"
          />
        </section>

        <DataGrid
          class="min-h-0 w-full min-w-0 flex-1"
          :data="filteredRows"
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
import { requestGridRows, requestColumns, screenFor } from '~/modules/prequal/requestColumns';
import { KPI } from '~/modules/prequal/status';
import { go } from '~/modules/prequal/router';

export default {
  name: 'PrequalDashboard',
  prototype: {
    title: 'Preconstruction › Prequalification › Overview',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3729-4281',
  },
  components: { PrequalShell, Button, DataGrid, SegmentedControl, KpiCard },
  data() {
    return {
      role: 'reviewer',
      roleOptions: [
        { label: 'Reviewer', value: 'reviewer' },
        { label: 'Estimator', value: 'estimator' },
      ],
      selectedKpi: null,
    };
  },
  computed: {
    rows() {
      return requestGridRows(this.$moment);
    },
    filteredRows() {
      return this.selectedKpi ? this.rows.filter(KPI[this.selectedKpi]) : this.rows;
    },
    kpis() {
      const rows = this.rows;
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
  methods: {
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
