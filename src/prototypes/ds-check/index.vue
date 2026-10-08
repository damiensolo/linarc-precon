<template>
  <!-- TEMPORARY: design-system wiring check. Delete when done. -->
  <div class="h-full">
    <AppLayout>
      <template #header>
        <span class="font-heading text-fontsize-16 leading-lineheight-24 font-bold text-text-default">
          Design system check
        </span>
      </template>

      <template #content>
        <div class="flex flex-col gap-space-24 p-space-24">
          <section class="flex flex-col gap-space-12">
            <h2 class="font-label text-fontsize-14 leading-lineheight-20 font-bold text-text-subtle">Buttons (md)</h2>
            <div class="flex items-center gap-space-12">
              <Button label="Primary" color-scheme="primary" variant="solid" size="medium" />
              <Button label="Secondary" color-scheme="secondary" variant="outline" size="medium" />
              <Button color-scheme="primary" variant="solid" size="medium" aria-label="Search">
                <template #leftIcon><Search /></template>
              </Button>
            </div>
          </section>

          <section class="flex flex-col gap-space-12">
            <h2 class="font-label text-fontsize-14 leading-lineheight-20 font-bold text-text-subtle">Radio</h2>
            <div class="flex items-center gap-space-24">
              <Radio v-model="radio" value="a" name="check" label="Option A" />
              <Radio v-model="radio" value="b" name="check" label="Option B" />
            </div>
          </section>

          <section class="flex flex-col gap-space-12">
            <h2 class="font-label text-fontsize-14 leading-lineheight-20 font-bold text-text-subtle">Checkbox</h2>
            <Checkbox v-model="checked" label="Checkbox label" />
          </section>
        </div>
      </template>
    </AppLayout>
  </div>
</template>

<script>
import { Search } from '@development/linarc-icons';
import AppLayout from '@/componentsV2/AppLayout/AppLayout.vue';
import Button from '@/components/Button/Button.vue';
import Radio from '@/components/Radio/Radio.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';

export default {
  name: 'DsCheck',
  prototype: {
    title: 'DS check (temporary)',
    figma: 'https://www.figma.com/design/1HxMANBEaYWFqEFtazB20l/Linarc-Design-System--V3.2',
  },
  components: { AppLayout, Button, Radio, Checkbox, Search },
  data() {
    return { radio: 'a', checked: true };
  },
};
</script>
