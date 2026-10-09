<template>
  <!-- Preconstruction › Prequalification › Requests (D-13). Layout and table from Documentation 1708:58317 (1440×1024);
       top nav = Top Nav Bar Module=Preconstruction (Bookmarks hidden); side nav = Side Nav Preconstruction, one rail per tool.
       Clicking a tool switches the rail; the title follows the selected rail item. -->
  <div class="flex flex-col h-full bg-surface-page">
    <TopNavBar
      :module="{ label: 'Precon', ariaLabel: 'Preconstruction', icon: PreconstructionModuleIcon, showChevron: true }"
      :tools="{ items: tools, needBookmarks: false, needCreate: true, isAdmin: false, selectedColor: 'var(--text-accent-teal)' }"
      :context="{
        enabled: true,
        primaryLabel: 'Northern Heights',
        primaryOptions: projects,
        primarySelectedValue: 'northern-heights',
        secondaryOptions: places,
      }"
      :account="{
        enabled: true,
        show: { announcement: true, message: true, chatSupport: true, help: true, notifications: true, profile: true },
      }"
      :user-details="{ name: 'Alex Morgan', email: 'alex@example.com' }"
      @tool-click="onTool"
    />

    <div class="flex flex-1 min-h-0">
      <SideNavV2
        class="hidden md:flex h-full shrink-0"
        :aria-label="currentTool.label"
        :module-list="nav"
        :selected-id="selectedNav"
        @click="onNav"
      />

      <AppLayout
        class="flex-1 min-w-0"
        :left-panel-enabled="false"
        :right-panel-enabled="false"
        :scrollable-content="false"
        :persist-preferences="false"
      >
        <template #header>
          <span class="font-label font-bold text-fontsize-16 leading-lineheight-24 text-text-default">{{ currentItem.label }}</span>
        </template>

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
      </AppLayout>
    </div>
  </div>
</template>

<script>
import { Plus, Sparkles } from '@development/linarc-icons';
// PROTOTYPE-CHANGE P-014: library-local until it moves into @development/linarc-icons.
import PreconstructionModuleIcon from '@/components/TopNavBar/ModuleIcon/PreconstructionModuleIcon.js';
import TopNavBar from '@/components/TopNavBar/index.vue';
import SideNavV2 from '@/componentsV2/SideNavV2/SideNavV2.vue';
import AppLayout from '@/componentsV2/AppLayout/AppLayout.vue';
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';
import Button from '@/components/Button/Button.vue';
import DataGrid from '@/components/DataGrid/index.vue';
import { packages, projects, places, preconTools, preconRails } from './data';

export default {
  name: 'RegistryList',
  prototype: {
    title: 'Preconstruction › Prequalification › Requests',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=1708-58317',
  },
  components: { TopNavBar, SideNavV2, AppLayout, StatusIndicator, Button, DataGrid, Plus },
  data() {
    return {
      PreconstructionModuleIcon,
      rows: packages,
      projects,
      places,
      selectedTool: 'prequalification',
      selectedNav: 'requests',
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
  computed: {
    tools() {
      return preconTools.map((t) => ({ ...t, isSelected: t.id === this.selectedTool }));
    },
    currentTool() {
      return preconTools.find((t) => t.id === this.selectedTool);
    },
    nav() {
      return preconRails[this.selectedTool];
    },
    currentItem() {
      return this.nav.find((i) => i.id === this.selectedNav) || this.nav[0];
    },
  },
  methods: {
    onTool({ id }) {
      if (!preconRails[id]) return;
      this.selectedTool = id;
      this.selectedNav = preconRails[id][0].id;
    },
    onNav({ id }) {
      this.selectedNav = id;
    },
  },
};
</script>
