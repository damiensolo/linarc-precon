<template>
  <!-- First-load placeholder for the record column (docs/5-ui-patterns.md §6), in the final layout so nothing jumps:
       meta line, the four key facts (label + value), Approved for (column header + rows), Conditions, and for
       reviewers Monitoring (heading + count, document rows). Skeleton pieces only; LoadRegion keeps it aria-hidden. -->
  <div class="flex flex-col gap-space-40">
    <!-- The meta line wraps to two lines below xl (the audit panel narrows the column from lg). -->
    <div class="flex flex-col">
      <Skeleton class="w-full xl:w-2/3" />
      <Skeleton class="w-1/2 xl:hidden" />
    </div>

    <div class="flex flex-col gap-space-40">
      <div class="grid grid-cols-1 gap-space-20 sm:grid-cols-2 xl:grid-cols-4">
        <!-- Status: in the title bar from md up, here below that. -->
        <div class="flex flex-col gap-space-4 md:hidden">
          <Skeleton shape="block" class="h-space-16 w-1/3" />
          <Skeleton class="w-1/2" />
        </div>
        <div v-for="n in 4" :key="n" class="flex flex-col gap-space-4">
          <Skeleton shape="block" class="h-space-16 w-1/3" />
          <!-- Valid until: expiry line + "in N days" + the driver caption, the tallest fact (sets the row height). -->
          <div v-if="n === 2" class="flex flex-col gap-space-2">
            <div class="flex flex-col">
              <Skeleton class="w-2/3" />
              <Skeleton shape="block" class="hidden h-space-16 w-1/3 xl:block" />
            </div>
            <Skeleton shape="block" class="h-space-16 w-full" />
          </div>
          <Skeleton v-else class="w-2/3" />
        </div>
      </div>

      <section class="flex flex-col gap-space-8">
        <Skeleton size="md" class="w-space-124" />
        <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
          <li class="hidden py-space-8 sm:block"><Skeleton shape="block" class="h-space-16 w-full" /></li>
          <!-- One row from sm up; trade / scope / limits stack below that. -->
          <li v-for="n in 2" :key="n" class="flex flex-col gap-space-2 py-space-12">
            <Skeleton class="w-full" />
            <Skeleton class="w-2/3 sm:hidden" />
            <Skeleton class="w-1/2 sm:hidden" />
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-space-8">
        <Skeleton size="md" class="w-space-124" />
        <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
          <li v-for="n in 2" :key="n" class="flex flex-col gap-space-4 py-space-12">
            <Skeleton class="w-2/3" />
            <Skeleton shape="block" class="h-space-16 w-1/2" />
          </li>
        </ul>
      </section>
    </div>

    <section v-if="reviewer" class="flex flex-col gap-space-8">
      <div class="flex flex-wrap items-center justify-between gap-x-space-16 gap-y-space-4">
        <Skeleton size="md" class="w-space-124" />
        <Skeleton class="w-1/4" />
      </div>
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <li v-for="n in 4" :key="n" class="grid grid-cols-1 items-center gap-x-space-24 gap-y-space-8 py-space-12 sm:grid-cols-12">
          <span class="flex flex-col gap-space-2 sm:col-span-5">
            <Skeleton class="w-2/3" />
            <Skeleton shape="block" class="h-space-16 w-1/2" />
          </span>
          <Skeleton shape="block" class="h-space-36 w-full sm:col-span-4" />
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import Skeleton from '~/candidates/Skeleton/Skeleton.vue';

export default {
  name: 'RecordSkeleton',
  components: { Skeleton },
  props: {
    /** Reviewers also see Monitoring (Estimator/PM doesn't). */
    reviewer: { type: Boolean, default: true },
  },
};
</script>
