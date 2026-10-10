<template>
  <!-- Request renewal: a short single-step task, so a ModalV2 (docs/5-ui-patterns.md §1). Pick the dated documents
       (expiring / expired ones preselected, or the row it was opened from) and edit the message the subcontractor
       sees. Nothing is sent until "Send request". Which renewals need human approval is an open product decision. -->
  <ModalV2
    :is-visible="open"
    title="Request renewal"
    :title-description="`${contact}, ${companyName}`"
    primary-label="Send request"
    secondary-label="Cancel"
    :primary-disabled="!selected.length"
    :close-on-primary-click="false"
    @onPrimaryClick="send"
    @closeModal="$emit('close')"
  >
    <template #modal-body>
      <div class="flex flex-col gap-space-16 font-label">
        <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">
          {{ contact }} gets an email with a link to upload the renewed documents. The record stays as it is until a document expires.
        </p>
        <fieldset class="m-0 flex flex-col gap-space-8 border-0 p-0">
          <legend class="mb-space-8 p-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Documents</legend>
          <div v-for="d in dated" :key="d.id" class="flex flex-wrap items-center justify-between gap-x-space-16">
            <Checkbox :value="selected.includes(d.id)" :label="d.label" size="small" @input="toggle(d.id, $event)" />
            <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">expires {{ $moment(d.expires).format('D MMM YYYY') }}</span>
          </div>
        </fieldset>
        <FormV2 :value="{ message }" :schema="schema" :flat="true" mode="manual" label-position="top" @input="message = $event.message">
          <template #footer><span /></template>
        </FormV2>
      </div>
    </template>
  </ModalV2>
</template>

<script>
import ModalV2 from '@/componentsV2/ModalV2/ModalV2.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';

const DAY = 24 * 60 * 60 * 1000;

export default {
  name: 'RenewalModal',
  components: { ModalV2, FormV2, Checkbox },
  props: {
    open: { type: Boolean, default: false },
    documents: { type: Array, required: true },
    /** Document id the modal was opened from; null = preselect everything expiring or expired. */
    preselect: { type: String, default: null },
    contact: { type: String, required: true },
    companyName: { type: String, required: true },
    now: { type: String, required: true },
  },
  data() {
    return {
      selected: [],
      message: '',
      schema: { sections: [{ id: 'msg', layout: { columns: 1, gap: '16px' }, fields: [{ id: 'message', type: 'textarea', label: 'Message to the subcontractor', props: { rows: 3 } }] }] },
    };
  },
  computed: {
    dated() {
      return [...this.documents].filter((d) => d.expires).sort((a, b) => a.expires.localeCompare(b.expires));
    },
  },
  watch: {
    open(v) {
      if (!v) return;
      const soon = (d) => (new Date(d.expires) - new Date(this.now)) / DAY <= 30;
      this.selected = this.preselect ? [this.preselect] : this.dated.filter((d) => soon(d) && !d.renewal).map((d) => d.id);
      const first = this.documents.find((d) => d.id === this.selected[0]);
      this.message = first
        ? `Your ${first.label.toLowerCase()} on file expires ${this.$moment(first.expires).format('D MMM YYYY')}. Please upload the renewed document so your qualification stays current.`
        : 'Please upload renewed documents so your qualification stays current.';
    },
  },
  methods: {
    toggle(id, on) {
      this.selected = on ? [...this.selected, id] : this.selected.filter((x) => x !== id);
    },
    send() {
      this.$emit('send', { ids: [...this.selected], message: this.message });
    },
  },
};
</script>
