<template>
  <!-- Preconstruction › Prequalification › Qualified Subs: the GC's qualified subcontractor list (screen 7, PRD UX
       "Qualified subcontractor list"). One row per company; the status is the lifecycle once approved (one signal per
       status, D-16/D-17), with the conditions count beside it. Filters: Status and Trade (SelectV2, multiple), no KPI
       cards: this is a roster, not a pipeline. Row action: View record, Request renewal (reviewer, Expiring / Expired;
       the record's ModalV2), or View decision for a company that was not approved. Rows open the record.
       Data: src/modules/prequal/data/records.js (recordRows), columns: src/modules/prequal/recordColumns.js. -->
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
          <span class="pb-space-8 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ summary }}</span>
        </div>

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
  components: { PrequalShell, Button, DataGrid, SegmentedControl, SelectV2, RenewalModal },
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
    };
  },
  computed: {
    rows() {
      return qualifiedRows(this.$moment);
    },
    tradeOptions() {
      const trades = [...new Set(this.rows.flatMap((r) => r.trade.split(' · ')))].sort();
      return trades.map((t) => ({ label: t, value: t }));
    },
    filteredRows() {
      return this.rows.filter(
        (r) =>
          (!this.statusFilter.length || this.statusFilter.includes(statusKey(r))) &&
          (!this.tradeFilter.length || r.trade.split(' · ').some((t) => this.tradeFilter.includes(t))),
      );
    },
    summary() {
      const n = this.filteredRows.length;
      const all = this.rows.length;
      return n === all ? `${all} companies` : `${n} of ${all} companies`;
    },
    columns() {
      return qualifiedColumns(this.role, (row) => this.act(row));
    },
    renewalContact() {
      return this.renewalRow ? companyById[this.renewalRow.id].contact : '';
    },
  },
  methods: {
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
