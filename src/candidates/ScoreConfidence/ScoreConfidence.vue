<template>
  <!-- CANDIDATE 2026-10-08: proposed design-system component, see docs/components/ScoreConfidence.md.
       Score and Confidence are always shown together (PRD §8): "72 · 64%". The recommendation carries the colour, never
       the numbers. `strip` variant (review header) is added with screen 5. -->
  <span
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

// Recommendation → StatusIndicator dot status (StatusIndicator/statusConstants.js: active = success, indeterminate = primary,
// cancelled = error).
const DOT = { accept: 'active', review: 'indeterminate', 'not-recommended': 'cancelled' };

export default {
  name: 'ScoreConfidence',
  components: { StatusIndicator },
  props: {
    /** 0–100, or null when not yet scored. */
    score: { type: Number, default: null },
    /** 0–100 (%), or null. */
    confidence: { type: Number, default: null },
    /** 'accept' | 'review' | 'not-recommended' | null; adds a leading dot. */
    recommendation: { type: String, default: null, validator: (v) => v === null || v in DOT },
  },
  computed: {
    dotStatus() {
      return DOT[this.recommendation] || 'disabled';
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
