<template>
  <!-- Overview: what this request is, how far along it is, and what still needs doing. Three typographic sections
       separated by space and headings; no cards. -->
  <div class="flex flex-col gap-space-32">
    <!-- Where the request stands once it has left the subcontractor's hands (stage, data/portalRequests.js). -->
    <section v-if="stage !== 'open'" class="flex flex-col gap-space-16">
      <InlineNotice v-if="stage === 'submitted'" tone="info" :title="statusLabel === 'Submitted' ? `Submitted ${date(submittedOn)}` : `${statusLabel} · submitted ${date(submittedOn)}`" :message="`${request.gc.name} is reviewing your application. Your answers and documents are read-only now; if the reviewer needs anything, you'll get an email and it will show here.`" />
      <InlineNotice v-else-if="stage === 'info' && respondedAt" tone="info" :title="`Response sent ${date(respondedAt)}`" :message="`${request.gc.name} has your response. The reviewer will pick it up from here; you’ll get an email if they need anything else.`" />
      <template v-else-if="stage === 'info'">
        <InlineNotice tone="warning" :title="`${request.gc.name} needs more information`" :message="`${infoRequest.by} asked on ${date(infoRequest.on)}: “${infoRequest.message}” Please respond by ${date(infoRequest.dueOn)}.`" />
        <PortalItemList title="Requested" hint="Only these can be changed. Everything else stays as you submitted it." :items="blocking" @open="$emit('open', $event.section)" />
      </template>
      <template v-else-if="stage === 'decided'">
        <InlineNotice :tone="decision.tone" :title="decision.title" :message="decision.message" />
        <PortalItemList v-if="decision.items.length" title="Renewals" hint="Upload each renewed document before the date shown." :items="renewals" @open="$emit('open', $event.section)" />
      </template>
    </section>

    <section class="flex flex-col gap-space-16">
      <p v-if="stage === 'open'" class="m-0 font-label text-fontsize-16 leading-lineheight-24 text-text-default">
        <strong>{{ request.gc.name }}</strong> has asked {{ companyName }} to prequalify for <strong>{{ request.project }}</strong>.
        Complete the sections on the left and upload the documents each one asks for. You can save and come back at any time.
      </p>
      <p v-else class="m-0 font-label text-fontsize-16 leading-lineheight-24 text-text-default">
        {{ possessive }} prequalification for <strong>{{ request.project }}</strong>, requested by <strong>{{ request.gc.name }}</strong>.
      </p>
      <dl class="m-0 grid grid-cols-1 gap-x-space-24 gap-y-space-12 font-label text-fontsize-14 leading-lineheight-20 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="d in details" :key="d.label" class="flex flex-col gap-space-2">
          <dt class="text-fontsize-12 leading-lineheight-16 text-text-soft">{{ d.label }}</dt>
          <dd class="m-0 text-text-default">{{ d.value }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="stage === 'open'" class="border-t border-border-subtle pt-space-20">
      <ProgressBar activity-label="Application progress" :secondary-text="progressText" :progress="completion" :show-percent-indicator="true" />
    </section>

    <section v-if="stage === 'open'" class="flex flex-col gap-space-24 border-t border-border-subtle pt-space-20">
      <p v-if="!blocking.length && !flagged.length" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">Nothing outstanding. You can review and submit.</p>
      <PortalItemList v-if="blocking.length" title="Needed before you can submit" :items="blocking" @open="$emit('open', $event.section)" />
      <PortalItemList v-if="flagged.length" title="Flagged for the reviewer" hint="You can submit with these; fix them now if you can." :items="flagged" @open="$emit('open', $event.section)" />
    </section>

    <section v-if="stage === 'open'" class="flex flex-col gap-space-16 border-t border-border-subtle pt-space-20">
      <InlineNotice tone="info" title="Background checks and outreach" :message="request.disclosure">
        <template #actions>
          <Checkbox :value="consent" label="I authorise Linarc to contact the references and insurance broker I list" size="small" @input="$emit('consent', $event)" />
        </template>
      </InlineNotice>
      <div>
        <Button :label="completion ? 'Continue application' : 'Start application'" color-scheme="primary" variant="solid" size="medium" @onClick="$emit('continue')" />
      </div>
    </section>
    <div v-else class="border-t border-border-subtle pt-space-20">
      <Button label="View your answers" color-scheme="secondary" variant="outline" size="medium" @onClick="$emit('open', 'company')" />
    </div>
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
    /** open | submitted | info | decided (data/portalRequests.js). */
    stage: { type: String, default: 'open' },
    infoRequest: { type: Object, default: null },
    /** { tone, title, message, items } once decided. */
    decision: { type: Object, default: null },
    submittedOn: { type: String, default: null },
    statusLabel: { type: String, default: '' },
    /** Set once the subcontractor has sent the response to an information request. */
    respondedAt: { type: String, default: null },
  },
  computed: {
    details() {
      const r = this.request;
      return [
        { label: 'Project', value: `${r.project} · ${r.projectLocation}` },
        { label: 'Trade', value: r.trade },
        { label: 'Requested limits', value: `${currency(r.requestedSingle)} single · ${currency(r.requestedAggregate)} aggregate` },
        { label: 'Requirement template', value: r.template },
        { label: 'Invited', value: this.date(r.invitedOn) },
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
    possessive() {
      return /s$/.test(this.companyName) ? `${this.companyName}’` : `${this.companyName}’s`;
    },
    renewals() {
      return this.decision.items.map((i) => ({ ...i, section: 'documents' }));
    },
  },
  methods: {
    date(iso) {
      return this.$moment(iso).format('D MMM YYYY');
    },
  },
};
</script>
