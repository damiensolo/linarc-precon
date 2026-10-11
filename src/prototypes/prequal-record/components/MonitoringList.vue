<template>
  <!-- Ongoing monitoring (reviewer only; document validation is hidden from Estimator/PM): every document on the
       record with its validity timeline (ExpiryIndicator `timeline`), soonest expiry first. A row needs action only
       when it is expiring or expired and no renewal has been requested; then "Request renewal" is its one action.
       `pending`: a reminder is being sent; Send reminder is disabled until it answers. The #status slot (sending /
       failed + Retry) sits where the confirmation line does. -->
  <section class="flex flex-col gap-space-8 font-label" aria-labelledby="record-monitoring">
    <div class="flex flex-wrap items-baseline justify-between gap-x-space-16 gap-y-space-4">
      <h2 id="record-monitoring" class="m-0 font-heading text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Monitoring</h2>
      <p class="m-0 text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ summary }}</p>
    </div>
    <p v-if="sent" class="m-0 text-fontsize-14 leading-lineheight-20 text-text-default" role="status">{{ sent }}</p>
    <slot name="status" />
    <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
      <li v-for="d in sorted" :key="d.id" class="grid grid-cols-1 items-center gap-x-space-24 gap-y-space-8 py-space-12 sm:grid-cols-12">
        <span class="flex min-w-0 flex-col sm:col-span-5">
          <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ d.label }}</span>
          <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ d.note }}<template v-if="d.key"> · sets valid-until</template></span>
        </span>
        <span class="min-w-0 sm:col-span-4">
          <ExpiryIndicator variant="timeline" :date="d.expires" :start-date="d.issued" :now="now" empty-label="No expiry" />
        </span>
        <span class="flex flex-wrap items-center gap-x-space-8 sm:col-span-3 sm:justify-end">
          <template v-if="d.renewal">
            <span class="text-fontsize-12 leading-lineheight-16 text-text-subtle">
              {{ renewal(d).label }} {{ $moment(d.renewal.on).format('D MMM') }}
            </span>
            <Button label="Send reminder" color-scheme="primary" variant="text" size="small" :is-disabled="pending" @onClick="$emit('remind', d)" />
          </template>
          <Button
            v-else-if="needsRenewal(d)"
            label="Request renewal"
            color-scheme="primary"
            variant="text"
            size="small"
            @onClick="$emit('renew', d.id)"
          />
        </span>
      </li>
    </ul>
  </section>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import ExpiryIndicator from '~/candidates/ExpiryIndicator/ExpiryIndicator.vue';
import { RENEWAL } from '~/modules/prequal/status';

const DAY = 24 * 60 * 60 * 1000;
const WARN_DAYS = 30;

export default {
  name: 'MonitoringList',
  components: { Button, ExpiryIndicator },
  props: {
    documents: { type: Array, required: true },
    now: { type: String, required: true },
    /** Confirmation line after a renewal request or reminder. */
    sent: { type: String, default: '' },
    /** A reminder is being sent: Send reminder is disabled (no double send). */
    pending: { type: Boolean, default: false },
  },
  computed: {
    sorted() {
      return [...this.documents].sort((a, b) => (a.expires || '9999').localeCompare(b.expires || '9999'));
    },
    summary() {
      const n = (s) => this.documents.filter((d) => this.state(d) === s).length;
      const expiring = n('expiring');
      const expired = n('expired');
      const parts = [`${this.documents.length} documents`];
      parts.push(expiring ? `${expiring} expiring within ${WARN_DAYS} days` : 'none expiring soon');
      if (expired) parts.push(`${expired} expired`);
      return parts.join(' · ');
    },
  },
  methods: {
    state(d) {
      if (!d.expires) return 'none';
      const days = Math.round((new Date(d.expires) - new Date(this.now)) / DAY);
      if (days < 0) return 'expired';
      if (days <= WARN_DAYS) return 'expiring';
      return 'current';
    },
    needsRenewal(d) {
      return ['expiring', 'expired'].includes(this.state(d));
    },
    renewal(d) {
      return RENEWAL[d.renewal.status];
    },
  },
};
</script>
