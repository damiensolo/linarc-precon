<template>
  <div class="flex flex-col gap-space-24">
    <div class="flex flex-wrap items-center gap-space-8 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
      <span>{{ requiredCount }} required documents:</span>
      <StatusChip v-for="c in counts" :key="c.key" :label="`${c.n} ${c.label}`" :status="c.chip" fill-style="outline" type="default" :removable="false" />
    </div>
    <section v-for="g in groups" :key="g.name" class="flex flex-col gap-space-12">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ g.name }}</h2>
      <DocumentSlot v-for="d in g.docs" :key="d.id" :doc="d" />
    </section>
  </div>
</template>

<script>
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import DocumentSlot from '~/candidates/DocumentSlot/DocumentSlot.vue';
import { DOCUMENT, toneToChipStatus } from '~/modules/prequal/status';

export default {
  name: 'PortalDocuments',
  components: { StatusChip, DocumentSlot },
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
        { key: 'passed', label: DOCUMENT.passed.label.toLowerCase(), n: n((d) => d.status === 'passed'), chip: toneToChipStatus('success') },
        { key: 'pending', label: 'in review', n: n((d) => d.status === 'processing' || d.status === 'needs-review'), chip: toneToChipStatus('info') },
        { key: 'action', label: 'action needed', n: n((d) => d.status === 'failed' || d.status === 'rejected'), chip: toneToChipStatus('error') },
        { key: 'missing', label: 'missing', n: n((d) => d.status === null), chip: toneToChipStatus('neutral') },
      ].filter((c) => c.n > 0);
    },
  },
};
</script>
