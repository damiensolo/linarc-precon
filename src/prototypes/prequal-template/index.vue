<template>
  <!-- Preconstruction › Configure › Templates › a template (screen 10, PRD UX "Template builder", l. 824–1010).
       Full-page create screen (D-18): PrequalShell, Title Bar / Workflow (back · name · version and status chip),
       ProgressStepper with six navigable steps in a centred 56rem column, fixed footer (Back / Cancel · Save draft ·
       Next / Publish). Same screen for a new template, a draft, and an active template (its first change starts the
       next version's draft; in-flight requests keep theirs, PRD UX l. 1007). Duplicate and Archive sit in the title
       bar; Publish, Archive and leaving with unsaved changes confirm in a ModalV2 (short single-step tasks).
       State and steps: ./builderState.js, ./components/. Data: src/modules/prequal/data/templates.js. -->
  <PrequalShell screen="templates" header-size="comfortable" :title="title" :scrollable-content="true" :bottom-panel="true">
    <template #header>
      <span class="flex min-w-0 items-center gap-space-8">
        <HeaderToolIcon type="back" aria-label="Back to Templates" @click="leave" />
        <span class="truncate font-label text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ title }}</span>
        <Chip :label="`v${version}`" size="small" fill-style="solid" type="default" :removable="false" class="shrink-0" />
        <StatusChip :label="status.label" :status="chipStatus" fill-style="outline" type="default" class="shrink-0" />
      </span>
    </template>
    <template #header-actions>
      <span v-if="savedText || lastAction" class="inline-flex" :class="{ 'sr-only sm:not-sr-only': !actionFailed }">
        <LoadStatus :load="actionLoad" size="xs" @retry="actionRetry">
          <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ savedText }}</span>
        </LoadStatus>
      </span>
      <Button label="Preview as subcontractor" color-scheme="secondary" variant="minimal" size="small" :is-disabled="busy" @onClick="preview" />
      <template v-if="record">
        <Button label="Duplicate" color-scheme="secondary" variant="minimal" size="small" :is-disabled="busy" @onClick="duplicate" />
        <Button v-if="record.status === 'archived'" label="Restore" color-scheme="secondary" variant="minimal" size="small" :is-disabled="busy" @onClick="restore" />
        <Button v-else label="Archive" color-scheme="secondary" variant="minimal" size="small" :is-disabled="busy" @onClick="confirm = 'archive'" />
      </template>
    </template>

    <template #content>
      <div class="mx-auto flex w-full max-w-4xl flex-col gap-space-32 pt-space-16">
        <!-- Six steps: under 640px only the active label shows and the labels are short (builderState STEPS.short);
             the strip is its own scroll box in case a label still doesn't fit, so the page never scrolls sideways.
             `relative`: the stepper's sr-only spans are absolutely positioned; without a positioned scroll box they
             escape it and widen the page by 4px at 390px (as F-065). -->
        <div class="relative min-w-0 overflow-x-auto">
          <ProgressStepper :steps="stepperSteps" :current="current" :labels="isNarrow ? 'active' : 'all'" :navigable="true" :fluid="true" aria-label="Template steps" @select="goTo" />
        </div>
        <StepBasics v-if="current === 'basics'" :def="def" :is-new="isNew" @input="update" @baseline="rebase" />
        <StepRequirements v-else-if="current === 'requirements'" :def="def" @input="update" />
        <StepThresholds v-else-if="current === 'thresholds'" :def="def" @input="update" />
        <StepChecks v-else-if="current === 'checks'" :def="def" @input="update" />
        <StepScoring v-else-if="current === 'scoring'" :def="def" @input="update" />
        <StepPublish v-else :def="def" :record="record" :version="nextVersion" :usage="usage" :warnings="warnings" @input="update" @go="goTo" />
      </div>

    <!-- Confirmations: publish (what changes for whom), archive, leave with unsaved changes. -->
    <ModalV2
      :is-visible="confirm === 'publish'"
      :title="`Publish ${title} v${nextVersion}?`"
      :primary-label="publishLabel"
      secondary-label="Cancel"
      :close-on-primary-click="false"
      @onPrimaryClick="publish"
      @closeModal="confirm = null"
    >
      <template #modal-body>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-default">{{ publishText }}</p>
      </template>
    </ModalV2>
    <ModalV2
      :is-visible="confirm === 'archive'"
      :title="`Archive ${title}?`"
      primary-label="Archive"
      secondary-label="Cancel"
      :close-on-primary-click="false"
      @onPrimaryClick="archive"
      @closeModal="confirm = null"
    >
      <template #modal-body>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-default">{{ archiveText }}</p>
      </template>
    </ModalV2>
    <ModalV2
      :is-visible="confirm === 'discard'"
      title="Leave without saving?"
      primary-label="Save draft and leave"
      secondary-label="Discard changes"
      :close-on-primary-click="false"
      :close-on-secondary-click="false"
      @onPrimaryClick="saveAndLeave"
      @onSecondaryClick="discard"
      @closeModal="confirm = null"
    >
      <template #modal-body>
        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-default">Changes on this template haven’t been saved. Save them as a draft, or discard them.</p>
      </template>
    </ModalV2>
    </template>

    <template #bottom-panel>
      <div class="flex h-full items-center px-space-20">
        <footer class="mx-auto flex w-full max-w-4xl items-center justify-between gap-space-12">
          <Button :label="index > 0 ? 'Back' : 'Cancel'" color-scheme="secondary" :variant="index > 0 ? 'outline' : 'minimal'" size="medium" @onClick="back" />
          <div class="flex items-center gap-space-12">
            <Button label="Save draft" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="busy || (!dirty && !isNew)" @onClick="save" />
            <Button :label="isLast ? publishLabel : 'Next'" color-scheme="primary" variant="solid" size="medium" :is-disabled="busy || (isLast && !canPublish)" @onClick="next" />
          </div>
        </footer>
      </div>
    </template>

  </PrequalShell>
