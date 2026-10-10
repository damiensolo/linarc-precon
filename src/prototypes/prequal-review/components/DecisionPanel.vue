<template>
  <!-- Sticky decision panel (right panel): what's left before a decision, the four decisions, request context and
       recent activity. Approve with conditions and Request information open a short form in the panel, then a
       confirmation preview; nothing is sent until Confirm. Linarc recommends; the reviewer decides. -->
  <div class="flex flex-col gap-space-24 font-label">
    <!-- Done -->
    <section v-if="mode === 'done'" class="flex flex-col gap-space-12">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ done.title }}</h2>
      <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ done.body }}</p>
      <div class="flex flex-wrap gap-space-8">
        <Button v-if="done.record" label="View qualification record" color-scheme="primary" variant="solid" size="medium" @onClick="$emit('record')" />
        <Button label="Back to Overview" color-scheme="secondary" variant="outline" size="medium" @onClick="$emit('dashboard')" />
      </div>
    </section>

    <!-- Decide -->
    <template v-else-if="mode === 'decide'">
      <section class="flex flex-col gap-space-8">
        <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Decision</h2>
        <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
          <li v-for="r in readiness" :key="r.label" class="flex items-start gap-space-8 py-space-8 text-fontsize-14 leading-lineheight-20">
            <Check v-if="r.ok" :size="16" :stroke-width="2" class="mt-space-2 shrink-0 text-icon-success" aria-hidden="true" />
            <span v-else class="mt-space-2 inline-block w-space-16 shrink-0" aria-hidden="true" />
            <span class="min-w-0 flex-1">
              <span class="text-text-default">{{ r.label }}</span>
              <span v-if="r.detail" class="block text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ r.detail }}</span>
            </span>
          </li>
        </ul>
      </section>
      <section class="flex flex-col gap-space-8">
        <Button class="w-full" label="Approve with conditions" color-scheme="primary" variant="solid" size="medium" @onClick="mode = 'conditions'" />
        <Button class="w-full" label="Approve" color-scheme="secondary" variant="outline" size="medium" @onClick="startApprove" />
        <Button class="w-full" label="Request information" color-scheme="secondary" variant="outline" size="medium" @onClick="mode = 'request'" />
        <Button class="w-full" label="Reject" color-scheme="secondary" variant="minimal" size="medium" @onClick="mode = 'reject'" />
        <p class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">
          Recommended: {{ recommendationLabel }}. The primary action follows the open required item; approving without conditions leaves it unresolved.
        </p>
      </section>
      <section class="flex flex-col gap-space-8 border-t border-border-subtle pt-space-20">
        <h3 class="m-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Request</h3>
        <dl class="m-0 flex flex-col gap-space-4 text-fontsize-12 leading-lineheight-16">
          <div v-for="c in contextRows" :key="c[0]" class="flex gap-space-8"><dt class="w-space-88 shrink-0 text-text-subtle">{{ c[0] }}</dt><dd class="m-0 text-text-default">{{ c[1] }}</dd></div>
        </dl>
      </section>
      <section class="flex flex-col gap-space-8">
        <h3 class="m-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Recent activity</h3>
        <ol class="m-0 flex list-none flex-col gap-space-8 p-0">
          <li v-for="h in history.slice(0, 3)" :key="h.at" class="flex flex-col text-fontsize-12 leading-lineheight-16">
            <span class="text-text-default">{{ h.actor }} · {{ h.action }}</span>
            <span class="text-text-subtle">{{ $moment(h.at).format('D MMM, h:mm a') }}</span>
          </li>
        </ol>
      </section>
    </template>

    <!-- Approve / approve with conditions: form -->
    <section v-else-if="mode === 'conditions' || mode === 'approve'" class="flex flex-col gap-space-16">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ mode === 'conditions' ? 'Approve with conditions' : 'Approve' }}</h2>
      <FormV2 v-model="approval" :schema="approvalSchema" :flat="true" mode="manual" label-position="top">
        <template #footer><span /></template>
      </FormV2>
      <div v-if="mode === 'conditions'" class="flex flex-col gap-space-8">
        <span class="text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Conditions</span>
        <Checkbox v-for="c in conditions" :key="c.id" :value="approval.conditions.includes(c.id)" :label="c.label" size="small" @input="toggleCondition(c.id, $event)" />
      </div>
      <div class="flex flex-wrap gap-space-8">
        <Button label="Review decision" color-scheme="primary" variant="solid" size="medium" :is-disabled="mode === 'conditions' && !approval.conditions.length" @onClick="confirmFrom = mode; mode = 'confirm'" />
        <Button label="Cancel" color-scheme="secondary" variant="minimal" size="medium" @onClick="mode = 'decide'" />
      </div>
    </section>

    <!-- Confirmation preview -->
    <section v-else-if="mode === 'confirm'" class="flex flex-col gap-space-16">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Confirm: {{ confirmFrom === 'conditions' ? 'approve with conditions' : 'approve' }}</h2>
      <dl class="m-0 flex flex-col divide-y divide-border-subtle text-fontsize-14 leading-lineheight-20">
        <div v-for="r in confirmRows" :key="r[0]" class="flex flex-col gap-space-2 py-space-8"><dt class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ r[0] }}</dt><dd class="m-0 text-text-default">{{ r[1] }}</dd></div>
      </dl>
      <p class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">Creates a qualification record and adds {{ companyName }} to Qualified Subs. Estimators see the status, limits and conditions; not the score or findings.</p>
      <div class="flex flex-wrap gap-space-8">
        <Button label="Confirm" color-scheme="primary" variant="solid" size="medium" @onClick="finish(confirmFrom)" />
        <Button label="Back" color-scheme="secondary" variant="outline" size="medium" @onClick="mode = confirmFrom" />
      </div>
    </section>

    <!-- Request information -->
    <section v-else-if="mode === 'request'" class="flex flex-col gap-space-16">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Request information</h2>
      <div class="flex flex-col gap-space-8">
        <span class="text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Items to send back</span>
        <Checkbox v-for="f in openFindings" :key="f.id" :value="infoRequest.items.includes(f.id)" :label="f.title" size="small" @input="toggleItem(f.id, $event)" />
      </div>
      <FormV2 :value="{ message: infoRequest.message }" :schema="messageSchema" :flat="true" mode="manual" label-position="top" @input="infoRequest.message = $event.message">
        <template #footer><span /></template>
      </FormV2>
      <p class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">The subcontractor sees the items and your message, not check results.</p>
      <div class="flex flex-wrap gap-space-8">
        <Button label="Send request" color-scheme="primary" variant="solid" size="medium" :is-disabled="!infoRequest.items.length" @onClick="finish('request')" />
        <Button label="Cancel" color-scheme="secondary" variant="minimal" size="medium" @onClick="mode = 'decide'" />
      </div>
    </section>

    <!-- Reject -->
    <section v-else-if="mode === 'reject'" class="flex flex-col gap-space-16">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Reject</h2>
      <FormV2 v-model="rejection" :schema="rejectSchema" :flat="true" mode="manual" label-position="top">
        <template #footer><span /></template>
      </FormV2>
      <div class="flex flex-wrap gap-space-8">
        <Button label="Reject request" color-scheme="primary" variant="solid" size="medium" :is-disabled="!rejection.reason" @onClick="finish('reject')" />
        <Button label="Cancel" color-scheme="secondary" variant="minimal" size="medium" @onClick="mode = 'decide'" />
      </div>
    </section>
  </div>
