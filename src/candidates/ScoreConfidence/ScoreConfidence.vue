<template>
  <!-- CANDIDATE 2026-10-08: proposed design-system component, see docs/components/ScoreConfidence.md.
       Score and Confidence are always shown together (PRD §8): "72 · 64%". The recommendation carries the colour, never
       the numbers.
       `strip` variant (2026-10-09, review header): the recommendation stamp as a StatusChip, then Score, Confidence,
       Knockouts and Checks as labelled values separated by space (no boxes, D-17), and a provisional note when checks
       are pending. -->
  <div v-if="variant === 'strip'" class="score-confidence-strip flex flex-col gap-space-8 font-label" role="group" :aria-label="ariaLabel">
    <div class="flex flex-wrap items-end gap-x-space-40 gap-y-space-16">
      <div class="flex flex-col gap-space-4">
        <span class="text-fontsize-12 leading-lineheight-16 text-text-soft">Recommendation</span>
        <StatusChip v-if="rec" :label="rec.label" :status="chipStatus" fill-style="outline" type="default" :removable="false" />
        <span v-else class="text-fontsize-14 leading-lineheight-20 text-text-subtle">Not yet scored</span>
      </div>
      <div v-for="s in stats" :key="s.label" class="flex flex-col gap-space-2">
        <span class="text-fontsize-12 leading-lineheight-16 text-text-soft">{{ s.label }}</span>
        <span class="tabular-nums">
          <span class="text-fontsize-20 font-bold leading-lineheight-28 text-text-default">{{ s.value }}</span>
          <span v-if="s.suffix" class="text-fontsize-14 leading-lineheight-20 text-text-subtle"> {{ s.suffix }}</span>
        </span>
      </div>
    </div>
    <p v-if="provisional" class="m-0 text-fontsize-12 leading-lineheight-16 text-text-subtle">
      <slot name="note">Provisional: {{ checksTotal - checksComplete }} check{{ checksTotal - checksComplete === 1 ? '' : 's' }} still running.</slot>
    </p>
  </div>
  <span
    v-else
    class="score-confidence inline-flex items-baseline gap-space-4 whitespace-nowrap font-label"
    role="group"
    :aria-label="ariaLabel"
  >
    <StatusIndicator v-if="recommendation" type="dot" :status="dotStatus" class="self-center" aria-hidden="true" />
    <span class="text-fontsize-14 leading-lineheight-20 tabular-nums text-text-default">{{ scoreText }}</span>
    <span class="text-fontsize-14 leading-lineheight-20 text-text-soft" aria-hidden="true">·</span>
    <span class="text-fontsize-12 leading-lineheight-16 tabular-nums text-text-subtle">{{ confidenceText }}</span>
  </span>
</template>

<script>
import StatusIndicator from '@/componentsV2/StatusIndicator/StatusIndicator.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import { RECOMMENDATION, toneToChipStatus } from '~/modules/prequal/status';

// Recommendation → StatusIndicator dot status (StatusIndicator/statusConstants.js: active = success, indeterminate = primary,
// cancelled = error).
const DOT = { accept: 'active', review: 'indeterminate', 'not-recommended': 'cancelled' };

export default {
  name: 'ScoreConfidence',
  components: { StatusIndicator, StatusChip },
  props: {
    /** 0–100, or null when not yet scored. */
    score: { type: Number, default: null },
    /** 0–100 (%), or null. */
    confidence: { type: Number, default: null },
    /** 'accept' | 'review' | 'not-recommended' | null; adds a leading dot (cell) or the stamp (strip). */
    recommendation: { type: String, default: null, validator: (v) => v === null || v in DOT },
    /** 'cell' (table) | 'strip' (review header). */
    variant: { type: String, default: 'cell', validator: (v) => ['cell', 'strip'].includes(v) },
    /** strip: confirmed knockouts. */
    knockouts: { type: Number, default: 0 },
    /** strip: checks complete / total. */
    checksComplete: { type: Number, default: null },
    checksTotal: { type: Number, default: null },
    /** strip: true while checks are pending; adds the note. */
    provisional: { type: Boolean, default: false },
  },
  computed: {
    dotStatus() {
      return DOT[this.recommendation] || 'disabled';
    },
    rec() {
      return this.recommendation ? RECOMMENDATION[this.recommendation] : null;
    },
    chipStatus() {
      return this.rec ? toneToChipStatus(this.rec.tone) : 'warning-neutral';
    },
    stats() {
      const out = [
        { label: 'Score', value: this.scoreText, suffix: this.score === null ? '' : '/ 100' },
        { label: 'Confidence', value: this.confidenceText, suffix: '' },
        { label: 'Knockouts', value: String(this.knockouts), suffix: 'confirmed' },
      ];
      if (this.checksTotal) out.push({ label: 'Checks', value: `${this.checksComplete} / ${this.checksTotal}`, suffix: 'complete' });
      return out;
    },
    scoreText() {
      return this.score === null ? '—' : String(this.score);
    },
    confidenceText() {
      return this.confidence === null ? '—' : `${this.confidence}%`;
    },
    ariaLabel() {
      if (this.score === null) return 'Not yet scored';
      return `Score ${this.score} of 100, confidence ${this.confidence === null ? 'unknown' : this.confidence + ' percent'}`;
    },
  },
};
</script>
