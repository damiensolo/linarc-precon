<template>
  <!-- Audit trail (reviewer only: it carries override reasons): newest first, hairline rows. The backlog's "Activity
       timeline" stays a composition (closed for screens 5 and 6): actor · action · time, no versions needed here. -->
  <section class="flex flex-col gap-space-8 font-label" aria-labelledby="record-audit">
    <h2 id="record-audit" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Audit trail</h2>
    <ol class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
      <li v-for="(e, i) in entries" :key="e.at + i" class="flex flex-col gap-space-2 py-space-12">
        <span class="text-fontsize-14 leading-lineheight-20 text-text-default"><strong>{{ e.actor }}</strong> {{ lower(e.action) }}</span>
        <span class="text-fontsize-12 leading-lineheight-16 tabular-nums text-text-soft">
          {{ $moment(e.at).format('D MMM YYYY · h:mm a') }}<template v-if="KIND[e.kind]"> · {{ KIND[e.kind] }}</template>
        </span>
      </li>
    </ol>
  </section>
</template>

<script>
// Kind words help scan the list; they're plain text, not colour (D-17).
const KIND = { override: 'Override', renewal: 'Renewal', monitoring: 'Monitoring' };

export default {
  name: 'AuditTrail',
  props: {
    entries: { type: Array, required: true },
  },
  data() {
    return { KIND };
  },
  methods: {
    lower(s) {
      return s.charAt(0).toLowerCase() + s.slice(1);
    },
  },
};
</script>
