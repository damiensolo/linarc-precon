<template>
  <!-- Shared shell for GC-side Prequalification screens (D-13): Preconstruction top nav (Bookmarks hidden),
       Side Nav Preconstruction rail for the selected tool, AppLayout for the page. Figma: Top Nav Bar
       Module=Preconstruction (40024068:91824), Side Nav Preconstruction (40024068:92254), Title Bar / Page.
       The rail's selector bar is the module accent, icon/accent/teal (as in Figma and the top nav's Precon teal);
       without it SideNavV2 falls back to surface/primary blue (fixed 2026-10-11, F-063). -->
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
      :account="account"
      :overflow="overflow"
      :user-details="{ name: 'Alex Morgan', email: 'alex@example.com' }"
      @tool-click="onTool"
      @account-click="onAccountClick"
    />

    <div class="flex flex-1 min-h-0">
      <SideNavV2
        class="hidden md:flex h-full shrink-0"
        :aria-label="currentTool.label"
        :module-list="rail"
        :selected-id="selectedNav"
        selector-color="var(--icon-accent-teal)"
        @click="onNav"
      />

      <AppLayout
        class="flex-1 min-w-0"
        :left-panel-enabled="false"
        :right-panel-enabled="rightPanel"
        :right-panel-visible="rightPanel"
        :bottom-panel-enabled="bottomPanel"
        :bottom-panel-visible="bottomPanel"
        :bottom-panel-resizable="false"
        :bottom-panel-default-height="64"
        :bottom-panel-min-height="64"
        :no-bottom-padding="true"
        :scrollable-content="scrollableContent"
        :persist-preferences="false"
        :header-size="headerSize"
      >
        <template #header>
          <!-- Default: Title Bar / Page (title only). Create screens pass their own (Title Bar / Workflow). -->
          <slot name="header">
            <span class="font-label font-bold text-fontsize-16 leading-lineheight-24 text-text-default">{{ title }}</span>
          </slot>
        </template>
        <template #header-actions>
          <slot name="header-actions" />
        </template>
        <template #content>
          <slot name="content" />
        </template>
        <template v-if="rightPanel" #right-panel>
          <slot name="right-panel" />
        </template>
        <template v-if="bottomPanel" #bottom-panel>
          <slot name="bottom-panel" />
        </template>
      </AppLayout>
    </div>
  </div>
</template>

<script>
// PROTOTYPE-CHANGE P-014: library-local until it moves into @development/linarc-icons.
import PreconstructionModuleIcon from '@/components/TopNavBar/ModuleIcon/PreconstructionModuleIcon.js';
import TopNavBar from '@/components/TopNavBar/index.vue';
import SideNavV2 from '@/componentsV2/SideNavV2/SideNavV2.vue';
import AppLayout from '@/componentsV2/AppLayout/AppLayout.vue';
import { preconTools, preconRails, projects, places } from './nav';
import { go, isBuilt } from './router';
import { accountWithSettings, overflowWithSettings, onAccountClick } from '~/modules/sandbox';

export default {
  name: 'PrequalShell',
  components: { TopNavBar, SideNavV2, AppLayout },
  props: {
    /** Screen name from router.js (dashboard, queue, qualified, review, record …); selects the rail item. */
    screen: { type: String, required: true },
    /** Page title shown in the title bar. */
    title: { type: String, required: true },
    rightPanel: { type: Boolean, default: false },
    /** Fixed 64px bar under the content (step navigation on create screens). */
    bottomPanel: { type: Boolean, default: false },
    scrollableContent: { type: Boolean, default: false },
    /** Title bar height: `comfortable` (64px, Title Bar / Workflow Size=Comfortable) on detail and create screens with a
        back button (HeaderToolIcon type="back"); list screens keep the 48px Title Bar / Page. */
    headerSize: { type: String, default: 'default' },
  },
  data() {
    // The tool whose rail lists this screen (Configure for the template screens, 2026-10-12); Prequalification otherwise.
    const owner = Object.keys(preconRails).find((tool) => preconRails[tool].some((i) => i.screen === this.screen));
    return { PreconstructionModuleIcon, projects, places, selectedTool: owner || 'prequalification' };
  },
  computed: {
    account() {
      return accountWithSettings({ announcement: true, message: true, chatSupport: true, help: true, notifications: true, profile: true });
    },
    overflow() {
      return overflowWithSettings();
    },
    tools() {
      return preconTools.map((t) => ({ ...t, isSelected: t.id === this.selectedTool }));
    },
    currentTool() {
      return preconTools.find((t) => t.id === this.selectedTool);
    },
    rail() {
      return preconRails[this.selectedTool];
    },
    selectedNav() {
      const item = this.rail.find((i) => i.screen === this.screen);
      return item ? item.id : this.rail[0].id;
    },
  },
  methods: {
    onAccountClick,
    onTool({ id }) {
      if (preconRails[id]) this.selectedTool = id;
    },
    onNav({ id }) {
      const item = this.rail.find((i) => i.id === id);
      // Only screens that exist as prototypes navigate; the rest are inert until built.
      if (item && item.screen && item.screen !== this.screen && isBuilt(item.screen)) go(item.screen);
    },
  },
};
</script>
