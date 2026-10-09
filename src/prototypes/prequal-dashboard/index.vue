<template>
  <!-- Preconstruction › Prequalification › Overview: the GC Request Dashboard (docs/prequal/screens.md §1).
       KPI cards filter the table; rows open the review screen or the qualification record (router.js).
       Reviewer sees Score · Confidence; the Estimator/PM view hides it (PRD §10). No Figma frame yet: this screen is
       pushed to Figma as the reference (prd-to-prototype step 6). -->
  <PrequalShell screen="dashboard" title="Overview">
    <template #header-actions>
      <span class="hidden sm:inline-flex items-center gap-space-8">
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">View as</span>
        <SegmentedControl v-model="role" :options="roleOptions" aria-label="View as" size="md" />
      </span>
      <Button label="New request" color-scheme="primary" variant="solid" size="medium" @onClick="newRequest">
        <template #leftIcon><Plus /></template>
      </Button>
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
import { Plus, Clock, ClipboardCheck, CalendarClock } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import KpiCard from '~/candidates/KpiCard/KpiCard.vue';
import '~/modules/prequal/gridSlots';
import { requestRows, TODAY } from '~/modules/prequal/data';
import { KPI, ROLES, toneToChipStatus } from '~/modules/prequal/status';
import { go } from '~/modules/prequal/router';

// Where a row leads: approved → the qualification record; anything with a submission → the review screen.
const screenFor = (row) => (row.outcome && row.outcome !== 'not-qualified' ? 'record' : 'review');
const actionLabel = (row) => {
  if (KPI.readyForReview(row)) return 'Review now';
  if (row.outcome && row.outcome !== 'not-qualified') return 'View record';
  return 'Open';
};

export default {
  name: 'PrequalDashboard',
  prototype: {
    title: 'Preconstruction › Prequalification › Overview',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3729-4281',
  },
  components: { PrequalShell, Button, DataGrid, SegmentedControl, KpiCard, Plus },
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
      return requestRows().map((r) => ({
        ...r,
        statusLabel: r.status.label,
        activityText: `${this.$moment(r.activity[0]).format('D MMM')} · ${r.activity[1]}`,
      }));
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
      const reviewer = ROLES[this.role].seesScore;
      const open = (row) => this.openRow({ row });
      // A cell with only a `center` slot is centred by DecoratedCell; pin the slot `left` (or `right`) and blank the
      // centre text so the column value stays available for sorting and filtering without rendering twice.
      const BLANK = { type: 'text', componentProps: { value: '' } };
      const cols = [
        { field: 'companyName', label: 'SUBCONTRACTOR', type: 'ShortText', width: 250, readonly: true, frozen: true },
        { field: 'trade', label: 'TRADE', type: 'ShortText', width: 140, readonly: true },
        { field: 'project', label: 'PROJECT', type: 'ShortText', width: 170, readonly: true },
        { field: 'templateName', label: 'TEMPLATE', type: 'ShortText', width: 230, readonly: true },
        {
          field: 'statusLabel',
          label: 'STATUS',
          type: 'ShortText',
          width: 290,
          readonly: true,
          cell: {
            left: {
              type: 'status-chip',
              componentProps: { label: (r) => r.status.label, status: (r) => toneToChipStatus(r.status.tone), fillStyle: 'outline', type: 'default' },
            },
            center: BLANK,
          },
        },
      ];
      if (reviewer) {
        cols.push({
          field: 'score',
          label: 'SCORE · CONFIDENCE',
          type: 'ShortText',
          width: 170,
          readonly: true,
          cell: {
            left: { type: 'score-confidence', componentProps: { score: (r) => r.score, confidence: (r) => r.confidence, recommendation: (r) => r.recommendation } },
            center: BLANK,
          },
        });
      }
      cols.push(
        { field: 'validUntil', label: 'EXPIRATION', type: 'ShortText', width: 220, readonly: true, cell: { left: { type: 'expiry', componentProps: { date: (r) => r.validUntil, now: TODAY } }, center: BLANK } },
        { field: 'activityText', label: 'LAST ACTIVITY', type: 'ShortText', width: 300, flex: 1, readonly: true },
        {
          field: 'action',
          label: '',
          type: 'ShortText',
          width: 130,
          readonly: true,
          cell: { center: BLANK, right: { type: 'button', componentProps: { label: actionLabel, variant: 'text', colorScheme: 'primary', size: 'small' }, onClick: open } },
        },
      );
      return cols;
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
