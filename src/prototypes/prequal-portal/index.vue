<template>
  <!-- Subcontractor completion portal (docs/prequal/screens.md §3 and §4; data in src/modules/prequal/data/portal.js).
       External user: the Linarc top nav in a reduced configuration (no module switcher, no tools, no project
       context, account rail with help / notifications / profile only) and no side rail (2026-10-09). The title bar
       carries the request, progress, save state and Submit; the section nav sits in the left panel; the selected
       section (overview, a FormV2 form, the Documents list or Review & submit) in the content area; Previous /
       Save and exit / Next in a fixed bottom panel so the way forward is always on screen.
       Visual rules (2026-10-09 restyle, docs/prototypes/prequal-portal.md "Visual hierarchy"): one container level,
       hairlines not boxes, colour only on the primary action and on states that ask for action, label-only buttons.
       Loading (docs/5-ui-patterns.md §6, D-24): the request comes from a (mock) request on entry. The top nav, the
       title-bar frame and the bottom panel stay; the section nav, the request title / progress and the section content
       show a skeleton in their final layout only if the answer takes > 200ms. Section switching is local (no loader).
       Save and Submit are honest: the button disables at once, "Saved …" changes only after the save resolves
       ("Saving…" / "Submitting…" only past 200ms), a failure keeps the input and says "Couldn't save." with Retry.
       Per request (2026-10-11): the hash names the request and, optionally, the section (`#req-012`, `#req-006/insurance`;
       a bare section or nothing is Northstar, REQ-008). Data: src/modules/prequal/data/portalRequests.js. The stage
       decides what the subcontractor can do: open (answer and submit), submitted (read-only, "Submitted …"), info
       (read-only except what the reviewer asked for; Send response) and decided (the decision and any renewals).
       Uploads (2026-10-11): choosing or dropping a file on any open slot uploads it (progress, cancellable), then Linarc
       checks it (data/uploads.js: wrong document → Rejected; photo → Needs review; PDF → Accepted with what was read)
       and the slot, readiness, Submit / Send response and the save time update. A failed transfer (?latency=fail)
       keeps the previous file and says so. Uploads are kept for the session (uploadStore), so the GC review sees them.
       End to end (2026-10-11, D-29): every table's Add / Edit / Remove works (RepeatField) and every grid cell is
       editable (MatrixField). Save and continue validates the section (FormV2 rules: required, minimums, every cell):
       valid → Complete (Needs attention when an entry disagrees with its document or a linked document failed);
       invalid → the errors stay on screen with a notice, and Skip for now moves on with the section In progress. Every
       save goes to the demo session (data/session.js), so completion, readiness, the GC tracking view and the request's
       status follow. Submit builds the review from the answers (data/submissionReview.js), moves the request to Ready
       for review and ends on a confirmation screen; the portal is then read-only. -->
  <div class="flex h-full flex-col bg-surface-page">
    <!-- Figma: Top Nav Bar Module=Company, whose module cell is the Linarc logomark (Module Icon / Logo Swap, Type=Logo,
         82×72 with the 48px Branding / Logomark), with the Company tools, Bookmarks / Create and project context removed. -->
    <TopNavBar
      :module="{ custom: true }"
      :tools="{ items: [], needBookmarks: false, needCreate: false, isAdmin: false }"
      :context="{ enabled: false }"
      :account="account"
      :overflow="overflow"
      :user-details="{ name: request.contact.name, email: request.contact.email }"
      @account-click="onAccountClick"
    >
      <template #custom_module>
        <span class="flex h-space-72 w-space-84 items-center justify-center" aria-label="Linarc" role="img">
          <LinarcLogoDark :size="48" aria-hidden="true" />
        </span>
      </template>
    </TopNavBar>

    <AppLayout
      class="min-h-0 flex-1"
      :left-panel-enabled="true"
      :left-panel-visible="!isNarrow"
      :left-panel-resizable="false"
      :left-panel-default-width="288"
      :right-panel-enabled="false"
      :bottom-panel-enabled="true"
      :bottom-panel-visible="true"
      :bottom-panel-resizable="false"
      :bottom-panel-default-height="64"
      :bottom-panel-min-height="64"
      :no-bottom-padding="true"
      :scrollable-content="true"
      :persist-preferences="false"
    >
      <template #left-panel>
        <!-- Same request as the content: a secondary LoadRegion (skeleton and reveal; the content region announces the
             load and shows the error + Retry, this panel stays empty on failure). -->
        <div class="h-full overflow-auto px-space-12 pb-space-12 pt-space-16">
          <LoadRegion secondary :load="load">
            <template #default>
              <PortalSectionNav :groups="navGroups" :selected="current" @select="goTo" />
            </template>
            <!-- Skeleton of the section nav: an unlabelled Overview row, then labelled groups of rows (same paddings). -->
            <template #skeleton>
              <div class="flex flex-col gap-space-20">
                <div v-for="g in 4" :key="g" class="flex flex-col gap-space-2">
                  <span v-if="g > 1" class="px-space-12 pb-space-4"><Skeleton shape="block" class="h-space-16 w-space-80" /></span>
                  <span v-for="i in g > 1 ? 3 : 1" :key="i" class="flex items-center gap-space-8 px-space-12 py-space-8">
                    <Skeleton class="flex-1" />
                    <Skeleton v-if="g > 1" shape="block" class="h-space-16 w-space-40" />
                  </span>
                </div>
              </div>
            </template>
          </LoadRegion>
        </div>
      </template>

      <template #header>
        <!-- pr-space-8: the 8px gap to the actions in Figma "Title bar / Portal request" (3801:5124); AppLayout's row has none. -->
        <span v-if="load.hasData" class="flex min-w-0 items-center gap-space-8 pr-space-8">
          <span class="inline-flex h-space-24 w-space-24 shrink-0 items-center justify-center rounded-radius-4 bg-surface-neutral font-heading text-fontsize-8 font-bold text-text-default" aria-hidden="true">{{ request.gc.logoText }}</span>
          <span class="truncate font-label text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Prequalification for {{ request.project }}</span>
          <span class="hidden truncate font-label text-fontsize-14 leading-lineheight-20 text-text-subtle lg:inline">· requested by {{ request.gc.name }}</span>
          <!-- Preview as subcontractor (Configure › Templates): marked as such, with the way back to the builder. -->
          <StatusChip v-if="preview" label="Preview" status="info" fill-style="outline" type="default" class="shrink-0" />
        </span>
        <span v-else class="flex min-w-0 flex-1 items-center gap-space-8 pr-space-8" :class="{ invisible: !load.indicator || loadFailed }" aria-hidden="true">
          <Skeleton shape="block" class="h-space-24 w-space-24" />
          <Skeleton size="md" class="w-full max-w-sm" />
        </span>
      </template>
      <template #header-actions>
        <!-- Progress and save state: only what the server confirmed, so "Saved …" changes after the save resolves. The
             line is LoadStatus on the last action's controller ("Saving…" / "Submitting…" past 200ms, or the error +
             Retry). Below sm it is visually hidden (still announced), except a failure, which shows at every width. -->
        <span v-if="load.hasData" class="inline-flex items-center gap-space-8 font-label text-fontsize-12 leading-lineheight-16 text-text-soft" :class="{ 'sr-only sm:not-sr-only': !actionFailed }">
          <span class="text-text-subtle" :class="{ 'hidden sm:inline': actionFailed }">{{ stageLine }}</span>
          <template v-if="editable">
            <span aria-hidden="true" :class="{ 'hidden sm:inline': actionFailed }">·</span>
            <LoadStatus :load="actionLoad" size="xs" @retry="lastAction === 'submit' ? submit() : onSave()">
              <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ saveText }}</span>
            </LoadStatus>
          </template>
        </span>
        <span v-else-if="!loadFailed" class="hidden sm:inline-flex" :class="{ invisible: !load.indicator }" aria-hidden="true">
          <Skeleton shape="block" class="h-space-16 w-space-124" />
        </span>
        <Button v-if="preview" label="Back to template editor" color-scheme="secondary" variant="outline" size="medium" @onClick="backToTemplate" />
        <Button v-else-if="editable" :label="submitLabel" color-scheme="primary" variant="solid" size="medium" :is-disabled="!load.hasData || !ready.canSubmit || submitted || submitting" @onClick="submit" />
      </template>

      <template #content>
        <!-- pt-space-16 on top of the layout's own padding: the section title needs room below the title-bar rule. -->
        <LoadRegion class="w-full pt-space-16" :load="load" @retry="fetch">
        <div class="flex w-full flex-col gap-space-24">
          <SelectV2 v-if="isNarrow" label="Section" :options="flatOptions" :value="current" @input="goTo" @change="goTo" />

          <div class="flex flex-col gap-space-4">
            <div class="flex flex-wrap items-baseline justify-between gap-space-8">
              <h1 class="m-0 font-heading text-fontsize-20 font-bold leading-lineheight-28 text-text-default">{{ currentTitle }}</h1>
              <span v-if="currentState" class="font-label text-fontsize-14 leading-lineheight-20" :class="currentState.tone === 'warning' ? 'text-text-warning-low' : 'text-text-subtle'">{{ currentState.label }}</span>
            </div>
            <p v-if="currentSection && currentSection.conditional" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ currentSection.conditional }}</p>
            <p v-if="currentSection && currentSection.note" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ currentSection.note }}</p>
          </div>

          <PortalOverview
            v-if="current === 'overview'"
            :request="request"
            :company-name="companyName"
            :sections="sections"
            :documents="documents"
            :readiness="ready"
            :completion="completion"
            :consent="consent"
            :stage="stage"
            :info-request="infoRequest"
            :decision="decision"
            :submitted-on="submittedOn"
            :status-label="statusLabel"
            :responded-at="respondedAt"
            @consent="consent = $event"
            @open="goTo"
            @continue="goTo(firstIncomplete)"
          />
          <PortalConfirmation
            v-else-if="current === 'confirmation'"
            :gc-name="request.gc.name"
            :project="request.project"
            :reference="submissionRef || ''"
            :submitted-at="submittedAt || ''"
            :sections="sections.filter((x) => !['documents', 'review'].includes(x.id)).length"
            :documents="documents.filter((d) => d.status).length"
            :contact="request.contact.email"
            @open="goTo"
          />
          <PortalDocuments v-else-if="current === 'documents'" :documents="documents" @upload="uploadDocument" @cancel="cancelUpload" @dismiss-error="dismissUploadError" />
          <PortalReview v-else-if="current === 'review'" :readiness="ready" :submitted="submitted" :submitting="submitting" :gc-name="request.gc.name" :stage="stage" :submit-label="submitLabel" @open="goTo" @submit="submit" />
          <!-- A template preview: plain text, not a notice (D-17: info is a plain text block). -->
          <p v-if="preview && current !== 'confirmation'" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
            Preview of <strong class="text-text-default">{{ preview.template }}</strong>{{ preview.status === 'draft' ? ' (draft)' : '' }}: what a subcontractor sees on a new request. Nothing here is saved or sent.
          </p>
          <InlineNotice
            v-if="sectionError && isFormSection"
            tone="warning"
            title="Some answers are missing"
            message="Complete the highlighted fields to finish this section. You can also skip it for now and come back; it stays In progress and blocks submission until it’s complete."
          />
          <FormV2 v-if="isFormSection" ref="form" :key="current" v-model="values[current]" :schema="schemas[current]" :field-types="portalFieldTypes" :flat="true" :read-only="locked" mode="manual" label-position="top" @submit="onSectionValid" @invalid="onSectionInvalid">
            <template #footer>
              <span />
            </template>
          </FormV2>
        </div>

        <!-- Skeleton in the final layout: (narrow) the section select, the section heading, then the Overview's text and
             details grid, or a form's label + field rows. -->
        <template #skeleton>
          <div class="flex w-full flex-col gap-space-24">
            <span v-if="isNarrow" class="flex flex-col gap-space-8">
              <Skeleton class="w-space-80" />
              <Skeleton shape="block" class="h-space-40 w-full" />
            </span>
            <Skeleton size="lg" class="w-space-124" />
            <div v-if="current === 'overview'" class="flex flex-col gap-space-16">
              <span class="flex flex-col">
                <Skeleton size="md" class="w-full" />
                <Skeleton size="md" class="w-2/3" />
              </span>
              <span class="grid grid-cols-1 gap-x-space-24 gap-y-space-12 sm:grid-cols-2 lg:grid-cols-3">
                <span v-for="i in 6" :key="i" class="flex flex-col gap-space-2">
                  <Skeleton shape="block" class="h-space-16 w-space-80" />
                  <Skeleton class="w-3/4" />
                </span>
              </span>
            </div>
            <div v-else class="grid grid-cols-1 gap-space-24 md:grid-cols-2">
              <span v-for="i in 6" :key="i" class="flex flex-col gap-space-4">
                <Skeleton class="w-space-124" />
                <Skeleton shape="block" class="h-space-40 w-full" />
              </span>
            </div>
          </div>
        </template>
        </LoadRegion>
      </template>

      <!-- Sticky footer: always visible under the content, never under the section nav. -->
      <template #bottom-panel>
        <footer class="flex h-full items-center justify-between gap-space-12 px-space-20">
          <Button label="Previous" color-scheme="secondary" variant="outline" size="medium" :is-disabled="!prevId" @onClick="leaveTo(prevId)" />
          <div class="flex items-center gap-space-12">
            <Button v-if="editable" label="Save and exit" color-scheme="secondary" variant="minimal" size="medium" :is-disabled="!load.hasData || saving" @onClick="saveAndExit" />
            <Button v-if="sectionError && canEditSection" label="Skip for now" color-scheme="secondary" variant="outline" size="medium" @onClick="skipSection" />
            <Button v-if="canEditSection" :label="nextId ? 'Save and continue' : 'Save and review'" color-scheme="primary" variant="solid" size="medium" :is-disabled="!load.hasData" @onClick="saveSection" />
            <Button v-else-if="current !== 'confirmation'" :label="nextId ? 'Next' : 'Review and submit'" color-scheme="primary" variant="solid" size="medium" :is-disabled="!load.hasData" @onClick="leaveTo(nextId || 'review')" />
          </div>
        </footer>
      </template>
    </AppLayout>
  </div>
