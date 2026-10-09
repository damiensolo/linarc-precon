<template>
  <!-- Step 1: who is being prequalified. Search Linarc first; what Linarc already knows (an open request, a
       qualification on file) is shown before anything else is asked, so duplicates are caught here. -->
  <div class="flex flex-col gap-space-32">
    <section class="flex flex-col gap-space-8">
      <SelectV2
        label="Subcontractor"
        placeholder="Search by company name or license number"
        :options="companyOptions"
        :value="companyId || ''"
        item-type="detailed"
        :visible-item-count="6"
        :clearable="true"
        @input="$emit('company', $event || null)"
      />
      <div v-if="!companyId && !adding">
        <Button label="Add a company that isn’t in Linarc" color-scheme="primary" variant="text" size="small" @onClick="$emit('adding', true)" />
      </div>
    </section>

    <template v-if="company">
      <section class="flex flex-col gap-space-4">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ company.name }}</h3>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ company.trade }} · CSI {{ company.csi }} · {{ company.state }}</p>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ company.contact }} · {{ company.email }}</p>
      </section>

      <InlineNotice v-for="r in history.open" :key="r.id" tone="warning" :title="`Open request: ${r.project}`">
        {{ company.name }} already has a request for {{ r.project }} ({{ r.templateName }}), {{ r.status.label.toLowerCase() }}.
        Start a new one only if this is different work.
        <template #actions>
          <Button label="Open that request" color-scheme="primary" variant="text" size="small" @onClick="$emit('open-request', r)" />
        </template>
      </InlineNotice>

      <section v-if="history.qualifications.length" class="flex flex-col gap-space-12">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Qualifications on file</h3>
        <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
          <li v-for="q in history.qualifications" :key="q.id" class="flex flex-wrap items-center gap-x-space-16 gap-y-space-4 py-space-12">
            <div class="flex min-w-0 flex-1 flex-col font-label">
              <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ q.project }} · {{ q.templateName }}</span>
              <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">
                {{ money(q.single) }} single · {{ money(q.aggregate) }} aggregate · valid until {{ $moment(q.validUntil).format('D MMM YYYY') }}
              </span>
            </div>
            <StatusChip :label="q.status.label" :status="toneToChipStatus(q.status.tone)" fill-style="outline" type="default" :removable="false" />
            <Button label="View record" color-scheme="primary" variant="text" size="small" @onClick="$emit('open-record', q)" />
          </li>
        </ul>
        <p class="m-0 font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">
          A new request doesn’t change these. If the new work fits an existing qualification, you may not need one.
        </p>
      </section>
    </template>

    <section v-else-if="adding" class="flex flex-col gap-space-16">
      <div class="flex flex-col gap-space-4">
        <h3 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">New company</h3>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">The contact receives the invitation. They can add colleagues once they open it.</p>
      </div>
      <FormV2 :value="newCompany" :schema="newCompanySchema" :flat="true" mode="manual" label-position="top" @input="$emit('new-company', $event)">
        <template #footer><span /></template>
      </FormV2>
      <div>
        <Button label="Search Linarc instead" color-scheme="primary" variant="text" size="small" @onClick="$emit('adding', false)" />
      </div>
    </section>
  </div>
</template>

<script>
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import Button from '@/components/Button/Button.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import { companyById } from '~/modules/prequal/data';
import { companyOptions, companyHistory, TRADES } from '~/modules/prequal/data/wizard';
import { toneToChipStatus } from '~/modules/prequal/status';
import { currency } from '~/candidates/FormTableFields/format';

export default {
  name: 'StepSubcontractor',
  components: { SelectV2, FormV2, Button, StatusChip, InlineNotice },
  props: {
    companyId: { type: String, default: null },
    adding: { type: Boolean, default: false },
    newCompany: { type: Object, required: true },
  },
  data() {
    return {
      companyOptions,
      newCompanySchema: {
        sections: [{
          id: 'new-company',
          layout: { columns: 2, gap: '24px' },
          fields: [
            { id: 'name', type: 'text', label: 'Company legal name', rules: [{ type: 'required' }] },
            { id: 'trade', type: 'select', label: 'Primary trade', options: TRADES.map((t) => ({ label: t, value: t })), rules: [{ type: 'required' }] },
            { id: 'contact', type: 'text', label: 'Contact name', rules: [{ type: 'required' }] },
            { id: 'email', type: 'text', label: 'Contact email', rules: [{ type: 'required' }] },
          ],
        }],
      },
    };
  },
  computed: {
    company() {
      return this.companyId ? companyById[this.companyId] : null;
    },
    history() {
      return this.companyId ? companyHistory(this.companyId) : { open: [], qualifications: [] };
    },
  },
  methods: {
    toneToChipStatus,
    money: currency,
  },
};
</script>