</template>

<script>
import ProgressStepper from '@/componentsV2/ProgressStepper/ProgressStepper.vue';
import Button from '@/components/Button/Button.vue';
import Chip from '@/components/Chip/Chip.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import HeaderToolIcon from '@/componentsV2/HeaderToolIcon/HeaderToolIcon.vue';
import ModalV2 from '@/componentsV2/ModalV2/ModalV2.vue';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import { toneToChipStatus } from '~/modules/prequal/status';
import { templateOptions } from '~/modules/prequal/data/templates';
import { go } from '~/modules/prequal/router';
import builderState from './builderState';
import StepBasics from './components/StepBasics.vue';
import StepRequirements from './components/StepRequirements.vue';
import StepThresholds from './components/StepThresholds.vue';
import StepChecks from './components/StepChecks.vue';
import StepScoring from './components/StepScoring.vue';
import StepPublish from './components/StepPublish.vue';

export default {
  name: 'PrequalTemplate',
  mixins: [builderState],
  prototype: {
    title: 'Preconstruction › Configure › Templates › Template builder',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3922-8013',
    records: () => [{ value: 'new', label: 'New template' }, ...templateOptions()],
  },
  components: { PrequalShell, ProgressStepper, Button, Chip, StatusChip, HeaderToolIcon, ModalV2, LoadStatus, StepBasics, StepRequirements, StepThresholds, StepChecks, StepScoring, StepPublish },
  computed: {
    chipStatus() {
      return toneToChipStatus(this.status.tone);
    },
    publishText() {
      const name = this.title;
      if (!this.record || !this.record.published) return `${name} becomes active at v1 and is offered to new requests that match its trades and project size.`;
      const n = this.usage.active;
      return `v${this.nextVersion} replaces v${this.record.version} for new requests. ${n ? `${n} active ${n === 1 ? 'request keeps' : 'requests keep'} v${this.record.version}.` : 'No active request is affected.'}${this.record.status === 'archived' ? ' The template is restored.' : ''}`;
    },
    archiveText() {
      const n = this.usage.active;
      return `New requests can no longer pick this template.${n ? ` ${n} active ${n === 1 ? 'request keeps' : 'requests keep'} v${this.record.version} until decided.` : ''} It can be restored later.`;
    },
  },
  methods: {
    saveAndLeave() {
      this.confirm = null;
      this.save().then((r) => {
        if (r.ok) go('templates');
      });
    },
  },
};
</script>
