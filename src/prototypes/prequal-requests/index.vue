<template>
  <!-- Preconstruction › Prequalification › Requests (D-13). Layout and table from Documentation 1708:58317 (1440×1024).
       Shell (top nav, rail, title bar) comes from PrequalShell; this file is the page content only. -->
  <PrequalShell screen="requests" title="Requests">
    <template #header-actions>
      <span class="hidden sm:inline-flex items-center gap-space-2">
        <StatusIndicator type="dot" status="active" />
        <!-- GAP: Workflow Status label is italic 11px in Figma (unbound, off-scale); nearest token is fontsize-12. -->
        <span class="font-label italic text-fontsize-12 leading-lineheight-16 text-text-subtle">
          Last updated 3 minutes ago
        </span>
      </span>
      <Button label="Add Contractor" color-scheme="primary" variant="solid" size="medium">
        <template #leftIcon><Plus /></template>
      </Button>
    </template>

    <template #content>
      <DataGrid
        class="flex-1 min-h-0 min-w-0 w-full"
        :data="rows"
        :header="columns"
        id-field="id"
        :views="['grid', 'list', 'kanban', 'gantt', 'lookahead']"
        default-view="list"
        :views-feature-enabled="true"
        :view-tabs="[]"
        :show-print="true"
        :show-save-template="true"
        :application-should-handle-download="true"
        :row-height="40"
        height="100%"
      />
    </template>
  </PrequalShell>
</template>

<script>
import { Plus, Sparkles } from '@development/linarc-icons';
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';
import Button from '@/components/Button/Button.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import { packages } from './data';

export default {
  name: 'PrequalRequests',
  prototype: {
    title: 'Preconstruction › Prequalification › Requests',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3726-76047',
  },
  components: { PrequalShell, StatusIndicator, Button, DataGrid, Plus },
  data() {
    return {
      rows: packages,
      // Widths from the Figma columns (56 / 280 / 180 / 143 / 252 / 166 / 252).
      columns: [
        { field: 'id', label: '', type: 'Sequence', width: 56, readonly: true, frozen: true },
        { field: 'title', label: 'TITLE NAME', type: 'ShortText', width: 280, readonly: true },
        { field: 'specCode', label: 'SPECIFICATION CODE', type: 'ShortText', width: 180, readonly: true },
        { field: 'packageNo', label: 'PACKAGE NO', type: 'ShortText', width: 143, readonly: true },
        {
          field: 'source',
          label: 'SOURCE',
          type: 'ShortText',
          width: 252,
          readonly: true,
          cell: {
            // Figma: Data Table / Cell, Type=AI Chip + Text → Status Chip (Status=AI). Library slot added in P-002.
            left: {
              type: 'status-chip',
              componentProps: { status: 'ai', type: 'icon', leftItem: Sparkles, label: 'Chip' },
              visible: (row) => row.aiSource,
            },
            center: { type: 'text' },
          },
        },
        { field: 'createdOn', label: 'CREATED ON', type: 'DateInput', width: 166, readonly: true },
        { field: 'description', label: 'DESCRIPTION', type: 'ShortText', width: 252, flex: 1, readonly: true },
      ],
    };
  },
};
</script>
