<template>
  <!-- Preconstruction › Prequalification › New request: the Start Prequalification wizard (docs/prequal/screens.md §2).
       Pattern from the V3.2 library (2026-10-09): Modal (ModalV2, customSlot) over the Overview, with the Figma
       Stepper Component + Step Trail as ProgressStepper (library, P-025). No drawer exists in the library.
       Steps: Subcontractor · Work context · Requirements & checks · Invite. `#<step id>` opens a step.
       Data: src/modules/prequal/data/wizard.js. Visual rules D-17: label-only buttons, hairlines, whitespace. -->
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
          <Button v-if="index > 0" label="Back" color-scheme="secondary" variant="outline" size="medium" @onClick="goTo(steps[index - 1].id)" />
          <Button v-else label="Cancel" color-scheme="secondary" variant="minimal" size="medium" @onClick="close" />
          <div class="flex items-center gap-space-12">
            <span v-if="savedText" class="hidden font-label text-fontsize-12 leading-lineheight-16 text-text-soft sm:inline">{{ savedText }}</span>
            <Button label="Save draft" color-scheme="secondary" variant="minimal" size="medium" @onClick="saveDraft" />
            <Button
              :label="isLast ? 'Send invite' : 'Next'"
              color-scheme="primary"
              variant="solid"
              size="medium"
              :is-disabled="!canContinue"
              @onClick="isLast ? send() : goTo(steps[index + 1].id)"
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
import PrequalDashboard from '../prequal-dashboard/index.vue';
import StepSubcontractor from './components/StepSubcontractor.vue';
import StepWork from './components/StepWork.vue';
import StepRequirements from './components/StepRequirements.vue';
import StepInvite from './components/StepInvite.vue';
import { companyById } from '~/modules/prequal/data';
import { steps, initialDraft } from '~/modules/prequal/data/wizard';
import { currentRoute, go } from '~/modules/prequal/router';

export default {
  name: 'PrequalWizard',
  prototype: {
    title: 'Preconstruction › Prequalification › New request',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3751-4083',
  },
  components: { ModalV2, ProgressStepper, Button, PrequalDashboard, StepSubcontractor, StepWork, StepRequirements, StepInvite },
  data() {
    const route = currentRoute();
    return {
      steps,
      current: route.id && steps.some((s) => s.id === route.id) ? route.id : 'subcontractor',
      draft: initialDraft(),
      adding: false,
      open: true,
      closeIcon: X,
      savedAt: null,
      isNarrow: false,
    };
  },
  computed: {
    index() {
      return steps.findIndex((s) => s.id === this.current);
    },
    isLast() {
      return this.index === steps.length - 1;
    },
    company() {
      return this.draft.companyId ? companyById[this.draft.companyId] : null;
    },
    /** The invite goes to a Linarc company's contact, or to the contact typed for a new company. */
    recipientCompany() {
      if (this.company) return this.company;
      const n = this.draft.newCompany;
      return { name: n.name || 'New company', contact: n.contact || 'Contact', email: n.email || '—' };
    },
    companyName() {
      return this.recipientCompany.name;
    },
    canContinue() {
      if (this.current === 'subcontractor') {
        const n = this.draft.newCompany;
        return Boolean(this.draft.companyId || (this.adding && n.name && n.contact && n.email));
      }
      if (this.current === 'work') {
        const w = this.draft.work;
        return Boolean(w.project && w.trades.length && w.single && w.aggregate);
      }
      return true;
    },
    savedText() {
      return this.savedAt ? `Draft saved ${this.$moment(this.savedAt).format('h:mm a')}` : '';
    },
  },
  mounted() {
    this.mq = window.matchMedia('(max-width: 639px)');
    this.isNarrow = this.mq.matches;
    this.onMq = (e) => { this.isNarrow = e.matches; };
    this.mq.addEventListener('change', this.onMq);
  },
  beforeDestroy() {
    if (this.mq) this.mq.removeEventListener('change', this.onMq);
  },
  methods: {
    goTo(id) {
      if (!id || id === this.current) return;
      this.current = id;
      window.history.replaceState(null, '', `${window.location.search}#${encodeURIComponent(id)}`);
      if (this.$refs.scroller) this.$refs.scroller.scrollTop = 0;
    },
    pickCompany(id) {
      this.draft.companyId = id;
      if (id) this.adding = false;
    },
    saveDraft() {
      this.savedAt = new Date();
    },
    close() {
      this.open = false;
      go('dashboard');
    },
    send() {
      // Prototype: the mock data is static, so the new request isn't added to the Overview.
      this.open = false;
      go('dashboard');
    },
    openRequest(r) {
      go(r.workflow === 'in-progress' || r.workflow === 'invited' || r.workflow === 'draft' ? 'dashboard' : 'review', r.id);
    },
    openRecord(q) {
      go('record', q.id);
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
