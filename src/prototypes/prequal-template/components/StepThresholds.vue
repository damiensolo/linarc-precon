<template>
  <!-- Step 3: minimum eligibility thresholds apart from risk / scoring thresholds (PRD UX l. 909–932). One table:
       Criterion · Rule type · Rule · Outcome when failed (derived from the rule type). Configure changes the rule
       type and the value; the criteria themselves ship with Linarc. The value shows on step 2 next to its field. -->
  <div class="flex flex-col gap-space-24">
    <dl class="m-0 grid grid-cols-1 gap-x-space-24 gap-y-space-8 font-label text-fontsize-14 leading-lineheight-20 sm:grid-cols-2">
      <div v-for="r in RULE_TYPES" :key="r.value" class="flex gap-space-8">
        <dt class="w-space-124 shrink-0 text-text-default">{{ r.label }}</dt>
        <dd class="m-0 text-text-subtle">{{ describe(r.value) }}</dd>
      </div>
    </dl>
    <RepeatField :field="field" :value="def.thresholds" @input="$emit('input', { thresholds: $event })" />
  </div>
</template>

<script>
import RepeatField from '~/candidates/FormTableFields/RepeatField.vue';
import { RULE_TYPES, ruleOutcome, thresholdText, weightLabel, UNITS } from '~/modules/prequal/data/templateCatalog';

const DESCRIBE = {
  minimum: 'Failing it fails the requirement; a required document or value below it blocks a recommendation to accept.',
  scoring: 'Below the target the section score drops; it never disqualifies on its own.',
  capacity: 'Produces a finding for the reviewer, normally reviewable.',
  informational: 'Visible to the reviewer, not scored.',
  knockout: 'Any failure sets the recommendation to Not recommended regardless of score.',
};

export default {
  name: 'StepThresholds',
  components: { RepeatField },
  props: { def: { type: Object, required: true } },
  data() {
    return { RULE_TYPES };
  },
  computed: {
    field() {
      return {
        id: 'thresholds',
        props: {
          columns: [
            { key: 'label', label: 'Criterion', lockedFor: () => true, wide: true },
            { key: 'section', label: 'Score impact', readOnly: true, display: (v) => weightLabel(v) },
            { key: 'rule', label: 'Rule type', input: 'select', options: RULE_TYPES, display: (v) => (RULE_TYPES.find((r) => r.value === v) || { label: v }).label },
            { key: 'value', label: 'Rule', input: 'text', display: (v, row) => thresholdText(row), help: 'As the rule reads: dollars, a factor, a percentage, months or days.', fromInput: (v) => (v !== '' && v !== null && !Number.isNaN(Number(String(v).replace(/[$,]/g, ''))) ? Number(String(v).replace(/[$,]/g, '')) : v) },
            { key: 'outcome', label: 'Outcome when failed', readOnly: true, display: (v, row) => ruleOutcome(row.rule, row.section) },
          ],
          addLabel: '',
          editLabel: 'Configure',
          removable: () => false,
          rowTitle: (row) => `${row.label} (${(UNITS[row.unit] || UNITS.status).label || 'rule'})`,
        },
      };
    },
  },
  methods: {
    describe(v) {
      return DESCRIBE[v];
    },
  },
};
</script>