</template>

<script>
import { Check } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import { RECOMMENDATION } from '~/modules/prequal/status';
import { currency } from '~/candidates/FormTableFields/format';

export default {
  name: 'DecisionPanel',
  components: { Check, Button, Checkbox, FormV2 },
  props: {
    request: { type: Object, required: true },
    companyName: { type: String, required: true },
    trade: { type: String, required: true },
    findings: { type: Array, required: true },
    checks: { type: Array, required: true },
    history: { type: Array, required: true },
    conditions: { type: Array, required: true },
    context: { type: Object, required: true },
    /** Pre-selects a finding when "Request information" comes from the evidence panel. */
    requestFor: { type: String, default: null },
  },
  data() {
    return {
      mode: 'decide',
      confirmFrom: 'conditions',
      done: null,
      approval: { trades: [this.trade], single: this.request.single, aggregate: this.request.aggregate, validUntil: '2027-03-31', conditions: ['umbrella'] },
      infoRequest: { items: [], message: 'Please upload a corrected certificate of insurance showing $5,000,000 umbrella coverage, and confirm your current bonding backlog.' },
      rejection: { reason: '', message: '' },
      approvalSchema: {
        sections: [{
          id: 'approval',
          layout: { columns: 1, gap: '16px' },
          fields: [
            { id: 'trades', type: 'multiselect', label: 'Qualified trades', options: [this.trade, 'Low Voltage', 'Fire Alarm'].map((t) => ({ label: t, value: t })) },
            { id: 'single', type: 'number', label: 'Single-project limit' },
            { id: 'aggregate', type: 'number', label: 'Aggregate limit' },
            { id: 'validUntil', type: 'text', label: 'Valid until', help: 'Earliest key-document expiry (COI, 31 Mar 2027)' },
          ],
        }],
      },
      messageSchema: { sections: [{ id: 'msg', layout: { columns: 1, gap: '16px' }, fields: [{ id: 'message', type: 'textarea', label: 'Message to the subcontractor', props: { rows: 4 } }] }] },
      rejectSchema: {
        sections: [{
          id: 'reject',
          layout: { columns: 1, gap: '16px' },
          fields: [
            { id: 'reason', type: 'select', label: 'Reason', options: ['Insurance below requirements', 'Insufficient bonding capacity', 'Safety record', 'Other'].map((t) => ({ label: t, value: t })) },
            { id: 'message', type: 'textarea', label: 'Explanation the subcontractor sees', props: { rows: 3 } },
          ],
        }],
      },
    };
  },
  computed: {
    openFindings() {
      return this.findings.filter((f) => f.resolution === 'unresolved' && f.severity !== 'info');
    },
    recommendationLabel() {
      const r = RECOMMENDATION[this.request.recommendation];
      return r ? r.label : '—';
    },
    readiness() {
      const running = this.checks.filter((k) => k.status === 'running');
      const knockouts = this.findings.filter((f) => f.severity === 'knockout' && f.resolution === 'unresolved').length;
      const missing = this.openFindings.filter((f) => f.severity === 'missing');
      const open = this.openFindings.filter((f) => f.severity === 'finding');
      return [
        { ok: knockouts === 0, label: knockouts ? `${knockouts} knockout` : 'No knockouts confirmed' },
        { ok: missing.length === 0, label: missing.length ? `${missing.length} required item failed` : 'Required items met', detail: missing.map((f) => f.title).join(' · ') },
        { ok: open.length === 0, label: open.length ? `${open.length} open findings` : 'No open findings' },
        { ok: running.length === 0, label: running.length ? `${running.length} checks still running` : 'All checks complete', detail: running.map((k) => k.label).join(' · ') },
      ];
    },
    contextRows() {
      return [
        ['Project', this.request.project],
        ['Template', this.context.templateVersion],
        ['Requested', `${currency(this.request.single)} single · ${currency(this.request.aggregate)} aggregate`],
        ['Submitted', this.$moment(this.context.submittedOn).format('D MMM YYYY')],
        ['Requested by', this.context.requestedBy],
      ];
    },
    confirmRows() {
      const a = this.approval;
      const rows = [
        ['Company', this.companyName],
        ['Qualified trades', (a.trades || []).join(', ')],
        ['Limits', `${currency(a.single)} single · ${currency(a.aggregate)} aggregate`],
        ['Valid until', this.$moment(a.validUntil).isValid() ? this.$moment(a.validUntil).format('D MMM YYYY') : a.validUntil],
      ];
      if (this.confirmFrom === 'conditions') rows.push(['Conditions', this.conditions.filter((c) => a.conditions.includes(c.id)).map((c) => c.label).join('; ')]);
      return rows;
    },
  },
  watch: {
    requestFor: {
      immediate: true,
      handler(id) {
        if (!id) return;
        this.infoRequest.items = [id];
        this.mode = 'request';
      },
    },
  },
  methods: {
    startApprove() {
      this.approval.conditions = [];
      this.mode = 'approve';
    },
    toggleCondition(id, on) {
      const c = this.approval.conditions;
      this.approval.conditions = on ? [...new Set([...c, id])] : c.filter((x) => x !== id);
    },
    toggleItem(id, on) {
      const c = this.infoRequest.items;
      this.infoRequest.items = on ? [...new Set([...c, id])] : c.filter((x) => x !== id);
    },
    finish(kind) {
      const DONE = {
        conditions: { title: 'Approved with conditions', body: `${this.companyName} is qualified with conditions until ${this.$moment(this.approval.validUntil).format('D MMM YYYY')}.`, record: true },
        approve: { title: 'Approved', body: `${this.companyName} is qualified until ${this.$moment(this.approval.validUntil).format('D MMM YYYY')}.`, record: true },
        request: { title: 'Information requested', body: `${this.infoRequest.items.length} item(s) sent to ${this.companyName}. The request moves to “More information needed”.`, record: false },
        reject: { title: 'Not approved', body: `${this.companyName} has been told: ${this.rejection.reason}.`, record: false },
      };
      this.done = DONE[kind];
      this.mode = 'done';
      this.$emit('decided', kind);
    },
  },
};
</script>
