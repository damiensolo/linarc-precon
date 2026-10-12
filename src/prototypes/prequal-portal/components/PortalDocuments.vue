<template>
  <!-- Documents: one summary line, then the slots grouped under a heading, separated by hairlines. The counts are
       words; only "action needed" is coloured, because it is the only count that asks for something. -->
  <div class="flex flex-col gap-space-32">
    <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
      {{ requiredCount }} required documents ·
      <template v-for="(c, i) in counts">
        <span :key="c.key" :class="c.key === 'action' ? 'text-text-error' : ''">{{ c.n }} {{ c.label }}</span><template v-if="i < counts.length - 1"> · </template>
      </template>
    </p>
    <section v-for="g in groups" :key="g.name" class="flex flex-col">
      <h2 class="m-0 border-b border-border-subtle pb-space-8 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ g.name }}</h2>
      <div class="flex flex-col divide-y divide-border-subtle">
        <DocumentSlot v-for="d in g.docs" :key="d.id" :doc="d" :readonly="!!d.locked" @upload="$emit('upload', $event)" @cancel="$emit('cancel', $event)" @dismiss-error="$emit('dismiss-error', $event)" />
      </div>
    </section>
  </div>
</template>

<script>
import DocumentSlot from '~/candidates/DocumentSlot/DocumentSlot.vue';
import { DOCUMENT } from '~/modules/prequal/status';

export default {
  name: 'PortalDocuments',
  components: { DocumentSlot },
  props: { documents: { type: Array, required: true } },
  computed: {
    groups() {
      const order = [];
      const by = {};
      for (const d of this.documents) {
        if (!by[d.group]) { by[d.group] = []; order.push(d.group); }
        by[d.group].push(d);
      }
      return order.map((name) => ({ name, docs: by[name] }));
    },
    requiredCount() {
      return this.documents.filter((d) => d.required).length;
    },
    counts() {
      const req = this.documents.filter((d) => d.required);
      const n = (fn) => req.filter(fn).length;
      return [
        { key: 'passed', label: DOCUMENT.passed.label.toLowerCase(), n: n((d) => d.status === 'passed') },
        { key: 'pending', label: 'in review', n: n((d) => d.status === 'processing' || d.status === 'needs-review') },
        { key: 'action', label: 'action needed', n: n((d) => d.status === 'failed' || d.status === 'rejected') },
        { key: 'missing', label: 'missing', n: n((d) => d.status === null) },
      ].filter((c) => c.n > 0);
    },
  },
};
</script>
