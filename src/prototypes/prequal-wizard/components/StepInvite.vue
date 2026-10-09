<template>
  <!-- Step 4: review what will be sent, edit the message, send. The summary is a definition list; each block links
       back to the step that sets it. -->
  <div class="flex flex-col gap-space-32">
    <section class="flex flex-col gap-space-12">
      <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Summary</h3>
      <dl class="m-0 flex flex-col divide-y divide-border-subtle font-label text-fontsize-14 leading-lineheight-20">
        <div v-for="row in rows" :key="row.label" class="flex flex-col gap-space-2 py-space-8 sm:flex-row sm:items-baseline sm:gap-space-16">
          <dt class="shrink-0 text-text-subtle sm:basis-1/3">{{ row.label }}</dt>
          <dd class="m-0 min-w-0 flex-1 text-text-default">{{ row.value }}</dd>
          <dd class="m-0 shrink-0">
            <Button label="Edit" color-scheme="primary" variant="text" size="small" @onClick="$emit('edit', row.step)" />
          </dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-space-12">
      <div class="flex flex-col gap-space-2">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Invitation</h3>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
          Sent to {{ recipient }}. Reminders go out every 3 business days until the application is submitted.
        </p>
      </div>
      <FormV2 :value="{ message }" :schema="schema" :flat="true" mode="manual" label-position="top" @input="$emit('message', $event.message)">
        <template #footer><span /></template>
      </FormV2>
    </section>
  </div>
</template>

<script>
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import Button from '@/components/Button/Button.vue';
import { templates } from '~/modules/prequal/data';
import { projectById, CHECKS, requestChanges } from '~/modules/prequal/data/wizard';
import { currency } from '~/candidates/FormTableFields/format';

export default {
  name: 'StepInvite',
  components: { FormV2, Button },
  props: {
    company: { type: Object, required: true },
    draft: { type: Object, required: true },
  },
  data() {
    return {
      schema: { sections: [{ id: 'invite', layout: { columns: 1, gap: '16px' }, fields: [{ id: 'message', type: 'textarea', label: 'Message', props: { rows: 8 } }] }] },
    };
  },
  computed: {
    message() {
      return this.draft.message;
    },
    recipient() {
      return `${this.company.contact} (${this.company.email})`;
    },
    rows() {
      const w = this.draft.work;
      const p = projectById[w.project];
      const checks = CHECKS.filter((k) => this.draft.checks.includes(k.id));
      const cost = checks.reduce((s, k) => s + k.cost, 0);
      const changes = requestChanges(w);
      return [
        { label: 'Subcontractor', value: `${this.company.name} · ${this.company.contact}`, step: 'subcontractor' },
        { label: 'Project', value: p ? `${p.name} · ${p.location}` : '—', step: 'work' },
        { label: 'Trades', value: w.trades.join(', '), step: 'work' },
        { label: 'Expected limits', value: `${currency(w.single)} single · ${currency(w.aggregate)} aggregate`, step: 'work' },
        { label: 'Template', value: templates[this.draft.template] + (changes.length ? ` · ${changes.length} change${changes.length > 1 ? 's' : ''} for this request` : ''), step: 'requirements' },
        { label: 'Checks', value: `${checks.length} checks · estimated ${currency(cost)}`, step: 'requirements' },
      ];
    },
  },
};
</script>
