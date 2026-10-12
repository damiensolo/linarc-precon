<template>
  <!-- Preconstruction › Prequalification › Qualified Subs: the GC's qualified subcontractor list (screen 7, PRD UX
       "Qualified subcontractor list"). One row per company; the status is the lifecycle once approved (one signal per
       status, D-16/D-17), with the conditions count beside it. Filters live in the grid's Filter panel (D-30,
       2026-10-12; were two SelectV2 multi-selects above the table): Status (is / is any of …), Trade (a company matches
       on any of its trades), Valid until and Number of conditions, with quick filters Renewal needed soon, Current, No
       longer active, Has conditions and Expires in 30 days. The Filter button's badge shows the active conditions and
       the panel clears them (no count line or Clear link above the table, asked 2026-10-12). No KPI cards: this is a roster, not a pipeline. Row action: View record, Request renewal (reviewer, Expiring / Expired;
       the record's ModalV2), or View decision for a company that was not approved. Rows open the record.
       Data: src/modules/prequal/data/records.js (recordRows), columns: src/modules/prequal/recordColumns.js.
       Loading (docs/5-ui-patterns.md §6), as the review queue: rows come from a (mock) request; the shell, title bar
       stay put. First load: the grid header shows at once and skeleton rows appear only if the answer takes > 200ms.
       Filtering happens in the grid (no re-query). -->
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
        <LoadRegion v-slot="{ skeleton }" class="min-h-0 w-full min-w-0 flex-1" :load="load" content-loads @retry="fetch">
          <DataGrid
            class="min-h-0 w-full min-w-0 flex-1"
            :quick-filters="quickFilters"
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
import LoadRegion from '~/candidates/LoadRegion/LoadRegion.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import { TODAY, companyById } from '~/modules/prequal/data';
import { qualifiedRows, qualifiedColumns, qualifiedActionLabel, qualifiedQuickFilters, tradeOptions } from '~/modules/prequal/recordColumns';
import { go } from '~/modules/prequal/router';
import RenewalModal from '~/prototypes/prequal-record/components/RenewalModal.vue';

export default {
  name: 'PrequalQualified',
  prototype: {
    title: 'Preconstruction › Prequalification › Qualified subcontractors',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3818-6279',
  },
  components: { PrequalShell, Button, DataGrid, SegmentedControl, RenewalModal, LoadRegion },
  data() {
    return {
      role: 'reviewer',
      roleOptions: [
        { label: 'Reviewer', value: 'reviewer' },
        { label: 'Estimator', value: 'estimator' },
      ],
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
      // The filter's options don't wait for the rows: the trade list is the roster's, as a server would return with
      // the filter definition.
      return tradeOptions(qualifiedRows(this.$moment));
    },
    quickFilters() {
      return qualifiedQuickFilters(this.$moment);
    },
    columns() {
      return qualifiedColumns(this.role, (row) => this.act(row), this.tradeOptions);
    },
    renewalContact() {
      return this.renewalRow ? companyById[this.renewalRow.id].contact : '';
    },
  },
  created() {
    this.fetch();
  },
  beforeDestroy() {
    this.load.destroy();
  },
  methods: {
    fetch() {
      this.load.run(
        (signal) =>
          mockRequest(() => {
            const all = qualifiedRows(this.$moment);
            return { rows: all, total: all.length };
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
