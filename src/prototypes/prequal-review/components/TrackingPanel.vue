<template>
  <!-- Right panel of a request the subcontractor hasn't submitted (PRD UX l. 1186: delivery state, completion progress
       and check progress as separate indicators; progress and checks are in the main column). Delivery: who it went
       to, when, whether it was opened, reminders, the due date. Action: Send reminder (an honest submit, as on the
       record screen), or for a draft, Continue in the wizard. Nothing here decides anything: the Decision panel only
       appears once there's a submission. -->
  <div class="flex flex-col gap-space-24 font-label">
    <section class="flex flex-col gap-space-8">
      <h2 class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ draft ? 'Draft' : 'Invitation' }}</h2>
      <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ sentence }}</p>
      <dl class="m-0 flex flex-col gap-space-4 text-fontsize-12 leading-lineheight-16">
        <div v-for="c in deliveryRows" :key="c[0]" class="flex gap-space-8"><dt class="w-space-88 shrink-0 text-text-subtle">{{ c[0] }}</dt><dd class="m-0 min-w-0 break-words text-text-default">{{ c[1] }}</dd></div>
      </dl>
    </section>

    <section class="flex flex-col gap-space-8">
      <Button v-if="draft" class="w-full" label="Continue in the wizard" color-scheme="primary" variant="solid" size="medium" @onClick="$emit('wizard')" />
      <template v-else>
        <Button class="w-full" label="Send reminder" color-scheme="secondary" variant="outline" size="medium" :is-disabled="sending" @onClick="remind" />
        <p v-if="sentNote" class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ sentNote }}</p>
        <LoadStatus :load="reminder" :active="tried" variant="notice" @retry="remind" />
      </template>
    </section>

    <section class="flex flex-col gap-space-8 border-t border-border-subtle pt-space-20">
      <h3 class="m-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Request</h3>
      <dl class="m-0 flex flex-col gap-space-4 text-fontsize-12 leading-lineheight-16">
        <div v-for="c in contextRows" :key="c[0]" class="flex gap-space-8"><dt class="w-space-88 shrink-0 text-text-subtle">{{ c[0] }}</dt><dd class="m-0 text-text-default">{{ c[1] }}</dd></div>
      </dl>
    </section>

    <section v-if="history.length" class="flex flex-col gap-space-8">
      <h3 class="m-0 text-fontsize-14 font-bold leading-lineheight-20 text-text-default">Recent activity</h3>
      <ol class="m-0 flex list-none flex-col gap-space-8 p-0">
        <li v-for="(h, i) in history.slice(0, 3)" :key="`${h.at}-${i}`" class="flex flex-col text-fontsize-12 leading-lineheight-16">
          <span class="text-text-default">{{ h.actor }} · {{ h.action }}</span>
          <span class="text-text-subtle">{{ $moment(h.at).format('D MMM, h:mm a') }}</span>
        </li>
      </ol>
    </section>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { currency } from '~/candidates/FormTableFields/format';
import { mockRequest } from '~/modules/mock/request';

export default {
  name: 'TrackingPanel',
  components: { Button, LoadStatus },
  props: {
    request: { type: Object, required: true },
    tracking: { type: Object, required: true },
    templateName: { type: String, required: true },
    history: { type: Array, required: true },
  },
  data() {
    return {
      reminder: createLoad({ label: 'reminder', action: { busy: 'Sending', done: 'Sent', error: "Couldn't send the reminder. Nothing was sent." } }),
      tried: false,
      sentNote: '',
    };
  },
  computed: {
    draft() {
      return this.tracking.stage === 'draft';
    },
    sending() {
      return this.reminder.status === 'loading';
    },
    fmt() {
      return (d) => this.$moment(d).format('D MMM YYYY');
    },
    sentence() {
      const t = this.tracking;
      const who = t.recipient.name;
      if (this.draft) return `Not sent. ${t.invitedBy} saved it as a draft; ${who} hasn’t been invited.`;
      if (!t.opened) return `Sent to ${who} on ${this.fmt(t.invitedOn)}; not opened yet.`;
      if (this.request.workflow === 'invited') return `${who} opened the invitation on ${this.fmt(t.opened)} but hasn't started.`;
      return `${who} is completing the requirements.`;
    },
    deliveryRows() {
      const t = this.tracking;
      const rows = [['Recipient', `${t.recipient.name} · ${t.recipient.email}`]];
      if (this.draft) return rows;
      rows.push(['Sent', `${this.fmt(t.invitedOn)} by ${t.invitedBy}`]);
      rows.push(['Opened', t.opened ? this.fmt(t.opened) : 'Not yet']);
      if (t.reminders.length) rows.push(['Reminders', t.reminders.map(this.fmt).join(', ')]);
      rows.push(['Due', this.fmt(t.dueOn)]);
      return rows;
    },
    contextRows() {
      return [
        ['Project', this.request.project],
        ['Template', this.templateName],
        ['Requested', `${currency(this.request.single)} single · ${currency(this.request.aggregate)} aggregate`],
      ];
    },
  },
  beforeDestroy() {
    this.reminder.destroy();
  },
  methods: {
    remind() {
      if (this.sending) return;
      this.tried = true;
      this.reminder.run(
        (signal) => mockRequest(() => true, { signal }),
        () => {
          const who = this.tracking.recipient.name;
          this.sentNote = `Reminder sent to ${who}.`;
          this.$emit('reminded', { at: new Date().toISOString(), actor: 'Jordan Lee', action: `Sent a reminder to ${who}` });
        },
      );
    },
  },
};
</script>
