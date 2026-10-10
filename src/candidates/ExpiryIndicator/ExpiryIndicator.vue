<template>
  <!-- CANDIDATE 2026-10-08: proposed design-system component, see docs/components/ExpiryIndicator.md.
       A date with its urgency: current → expiring (within warnDays) → expired. Text always carries the state; the dot
       only reinforces it. `timeline` variant (2026-10-09, Qualification Record): the date line over a validity bar
       (start → expiry, filled to today); the bar replaces the dot, so there is still one colour signal (D-17). -->
  <span
    v-if="variant === 'inline'"
    class="expiry-indicator inline-flex items-center gap-space-8 whitespace-nowrap font-label"
    :title="fullDate"
  >
    <StatusIndicator v-if="state !== 'none'" type="dot" :status="dotStatus" aria-hidden="true" />
    <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ dateText }}</span>
    <span v-if="hint" class="text-fontsize-12 leading-lineheight-16" :class="hintClass">{{ hint }}</span>
    <slot name="action" />
  </span>

  <span v-else class="expiry-indicator flex w-full min-w-0 flex-col gap-space-4 font-label" :title="fullDate">
    <span class="flex flex-wrap items-baseline gap-x-space-8">
      <span class="text-fontsize-14 leading-lineheight-20 text-text-default">{{ dateText }}</span>
      <span v-if="hint" class="text-fontsize-12 leading-lineheight-16" :class="hintClass">{{ hint }}</span>
    </span>
    <ProgressBar
      v-if="state !== 'none' && startObj"
      :progress="elapsed"
      :bar-only="true"
      :color-stops="barStops"
      :aria-label="barLabel"
    />
  </span>
</template>

<script>
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';
import ProgressBar from '@/components/ProgressBar/ProgressBar.vue';
import { LIFECYCLE } from '~/modules/prequal/status';

const DAY = 24 * 60 * 60 * 1000;
// A date-only ISO string ("2026-10-20") parses as UTC midnight, which is the previous day west of UTC. Read it as
// local midnight so the shown date and the day count match the data (fixed 2026-10-09, F-049).
const toDate = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00`) : new Date(v));
// state → StatusIndicator dot (active = success, standby = warning-low, cancelled = error)
const DOT = { current: 'active', expiring: 'standby', expired: 'cancelled' };
const HINT_CLASS = { current: 'text-text-subtle', expiring: 'text-text-warning-low', expired: 'text-text-error' };
// Timeline fill. Current is neutral, not green: colour only where the user must act (D-17). The spec's
// green → yellow → red is kept for expiring and expired; neutral for current accepted by the user 2026-10-09.
const BAR = {
  current: 'var(--surface-warning-neutral)',
  expiring: 'var(--surface-warning-low)',
  expired: 'var(--surface-error-default)',
};

export default {
  name: 'ExpiryIndicator',
  components: { StatusIndicator, ProgressBar },
  props: {
    /** ISO date string or Date; null renders `emptyLabel`. */
    date: { type: [String, Date], default: null },
    /** Days before `date` from which the state is `expiring` (PRD default 30, configurable per GC). */
    warnDays: { type: Number, default: 30 },
    /** Injectable "today" so screenshots and the mock data are deterministic. */
    now: { type: [String, Date], default: () => new Date() },
    /** Shown when there is no date: "—" in a table of mixed requests, "No expiry" on a record that truly has none. */
    emptyLabel: { type: String, default: '—' },
    /** `inline` (dot · date · hint) or `timeline` (date · hint over a validity bar). */
    variant: { type: String, default: 'inline', validator: (v) => ['inline', 'timeline'].includes(v) },
    /** Start of validity (issue / effective date); the timeline bar runs from here to `date`. */
    startDate: { type: [String, Date], default: null },
  },
  computed: {
    dateObj() {
      return this.date ? toDate(this.date) : null;
    },
    startObj() {
      return this.startDate ? toDate(this.startDate) : null;
    },
    daysLeft() {
      if (!this.dateObj) return null;
      return Math.round((this.dateObj - toDate(this.now)) / DAY);
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
      if (!this.dateObj) return this.emptyLabel;
      const d = this.$moment(this.dateObj).format('D MMM YYYY');
      if (this.variant !== 'timeline') return d;
      return this.state === 'expired' ? `Expired ${d}` : `Expires ${d}`;
    },
    fullDate() {
      return this.dateObj ? this.$moment(this.dateObj).format('LL') : '';
    },
    hint() {
      const d = this.daysLeft;
      if (d === null) return '';
      if (d < 0) {
        const ago = `${-d} day${d === -1 ? '' : 's'} ago`;
        return this.variant === 'timeline' ? ago : `${LIFECYCLE.expired.label.toLowerCase()} · ${ago}`;
      }
      if (d === 0) return 'expires today';
      if (this.state === 'expiring') return `in ${d} day${d === 1 ? '' : 's'}`;
      return '';
    },
    hintClass() {
      return HINT_CLASS[this.state];
    },
    /** Share of the validity period already used, 0–100. */
    elapsed() {
      if (!this.startObj || !this.dateObj) return 0;
      const total = this.dateObj - this.startObj;
      if (total <= 0) return 100;
      const used = toDate(this.now) - this.startObj;
      return Math.max(0, Math.min(100, Math.round((used / total) * 100)));
    },
    barStops() {
      return [{ max: 100, color: BAR[this.state] || BAR.current }];
    },
    barLabel() {
      return `${this.elapsed}% of the validity period used`;
    },
  },
};
</script>
