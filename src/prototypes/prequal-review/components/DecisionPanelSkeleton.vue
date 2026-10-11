<template>
  <!-- First-load placeholder for the Decision panel (docs/5-ui-patterns.md §6): heading + four readiness rows, the four
       decision buttons (medium = 32), the request facts and recent activity, in the panel's own spacing. -->
  <div class="flex flex-col gap-space-24" aria-hidden="true">
    <section class="flex flex-col gap-space-8">
      <Skeleton size="md" class="w-1/3" />
      <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
        <!-- Most readiness rows carry a detail line. -->
        <li v-for="n in 4" :key="n" class="flex flex-col py-space-8">
          <Skeleton class="w-2/3" />
          <Skeleton v-if="n > 1" shape="block" class="h-space-16 w-1/2" />
        </li>
      </ul>
    </section>
    <section class="flex flex-col gap-space-8">
      <Skeleton v-for="n in 4" :key="n" shape="block" class="h-space-32 w-full" />
      <div class="flex flex-col">
        <Skeleton shape="block" class="h-space-16 w-full" />
        <Skeleton shape="block" class="h-space-16 w-2/3" />
      </div>
    </section>
    <section class="flex flex-col gap-space-8 border-0 border-t border-solid border-border-subtle pt-space-20">
      <Skeleton class="w-1/4" />
      <Skeleton v-for="n in 5" :key="n" shape="block" class="h-space-16 w-full" />
    </section>
    <section class="flex flex-col gap-space-8">
      <Skeleton class="w-1/3" />
      <Skeleton v-for="n in 3" :key="n" shape="block" class="h-space-32 w-full" />
    </section>
  </div>
</template>

<script>
import Skeleton from '~/candidates/Skeleton/Skeleton.vue';

export default {
  name: 'DecisionPanelSkeleton',
  components: { Skeleton },
};
</script>
