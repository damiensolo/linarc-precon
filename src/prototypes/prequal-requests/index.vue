<template>
  <!-- Preconstruction › Prequalification › Requests: the plain list of all requests, same rows and columns as the
       Overview (dashboard) without the KPI cards. Kept while we decide whether it stays on the rail (plan Q1);
       the Overview is the richer screen. Shell from PrequalShell; data and columns from src/modules/prequal. -->
  <PrequalShell screen="requests" title="Requests">
    <template #header-actions>
      <span class="hidden sm:inline-flex items-center gap-space-8">
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">View as</span>
        <SegmentedControl v-model="role" :options="roleOptions" aria-label="View as" size="md" />
      </span>
      <Button label="New request" color-scheme="primary" variant="solid" size="medium" @onClick="newRequest" />
    </template>

    <template #content>
      <DataGrid
        class="min-h-0 w-full min-w-0 flex-1"
        :data="rows"
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
    </template>
  </PrequalShell>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import { requestGridRows, requestColumns, screenFor } from '~/modules/prequal/requestColumns';
import { go } from '~/modules/prequal/router';

export default {
  name: 'PrequalRequests',
  prototype: {
    title: 'Preconstruction › Prequalification › Requests',
    // Reference frame still shows the package-list table it was built from (2026-10-08); the request data is newer.
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3726-76047',
  },
  components: { PrequalShell, Button, DataGrid, SegmentedControl },
  data() {
    return {
      role: 'reviewer',
      roleOptions: [
        { label: 'Reviewer', value: 'reviewer' },
        { label: 'Estimator', value: 'estimator' },
      ],
    };
  },
  computed: {
    rows() {
      return requestGridRows(this.$moment);
    },
    columns() {
      return requestColumns(this.role, (row) => this.openRow({ row }));
    },
  },
  methods: {
    openRow({ row }) {
      if (row) go(screenFor(row), row.id);
    },
    newRequest() {
      go('wizard');
    },
  },
};
</script>
