<template>
  <!-- Step 4: the independent checks this template runs (PRD UX l. 936–955): what each checks (source), when it runs
       and who sees the result, the cost per request. Paid checks are acknowledged once, on Review & publish, not on
       every request. Estimated cost at scale and per-check billing are Phase 2 (one line here). Same rows as the
       wizard's step 3, so what an estimator sees matches what the admin set. -->
  <div class="flex flex-col gap-space-16">
    <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
      Linarc runs these against outside sources. Free checks are included in the plan; paid checks are billed per request on the policy acknowledged at publish.
    </p>
    <ul class="m-0 flex list-none flex-col divide-y divide-border-subtle p-0">
      <li v-for="k in CHECKS" :key="k.id" class="flex flex-col gap-space-8 py-space-12">
        <div class="flex items-start gap-space-12">
          <Checkbox :value="selected(k.id)" :label="k.label" size="small" class="min-w-0 flex-1" @input="toggle(k.id, $event)" />
          <span class="hidden shrink-0 font-label text-fontsize-12 leading-lineheight-20 text-text-subtle sm:inline">{{ k.source }} · {{ k.availability }}</span>
          <span class="w-space-72 shrink-0 text-right font-label text-fontsize-14 leading-lineheight-20 tabular-nums" :class="k.cost ? 'text-text-default' : 'text-text-subtle'">{{ k.cost ? money(k.cost) : 'Included' }}</span>
        </div>
        <div v-if="selected(k.id)" class="flex flex-wrap gap-x-space-24 gap-y-space-8 pl-space-28">
          <SelectV2 class="w-full sm:w-space-124 sm:min-w-fit" label="Runs" size="small" :options="CHECK_RUNS" :value="def.checkRuns[k.id] || 'submission'" :allow-search="false" @input="setRun(k.id, $event)" />
          <SelectV2 class="w-full sm:w-space-124 sm:min-w-fit" label="Results visible to" size="small" :options="CHECK_VISIBILITY" :value="def.checkVisibility[k.id] || 'reviewer'" :allow-search="false" @input="setVisibility(k.id, $event)" />
        </div>
      </li>
    </ul>
    <p class="m-0 flex flex-wrap justify-between gap-space-8 font-label text-fontsize-14 leading-lineheight-20">
      <span class="text-text-subtle">{{ def.checks.length }} of {{ CHECKS.length }} checks</span>
      <span class="text-text-default">Cost per request <strong class="tabular-nums">{{ money(cost) }}</strong></span>
    </p>
  </div>
</template>

<script>
import Checkbox from '@/components/Checkbox/Checkbox.vue';
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import { CHECKS } from '~/modules/prequal/data/wizard';
import { CHECK_RUNS, CHECK_VISIBILITY } from '~/modules/prequal/data/templateCatalog';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default {
  name: 'StepChecks',
  components: { Checkbox, SelectV2 },
  props: { def: { type: Object, required: true } },
  data() {
    return { CHECKS, CHECK_RUNS, CHECK_VISIBILITY };
  },
  computed: {
    cost() {
      return CHECKS.filter((k) => this.def.checks.includes(k.id)).reduce((n, k) => n + k.cost, 0);
    },
  },
  methods: {
    money: (v) => usd.format(v),
    selected(id) {
      return this.def.checks.includes(id);
    },
    toggle(id, on) {
      const checks = on ? [...new Set([...this.def.checks, id])] : this.def.checks.filter((x) => x !== id);
      this.$emit('input', { checks });
    },
    setRun(id, v) {
      this.$emit('input', { checkRuns: { ...this.def.checkRuns, [id]: v } });
    },
    setVisibility(id, v) {
      this.$emit('input', { checkVisibility: { ...this.def.checkVisibility, [id]: v } });
    },
  },
};
</script>
