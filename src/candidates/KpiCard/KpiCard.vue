<template>
  <!-- CANDIDATE 2026-10-08: proposed design-system component, see docs/components/KpiCard.md. Not a prototype-local widget.
       A count + label that answers one question at a glance; clicking it filters the list below. -->
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    class="kpi-card flex w-full min-w-0 flex-col items-start gap-space-4 rounded-radius-6 bg-surface-container px-space-20 py-space-16 text-left outline outline-1 -outline-offset-1 outline-border-subtle"
    :class="[
      interactive ? 'cursor-pointer hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-primary-focused' : '',
      selected ? 'bg-surface-select-opaque outline-2 -outline-offset-2 outline-border-primary' : '',
    ]"
    :aria-pressed="interactive ? String(selected) : undefined"
    @click="onClick"
  >
    <span class="flex w-full min-w-0 items-center gap-space-8">
      <component :is="icon" v-if="icon" :size="16" :stroke-width="1.5" class="shrink-0" :class="iconToneClass" aria-hidden="true" />
      <span class="truncate font-label text-fontsize-14 leading-lineheight-20 text-text-subtle" :title="label">{{ label }}</span>
    </span>
    <span v-if="loading" class="h-space-32 w-space-48 animate-pulse rounded-radius-4 bg-surface-subtle" aria-hidden="true" />
    <span v-else class="font-heading text-fontsize-28 font-bold leading-lineheight-36 tabular-nums text-text-default">{{ value }}</span>
    <span v-if="hint || $slots.default" class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">
      <slot>{{ hint }}</slot>
    </span>
  </component>
</template>

<script>
const ICON_TONE = {
  neutral: 'text-icon-default',
  info: 'text-icon-info',
  success: 'text-icon-success',
  warning: 'text-icon-warning-low',
  error: 'text-icon-error',
};

export default {
  name: 'KpiCard',
  props: {
    label: { type: String, required: true },
    value: { type: [Number, String], required: true },
    hint: { type: String, default: '' },
    /** Colours the icon only; the value stays text/default (colour is status, not decoration). */
    tone: { type: String, default: 'neutral', validator: (v) => v in ICON_TONE },
    icon: { type: [Object, Function], default: null },
    selected: { type: Boolean, default: false },
    interactive: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
  },
  computed: {
    iconToneClass() {
      return ICON_TONE[this.tone];
    },
  },
  methods: {
    onClick(event) {
      if (this.interactive) this.$emit('click', event);
    },
  },
};
</script>
