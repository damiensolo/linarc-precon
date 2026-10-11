<template>
  <!-- Preconstruction › Prequalification › Review Queue: the reviewer's work list (screen 8, PRD UX "Review queue").
       Requests with a submission (Ready for review, GC is reviewing, More information needed), the PRD's columns
       (request state, recommendation, score · confidence, findings, checks, assigned reviewer, last activity) and its
       five quick filters as a SegmentedControl plus "Assigned to me". No KPI cards: the Overview has the pipeline.
       Row action: Review now (ready) or Open → the review screen. Data and columns: src/modules/prequal/queueColumns.js. -->
  <PrequalShell screen="queue" title="Review queue">
    <template #header-actions>
      <Button label="New request" color-scheme="primary" variant="solid" size="medium" @onClick="newRequest" />
    </template>

    <template #content>
      <div class="flex h-full min-h-0 flex-col gap-space-16">
        <div class="flex flex-wrap items-center gap-x-space-16 gap-y-space-8" aria-label="Filters">
          <SegmentedControl v-model="filter" :options="filterOptions" aria-label="Queue filter" size="md" />
          <Checkbox :value="mine" label="Assigned to me" size="small" @input="mine = $event" />
          <span class="font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ summary }}</span>
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
    </template>
  </PrequalShell>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import { queueRows, queueColumns, QUEUE_FILTERS, ME } from '~/modules/prequal/queueColumns';
import { go } from '~/modules/prequal/router';

export default {
  name: 'PrequalQueue',
  prototype: {
    title: 'Preconstruction › Prequalification › Review queue',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3818-5154',
  },
  components: { PrequalShell, Button, Checkbox, DataGrid, SegmentedControl },
  data() {
    return {
      filter: 'all',
      filterOptions: QUEUE_FILTERS.map((f) => ({ label: f.label, value: f.id })),
      mine: false,
    };
  },
  computed: {
    rows() {
      return queueRows(this.$moment);
    },
    filteredRows() {
      const f = QUEUE_FILTERS.find((x) => x.id === this.filter);
      return this.rows.filter((r) => f.test(r) && (!this.mine || r.reviewer === ME));
    },
    summary() {
      const n = this.filteredRows.length;
      const all = this.rows.length;
      return n === all ? `${all} requests` : `${n} of ${all} requests`;
    },
    columns() {
      return queueColumns((row) => this.openRow({ row }));
    },
  },
  methods: {
    openRow({ row }) {
      if (row) go('review', row.id);
    },
    newRequest() {
      go('wizard');
    },
  },
};
</script>
