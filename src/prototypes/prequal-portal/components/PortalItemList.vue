<template>
  <!-- A list of outstanding items (Overview "Needs your attention", Review & submit buckets): one container at most,
       rows separated by hairlines, the reason in muted text, "Open" as a text action. No per-row box, no dots:
       the heading above the list says what kind of items these are. -->
  <section class="flex flex-col gap-space-8">
    <div v-if="title" class="flex flex-col gap-space-2">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">
        {{ title }} <span class="font-normal text-text-soft">{{ items.length }}</span>
      </h2>
      <p v-if="hint" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ hint }}</p>
    </div>
    <p v-if="!items.length" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-soft">{{ emptyText }}</p>
    <ul v-else class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
      <li v-for="item in items" :key="item.id" class="flex items-center gap-space-12 py-space-8">
        <div class="flex min-w-0 flex-1 flex-col font-label">
          <span class="truncate text-fontsize-14 leading-lineheight-20 text-text-default">{{ item.label }}</span>
          <span class="truncate text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ item.reason }}</span>
        </div>
        <Button label="Open" color-scheme="primary" variant="text" size="small" @onClick="$emit('open', item)" />
      </li>
    </ul>
  </section>
</template>

<script>
import Button from '@/components/Button/Button.vue';

export default {
  name: 'PortalItemList',
  components: { Button },
  props: {
    items: { type: Array, required: true },
    title: { type: String, default: '' },
    hint: { type: String, default: '' },
    emptyText: { type: String, default: 'None.' },
  },
};
</script>
