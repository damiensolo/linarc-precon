<template>
  <!-- First-load placeholder for the audit trail (docs/5-ui-patterns.md §6): heading, then entries of action + time in
       AuditTrail's own spacing. -->
  <div class="flex flex-col gap-space-8" aria-hidden="true">
    <Skeleton size="md" class="w-1/3" />
    <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
      <li v-for="n in 5" :key="n" class="flex flex-col gap-space-2 py-space-12">
        <Skeleton class="w-full" />
        <Skeleton class="w-2/3" />
        <Skeleton shape="block" class="h-space-16 w-1/2" />
      </li>
    </ul>
  </div>
</template>

<script>
import Skeleton from '~/candidates/Skeleton/Skeleton.vue';

export default {
  name: 'AuditTrailSkeleton',
  components: { Skeleton },
};
</script>