</template>

<script>
// LinarcLogoDark: the stacked Linarc mark with the white wordmark, for dark surfaces (Figma Branding / Logomark Mode=Dark).
import { LinarcLogoDark } from '@development/linarc-icons';
import TopNavBar from '@/components/TopNavBar/index.vue';
import AppLayout from '@/componentsV2/AppLayout/AppLayout.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import Button from '@/components/Button/Button.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import PortalSectionNav from '~/candidates/PortalSectionNav/PortalSectionNav.vue';
import LoadRegion from '~/candidates/LoadRegion/LoadRegion.vue';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';
import Skeleton from '~/candidates/Skeleton/Skeleton.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import PortalOverview from './components/PortalOverview.vue';
import PortalDocuments from './components/PortalDocuments.vue';
import PortalReview from './components/PortalReview.vue';
import PortalConfirmation from './components/PortalConfirmation.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import { buildSubmissionReview } from '~/modules/prequal/data/submissionReview';
import { trackingFor } from '~/modules/prequal/data/tracking';
import { nowStamp, respond, saveAnswers, submitApplication } from '~/modules/prequal/data/session';
import { requestById } from '~/modules/prequal/data';
import { pillars } from '~/modules/prequal/data/portal';
import { portalFor, portalOptions, readinessFor, completionFor } from '~/modules/prequal/data/portalRequests';
import { recordUpload, uploadDuration, validateUpload } from '~/modules/prequal/data/uploads';
import { TODAY } from '~/modules/prequal/data';
import { SECTION } from '~/modules/prequal/status';
import { portalFieldTypes, sectionSchema, sectionValues } from '~/modules/prequal/portalFields';
import { currentRoute, go } from '~/modules/prequal/router';
import { accountWithSettings, overflowWithSettings, onAccountClick } from '~/modules/sandbox';

