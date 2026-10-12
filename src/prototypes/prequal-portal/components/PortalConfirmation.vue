<template>
  <!-- The end of the subcontractor's submission (2026-10-11): what was sent, the reference to quote, and what happens
       next. One success block, then plain text (D-17): no card, no illustration. -->
  <div class="flex flex-col gap-space-32 font-label">
    <section class="flex flex-col gap-space-12">
      <InlineNotice tone="success" title="Your application has been submitted" :message="`${gcName} has your answers and documents for ${project}. Reference ${reference} · ${when}.`" />
      <dl class="m-0 grid grid-cols-1 gap-x-space-24 gap-y-space-12 text-fontsize-14 leading-lineheight-20 sm:grid-cols-3">
        <div v-for="d in details" :key="d.label" class="flex flex-col gap-space-2">
          <dt class="text-fontsize-12 leading-lineheight-16 text-text-soft">{{ d.label }}</dt>
          <dd class="m-0 text-text-default">{{ d.value }}</dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-space-8 border-t border-border-subtle pt-space-20">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">What happens next</h2>
      <ol class="m-0 list-decimal pl-space-20 text-fontsize-14 leading-lineheight-20 text-text-default">
        <li class="pb-space-8">Linarc finishes its checks: your insurance broker, surety and references are contacted today.</li>
        <li class="pb-space-8">A reviewer at {{ gcName }} looks at your application, usually within 5 business days.</li>
        <li class="pb-space-8">If they need anything else, you’ll get an email and the request will show here. Only the items they ask for can be changed.</li>
        <li class="pb-space-8">You’ll be told the decision by email. If you’re approved, Linarc reminds you before any document expires.</li>
      </ol>
    </section>

    <div class="flex flex-wrap gap-space-8 border-t border-border-subtle pt-space-20">
      <Button label="View your answers" color-scheme="secondary" variant="outline" size="medium" @onClick="$emit('open', 'overview')" />
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';

export default {
  name: 'PortalConfirmation',
  components: { Button, InlineNotice },
  props: {
    gcName: { type: String, required: true },
    project: { type: String, required: true },
    reference: { type: String, required: true },
    submittedAt: { type: String, required: true },
    sections: { type: Number, required: true },
    documents: { type: Number, required: true },
    contact: { type: String, required: true },
  },
  computed: {
    when() {
      return this.$moment(this.submittedAt).format('D MMM YYYY, h:mm a');
    },
    details() {
      return [
        { label: 'Sections', value: `${this.sections} answered` },
        { label: 'Documents', value: `${this.documents} uploaded` },
        { label: 'Confirmation sent to', value: this.contact },
      ];
    },
  },
};
</script>
