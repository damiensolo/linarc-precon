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
          <!-- Cross-linked with the grid's Filter panel (2026-10-12): a view other than All is a "Queue view is …"
               condition (Filter shows 1); the same views are quick filters in the panel, and editing or removing
               that condition there moves the segment. A panel filter that isn't one view leaves no segment selected. -->
          <SegmentedControl :value="filter" :options="filterOptions" aria-label="Queue filter" size="md" @input="pickView" />
          <Checkbox :value="mine" label="Assigned to me" size="small" @input="mine = $event" />
          <LoadStatus :load="load" @retry="fetch">{{ summary }}</LoadStatus>
        </div>

        <LoadRegion v-slot="{ skeleton }" class="min-h-0 w-full min-w-0 flex-1" :load="load" content-loads @retry="fetch">
          <DataGrid
            ref="grid"
            class="min-h-0 w-full min-w-0 flex-1"
            :quick-filters="quickFilters"
            @filter-change="onFilterChange"
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
import { queueRows, queueColumns, QUEUE_FILTERS, ME, QUEUE_VIEW_FIELD, queueQuickFilters } from '~/modules/prequal/queueColumns';

/** The single view a filter config expresses ('all' when it has no queue-view condition), or null when it's more. */
function viewOf(config) {
  if ((config.groups || []).length) return null;
  const conds = config.conditions || [];
  const views = conds.filter((c) => c.field === QUEUE_VIEW_FIELD);
  if (!views.length) return conds.length ? null : 'all';
  if (views.length > 1 || conds.length > 1) return null;
  const { operator, value } = views[0];
  if (operator === 'is') return value;
  if (operator === 'isAnyOf' && Array.isArray(value) && value.length === 1) return value[0];
  return null;
}
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
      quickFilters: queueQuickFilters,
      filtered: false,
      shown: 0,
      rows: [],
      total: 0,
      load: createLoad({ label: 'review queue' }),
    };
  },
  computed: {
    summary() {
      // Nothing until the first answer: a "0 requests" before loading would be a false result.
      if (!this.load.hasData) return '';
      const n = this.filtered ? this.shown : this.rows.length;
      return n === this.total ? `${n} requests` : `${n} of ${this.total} requests`;
    },
    columns() {
      return queueColumns((row) => this.openRow({ row }));
    },
  },
  watch: {
    // "Assigned to me" is queried, as it would be on the server; the views filter in the grid (shared with its panel).
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
      const { mine } = this;
      this.load.run(
        (signal) =>
          mockRequest(() => {
            const all = queueRows(this.$moment);
            return { rows: all.filter((r) => !mine || r.reviewer === ME), total: all.length };
          }, { signal }),
        ({ rows, total }) => {
          this.rows = rows;
          this.total = total;
          this.$nextTick(this.syncCount);
        },
      );
    },
    /** Segment → grid: replace any queue-view condition with this view's (none for All), keep the rest. */
    pickView(id) {
      this.filter = id;
      const grid = this.$refs.grid;
      if (!grid) return;
      const config = grid.getFilterService().getFilterConfig();
      if (viewOf(config) === id) return;
      const others = (config.conditions || []).filter((c) => c.field !== QUEUE_VIEW_FIELD);
      const next = id === 'all' ? others : [...others, { field: QUEUE_VIEW_FIELD, operator: 'is', value: id, join: 'and' }];
      grid.setFilters((config.groups || []).length ? { conditions: [], groups: config.groups } : next);
    },
    /** Grid → segment: the panel (quick filter, edit, Clear all) moves the segment; a mixed filter selects none. */
    onFilterChange({ filterConfig }) {
      // Views are one choice, as in the segmented control: a second view quick filter replaces the first instead
      // of AND-ing two views (which would usually match nothing).
      const conds = filterConfig.conditions || [];
      const viewConds = conds.filter((c) => c.field === QUEUE_VIEW_FIELD && c.operator === 'is');
      if (viewConds.length > 1 && !(filterConfig.groups || []).length) {
        const keep = viewConds[viewConds.length - 1];
        this.$refs.grid.setFilters(conds.filter((c) => c.field !== QUEUE_VIEW_FIELD || c === keep));
        return;
      }
      this.filter = viewOf(filterConfig);
      const groups = filterConfig.groups || [];
      this.filtered = (filterConfig.conditions || []).length + groups.length > 0;
      this.$nextTick(this.syncCount);
    },
    syncCount() {
      const grid = this.$refs.grid;
      this.shown = grid ? grid.getDisplayRowCount() : this.rows.length;
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
