<template>
  <!-- Preconstruction › Prequalification › New request — DEFAULT VERSION: full-page create screen (user direction
       2026-10-09). Pattern from the app and the V3.2 library: the RFI "Create" screen (Documentation file,
       RFI- Details) keeps the module nav and puts Title Bar / Workflow (back arrow, title, ID chip; Code Connect:
       AppLayout #header) above a full-page form. Version B, the same steps in a modal, is `prequal-wizard-modal`.
       Layout (D-18): the stepper and form sit in a centred 56rem column (wide-form width: tables and two-column fields); the fixed footer's buttons align to it.
       Steps and state: ./wizardState.js and ./components/. Visual rules D-17. `#<step id>` opens a step. -->
  <PrequalShell screen="dashboard" title="New prequalification request" :scrollable-content="true" :bottom-panel="true">
    <!-- Title Bar / Workflow, Status=Create: back · title · document ID chip -->
    <template #header>
      <span class="flex min-w-0 items-center gap-space-8">
        <Button label="" aria-label="Back to Overview" color-scheme="secondary" variant="minimal" size="medium" @onClick="close">
          <template #leftIcon><ChevronLeft /></template>
        </Button>
        <span class="truncate font-label text-fontsize-16 font-bold leading-lineheight-24 text-text-default">New prequalification request</span>
        <Chip :label="requestId" size="small" fill-style="solid" type="default" :removable="false" class="shrink-0" />
      </span>
    </template>
    <template #header-actions>
      <span v-if="savedText" class="hidden font-label text-fontsize-12 leading-lineheight-16 text-text-soft sm:inline">{{ savedText }}</span>
    </template>

    <template #content>
      <div class="mx-auto flex w-full max-w-4xl flex-col gap-space-32 pt-space-16">
        <ProgressStepper
          :steps="steps"
          :current="current"
          :labels="isNarrow ? 'active' : 'all'"
          :navigable="true"
          :fluid="true"
          aria-label="Request steps"
          @select="goTo"
        />
        <StepSubcontractor
          v-if="current === 'subcontractor'"
          :company-id="draft.companyId"
          :adding="adding"
          :new-company="draft.newCompany"
          @company="pickCompany"
          @adding="adding = $event"
          @new-company="draft.newCompany = $event"
          @open-request="openRequest"
          @open-record="openRecord"
        />
        <StepWork v-else-if="current === 'work'" :work="draft.work" @input="draft.work = { ...draft.work, ...$event }" />
        <StepRequirements
          v-else-if="current === 'requirements'"
          :work="draft.work"
          :template="draft.template"
          :checks="draft.checks"
          :company-name="companyName"
          @template="draft.template = $event"
          @checks="draft.checks = $event"
        />
        <StepInvite v-else :company="recipientCompany" :draft="draft" @edit="goTo" @message="draft.message = $event" />
      </div>
    </template>

    <!-- Fixed footer: the bar spans the content area; its buttons align to the centred form column (D-18). -->
    <template #bottom-panel>
      <div class="flex h-full items-center px-space-20">
        <footer class="mx-auto flex w-full max-w-4xl items-center justify-between gap-space-12">
          <Button :label="index > 0 ? 'Back' : 'Cancel'" color-scheme="secondary" :variant="index > 0 ? 'outline' : 'minimal'" size="medium" @onClick="back" />
          <div class="flex items-center gap-space-12">
            <Button label="Save draft" color-scheme="secondary" variant="minimal" size="medium" @onClick="saveDraft" />
            <Button :label="isLast ? 'Send invite' : 'Next'" color-scheme="primary" variant="solid" size="medium" :is-disabled="!canContinue" @onClick="next" />
          </div>
        </footer>
      </div>
    </template>
  </PrequalShell>
</template>

<script>
import { ChevronLeft } from '@development/linarc-icons';
import ProgressStepper from '@/componentsV2/ProgressStepper/ProgressStepper.vue';
import Button from '@/components/Button/Button.vue';
import Chip from '@/components/Chip/Chip.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import StepSubcontractor from './components/StepSubcontractor.vue';
import StepWork from './components/StepWork.vue';
import StepRequirements from './components/StepRequirements.vue';
import StepInvite from './components/StepInvite.vue';
import wizardState from './wizardState';

export default {
  name: 'PrequalWizard',
  mixins: [wizardState],
  prototype: {
    title: 'Preconstruction › Prequalification › New request',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3769-6836',
  },
  components: { PrequalShell, ProgressStepper, Button, Chip, ChevronLeft, StepSubcontractor, StepWork, StepRequirements, StepInvite },
  data() {
    // PLACEHOLDER DATA: the next request number after req-024.
    return { requestId: 'REQ-025' };
  },
  methods: {
    scrollElement() {
      return this.$el.querySelector('.lnrc-app-layout__content-body');
    },
  },
};
</script>
