<template>
  <!-- Step 2: the work the subcontractor is being qualified for. These answers pick the template and raise limits
       on step 3, so each field says what it changes. -->
  <FormV2 :value="work" :schema="schema" :flat="true" mode="manual" label-position="top" @input="$emit('input', $event)">
    <template #footer><span /></template>
  </FormV2>
</template>

<script>
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import { projects, TRADES, REGIONS, SIZE_BANDS } from '~/modules/prequal/data/wizard';

const opts = (list) => list.map((v) => ({ label: v, value: v }));
const yesNo = [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }];

export default {
  name: 'StepWork',
  components: { FormV2 },
  props: { work: { type: Object, required: true } },
  data() {
    return {
      schema: {
        sections: [{
          id: 'work',
          layout: { columns: 2, gap: '24px' },
          fields: [
            { id: 'project', type: 'select', label: 'Project', colSpan: 'full', options: projects.map((p) => ({ label: `${p.name} · ${p.location}`, value: p.id })), rules: [{ type: 'required' }] },
            { id: 'trades', type: 'multiselect', label: 'Trades (CSI divisions)', colSpan: 'full', options: opts(TRADES), help: 'Picks the requirement template on the next step.', rules: [{ type: 'required' }] },
            { id: 'sizeBand', type: 'select', label: 'Project size', options: opts(SIZE_BANDS) },
            { id: 'regions', type: 'multiselect', label: 'Regions', options: opts(REGIONS) },
            { id: 'single', type: 'number', label: 'Largest single contract expected', help: 'Sets the bonding and insurance limits asked for.', rules: [{ type: 'required' }] },
            { id: 'aggregate', type: 'number', label: 'Aggregate expected across projects', help: 'Above the template’s aggregate, umbrella and bonding go up.', rules: [{ type: 'required' }] },
            { id: 'ownership', type: 'radio', label: 'Owner type', options: [{ label: 'Private', value: 'private' }, { label: 'Public', value: 'public' }, { label: 'Federal', value: 'federal' }], props: { inline: true } },
            { id: 'publicWorks', type: 'radio', label: 'Prevailing wage (public works)', options: yesNo, props: { inline: true } },
            { id: 'siteSecurity', type: 'radio', label: 'Site security (badging, background checks)', colSpan: 'full', options: yesNo, props: { inline: true }, help: 'Adds the Site security section to the application.' },
          ],
        }],
      },
    };
  },
  computed: {
    projects() {
      return projects;
    },
  },
};
</script>
