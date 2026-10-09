<template>
  <!-- CANDIDATE 2026-10-09: proposed design-system component, see docs/components/InlineNotice.md.
       An in-place notice under a field or above a form section (not a toast, not a modal): tone + icon + message,
       optional title and actions. Used for declared-vs-document mismatches and submission readiness. -->
  <div
    class="inline-notice flex items-start gap-space-8 rounded-radius-4 px-space-12 py-space-8 outline outline-1 -outline-offset-1"
    :class="toneClasses.box"
    :role="tone === 'error' || tone === 'warning' ? 'alert' : 'status'"
  >
    <component :is="toneIcon" :size="16" :stroke-width="1.75" class="mt-space-2 shrink-0" :class="toneClasses.icon" aria-hidden="true" />
    <div class="flex min-w-0 flex-1 flex-col gap-space-2 font-label text-fontsize-14 leading-lineheight-20">
      <span v-if="title" class="font-bold" :class="toneClasses.text">{{ title }}</span>
      <span class="text-text-default"><slot>{{ message }}</slot></span>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-space-8 pt-space-4">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script>
import { TriangleAlert, CircleAlert, Info, CircleCheck } from '@development/linarc-icons';

const TONES = {
  warning: { icon: TriangleAlert, box: 'bg-surface-warning-low-subtle outline-border-warning-low', icon_: 'text-icon-warning-low', text: 'text-text-warning-low' },
  error: { icon: CircleAlert, box: 'bg-surface-error-subtle outline-border-error', icon_: 'text-icon-error', text: 'text-text-error' },
  info: { icon: Info, box: 'bg-surface-info-subtle outline-border-info', icon_: 'text-icon-info', text: 'text-text-info' },
  success: { icon: CircleCheck, box: 'bg-surface-success-subtle outline-border-success', icon_: 'text-icon-success', text: 'text-text-success' },
};

export default {
  name: 'InlineNotice',
  props: {
    tone: { type: String, default: 'warning', validator: (v) => v in TONES },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
  },
  computed: {
    toneIcon() {
      return TONES[this.tone].icon;
    },
    toneClasses() {
      const t = TONES[this.tone];
      return { box: t.box, icon: t.icon_, text: t.text };
    },
  },
};
</script>
