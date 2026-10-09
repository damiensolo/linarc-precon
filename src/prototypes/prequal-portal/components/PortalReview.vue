<template>
  <div class="flex flex-col gap-space-24">
    <template v-if="submitted">
      <InlineNotice tone="success" title="Submission received" :message="`Your information has been sent to ${gcName}. Verification may still be in progress, and they may request additional information.`">
        <template #actions>
          <Button label="View submission" color-scheme="secondary" variant="outline" size="small" @onClick="$emit('open', 'overview')" />
        </template>
      </InlineNotice>
    </template>

    <template v-else>
      <section v-for="b in buckets" :key="b.key" class="flex flex-col gap-space-12">
        <div class="flex flex-col gap-space-2">
          <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ b.title }} <span class="font-normal text-text-subtle">({{ b.items.length }})</span></h2>
          <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ b.hint }}</p>
        </div>
        <p v-if="!b.items.length" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-soft">None.</p>
        <ul v-else class="m-0 flex list-none flex-col gap-space-4 p-0">
          <li v-for="i in b.items" :key="i.id" class="flex items-center gap-space-12 rounded-radius-4 bg-surface-container px-space-12 py-space-8 outline outline-1 -outline-offset-1 outline-border-subtle">
            <StatusIndicator type="dot" :status="b.dot" aria-hidden="true" />
            <div class="flex min-w-0 flex-1 flex-col font-label">
              <span class="truncate text-fontsize-14 leading-lineheight-20 text-text-default">{{ i.label }}</span>
              <span class="truncate text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ i.reason }}</span>
            </div>
            <Button label="Open" color-scheme="primary" variant="text" size="small" @onClick="$emit('open', sectionOf(i))" />
          </li>
        </ul>
      </section>

      <InlineNotice v-if="!readiness.canSubmit" tone="error" title="Submission is not ready" :message="`Complete the ${readiness.blocking.length} items above first. Flagged and pending items don't stop you from submitting.`" />
      <InlineNotice v-else-if="readiness.flagged.length" tone="warning" title="You can submit with flagged items" message="They will be shown to the reviewer exactly as they appear here. Fix them now if you can; otherwise the reviewer may ask for more information." />

      <div class="flex flex-wrap items-center gap-space-12">
        <Button label="Submit application" color-scheme="primary" variant="solid" size="medium" :is-disabled="!readiness.canSubmit" @onClick="$emit('submit')">
          <template #leftIcon><Send /></template>
        </Button>
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">Submitting sends your answers and documents to {{ gcName }}. You can still respond to information requests afterwards.</span>
      </div>
    </template>
  </div>
</template>

<script>
import { Send } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';

export default {
  name: 'PortalReview',
  components: { Button, StatusIndicator, InlineNotice, Send },
  props: {
    readiness: { type: Object, required: true },
    submitted: { type: Boolean, default: false },
    gcName: { type: String, required: true },
  },
  computed: {
    buckets() {
      const r = this.readiness;
      return [
        { key: 'blocking', title: 'Blocks submission', hint: 'Required documents that are missing or were rejected, and sections not yet complete.', items: r.blocking, dot: 'cancelled' },
        { key: 'flagged', title: 'Flagged, submission allowed', hint: 'A document failed a requirement or a value you entered does not match its document. The reviewer will see these.', items: r.flagged, dot: 'standby' },
        { key: 'pending', title: 'Still being checked', hint: 'Processing or awaiting a reviewer. These do not block submission.', items: r.pending, dot: 'indeterminate' },
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
