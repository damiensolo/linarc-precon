<template>
  <!-- Preconstruction › Prequalification › Review Queue: the reviewer's work list (screen 8, PRD UX "Review queue").
       Requests with a submission (Ready for review, GC is reviewing, More information needed), the PRD's columns
       (request state, recommendation, score · confidence, findings, checks, assigned reviewer, last activity) and its
       five quick filters as a SegmentedControl plus "Assigned to me". No KPI cards: the Overview has the pipeline.
       Row action: Review now (ready) or Open → the review screen. Data and columns: src/modules/prequal/queueColumns.js.
       Loading (docs/5-ui-patterns.md §6): rows come from a (mock) request; the shell, title bar and filters stay put.
       First load: the grid header shows at once and skeleton rows appear only if the answer takes > 200ms. A filter
       change re-queries and keeps the current rows with "Updating…" in place of the count. Try the sandbox Latency select. -->
  <PrequalShell screen="queue" title="Review queue">
    <template #header-actions>
      <Button label="New request" color-scheme="primary" variant="solid" size="medium" @onClick="newRequest" />
    </template>

    <template #content>
      <div class="flex h-full min-h-0 flex-col gap-space-16">
        <div class="flex flex-wrap items-center gap-x-space-16 gap-y-space-8" aria-label="Filters">
          <SegmentedControl v-model="filter" :options="filterOptions" aria-label="Queue filter" size="md" />
          <Checkbox :value="mine" label="Assigned to me" size="small" @input="mine = $event" />
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
    </template>
  </PrequalShell>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import LoadRegion from '~/candidates/LoadRegion/LoadRegion.vue';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import { queueRows, queueColumns, QUEUE_FILTERS, ME } from '~/modules/prequal/queueColumns';
import { go } from '~/modules/prequal/router';

export default {
  name: 'PrequalQueue',
  prototype: {
    title: 'Preconstruction › Prequalification › Review queue',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3818-5154',
  },
  components: { PrequalShell, Button, Checkbox, DataGrid, SegmentedControl, LoadRegion, LoadStatus },
  data() {
    return {
      filter: 'all',
      filterOptions: QUEUE_FILTERS.map((f) => ({ label: f.label, value: f.id })),
      mine: false,
      rows: [],
      total: 0,
      load: createLoad({ label: 'review queue' }),
    };
  },
  computed: {
    summary() {
      // Nothing until the first answer: a "0 requests" before loading would be a false result.
      if (!this.load.hasData) return '';
      const n = this.rows.length;
      return n === this.total ? `${n} requests` : `${n} of ${this.total} requests`;
    },
    columns() {
      return queueColumns((row) => this.openRow({ row }));
    },
  },
  watch: {
    // Filters are queried, as they would be on the server: the controls answer at once, the rows follow.
    filter: 'fetch',
    mine: 'fetch',
  },
  created() {
    this.fetch();
  },
  beforeDestroy() {
    this.load.destroy();
  },
  methods: {
    fetch() {
      const { filter, mine } = this;
      this.load.run(
        (signal) =>
          mockRequest(() => {
            const all = queueRows(this.$moment);
            const f = QUEUE_FILTERS.find((x) => x.id === filter);
            return { rows: all.filter((r) => f.test(r) && (!mine || r.reviewer === ME)), total: all.length };
          }, { signal }),
        ({ rows, total }) => {
          this.rows = rows;
          this.total = total;
        },
      );
    },
    openRow({ row }) {
      if (row) go('review', row.id);
    },
    newRequest() {
      go('wizard');
    },
  },
};
</script>
