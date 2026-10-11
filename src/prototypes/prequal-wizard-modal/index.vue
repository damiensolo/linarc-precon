<template>
  <!-- Preconstruction › Prequalification › New request — VERSION B (modal), kept for comparison with the default
       full-page create screen (`prequal-wizard`), at the user's direction 2026-10-09. Same steps, state and copy
       (../prequal-wizard/wizardState.js, ../prequal-wizard/components/); only the container differs: ModalV2
       (customSlot) over the Overview, with the step area scrolling inside the dialog. -->
  <div class="h-full">
    <PrequalDashboard />

    <ModalV2
      :is-visible="open"
      variant="customSlot"
      title="New prequalification request"
      :right-icon="closeIcon"
      :close-on-blur="false"
      @closeModal="close"
      @onRightIconClick="close"
    >
      <template #modal-body>
        <div class="wizard flex flex-col gap-space-24">
          <ProgressStepper
            :steps="steps"
            :current="current"
            :labels="isNarrow ? 'active' : 'all'"
            :navigable="true"
            :fluid="true"
            aria-label="Request steps"
            @select="goTo"
          />
          <div ref="scroller" class="wizard__scroll min-h-0 overflow-y-auto pr-space-4">
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
        </div>
      </template>

      <template #modal-footer>
        <div class="flex w-full items-center justify-between gap-space-12">
          <Button v-if="index > 0" label="Back" color-scheme="secondary" variant="outline" size="medium" @onClick="back" />
          <Button v-else label="Cancel" color-scheme="secondary" variant="minimal" size="medium" @onClick="close" />
          <div class="flex items-center gap-space-12">
            <!-- Save / send state: LoadStatus on the last action ("…ing" only past 200ms, the error + Retry; wizardState
                 actionLoad). Visually hidden below sm (still announced) except a failure, which shows at every width. -->
            <span v-if="savedText || lastAction" class="inline-flex" :class="{ 'sr-only sm:not-sr-only': !actionFailed }">
              <LoadStatus :load="actionLoad" size="xs" @retry="actionRetry">
                <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ savedText }}</span>
              </LoadStatus>
            </span>
            <Button label="Save draft" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="savingDraft || sending" @onClick="saveDraft" />
            <Button
              :label="isLast ? 'Send invite' : 'Next'"
              color-scheme="primary"
              variant="solid"
              size="medium"
              :is-disabled="!canContinue || sending"
              @onClick="next"
            />
          </div>
        </div>
      </template>
    </ModalV2>
  </div>
</template>

<script>
import { X } from '@development/linarc-icons';
import ModalV2 from '@/componentsV2/ModalV2/ModalV2.vue';
import ProgressStepper from '@/componentsV2/ProgressStepper/ProgressStepper.vue';
import Button from '@/components/Button/Button.vue';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';
import PrequalDashboard from '../prequal-dashboard/index.vue';
import StepSubcontractor from '../prequal-wizard/components/StepSubcontractor.vue';
import StepWork from '../prequal-wizard/components/StepWork.vue';
import StepRequirements from '../prequal-wizard/components/StepRequirements.vue';
import StepInvite from '../prequal-wizard/components/StepInvite.vue';
import wizardState from '../prequal-wizard/wizardState';

export default {
  name: 'PrequalWizardModal',
  mixins: [wizardState],
  prototype: {
    title: 'Preconstruction › Prequalification › New request (version B: modal)',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3789-3775',
  },
  components: { ModalV2, ProgressStepper, Button, LoadStatus, PrequalDashboard, StepSubcontractor, StepWork, StepRequirements, StepInvite },
  data() {
    return { open: true, closeIcon: X };
  },
  methods: {
    scrollElement() {
      return this.$refs.scroller;
    },
  },
};
</script>

<style scoped>
/* The modal (ModalV2 customSlot) takes its width from the content. Figma's Modal frames have no wide size, so the
   width is set here: 48rem (Tailwind max-w-3xl), never wider than the viewport minus the overlay and body padding.
   The step content scrolls inside the modal so the footer (Back / Save draft / Next) stays on screen (D-17).
   needs-figma: a "wide / wizard" Modal size; needs-token: none (space tokens only). */
.wizard {
  width: min(48rem, calc(100vw - 4 * var(--space-16)));
}
.wizard__scroll {
  max-height: calc(100vh - 2 * var(--space-16) - 2 * var(--space-64) - 2 * var(--space-40) - var(--space-24));
}
</style>
