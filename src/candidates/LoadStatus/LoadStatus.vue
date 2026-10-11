<template>
  <!-- CANDIDATE 2026-10-10: proposed design-system component, see docs/components/LoadingStates.md. Not a prototype-local widget.
       The small, non-blocking loading line for a LoadRegion, placed where the page already shows a meta line (a result
       count, "Saved 2 min ago"). Shows the default slot normally; while a load runs past the delay it shows an
       indeterminate spinner and "Loading…" / "Updating…" / "Still loading…" (no percentages or stages); after a
       failed refresh, "Couldn't update." with Retry, keeping the content. Screen readers hear LoadRegion's live region. -->
  <span class="inline-flex min-w-0 items-center gap-space-8 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
    <template v-if="load.status === 'loading' && load.indicator">
      <StatusIndicator type="spinner" size="sm" decorative />
      <span>{{ text }}</span>
      <Button v-if="cancellable && load.slow" label="Cancel" color-scheme="secondary" variant="minimal" size="small" @onClick="load.cancel()" />
    </template>
    <template v-else-if="load.status === 'error' && load.hasData">
      <span role="alert">Couldn't update.</span>
      <Button label="Retry" color-scheme="secondary" variant="minimal" size="small" @onClick="$emit('retry')" />
    </template>
    <slot v-else />
  </span>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';

export default {
  name: 'LoadStatus',
  components: { Button, StatusIndicator },
  props: {
    /** Controller from createLoad() (~/candidates/LoadRegion/createLoad.js), shared with the LoadRegion. */
    load: { type: Object, required: true },
    /** Offer Cancel once the load is slow. */
    cancellable: { type: Boolean, default: true },
  },
  computed: {
    text() {
      if (this.load.slow) return 'Still loading…';
      return this.load.hasData ? 'Updating…' : 'Loading…';
    },
  },
};
</script>
