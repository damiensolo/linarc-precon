<template>
  <div class="flex flex-col gap-space-24">
    <section class="flex flex-col gap-space-16 rounded-radius-6 bg-surface-container p-space-20 outline outline-1 -outline-offset-1 outline-border-subtle">
      <p class="m-0 font-label text-fontsize-16 leading-lineheight-24 text-text-default">
        <strong>{{ request.gc.name }}</strong> has asked {{ companyName }} to prequalify for <strong>{{ request.project }}</strong>.
        Complete the sections on the left and upload the documents each one asks for. You can save and come back at any time.
      </p>
      <dl class="m-0 grid grid-cols-1 gap-x-space-24 gap-y-space-12 font-label text-fontsize-14 leading-lineheight-20 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="d in details" :key="d.label" class="flex flex-col gap-space-2">
          <dt class="text-fontsize-12 leading-lineheight-16 text-text-soft">{{ d.label }}</dt>
          <dd class="m-0 text-text-default">{{ d.value }}</dd>
        </div>
      </dl>
    </section>

    <section class="rounded-radius-6 bg-surface-container p-space-20 outline outline-1 -outline-offset-1 outline-border-subtle">
      <ProgressBar activity-label="Application progress" :secondary-text="progressText" :progress="completion" :show-percent-indicator="true" />
    </section>

    <section class="flex flex-col gap-space-12">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Needs your attention</h2>
      <p v-if="!attention.length" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">Nothing outstanding. You can review and submit.</p>
      <ul v-else class="m-0 flex list-none flex-col gap-space-4 p-0">
        <li v-for="item in attention" :key="item.id" class="flex items-center gap-space-12 rounded-radius-4 bg-surface-container px-space-12 py-space-8 outline outline-1 -outline-offset-1 outline-border-subtle">
          <StatusIndicator type="dot" :status="item.blocking ? 'cancelled' : 'standby'" aria-hidden="true" />
          <div class="flex min-w-0 flex-1 flex-col font-label">
            <span class="truncate text-fontsize-14 leading-lineheight-20 text-text-default">{{ item.label }}</span>
            <span class="truncate text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ item.reason }}</span>
          </div>
          <Button label="Open" color-scheme="primary" variant="text" size="small" @onClick="$emit('open', item.section)" />
        </li>
      </ul>
    </section>

    <InlineNotice tone="info" title="Background checks and outreach" :message="request.disclosure">
      <template #actions>
        <Checkbox :value="consent" label="I authorise Linarc to contact the references and insurance broker I list" size="small" @input="$emit('consent', $event)" />
      </template>
    </InlineNotice>

    <div>
      <Button label="Continue application" color-scheme="primary" variant="solid" size="medium" @onClick="$emit('continue')">
        <template #rightIcon><ChevronRight /></template>
      </Button>
    </div>
  </div>
</template>

<script>
import { ChevronRight } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import ProgressBar from '@/components/ProgressBar/ProgressBar.vue';
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import { currency } from '~/candidates/FormTableFields/format';

export default {
  name: 'PortalOverview',
  components: { Button, Checkbox, ProgressBar, StatusIndicator, InlineNotice, ChevronRight },
  props: {
    request: { type: Object, required: true },
    companyName: { type: String, required: true },
    sections: { type: Array, required: true },
    documents: { type: Array, required: true },
    readiness: { type: Object, required: true },
    completion: { type: Number, required: true },
    consent: { type: Boolean, default: false },
  },
  computed: {
    details() {
      const r = this.request;
      return [
        { label: 'Project', value: `${r.project} · ${r.projectLocation}` },
        { label: 'Trade', value: r.trade },
        { label: 'Requested limits', value: `${currency(r.requestedSingle)} single · ${currency(r.requestedAggregate)} aggregate` },
        { label: 'Requirement template', value: r.template },
        { label: 'Invited', value: this.$moment(r.invitedOn).format('D MMM YYYY') },
        { label: 'Your contact', value: `${r.contact.name} · ${r.contact.email}` },
      ];
    },
    progressText() {
      const counted = this.sections.filter((s) => s.id !== 'documents' && s.id !== 'review');
      const entered = counted.filter((s) => s.state === 'complete' || s.state === 'needs-attention').length;
      const required = this.documents.filter((d) => d.required);
      const ok = required.filter((d) => ['passed', 'processing', 'needs-review'].includes(d.status)).length;
      return `${entered} of ${counted.length} sections entered · ${ok} of ${required.length} required documents accepted or in review`;
    },
    attention() {
      const toSection = (i) => (i.kind === 'document' ? 'documents' : i.kind === 'field' ? i.id.split('.')[0] : i.id);
      return [
        ...this.readiness.blocking.map((i) => ({ ...i, blocking: true, section: toSection(i) })),
        ...this.readiness.flagged.map((i) => ({ ...i, blocking: false, section: toSection(i) })),
      ];
    },
  },
};
</script>
