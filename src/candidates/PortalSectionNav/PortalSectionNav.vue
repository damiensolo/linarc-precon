<template>
  <!-- CANDIDATE 2026-10-09: proposed design-system component, see docs/components/PortalSectionNav.md.
       Grouped section list with a completion state per row, for multi-step applications (the subcontractor portal).
       SideNavV2 is the 82px icon rail and doesn't fit; this is the wide, labelled form.
       Visual rule (2026-10-09 restyle): one signal per row. Complete = a check mark, needs attention = the state word
       in the warning colour, everything else = the state word in muted text. No coloured dots. -->
  <nav class="portal-section-nav flex flex-col gap-space-20 font-label" :aria-label="ariaLabel">
    <div v-for="group in groups" :key="group.id" class="flex flex-col gap-space-2">
      <span v-if="group.label" class="px-space-12 pb-space-4 text-fontsize-12 font-normal leading-lineheight-16 text-text-soft">
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
        <span class="min-w-0 flex-1 truncate text-fontsize-14 leading-lineheight-20">{{ item.label }}</span>
        <template v-if="item.state">
          <Check v-if="isComplete(item.state)" :size="16" :stroke-width="2" class="shrink-0 text-icon-default" :aria-label="stateLabel(item.state)" />
          <span v-else class="shrink-0 text-fontsize-12 leading-lineheight-16" :class="stateTextClass(item.state)">
            {{ stateLabel(item.state) }}
          </span>
        </template>
      </button>
    </div>
  </nav>
</template>

<script>
import { Check } from '@development/linarc-icons';
import { SECTION } from '~/modules/prequal/status';

const COMPLETE = ['complete', 'submitted'];
// Only "needs attention" carries colour: it is the one state the user must act on.
const TEXT = { 'needs-attention': 'text-text-warning-low' };

export default {
  name: 'PortalSectionNav',
  components: { Check },
  props: {
    /** [{ id, label, items: [{ id, label, state? }] }] — state keys from SECTION in status.js; omit for plain rows. */
    groups: { type: Array, required: true },
    selected: { type: String, default: '' },
    ariaLabel: { type: String, default: 'Application sections' },
  },
  methods: {
    isComplete(state) {
      return COMPLETE.includes(state);
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
