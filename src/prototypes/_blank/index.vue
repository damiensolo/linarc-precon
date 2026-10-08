<template>
  <!--
    Starter for a new prototype. Copy this folder to src/prototypes/<your-slug>/
    and update `prototype` below. Build the view from design-system components
    (@/components, @/componentsV2) and token classes only.
  -->
  <div class="flex flex-col gap-space-24 p-space-32">
    <header class="flex flex-col gap-space-4">
      <h1 class="font-heading text-fontsize-24 leading-lineheight-32 font-bold text-text-default">
        Blank prototype
      </h1>
      <p class="font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
        Copy <code>src/prototypes/_blank</code> to start a new view.
      </p>
    </header>

    <section
      class="flex flex-col gap-space-16 p-space-24 rounded-radius-6 border border-border-default bg-surface-container"
    >
      <div class="flex items-center gap-space-12">
        <Button label="Primary action" color-scheme="primary" variant="solid" size="medium" @onClick="clicks += 1" />
        <Button label="Secondary" color-scheme="secondary" variant="outline" size="medium" />
      </div>
      <p class="font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
        Primary clicked {{ clicks }} times.
      </p>
    </section>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';

export default {
  name: 'BlankPrototype',
  prototype: {
    title: 'Blank',
    figma: '',
  },
  components: {
    Button,
  },
  data() {
    return {
      clicks: 0,
    };
  },
};
</script>
