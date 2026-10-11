<template>
  <!-- First-load placeholder for the review's main column (docs/5-ui-patterns.md §6), in the final layout so nothing
       jumps when the request arrives: meta line, the score strip (five label/value pairs + caption), the tab row, then
       the Overview tab (Summary, Needs your decision, Section scores). Skeleton pieces only; LoadRegion shows it after
       200ms and keeps it aria-hidden. `tracking`: a request not yet submitted (no strip; three tabs; the progress bar
       and section rows). -->
  <div class="flex flex-col gap-space-24">
    <!-- The meta line wraps to two or three lines below xl. -->
    <div class="flex flex-col">
      <Skeleton class="w-full xl:w-2/3" />
      <Skeleton class="w-full xl:hidden" />
      <Skeleton class="w-1/2 md:hidden" />
    </div>

    <div v-if="!tracking" class="flex flex-col gap-space-8">
      <div class="flex flex-wrap items-end gap-x-space-40 gap-y-space-16">
        <!-- Widths of the five label/value pairs (recommendation, score, confidence, knockouts, checks), so the strip
             wraps where the real one does. -->
        <div v-for="(w, i) in statWidths" :key="i" class="flex flex-col gap-space-2" :class="w">
          <Skeleton shape="block" class="h-space-16 w-full" />
          <Skeleton shape="block" class="h-space-28 w-2/3" />
        </div>
      </div>
      <Skeleton shape="block" class="h-space-16 w-1/2" />
    </div>

    <slot name="panel" />

    <div class="flex flex-col gap-space-24">
      <div class="flex h-space-48 items-center gap-space-40 overflow-hidden border-0 border-b border-solid border-border-subtle">
        <Skeleton v-for="n in (tracking ? 3 : 6)" :key="n" class="w-space-56 shrink-0" />
      </div>

      <div v-if="tracking" class="flex flex-col gap-space-24 pb-space-24">
        <section class="flex flex-col gap-space-8">
          <Skeleton size="md" class="w-space-124" />
          <Skeleton shape="block" class="h-space-8 w-full" />
        </section>
        <section class="flex flex-col gap-space-4">
          <Skeleton class="w-1/3" />
          <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
            <li v-for="n in 4" :key="n" class="py-space-10"><Skeleton class="w-full" /></li>
          </ul>
        </section>
      </div>

      <div v-else class="flex flex-col gap-space-40 pb-space-24">
        <section class="flex flex-col gap-space-8">
          <Skeleton size="md" class="w-space-124" />
          <Skeleton class="w-full" />
          <Skeleton class="w-full" />
          <Skeleton class="w-2/3" />
        </section>

        <section class="flex flex-col gap-space-4">
          <Skeleton size="md" class="w-1/3" />
          <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
            <li v-for="n in 3" :key="n" class="flex flex-col gap-space-8 py-space-16">
              <Skeleton size="md" class="w-2/3" />
              <Skeleton class="w-full" />
              <Skeleton class="w-1/2" />
            </li>
          </ul>
        </section>

        <section class="flex flex-col gap-space-12">
          <Skeleton size="md" class="w-space-124" />
          <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
            <li v-for="n in 5" :key="n" class="py-space-10"><Skeleton class="w-full" /></li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import Skeleton from '~/candidates/Skeleton/Skeleton.vue';

export default {
  name: 'ReviewSkeleton',
  components: { Skeleton },
  props: {
    tracking: { type: Boolean, default: false },
  },
  data() {
    return { statWidths: ['w-space-88', 'w-space-56', 'w-space-56', 'w-space-72', 'w-space-124'] };
  },
};
</script>
