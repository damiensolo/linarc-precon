<template>
  <!-- Preconstruction › Configure › Templates: the admin's requirement templates (screen 9, PRD UX "Templates list",
       l. 797–822). One row per template: name and version, status (Draft / Active / Archived, TEMPLATE in status.js),
       a draft in progress, trades, project size and types, documents, checks, knockouts, usage, last updated.
       Filters live in the grid's Filter panel (D-30) with quick filters Active · Draft · Archived · In use. Row action:
       Edit (draft) or Open → the builder (prequal-template#<id>). New template → the builder on Basics.
       Duplicate, Archive and Preview are in the builder's title bar (one row action, D-17).
       Data: src/modules/prequal/data/templates.js; columns: src/modules/prequal/templateColumns.js.
       Loading (docs/5-ui-patterns.md §6) as the other lists: rows from a (mock) request, skeleton rows after 200ms. -->
  <PrequalShell screen="templates" title="Templates">
    <template #header-actions>
      <Button label="New template" color-scheme="primary" variant="solid" size="medium" @onClick="create" />
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
    </template>
  </PrequalShell>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import LoadRegion from '~/candidates/LoadRegion/LoadRegion.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import { templateRows, templateColumns, templateQuickFilters, tradeOptions } from '~/modules/prequal/templateColumns';
import { go } from '~/modules/prequal/router';

export default {
  name: 'PrequalTemplates',
  prototype: {
    title: 'Preconstruction › Configure › Templates',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3920-7593',
  },
  components: { PrequalShell, Button, DataGrid, LoadRegion },
  data() {
    return {
      rows: [],
      quickFilters: templateQuickFilters,
      load: createLoad({ label: 'templates' }),
    };
  },
  computed: {
    tradeOptions() {
      return tradeOptions(templateRows(this.$moment));
    },
    columns() {
      return templateColumns((row) => this.openRow({ row }), this.tradeOptions);
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
        (signal) => mockRequest(() => ({ rows: templateRows(this.$moment) }), { signal }),
        ({ rows }) => {
          this.rows = rows;
        },
      );
    },
    openRow({ row }) {
      if (row) go('template', row.id);
    },
    create() {
      go('template', 'new');
    },
  },
};
</script>
