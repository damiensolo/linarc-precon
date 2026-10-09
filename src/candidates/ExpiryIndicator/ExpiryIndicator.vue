<template>
  <!-- CANDIDATE 2026-10-08: proposed design-system component, see docs/components/ExpiryIndicator.md.
       A date with its urgency: current → expiring (within warnDays) → expired. Text always carries the state; the dot
       only reinforces it. `timeline` variant (validity bar) is added with the Qualification Record. -->
  <span class="expiry-indicator inline-flex items-center gap-space-8 whitespace-nowrap font-label" :title="fullDate">
    <StatusIndicator v-if="state !== 'none'" type="dot" :status="dotStatus" aria-hidden="true" />
    <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ dateText }}</span>
    <span v-if="hint" class="text-fontsize-12 leading-lineheight-16" :class="hintClass">{{ hint }}</span>
    <slot name="action" />
  </span>
</template>

<script>
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';
import { LIFECYCLE } from '~/modules/prequal/status';

const DAY = 24 * 60 * 60 * 1000;
// state → StatusIndicator dot (active = success, standby = warning-low, cancelled = error)
const DOT = { current: 'active', expiring: 'standby', expired: 'cancelled' };
const HINT_CLASS = { current: 'text-text-subtle', expiring: 'text-text-warning-low', expired: 'text-text-error' };

export default {
  name: 'ExpiryIndicator',
  components: { StatusIndicator },
  props: {
    /** ISO date string or Date; null renders "No expiry". */
    date: { type: [String, Date], default: null },
    /** Days before `date` from which the state is `expiring` (PRD default 30, configurable per GC). */
    warnDays: { type: Number, default: 30 },
    /** Injectable "today" so screenshots and the mock data are deterministic. */
    now: { type: [String, Date], default: () => new Date() },
    /** Shown when there is no date: "—" in a table of mixed requests, "No expiry" on a record that truly has none. */
    emptyLabel: { type: String, default: '—' },
  },
  computed: {
    dateObj() {
      return this.date ? new Date(this.date) : null;
    },
    daysLeft() {
      if (!this.dateObj) return null;
      return Math.round((this.dateObj - new Date(this.now)) / DAY);
    },
    /** current | expiring | expired | none; tones follow LIFECYCLE in status.js */
    state() {
      if (this.daysLeft === null) return 'none';
      if (this.daysLeft < 0) return 'expired';
      if (this.daysLeft <= this.warnDays) return 'expiring';
      return 'current';
    },
    dotStatus() {
      return DOT[this.state];
    },
    dateText() {
      return this.dateObj ? this.$moment(this.dateObj).format('D MMM YYYY') : this.emptyLabel;
    },
    fullDate() {
      return this.dateObj ? this.$moment(this.dateObj).format('LL') : '';
    },
    hint() {
      const d = this.daysLeft;
      if (d === null) return '';
      if (d < 0) return `${LIFECYCLE.expired.label.toLowerCase()} · ${-d} day${d === -1 ? '' : 's'} ago`;
      if (d === 0) return 'expires today';
      if (this.state === 'expiring') return `in ${d} day${d === 1 ? '' : 's'}`;
      return '';
    },
    hintClass() {
      return HINT_CLASS[this.state];
    },
  },
};
</script>
