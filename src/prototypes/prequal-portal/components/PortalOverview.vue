<template>
  <!-- Overview: what this request is, how far along it is, and what still needs doing. Three typographic sections
       separated by space and headings; no cards. -->
  <div class="flex flex-col gap-space-32">
    <section class="flex flex-col gap-space-16">
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

    <section class="border-t border-border-subtle pt-space-20">
      <ProgressBar activity-label="Application progress" :secondary-text="progressText" :progress="completion" :show-percent-indicator="true" />
    </section>

    <section class="flex flex-col gap-space-24 border-t border-border-subtle pt-space-20">
      <p v-if="!blocking.length && !flagged.length" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">Nothing outstanding. You can review and submit.</p>
      <PortalItemList v-if="blocking.length" title="Needed before you can submit" :items="blocking" @open="$emit('open', $event.section)" />
      <PortalItemList v-if="flagged.length" title="Flagged for the reviewer" hint="You can submit with these; fix them now if you can." :items="flagged" @open="$emit('open', $event.section)" />
    </section>

    <section class="flex flex-col gap-space-16 border-t border-border-subtle pt-space-20">
      <InlineNotice tone="info" title="Background checks and outreach" :message="request.disclosure">
        <template #actions>
          <Checkbox :value="consent" label="I authorise Linarc to contact the references and insurance broker I list" size="small" @input="$emit('consent', $event)" />
        </template>
      </InlineNotice>
      <div>
        <Button label="Continue application" color-scheme="primary" variant="solid" size="medium" @onClick="$emit('continue')" />
      </div>
    </section>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import ProgressBar from '@/components/ProgressBar/ProgressBar.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import PortalItemList from './PortalItemList.vue';
import { currency } from '~/candidates/FormTableFields/format';

const toSection = (i) => (i.kind === 'document' ? 'documents' : i.kind === 'field' ? i.id.split('.')[0] : i.id);

export default {
  name: 'PortalOverview',
  components: { Button, Checkbox, ProgressBar, InlineNotice, PortalItemList },
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
    blocking() {
      return this.readiness.blocking.map((i) => ({ ...i, section: toSection(i) }));
    },
    flagged() {
      return this.readiness.flagged.map((i) => ({ ...i, section: toSection(i) }));
    },
  },
};
</script>
