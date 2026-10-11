<template>
  <!-- CANDIDATE 2026-10-10: proposed design-system component, see docs/components/LoadingStates.md. Not a prototype-local widget.
       Figma: the bar of Data Table / Sheet Cell Type=Skeleton Loader (40016391:36860): surface/neutral, radius-6, as tall
       as the line box it stands in for. Code adds a restrained shimmer; static under prefers-reduced-motion. -->
  <span class="skeleton block shrink-0 bg-surface-neutral" :class="shapeClasses" aria-hidden="true" />
</template>

<script>
// Line heights of the text styles a line stands in for: label/sm 20, label/md 24, heading 28.
const LINE_HEIGHT = { sm: 'h-space-20', md: 'h-space-24', lg: 'h-space-28' };

export default {
  name: 'Skeleton',
  props: {
    /** line (one line of text; width from the parent's class) | block (any box; size from class) | circle (size from class). */
    shape: { type: String, default: 'line', validator: (v) => ['line', 'block', 'circle'].includes(v) },
    /** For `line`: the text style it replaces. sm = 14/20, md = 16/24, lg = 20/28. */
    size: { type: String, default: 'sm', validator: (v) => v in LINE_HEIGHT },
  },
  computed: {
    shapeClasses() {
      if (this.shape === 'circle') return 'rounded-radius-round';
      if (this.shape === 'block') return 'rounded-radius-6';
      return ['rounded-radius-6', LINE_HEIGHT[this.size]];
    },
  },
};
</script>

<style scoped>
/* One highlight band sweeps left → right across the viewport; background-attachment: fixed keeps every skeleton on
   the page in phase, so the sweep reads as one light, not many. --skeleton-shimmer-ms is the configurable cycle. */
.skeleton {
  background-image: linear-gradient(90deg, var(--surface-neutral) 40%, var(--surface-soft) 50%, var(--surface-neutral) 60%);
  background-size: 200vw 100%;
  background-attachment: fixed;
  animation: skeleton-shimmer var(--skeleton-shimmer-ms, 1600ms) linear infinite;
}

@keyframes skeleton-shimmer {
  from {
    background-position: -150vw 0;
  }
  to {
    background-position: 50vw 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background-image: none;
  }
}
</style>