/** The portal shown without a request in the hash: Northstar, the request the portal was first built for. */
const DEFAULT_REQUEST = 'req-008';
/** `req-006/insurance` → ['req-006', 'insurance']; `insurance` → [null, 'insurance']. */
function parseHash(id) {
  if (!id) return [null, null];
  const [a, b] = id.split('/');
  return /^(req-\d+|preview-.+)$/.test(a) ? [a, b || null] : [null, a];
}

export default {
  name: 'PrequalPortal',
  prototype: {
    title: 'Prequalification › Subcontractor portal',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3793-4665',
    // Sandbox record picker (App.vue): every request a subcontractor can open.
    records: portalOptions,
  },
  components: { TopNavBar, AppLayout, FormV2, SelectV2, Button, StatusChip, PortalSectionNav, PortalOverview, PortalDocuments, PortalReview, PortalConfirmation, InlineNotice, LinarcLogoDark, LoadRegion, LoadStatus, Skeleton },
  provide() {
    // Slots under form fields (portalFields.js DocumentField) reach the upload handlers through FormV2.
    return { portalUploads: { upload: (e) => this.uploadDocument(e), cancel: (e) => this.cancelUpload(e), dismissError: (e) => this.dismissUploadError(e) } };
  },
  data() {
    const [askedId, askedSection] = parseHash(currentRoute().id);
    const portal = portalFor(askedId) || portalFor(DEFAULT_REQUEST);
    const forms = portal.sections.filter((s) => s.id !== 'documents' && s.id !== 'review');
    const known = ['overview', ...portal.sections.map((s) => s.id)];
    return {
      portal,
      /** Preview as subcontractor (Configure › Templates › Preview): { template, status }; nothing is saved or sent. */
      preview: portal.preview || null,
      requestId: portal.request.requestId,
      request: portal.request,
      companyName: portal.companyName,
      stage: portal.stage,
      infoRequest: portal.infoRequest,
      decision: portal.decision,
      submittedOn: portal.submittedOn || null,
      respondedAt: portal.respondedAt || null,
      sections: portal.sections,
      documents: portal.documents,
      /** The nav groups for this request: the template's custom sections sit under the group each names. */
      pillars: portal.pillars || pillars,
      portalFieldTypes,
      schemas: Object.fromEntries(forms.map((s) => [s.id, sectionSchema(s, portal.documents)])),
      // Saved answers (this demo session) win over the starting data.
      values: Object.fromEntries(forms.map((s) => [s.id, (portal.savedValues && portal.savedValues[s.id]) || sectionValues(s)])),
      /** The last Save and continue on this section failed validation: the notice and Skip for now show. */
      sectionError: false,
      submissionRef: portal.submissionRef || null,
      submittedAt: portal.submittedAt || null,
      current: askedSection && known.includes(askedSection) ? askedSection : 'overview',
      consent: true,
      /** Nothing left to submit: already submitted or decided (or just submitted / responded here). */
      submitted: portal.stage === 'submitted' || portal.stage === 'decided' || !!portal.respondedAt,
      savedAt: new Date(portal.lastSaved || '2026-10-08T09:00:00'),
      isNarrow: false,
      ready: readinessFor(portal),
      completion: completionFor(portal),
      load: createLoad({ label: 'request' }),
      saveLoad: createLoad({ label: 'changes', action: { busy: 'Saving', done: 'Saved', error: "Couldn't save." } }),
      submitLoad: createLoad({ label: 'application', action: { busy: 'Submitting', done: 'Submitted', error: "Couldn't submit." } }),
      /** 'save' | 'submit': the action whose state the title bar's meta line shows. */
      lastAction: 'save',
    };
  },
  computed: {
    account() {
      return accountWithSettings({ announcement: false, message: false, chatSupport: false, help: true, notifications: true, profile: true });
    },
    overflow() {
      return overflowWithSettings();
    },
    byId() {
      return Object.fromEntries(this.sections.map((s) => [s.id, s]));
    },
    order() {
      return ['overview', ...this.pillars.flatMap((p) => p.sections.filter((id) => this.byId[id]))];
    },
    navGroups() {
      const { byId } = this;
      return [
        { id: 'start', label: '', items: [{ id: 'overview', label: 'Overview' }] },
        ...this.pillars.map((p) => ({ id: p.id, label: p.label, items: p.sections.filter((id) => byId[id]).map((id) => ({ id, label: byId[id].label, state: id === 'review' ? undefined : byId[id].state })) })),
      ];
    },
    isFormSection() {
      return !['overview', 'documents', 'review', 'confirmation'].includes(this.current);
    },
    /** A section form the sub can still change: Save and continue applies. */
    canEditSection() {
      return this.isFormSection && this.editable && !this.locked;
    },
    /** The subcontractor can still change answers: before submission, or the items the reviewer asked for. */
    editable() {
      return !this.submitted && (this.stage === 'open' || this.stage === 'info');
    },
    /** Read-only form: a submitted section (everything once submitted, all but the requested ones on an info request). */
    locked() {
      return !this.editable || (this.currentSection && this.currentSection.state === 'submitted');
    },
    submitLabel() {
      return this.stage === 'info' ? 'Send response' : 'Submit';
    },
    statusLabel() {
      return { submitted: 'Submitted', 'under-review': 'Under review' }[this.portal.workflow] || '';
    },
    /** The title bar's state line: progress before submission, then where the request stands. */
    stageLine() {
      const d = (iso) => this.$moment(iso).format('D MMM YYYY');
      if (this.stage === 'open') return this.submitted ? 'Submitted today' : `${this.completion}% complete`;
      if (this.stage === 'info') return this.submitted ? 'Response sent' : `Response due ${d(this.infoRequest.dueOn)}`;
      if (this.stage === 'decided') return this.decision.title;
      return this.statusLabel === 'Submitted' ? `Submitted ${d(this.submittedOn)}` : `${this.statusLabel} · submitted ${d(this.submittedOn)}`;
    },
    flatOptions() {
      return this.navGroups.flatMap((g) => g.items.map((i) => ({ value: i.id, label: g.label ? `${g.label} › ${i.label}` : i.label })));
    },
    currentSection() {
      return this.byId[this.current] || null;
    },
    currentTitle() {
      if (this.current === 'confirmation') return 'Application submitted';
      return this.current === 'overview' ? 'Overview' : this.currentSection.label;
    },
    currentState() {
      if (!this.currentSection || this.current === 'review') return null;
      return SECTION[this.currentSection.state] || null;
    },
    prevId() {
      const i = this.order.indexOf(this.current);
      return i > 0 ? this.order[i - 1] : null;
    },
    nextId() {
      const i = this.order.indexOf(this.current);
      return i >= 0 && i < this.order.length - 1 ? this.order[i + 1] : null;
    },
    firstIncomplete() {
      return this.order.find((id) => id !== 'overview' && id !== 'review' && id !== 'documents' && !['complete', 'submitted'].includes(this.byId[id].state)) || 'documents';
    },
    saveText() {
      return `Saved ${this.$moment(this.savedAt).fromNow()}`;
    },
    loadFailed() {
      return !this.load.hasData && (this.load.status === 'error' || this.load.status === 'cancelled');
    },
    saving() {
      return this.saveLoad.status === 'loading';
    },
    submitting() {
      return this.submitLoad.status === 'loading';
    },
    actionLoad() {
      return this.lastAction === 'submit' ? this.submitLoad : this.saveLoad;
    },
    actionFailed() {
      return this.actionLoad.status === 'error';
    },
  },
  created() {
    /** Uploads in flight, by slot id: { timer, controller, previous } (not reactive). */
    this.inFlight = {};
    this.fetch();
  },
  mounted() {
    this.mq = window.matchMedia('(max-width: 767px)');
    this.isNarrow = this.mq.matches;
    this.onMq = (e) => { this.isNarrow = e.matches; };
    this.mq.addEventListener('change', this.onMq);
  },
  beforeDestroy() {
    if (this.mq) this.mq.removeEventListener('change', this.onMq);
    this.load.destroy();
    this.saveLoad.destroy();
    this.submitLoad.destroy();
    Object.values(this.inFlight).forEach((u) => this.stopUpload(u));
  },
  methods: {
    onAccountClick,
    goTo(id) {
      if (!id || id === this.current) return;
      this.sectionError = false;
      this.current = id;
      window.history.replaceState(null, '', `#${this.requestId}/${encodeURIComponent(id)}`);
      const body = this.$el.querySelector('.lnrc-app-layout__content-body');
      if (body) body.scrollTop = 0;
    },
    fetch() {
      // PLACEHOLDER DATA: the static portal data, served through the mock request (?latency= to review the states).
      this.load.run(
        (signal) => mockRequest(() => ({ request: this.portal.request, ready: readinessFor(this.portal), completion: completionFor(this.portal) }), { signal }),
        (r) => {
          this.request = r.request;
          this.ready = r.ready;
          this.completion = r.completion;
        },
      );
    },
    /** An action whose result the server must confirm: LoadStatus shows "…ing" past 200ms, the error + Retry, and
        announces the result. */
    act(name, load, produce, apply) {
      this.lastAction = name;
      return load.run((signal) => mockRequest(produce, { signal }), apply);
    },
    onSave() {
      // Disabled while a save runs (no double save). The form values are never touched here, so a failure keeps them.
      if (this.saving || !this.load.hasData) return;
      this.act('save', this.saveLoad, () => new Date(), (at) => { this.savedAt = at; });
    },
    /** Preview › Back to template editor: the builder, on the step it was left on (builderState.preview). */
    backToTemplate() {
      let target = null;
      try { target = window.sessionStorage.getItem('linarc-prototypes:preview-return'); } catch (e) { /* storage blocked */ }
      go('template', target && target.startsWith(`${this.preview.templateId}/`) ? target : this.preview.templateId);
    },
    submit() {
      if (!this.ready.canSubmit || this.submitted || this.submitting) return;
      // Submitted only once the server confirms; until then both Submit buttons stay disabled.
      this.act('submit', this.submitLoad, () => true, () => {
        this.submitted = true;
        if (this.stage === 'info') {
          this.respondedAt = respond(this.requestId);
          this.sections.forEach((x) => { if (x.state === 'needs-attention') x.state = 'submitted'; });
          this.goTo('review');
          return;
        }
        // The application: the GC's review is built from what was entered and uploaded, then the request moves on.
        const tracking = trackingFor(this.requestId);
        const at = nowStamp();
        const { review, summary } = buildSubmissionReview({ request: requestById[this.requestId], portal: this.portal, values: this.values, tracking, invitedBy: tracking ? tracking.invitedBy : 'Jordan Lee', at });
        this.submissionRef = submitApplication(this.requestId, { review, summary });
        this.submittedAt = at;
        this.submittedOn = at.slice(0, 10);
        this.stage = 'submitted';
        this.portal.stage = 'submitted';
        this.portal.workflow = 'submitted';
        this.sections.forEach((x) => { x.state = 'submitted'; });
        this.documents.forEach((d) => this.$set(d, 'locked', true));
        this.goTo('confirmation');
      });
    },
    /** A section's state from its answers: complete (or needs attention) when valid, in progress when partly answered. */
    stateFor(section, valid) {
      const vals = this.values[section.id] || {};
      const answered = Object.entries(vals).some(([k, v]) => {
        if (section.id === 'company' && k === 'legalName') return false; // prefilled from the invitation
        if (Array.isArray(v)) return v.length && (typeof v[0] !== 'object' || v.some((row) => Object.values(row).slice(1).some((x) => x !== null && x !== '')));
        return v !== null && v !== undefined && v !== '';
      });
      if (!valid) return answered ? 'in-progress' : 'not-started';
      const docById = Object.fromEntries(this.documents.map((d) => [d.id, d]));
      const flagged = section.fields.some((f) => f.mismatch || (f.evidence && docById[f.evidence] && ['failed', 'rejected'].includes(docById[f.evidence].status)));
      return flagged ? 'needs-attention' : 'complete';
    },
    /** Completion as the GC tracking view counts it: sections answered over those that count (not Documents). */
    recount() {
      const counted = this.sections.filter((x) => !['documents', 'review'].includes(x.id));
      this.completion = Math.round((counted.filter((x) => ['complete', 'needs-attention'].includes(x.state)).length / counted.length) * 100);
      this.portal.percent = this.completion;
      this.ready = readinessFor(this.portal);
    },
    /** Save everything to the demo session (the GC's tracking view and the request's status follow). */
    persist(lastSection) {
      if (this.stage !== 'open') return;
      this.recount();
      saveAnswers(this.requestId, { values: this.values, states: Object.fromEntries(this.sections.map((x) => [x.id, x.state])), percent: this.completion, lastSection });
      this.savedAt = new Date();
    },
    saveSection() {
      // FormV2 touches every field and validates; it answers with `submit` (valid) or `invalid`.
      if (this.$refs.form) this.$refs.form.onSubmit();
    },
    onSectionValid() {
      const sec = this.currentSection;
      sec.state = this.stateFor(sec, true);
      this.sectionError = false;
      this.persist(sec.label);
      this.goTo(this.nextId || 'review');
    },
    onSectionInvalid() {
      const sec = this.currentSection;
      sec.state = this.stateFor(sec, false);
      this.sectionError = true;
      this.persist();
    },
    skipSection() {
      this.persist();
      this.goTo(this.nextId || 'review');
    },
    /** Previous / Next on pages without a form, and Previous on a form: keep what was typed, don't validate. */
    leaveTo(id) {
      if (this.canEditSection) {
        const sec = this.currentSection;
        const valid = this.$refs.form ? this.$refs.form.validate().isValid : false;
        sec.state = this.stateFor(sec, valid);
        this.persist(valid ? sec.label : undefined);
      }
      this.goTo(id);
    },
    saveAndExit() {
      if (this.canEditSection) this.leaveTo('overview');
      else { this.persist(); this.goTo('overview'); }
      this.onSave();
    },
    /** Every value entered so far, by field id (the intake check compares documents with them). */
    answers() {
      return Object.assign({}, ...Object.values(this.values));
    },
    /** Upload, then check, a file (or files) dropped on a slot. Progress follows the file size; X cancels. */
    uploadDocument({ doc, files, mode = 'replace' }) {
      if (this.inFlight[doc.id] || !files || !files.length) return;
      const previous = { status: doc.status, message: doc.message, file: doc.file, files: doc.files, validThrough: doc.validThrough, extracted: doc.extracted };
      const previousFiles = doc.files || (doc.file ? [doc.file] : []);
      const name = files.length > 1 ? `${files.length} files` : files[0].name;
      const u = { previous, timer: null, controller: null };
      this.inFlight[doc.id] = u;
      this.$set(doc, 'uploadError', '');
      this.$set(doc, 'cancellable', true);
      this.$set(doc, 'progress', 0);
      doc.file = { name, uploadedOn: TODAY };
      doc.files = undefined;
      doc.message = `Uploading ${name}…`;
      doc.status = 'processing';
      const total = files.reduce((a, f) => a + uploadDuration(f), 0);
      const started = Date.now();
      u.timer = setInterval(() => {
        doc.progress = Math.min(100, Math.round(((Date.now() - started) / total) * 100));
        if (doc.progress < 100) return;
        clearInterval(u.timer);
        // Transferred: Linarc reads the document (simulated server processing, ~1.2 s).
        doc.message = 'We’re checking this document.';
        doc.cancellable = false;
        u.controller = new AbortController();
        u.timer = setTimeout(() => {
          mockRequest(() => validateUpload({ requestId: this.requestId, doc, files, previous: mode === 'add' ? previousFiles : [], answers: this.answers() }), { signal: u.controller.signal })
            .then((result) => this.applyUpload(doc, result))
            .catch((e) => {
              if (e && e.name === 'AbortError') return;
              this.restoreDoc(doc, previous);
              doc.uploadError = `Couldn’t upload ${name}. Check your connection and try again.`;
            })
            .finally(() => { delete this.inFlight[doc.id]; });
        }, 1200);
      }, 100);
    },
    applyUpload(doc, result) {
      const many = result.files.length > 1 || doc.count;
      doc.file = many ? undefined : result.files[0];
      doc.files = many ? result.files : undefined;
      this.$set(doc, 'validThrough', result.validThrough);
      this.$set(doc, 'extracted', result.extracted);
      doc.message = result.message;
      doc.progress = undefined;
      doc.cancellable = false;
      doc.status = result.status;
      recordUpload(this.requestId, doc.id, { ...result, label: doc.label, at: `${TODAY}T${new Date().toTimeString().slice(0, 8)}` });
      // A renewal the GC asked for: the Overview's list says it arrived.
      if (this.decision) {
        const item = this.decision.items.find((i) => i.id === doc.id);
        if (item) item.reason = result.status === 'rejected' ? result.message : `Renewed document uploaded today; ${result.status === 'passed' ? 'accepted' : 'a reviewer will check it'}.`;
      }
      if (this.stage === 'open') {
        const docs = this.byId.documents;
        const required = this.documents.filter((d) => d.required === true || (d.required === 'site-security' && this.request.flags.siteSecurity));
        if (docs) docs.state = required.some((d) => d.status === 'rejected' || d.status === 'failed') ? 'needs-attention' : required.every((d) => d.status) ? 'complete' : 'in-progress';
      }
      this.ready = readinessFor(this.portal);
      this.lastAction = 'save';
      this.savedAt = new Date();
    },
    restoreDoc(doc, previous) {
      Object.assign(doc, previous, { progress: undefined, cancellable: false });
    },
    stopUpload(u) {
      clearInterval(u.timer);
      clearTimeout(u.timer);
      if (u.controller) u.controller.abort();
    },
    cancelUpload({ doc }) {
      const u = this.inFlight[doc.id];
      if (!u) return;
      this.stopUpload(u);
      this.restoreDoc(doc, u.previous);
      delete this.inFlight[doc.id];
    },
    dismissUploadError({ doc }) {
      doc.uploadError = '';
    },
  },
};
</script>

<style>
/* A custom group "with a container" (template builder, 2026-10-12): FormV2 layout groups have no box of their own,
   so the hairline container is drawn here with the token variables. */
.formv2-group[data-group-id^='box-'] { border: 1px solid var(--border-subtle); border-radius: var(--radius-4); padding: var(--space-16); }
</style>
