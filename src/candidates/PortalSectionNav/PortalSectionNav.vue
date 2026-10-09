<template>
  <!-- CANDIDATE 2026-10-09: proposed design-system component, see docs/components/PortalSectionNav.md.
       Grouped section list with a completion state per row, for multi-step applications (the subcontractor portal).
       SideNavV2 is the 82px icon rail and doesn't fit; this is the wide, labelled form. -->
  <nav class="portal-section-nav flex flex-col gap-space-16 font-label" :aria-label="ariaLabel">
    <div v-for="group in groups" :key="group.id" class="flex flex-col gap-space-2">
      <span v-if="group.label" class="px-space-12 pb-space-4 text-fontsize-12 font-bold uppercase leading-lineheight-16 tracking-letterspacing-4 text-text-soft">
        {{ group.label }}
      </span>
      <button
        v-for="item in group.items"
        :key="item.id"
        type="button"
        class="flex w-full items-center gap-space-8 rounded-radius-4 px-space-12 py-space-8 text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-primary-focused"
        :class="item.id === selected ? 'bg-surface-select-opaque text-text-primary' : 'text-text-default hover:bg-surface-subtle'"
        :aria-current="item.id === selected ? 'page' : undefined"
        @click="$emit('select', item.id)"
      >
        <StatusIndicator v-if="item.state" type="dot" :status="dotFor(item.state)" aria-hidden="true" />
        <span v-else class="inline-block w-space-8" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-fontsize-14 leading-lineheight-20">{{ item.label }}</span>
        <span v-if="item.state" class="shrink-0 text-fontsize-12 leading-lineheight-16" :class="stateTextClass(item.state)">
          {{ stateLabel(item.state) }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script>
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';
import { SECTION } from '~/modules/prequal/status';

// Section completion → StatusIndicator dot (complete = workflow green, indeterminate = blue, standby = yellow, disabled = grey).
const DOT = { complete: 'complete', submitted: 'complete', 'in-progress': 'indeterminate', 'needs-attention': 'standby', 'not-started': 'disabled' };
const TEXT = { complete: 'text-text-success', submitted: 'text-text-success', 'in-progress': 'text-text-subtle', 'needs-attention': 'text-text-warning-low', 'not-started': 'text-text-soft' };

export default {
  name: 'PortalSectionNav',
  components: { StatusIndicator },
  props: {
    /** [{ id, label, items: [{ id, label, state? }] }] — state keys from SECTION in status.js; omit for plain rows. */
    groups: { type: Array, required: true },
    selected: { type: String, default: '' },
    ariaLabel: { type: String, default: 'Application sections' },
  },
  methods: {
    dotFor(state) {
      return DOT[state] || 'disabled';
    },
    stateLabel(state) {
      return SECTION[state] ? SECTION[state].label : '';
    },
    stateTextClass(state) {
      return TEXT[state] || 'text-text-soft';
    },
  },
};
</script>
