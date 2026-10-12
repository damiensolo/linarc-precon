<template>
  <!-- Sticky decision panel (right panel): what's left before a decision, the four decisions, request context and
       recent activity. Approve with conditions and Request information open a short form in the panel, then a
       confirmation preview; nothing is sent until Confirm. Linarc recommends; the reviewer decides.
       Submits are honest (docs/5-ui-patterns.md §6): Confirm / Send request / Reject request run a (mock) request; the
       buttons disable at once (a second click does nothing), "Saving…" / "Sending…" shows only after 200ms, the Done
       state only after the request resolves, and a failure keeps the form with an error and Retry. The state line is
       the shared LoadStatus on action controllers (createLoad `action`); it sits after the form, outside the mode
       switch, so its live region survives the switch to Done and says "Decision saved" / "Information request sent".
       Per request (2026-10-11): the starting values (trades, limits, valid until, preselected conditions, message) come
       from the review's `defaults`; the solid button follows the recommendation (`defaults.primary`). A decided request
       shows its decision read-only (`decided`); one waiting on the sub shows what was asked and when (`infoRequest`),
       and the reviewer can still decide. -->
  <div class="flex flex-col gap-space-24 font-label">
    <!-- Decided: read-only -->
    <section v-if="decided" class="flex flex-col gap-space-12">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Decision</h2>
      <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ decidedSentence }}</p>
      <dl class="m-0 flex flex-col divide-y divide-border-subtle text-fontsize-14 leading-lineheight-20">
        <div v-for="r in decidedRows" :key="r[0]" class="flex flex-col gap-space-2 py-space-8"><dt class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ r[0] }}</dt><dd class="m-0 text-text-default">{{ r[1] }}</dd></div>
      </dl>
      <div class="flex flex-wrap gap-space-8">
        <Button v-if="decided.outcome !== 'not-qualified'" label="View qualification record" color-scheme="primary" variant="solid" size="medium" @onClick="$emit('record')" />
        <Button :label="backLabel" color-scheme="secondary" variant="outline" size="medium" @onClick="$emit('dashboard')" />
      </div>
    </section>

    <!-- Done -->
    <section v-else-if="mode === 'done'" class="flex flex-col gap-space-12">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ done.title }}</h2>
      <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ done.body }}</p>
      <div class="flex flex-wrap gap-space-8">
        <Button v-if="done.record" label="View qualification record" color-scheme="primary" variant="solid" size="medium" @onClick="$emit('record')" />
        <Button :label="backLabel" color-scheme="secondary" variant="outline" size="medium" @onClick="$emit('dashboard')" />
      </div>
    </section>

    <!-- Decide -->
    <template v-else-if="mode === 'decide'">
      <!-- The subcontractor answered (portal Send response): what came back; the decision is next. -->
      <section v-if="infoRequest && infoRequest.respondedAt" class="flex flex-col gap-space-8">
        <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Response received</h2>
        <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">
          The subcontractor responded on {{ $moment(infoRequest.respondedAt).format('D MMM') }} to the request {{ infoRequest.by }} sent on {{ $moment(infoRequest.on).format('D MMM') }}. Check the new documents, then decide.
        </p>
        <ul class="m-0 flex list-none flex-col gap-space-4 p-0 text-fontsize-14 leading-lineheight-20 text-text-default">
          <li v-for="label in infoRequest.received" :key="label">{{ label }}</li>
        </ul>
      </section>
      <section v-else-if="infoRequest" class="flex flex-col gap-space-8">
        <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Waiting for the subcontractor</h2>
        <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">
          {{ infoRequest.by }} asked for {{ requestedItems.length }} item{{ requestedItems.length === 1 ? '' : 's' }} on {{ $moment(infoRequest.on).format('D MMM') }}; due {{ $moment(infoRequest.dueOn).format('D MMM') }}.
        </p>
        <ul class="m-0 flex list-none flex-col gap-space-4 p-0 text-fontsize-14 leading-lineheight-20 text-text-default">
          <li v-for="f in requestedItems" :key="f.id">{{ f.title }}</li>
        </ul>
        <p class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">“{{ infoRequest.message }}”</p>
      </section>
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
        <Button v-for="a in actions" :key="a.id" class="w-full" :label="a.label" :color-scheme="a.scheme" :variant="a.variant" size="medium" @onClick="act(a.id)" />
        <p class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ primaryNote }}</p>
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
          <li v-for="(h, i) in history.slice(0, 3)" :key="`${h.at}-${i}`" class="flex flex-col text-fontsize-12 leading-lineheight-16">
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
        <Button label="Confirm" color-scheme="primary" variant="solid" size="medium" :is-disabled="busy" @onClick="finish(confirmFrom)" />
        <Button label="Back" color-scheme="secondary" variant="outline" size="medium" :is-disabled="busy" @onClick="mode = confirmFrom" />
      </div>
    </section>

    <!-- Request information -->
    <section v-else-if="mode === 'request'" class="flex flex-col gap-space-16">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Request information</h2>
      <div class="flex flex-col gap-space-8">
        <span class="text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Items to send back</span>
        <Checkbox v-for="f in openFindings" :key="f.id" :value="infoForm.items.includes(f.id)" :label="f.title" size="small" @input="toggleItem(f.id, $event)" />
      </div>
      <FormV2 :value="{ message: infoForm.message }" :schema="messageSchema" :flat="true" mode="manual" label-position="top" @input="infoForm.message = $event.message">
        <template #footer><span /></template>
      </FormV2>
      <p class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">The subcontractor sees the items and your message, not check results.</p>
      <div class="flex flex-wrap gap-space-8">
        <Button label="Send request" color-scheme="primary" variant="solid" size="medium" :is-disabled="!infoForm.items.length || busy" @onClick="finish('request')" />
        <Button label="Cancel" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="busy" @onClick="mode = 'decide'" />
      </div>
    </section>

    <!-- Reject -->
    <section v-else-if="mode === 'reject'" class="flex flex-col gap-space-16">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Reject</h2>
      <FormV2 v-model="rejection" :schema="rejectSchema" :flat="true" mode="manual" label-position="top">
        <template #footer><span /></template>
      </FormV2>
      <div class="flex flex-wrap gap-space-8">
        <Button label="Reject request" color-scheme="primary" variant="solid" size="medium" :is-disabled="!rejection.reason || busy" @onClick="finish('reject')" />
        <Button label="Cancel" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="busy" @onClick="mode = 'decide'" />
      </div>
    </section>

    <!-- The submitted form's state (Saving… / Sending…, or the error + Retry). -mt-space-8: 16px under the form's
         buttons, as inside the form (the panel's own gap is 24). -->
    <div v-if="submitted" class="-mt-space-8 flex flex-col">
      <LoadStatus :load="submitLoad" variant="notice" @retry="finish(submitted)" />
    </div>
  </div>
</template>

<script>
import { Check } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import { RECOMMENDATION } from '~/modules/prequal/status';
import { currency } from '~/candidates/FormTableFields/format';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default {
  name: 'DecisionPanel',
  components: { Check, Button, Checkbox, FormV2, LoadStatus },
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
    /** Starting values for this request: { primary, trades, validUntil, validUntilHelp, conditions, infoMessage, rejectReason }. */
    defaults: { type: Object, default: () => ({}) },
    /** An open information request: { on, by, dueOn, items: [finding ids], message }. */
    infoRequest: { type: Object, default: null },
    /** A decision already made (closed request): { outcome, by, on, trades, validUntil, conditions } or { outcome, by, on, reason, message }. */
    decided: { type: Object, default: null },
    backLabel: { type: String, default: 'Back to Review Queue' },
  },
  data() {
    return {
      mode: 'decide',
      confirmFrom: 'conditions',
      done: null,
      /** The decision being (or last) submitted; its state shows under the form. Cleared when the form changes. */
      submitted: null,
      /** Approve / approve with conditions / reject save a decision; Request information sends a request. */
      decisionLoad: createLoad({ label: 'decision', action: { busy: 'Saving', done: 'Saved', error: "Couldn't save the decision. Nothing was changed." } }),
      requestLoad: createLoad({ label: 'information request', action: { busy: 'Sending', done: 'Sent', error: "Couldn't send the request. Nothing was sent." } }),
      approval: {
        trades: [(this.defaults.trades || [this.trade])[0]],
        single: this.request.single,
        aggregate: this.request.aggregate,
        validUntil: this.defaults.validUntil || '',
        conditions: [...(this.defaults.conditions || [])],
      },
      infoForm: { items: [], message: this.defaults.infoMessage || '' },
      rejection: { reason: this.defaults.rejectReason || '', message: '' },
      approvalSchema: {
        sections: [{
          id: 'approval',
          layout: { columns: 1, gap: '16px' },
          fields: [
            { id: 'trades', type: 'multiselect', label: 'Qualified trades', options: (this.defaults.trades || [this.trade]).map((t) => ({ label: t, value: t })) },
            { id: 'single', type: 'number', label: 'Single-project limit' },
            { id: 'aggregate', type: 'number', label: 'Aggregate limit' },
            { id: 'validUntil', type: 'text', label: 'Valid until', help: this.defaults.validUntilHelp || 'Earliest key-document expiry' },
          ],
        }],
      },
      messageSchema: { sections: [{ id: 'msg', layout: { columns: 1, gap: '16px' }, fields: [{ id: 'message', type: 'textarea', label: 'Message to the subcontractor', props: { rows: 4 } }] }] },
      rejectSchema: {
        sections: [{
          id: 'reject',
          layout: { columns: 1, gap: '16px' },
          fields: [
            { id: 'reason', type: 'select', label: 'Reason', options: ['Debarment (knockout)', 'Insurance below requirements', 'Insufficient bonding capacity', 'Safety record', 'Other'].map((t) => ({ label: t, value: t })) },
            { id: 'message', type: 'textarea', label: 'Explanation the subcontractor sees', props: { rows: 3 } },
          ],
        }],
      },
    };
  },
  computed: {
    busy() {
      return this.decisionLoad.status === 'loading' || this.requestLoad.status === 'loading';
    },
    submitLoad() {
      return this.submitted === 'request' ? this.requestLoad : this.decisionLoad;
    },
    openFindings() {
      return this.findings.filter((f) => f.resolution === 'unresolved' && f.severity !== 'info');
    },
    recommendationLabel() {
      const r = RECOMMENDATION[this.request.recommendation];
      return r ? r.label : '—';
    },
    /** The four decisions in a fixed order; only the one the recommendation points to is solid. */
    actions() {
      const primary = this.defaults.primary || 'conditions';
      const rest = { conditions: 'outline', approve: 'outline', request: 'outline', reject: 'minimal' };
      return [
        ['conditions', 'Approve with conditions'],
        ['approve', 'Approve'],
        ['request', 'Request information'],
        ['reject', 'Reject'],
      ].map(([id, label]) => (id === primary
        ? { id, label, scheme: 'primary', variant: 'solid' }
        : { id, label, scheme: 'secondary', variant: rest[id] }));
    },
    primaryNote() {
      const rec = `Recommended: ${this.recommendationLabel}.`;
      switch (this.defaults.primary) {
        case 'approve':
          return `${rec} Nothing required is open, so the primary action is Approve.`;
        case 'reject':
          return `${rec} A confirmed knockout is open; it can only be approved if the match is dismissed.`;
        case 'request':
          return `${rec} Required items are missing or unverified, so the primary action asks the subcontractor for them.`;
        default:
          return `${rec} The primary action follows the open required item; approving without conditions leaves it unresolved.`;
      }
    },
    requestedItems() {
      if (!this.infoRequest) return [];
      return this.infoRequest.items.map((id) => this.findings.find((f) => f.id === id)).filter(Boolean);
    },
    decidedSentence() {
      const d = this.decided;
      const on = this.$moment(d.on).format('D MMM YYYY');
      if (d.outcome === 'not-qualified') return `Not approved by ${d.by} on ${on}.`;
      const what = d.outcome === 'qualified-with-conditions' ? 'Approved with conditions' : 'Approved';
      return `${what} by ${d.by} on ${on}. The qualification record carries what happened since.`;
    },
    decidedRows() {
      const d = this.decided;
      if (d.outcome === 'not-qualified') return [['Reason', d.reason], ['Told the subcontractor', d.message]];
      return [
        ['Qualified trades', d.trades.map((t) => `${t.trade} (${currency(t.single)} / ${currency(t.aggregate)})`).join(' · ')],
        ['Valid until', this.$moment(d.validUntil).format('D MMM YYYY')],
        ['Conditions', d.conditions.length ? d.conditions.map((c) => c.label).join('; ') : 'None'],
      ];
    },
    readiness() {
      const running = this.checks.filter((k) => k.status === 'running');
      const knockouts = this.findings.filter((f) => f.severity === 'knockout' && f.resolution === 'unresolved').length;
      const missing = this.openFindings.filter((f) => f.severity === 'missing');
      const open = this.openFindings.filter((f) => f.severity === 'finding');
      return [
        // Counts are pluralised ("2 required items failed"; was "2 required item failed", 2026-10-11).
        { ok: knockouts === 0, label: knockouts ? plural(knockouts, 'knockout') : 'No knockouts confirmed' },
        { ok: missing.length === 0, label: missing.length ? `${plural(missing.length, 'required item')} failed` : 'Required items met', detail: missing.map((f) => f.title).join(' · ') },
        { ok: open.length === 0, label: open.length ? plural(open.length, 'open finding') : 'No open findings' },
        { ok: running.length === 0, label: running.length ? `${plural(running.length, 'check')} still running` : 'All checks complete', detail: running.map((k) => k.label).join(' · ') },
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
    mode(m) {
      // Kept on Done, so the confirmation is announced by the same live region that announced "Saving…".
      if (!this.busy && m !== 'done') this.submitted = null;
    },
    requestFor: {
      immediate: true,
      handler(id) {
        if (!id) return;
        this.infoForm.items = [id];
        this.mode = 'request';
      },
    },
  },
  beforeDestroy() {
    this.decisionLoad.destroy();
    this.requestLoad.destroy();
  },
  methods: {
    act(id) {
      if (id === 'approve') this.startApprove();
      else this.mode = id;
    },
    startApprove() {
      this.approval.conditions = [];
      this.mode = 'approve';
    },
    toggleCondition(id, on) {
      const c = this.approval.conditions;
      this.approval.conditions = on ? [...new Set([...c, id])] : c.filter((x) => x !== id);
    },
    toggleItem(id, on) {
      const c = this.infoForm.items;
      this.infoForm.items = on ? [...new Set([...c, id])] : c.filter((x) => x !== id);
    },
    finish(kind) {
      const DONE = {
        conditions: { title: 'Approved with conditions', body: `${this.companyName} is qualified with conditions until ${this.$moment(this.approval.validUntil).format('D MMM YYYY')}.`, record: true },
        approve: { title: 'Approved', body: `${this.companyName} is qualified until ${this.$moment(this.approval.validUntil).format('D MMM YYYY')}.`, record: true },
        request: { title: 'Information requested', body: `${plural(this.infoForm.items.length, 'item')} sent to ${this.companyName.replace(/\.$/, '')}. The request moves to “More information needed”.`, record: false },
        reject: { title: 'Not approved', body: `${this.companyName} has been told: ${this.rejection.reason}.`, record: false },
      };
      // A second click while the first is in flight does nothing (the button is disabled on the next frame).
      if (this.busy) return;
      this.submitted = kind;
      this.submitLoad.run(
        (signal) => mockRequest(() => kind, { signal }),
        () => {
          this.done = DONE[kind];
          this.mode = 'done';
          // What was decided, for the page to record (data/session.js decide()).
          const a = this.approval;
          const num = (v) => Number(String(v).replace(/[^0-9.]/g, ''));
          this.$emit('decided', {
            kind,
            trades: a.trades || [],
            single: num(a.single),
            aggregate: num(a.aggregate),
            validUntil: this.$moment(a.validUntil).isValid() ? this.$moment(a.validUntil).format('YYYY-MM-DD') : a.validUntil,
            conditions: kind === 'conditions' ? this.conditions.filter((c) => a.conditions.includes(c.id)).map((c) => c.label) : [],
            items: this.infoForm.items,
            labels: this.findings.filter((f) => this.infoForm.items.includes(f.id)).map((f) => f.title),
            message: kind === 'request' ? this.infoForm.message : this.rejection.message,
            reason: this.rejection.reason,
          });
        },
      );
    },
  },
};
</script>
