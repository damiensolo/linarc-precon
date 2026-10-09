<template>
  <div class="flex flex-col gap-space-32">
    <template v-if="submitted">
      <InlineNotice tone="success" title="Submission received" :message="`Your information has been sent to ${gcName}. Verification may still be in progress, and they may request additional information.`">
        <template #actions>
          <Button label="View submission" color-scheme="secondary" variant="outline" size="small" @onClick="$emit('open', 'overview')" />
        </template>
      </InlineNotice>
    </template>

    <template v-else>
      <PortalItemList v-for="b in buckets" :key="b.key" :title="b.title" :hint="b.hint" :items="b.items" @open="$emit('open', sectionOf($event))" />

      <section class="flex flex-col gap-space-16 border-t border-border-subtle pt-space-20">
        <InlineNotice v-if="!readiness.canSubmit" tone="error" title="Submission is not ready" :message="`Complete the ${readiness.blocking.length} items above first. Flagged and pending items don't stop you from submitting.`" />
        <InlineNotice v-else-if="readiness.flagged.length" tone="warning" title="You can submit with flagged items" message="They will be shown to the reviewer exactly as they appear here. Fix them now if you can; otherwise the reviewer may ask for more information." />
        <div class="flex flex-wrap items-center gap-space-12">
          <Button label="Submit application" color-scheme="primary" variant="solid" size="medium" :is-disabled="!readiness.canSubmit" @onClick="$emit('submit')" />
          <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">Submitting sends your answers and documents to {{ gcName }}. You can still respond to information requests afterwards.</span>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import PortalItemList from './PortalItemList.vue';

export default {
  name: 'PortalReview',
  components: { Button, InlineNotice, PortalItemList },
  props: {
    readiness: { type: Object, required: true },
    submitted: { type: Boolean, default: false },
    gcName: { type: String, required: true },
  },
  computed: {
    buckets() {
      const r = this.readiness;
      return [
        { key: 'blocking', title: 'Blocks submission', hint: 'Required documents that are missing or were rejected, and sections not yet complete.', items: r.blocking },
        { key: 'flagged', title: 'Flagged, submission allowed', hint: 'A document failed a requirement or a value you entered does not match its document. The reviewer will see these.', items: r.flagged },
        { key: 'pending', title: 'Still being checked', hint: 'Processing or awaiting a reviewer. These do not block submission.', items: r.pending },
      ];
    },
  },
  methods: {
    sectionOf(i) {
      return i.kind === 'document' ? 'documents' : i.kind === 'field' ? i.id.split('.')[0] : i.id;
    },
  },
};
</script>
