// DataGrid cell slots for the Prequalification candidates, registered through the grid's public extension point
// (src/components/DataGrid/cellVariants/slotRegistry.js: "Consumers can register additional slot types at app bootstrap").
// Import this module once from any Prequal screen that uses these column types:
//   cell: { center: { type: 'score-confidence', componentProps: { score: (r) => r.score, … } } }
import { registerSlotType } from '@/components/DataGrid/cellVariants/slotRegistry';
import { resolveComponentProps } from '@/components/DataGrid/cellVariants/_resolvers';
import ScoreConfidence from '~/candidates/ScoreConfidence/ScoreConfidence.vue';
import ExpiryIndicator from '~/candidates/ExpiryIndicator/ExpiryIndicator.vue';

/** Wrap a candidate as a slot component: `componentProps` (static or per-row functions) become the candidate's props. */
const asSlot = (name, Component) => ({
  name,
  props: {
    row: { type: Object, default: () => ({}) },
    value: { type: null, default: null },
    column: { type: Object, default: () => ({}) },
    slotProps: { type: Object, default: () => ({}) },
  },
  computed: {
    cp() {
      return resolveComponentProps(this.slotProps.componentProps, this.row);
    },
  },
  render(h) {
    return h(Component, { props: this.cp });
  },
});

registerSlotType('score-confidence', asSlot('ScoreConfidenceSlot', ScoreConfidence));
registerSlotType('expiry', asSlot('ExpirySlot', ExpiryIndicator));

export const PREQUAL_SLOT_TYPES = ['score-confidence', 'expiry'];
