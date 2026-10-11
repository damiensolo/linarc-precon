<template>
  <!-- Preconstruction › Prequalification › Qualified Subs: the GC's qualified subcontractor list (screen 7, PRD UX
       "Qualified subcontractor list"). One row per company; the status is the lifecycle once approved (one signal per
       status, D-16/D-17), with the conditions count beside it. Filters: Status and Trade (SelectV2, multiple), no KPI
       cards: this is a roster, not a pipeline. Row action: View record, Request renewal (reviewer, Expiring / Expired;
       the record's ModalV2), or View decision for a company that was not approved. Rows open the record.
       Data: src/modules/prequal/data/records.js (recordRows), columns: src/modules/prequal/recordColumns.js.
       Loading (docs/5-ui-patterns.md §6), as the review queue: rows come from a (mock) request; the shell, title bar
       and filters stay put. First load: the grid header shows at once and skeleton rows appear only if the answer takes
       > 200ms. A filter change re-queries and keeps the current rows with "Updating…" in place of the count. -->
  <PrequalShell screen="qualified" title="Qualified subcontractors">
    <template #header-actions>
      <span class="hidden sm:inline-flex items-center gap-space-8">
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">View as</span>
        <SegmentedControl v-model="role" :options="roleOptions" aria-label="View as" size="md" />
      </span>
      <Button label="New request" color-scheme="primary" variant="solid" size="medium" @onClick="newRequest" />
    </template>

    <template #content>
      <div class="flex h-full min-h-0 flex-col gap-space-16">
        <div class="flex flex-wrap items-end gap-x-space-16 gap-y-space-8" aria-label="Filters">
          <SelectV2
            class="w-full sm:w-1/3 lg:w-1/5"
            label="Status"
            placeholder="Any status"
            :options="statusOptions"
            :value="statusFilter"
            :multiple="true"
            :show-checkmark-on-selected="true"
            :allow-search="false"
            :clearable="true"
            @input="statusFilter = $event || []"
          />
          <SelectV2
            class="w-full sm:w-1/3 lg:w-1/5"
            label="Trade"
            placeholder="Any trade"
            :options="tradeOptions"
            :value="tradeFilter"
            :multiple="true"
            :show-checkmark-on-selected="true"
            :clearable="true"
            @input="tradeFilter = $event || []"
          />
          <LoadStatus :load="load" @retry="fetch">{{ summary }}</LoadStatus>
        </div>

        <LoadRegion v-slot="{ skeleton }" class="min-h-0 w-full min-w-0 flex-1" :load="load" content-loads @retry="fetch">
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
        </LoadRegion>
      </div>

      <RenewalModal
        v-if="renewalRow"
        :open="renewalOpen"
        :documents="renewalRow.record.documents"
        :contact="renewalContact"
        :company-name="renewalRow.companyName"
        :now="today"
        @send="sendRenewal"
        @close="renewalOpen = false"
      />
    </template>
  </PrequalShell>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import LoadRegion from '~/candidates/LoadRegion/LoadRegion.vue';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import { TODAY, companyById } from '~/modules/prequal/data';
import { qualifiedRows, qualifiedColumns, qualifiedActionLabel, statusKey, STATUS_OPTIONS } from '~/modules/prequal/recordColumns';
import { go } from '~/modules/prequal/router';
import RenewalModal from '~/prototypes/prequal-record/components/RenewalModal.vue';

export default {
  name: 'PrequalQualified',
  prototype: {
    title: 'Preconstruction › Prequalification › Qualified subcontractors',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3818-6279',
  },
  components: { PrequalShell, Button, DataGrid, SegmentedControl, SelectV2, RenewalModal, LoadRegion, LoadStatus },
  data() {
    return {
      role: 'reviewer',
      roleOptions: [
        { label: 'Reviewer', value: 'reviewer' },
        { label: 'Estimator', value: 'estimator' },
      ],
      statusOptions: STATUS_OPTIONS,
      statusFilter: [],
      tradeFilter: [],
      renewalOpen: false,
      renewalRow: null,
      today: TODAY,
      sent: {},
      rows: [],
      total: 0,
      load: createLoad({ label: 'qualified subcontractors' }),
    };
  },
  computed: {
    tradeOptions() {
      // The filter's options don't wait for the rows (filters render at once): the trade list is the roster's, as a
      // server would return with the filter definition.
      const trades = [...new Set(qualifiedRows(this.$moment).flatMap((r) => r.trade.split(' · ')))].sort();
      return trades.map((t) => ({ label: t, value: t }));
    },
    summary() {
      // Nothing until the first answer: a "0 companies" before loading would be a false result.
      if (!this.load.hasData) return '';
      const n = this.rows.length;
      const all = this.total;
      return n === all ? `${all} companies` : `${n} of ${all} companies`;
    },
    columns() {
      return qualifiedColumns(this.role, (row) => this.act(row));
    },
    renewalContact() {
      return this.renewalRow ? companyById[this.renewalRow.id].contact : '';
    },
  },
  watch: {
    // Filters are queried, as they would be on the server: the selects answer at once, the rows follow.
    statusFilter: 'fetch',
    tradeFilter: 'fetch',
  },
  created() {
    this.fetch();
  },
  beforeDestroy() {
    this.load.destroy();
  },
  methods: {
    fetch() {
      const { statusFilter, tradeFilter } = this;
      this.load.run(
        (signal) =>
          mockRequest(() => {
            const all = qualifiedRows(this.$moment);
            const rows = all.filter(
              (r) =>
                (!statusFilter.length || statusFilter.includes(statusKey(r))) &&
                (!tradeFilter.length || r.trade.split(' · ').some((t) => tradeFilter.includes(t))),
            );
            return { rows, total: all.length };
          }, { signal }),
        ({ rows, total }) => {
          this.rows = rows;
          this.total = total;
        },
      );
    },
    openRow({ row }) {
      if (!row) return;
      go(row.record ? 'record' : 'review', row.requestId);
    },
    act(row) {
      if (qualifiedActionLabel(this.role)(row) === 'Request renewal') {
        this.renewalRow = row;
        this.renewalOpen = true;
      } else {
        this.openRow({ row });
      }
    },
    sendRenewal({ ids }) {
      // The record screen keeps the audit trail; here the request just closes the modal (data is static).
      this.$set(this.sent, this.renewalRow.id, ids.length);
      this.renewalOpen = false;
    },
    newRequest() {
      go('wizard');
    },
  },
};
</script>
