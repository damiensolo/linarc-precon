<template>
  <!-- Preconstruction › Prequalification › Review Queue → request: the GC Review Dashboard (docs/prequal/screens.md §5).
       Patterns (docs/5-ui-patterns.md): full page under the module nav; Title Bar / Workflow header (back · company ·
       request ID chip · status); the sticky Decision panel in AppLayout's right panel (as the RFI screen's activity log);
       below 1024px the panel moves inline under the strip. Evidence for a finding opens in the same panel (the library
       has no drawer; flagged). Tabs: TabNavigation (library, P-028). Reviewer view only (estimators never open this).
       Data (2026-10-11): the request in the hash (`#req-004`; req-001 when there's none). Every request with a submission
       has its own review (`reviewFor`, src/modules/prequal/data/review.js + dossiers.js): open ones decide in the
       Decision panel; More information needed shows what was asked; decided ones show the decision read-only. A request
       not yet submitted (Not sent, Waiting for subcontractor, completing requirements) opens its tracking view instead
       (PRD UX l. 1186; `trackingFor`, data/tracking.js): progress by section, checks, history, and a panel with the
       invitation's delivery and Send reminder. Back returns to the list the request belongs to.
       Loading (docs/5-ui-patterns.md §6): the review comes from a (mock) request. The shell and the title bar frame (back
       arrow) stay; the company name, ID chip, status, the main column and the Decision panel wait for it, as skeletons
       in the final layout after 200ms. Tabs are local (no request). Decisions and resolutions submit honestly (see
       DecisionPanel / EvidencePanel). Try the sandbox Latency select. -->
  <PrequalShell screen="review" header-size="comfortable" title="Review" :right-panel="isWide" :scrollable-content="true">
    <template #header>
      <span class="flex min-w-0 items-center gap-space-8">
        <!-- Title Bar / Workflow Size=Comfortable: the back button has a visible container (HeaderToolIcon type="back", P-038). -->
        <HeaderToolIcon type="back" :aria-label="backTo.label" @click="back" />
        <template v-if="request">
          <span class="truncate font-label text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ company.name }}</span>
          <Chip :label="displayId" size="small" fill-style="solid" type="default" :removable="false" class="shrink-0" />
        </template>
        <!-- The name depends on the review: a title-sized line holds its place (invisible for the first 200ms). -->
        <Skeleton v-else size="md" class="w-space-124 shrink-0" :class="{ invisible: !load.indicator }" />
        <span v-if="request" class="hidden items-center gap-space-8 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle md:inline-flex">
          Status:
          <StatusChip :label="status.label" :status="toneToChipStatus(status.tone)" fill-style="outline" type="default" :removable="false" />
        </span>
      </span>
    </template>

    <template #content>
      <div class="flex w-full flex-col gap-space-24 pt-space-16">
        <LoadRegion :load="load" @retry="fetch">
          <!-- v-slot keeps the content lazy: it is only evaluated once the review has arrived. -->
          <template #default>
            <div class="flex flex-col gap-space-24">
              <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ metaLine }}</p>

              <ScoreConfidence
                v-if="!tracking"
                variant="strip"
                :score="request.score"
                :confidence="request.confidence"
                :recommendation="request.recommendation"
                :knockouts="request.knockouts"
                :checks-complete="checksComplete"
                :checks-total="checks.length"
                :provisional="checksComplete < checks.length"
              />

              <div v-if="!isWide" class="border-t border-border-subtle pt-space-20">
                <TrackingPanel v-if="tracking" v-bind="trackingProps" @wizard="openWizard" @reminded="history.unshift($event)" />
                <EvidencePanel v-else-if="evidenceFor" :finding="evidenceFor" :readonly="!!decided" @close="evidenceFor = null" @request-info="requestInfo" @resolve="resolve" />
                <DecisionPanel v-else v-bind="panelProps" @record="openRecord" @dashboard="back" />
              </div>

              <div class="flex flex-col gap-space-24">
                <TabNavigation v-model="tab" :tabs="tabs" aria-label="Review sections" id-prefix="review-tab" />
                <div role="tabpanel" :aria-labelledby="`review-tab-${tab}`" class="pb-space-24">
                  <RequestProgress v-if="tab === 'progress'" :tracking="tracking" />
                  <ReviewOverview v-else-if="tab === 'overview'" :summary="lintelSummary" :findings="findings" :sections="sectionScores" :heading="decided ? 'Open at the decision' : 'Needs your decision'" @tab="tab = $event" @evidence="openEvidence" />
                  <FindingList v-else-if="tab === 'findings'" :findings="findings" @evidence="openEvidence" />
                  <ReviewDetails v-else :tab="tab" :submission="submission" :documents="documents" :checks="checks" :history="history" />
                </div>
              </div>
            </div>
          </template>

          <template #skeleton>
            <ReviewSkeleton :tracking="isTracking">
              <template v-if="!isWide" #panel>
                <div class="border-0 border-t border-solid border-border-subtle pt-space-20"><DecisionPanelSkeleton /></div>
              </template>
            </ReviewSkeleton>
          </template>
        </LoadRegion>
      </div>
    </template>

    <template #right-panel>
      <!-- Same request as the main column: a secondary LoadRegion (skeleton and reveal, but no second live region or error
           notice; the main region announces the load and shows the error + Retry, this panel stays empty on failure). -->
      <div class="h-full overflow-y-auto p-space-20">
        <LoadRegion secondary :load="load">
          <template #default>
            <TrackingPanel v-if="tracking" v-bind="trackingProps" @wizard="openWizard" @reminded="history.unshift($event)" />
            <EvidencePanel v-else-if="evidenceFor" :finding="evidenceFor" :readonly="!!decided" @close="evidenceFor = null" @request-info="requestInfo" @resolve="resolve" />
            <DecisionPanel v-else :key="panelKey" v-bind="panelProps" @record="openRecord" @dashboard="back" />
          </template>
          <template #skeleton>
            <DecisionPanelSkeleton />
          </template>
        </LoadRegion>
      </div>
    </template>
  </PrequalShell>
</template>

<script>
import HeaderToolIcon from '@/componentsV2/HeaderToolIcon/HeaderToolIcon.vue';
import Chip from '@/components/Chip/Chip.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import TabNavigation from '@/componentsV2/TabNavigation/TabNavigation.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import ScoreConfidence from '~/candidates/ScoreConfidence/ScoreConfidence.vue';
import LoadRegion from '~/candidates/LoadRegion/LoadRegion.vue';
import Skeleton from '~/candidates/Skeleton/Skeleton.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import { currency } from '~/candidates/FormTableFields/format';
import { companyById, requestById, templates } from '~/modules/prequal/data';
import { REVIEW_ID, reviewFor } from '~/modules/prequal/data/review';
import { recordFor } from '~/modules/prequal/data/records';
import { trackingFor } from '~/modules/prequal/data/tracking';
import { QUEUE_STAGES, requestStatus, toneToChipStatus } from '~/modules/prequal/status';
import { currentRoute, go } from '~/modules/prequal/router';
import ReviewOverview from './components/ReviewOverview.vue';
import FindingList from './components/FindingList.vue';
import ReviewDetails from './components/ReviewDetails.vue';
import DecisionPanel from './components/DecisionPanel.vue';
import EvidencePanel from './components/EvidencePanel.vue';
import ReviewSkeleton from './components/ReviewSkeleton.vue';
import DecisionPanelSkeleton from './components/DecisionPanelSkeleton.vue';
import RequestProgress from './components/RequestProgress.vue';
import TrackingPanel from './components/TrackingPanel.vue';

export default {
  name: 'PrequalReview',
  prototype: {
    title: 'Preconstruction › Prequalification › Review',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3769-6710',
  },
  components: { PrequalShell, HeaderToolIcon, Chip, StatusChip, TabNavigation, ScoreConfidence, ReviewOverview, FindingList, ReviewDetails, DecisionPanel, EvidencePanel, LoadRegion, Skeleton, ReviewSkeleton, DecisionPanelSkeleton, RequestProgress, TrackingPanel },
  data() {
    const asked = currentRoute().id;
    return {
      /** The request in the hash; Apex (req-001) when there's none or it's unknown. Known at once, before the load. */
      requestId: asked && requestById[asked] ? asked : REVIEW_ID,
      // Filled by fetch(); null / empty until the review arrives (nothing derived from them renders before that).
      request: null,
      /** Set instead of the review fields for a request not yet submitted. */
      tracking: null,
      conditions: [],
      defaults: {},
      infoRequest: null,
      decided: null,
      context: null,
      lintelSummary: '',
      sectionScores: [],
      findings: [],
      checks: [],
      documents: [],
      submission: null,
      history: [],
      load: createLoad({ label: 'review' }),
      tab: 'overview',
      evidenceFor: null,
      requestFor: null,
      panelKey: 0,
      isWide: true,
    };
  },
  computed: {
    company() {
      return this.request ? companyById[this.request.company] : null;
    },
    status() {
      return this.request ? requestStatus(this.request) : null;
    },
    /** Known before the load (the id is in the hash): a request not yet submitted opens its tracking view. */
    isTracking() {
      return ['draft', 'invited', 'in-progress'].includes(requestById[this.requestId].workflow);
    },
    displayId() {
      return this.requestId.toUpperCase();
    },
    /** Where Back goes: the list this request belongs to (queue stages → Review Queue, decided → Qualified Subs). */
    backTo() {
      const r = requestById[this.requestId];
      if (QUEUE_STAGES.includes(r.workflow)) return { screen: 'queue', label: 'Back to Review Queue' };
      if (r.workflow === 'closed') return { screen: 'qualified', label: 'Back to Qualified Subs' };
      return { screen: 'dashboard', label: 'Back to Overview' };
    },
    metaLine() {
      const c = this.company;
      const r = this.request;
      const t = this.tracking;
      const when = t
        ? (t.invitedOn ? `invited ${this.$moment(t.invitedOn).format('D MMM YYYY')}` : 'not sent')
        : `submitted ${this.$moment(this.context.submittedOn).format('D MMM YYYY')}`;
      const pw = t ? t.publicWorks : this.context.publicWorks;
      return `${c.trade} · CSI ${c.csi} · ${c.state} · ${r.project} · requested ${currency(r.single)} single / ${currency(r.aggregate)} aggregate · ${when} · ${pw ? 'Public works' : 'Private'}`;
    },
    trackingProps() {
      return { request: this.request, tracking: this.tracking, templateName: templates[this.request.template], history: this.history };
    },
    checksComplete() {
      return this.checks.filter((k) => k.status === 'complete').length;
    },
    openCount() {
      return this.findings.filter((f) => f.resolution === 'unresolved' && f.severity !== 'info').length;
    },
    tabs() {
      const running = this.checks.length - this.checksComplete;
      if (this.tracking) {
        return [
          { id: 'progress', label: 'Progress' },
          { id: 'checks', label: 'Checks', count: running || undefined },
          { id: 'history', label: 'History' },
        ];
      }
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'findings', label: 'Findings', count: this.openCount || undefined, countStatus: this.openCount ? 'standby' : undefined },
        { id: 'submission', label: 'Submission' },
        { id: 'documents', label: 'Documents' },
        { id: 'checks', label: 'Checks', count: running || undefined },
        { id: 'history', label: 'History' },
      ];
    },
    panelProps() {
      return {
        request: this.request,
        companyName: this.company.name,
        trade: this.company.trade,
        findings: this.findings,
        checks: this.checks,
        history: this.history,
        conditions: this.conditions,
        context: this.context,
        requestFor: this.requestFor,
        defaults: this.defaults,
        infoRequest: this.infoRequest,
        decided: this.decided,
        backLabel: this.backTo.label,
      };
    },
  },
  created() {
    this.fetch();
  },
  mounted() {
    this.mq = window.matchMedia('(min-width: 1024px)');
    this.isWide = this.mq.matches;
    this.onMq = (e) => { this.isWide = e.matches; };
    this.mq.addEventListener('change', this.onMq);
  },
  beforeDestroy() {
    if (this.mq) this.mq.removeEventListener('change', this.onMq);
    this.load.destroy();
  },
  methods: {
    fetch() {
      this.load.run(
        (signal) =>
          mockRequest(() => {
            const id = this.requestId;
            const request = { ...requestById[id] };
            const review = reviewFor(id);
            if (!review) {
              const tracking = trackingFor(id);
              return { request, tracking, checks: tracking.checks, history: [...tracking.history] };
            }
            return { request, tracking: null, ...review, decided: review.decided || this.decisionFrom(request) };
          }, { signal }),
        (r) => {
          Object.assign(this, r);
          if (r.tracking) this.tab = 'progress';
        },
      );
    },
    /** A decided, approved request: its decision as the qualification record holds it. */
    decisionFrom(request) {
      if (request.workflow !== 'closed') return null;
      const rec = recordFor(request.id);
      if (!rec) return null;
      return { outcome: rec.outcome, by: rec.approvedByName, on: rec.approvedOn, trades: rec.trades, validUntil: rec.validUntil, conditions: rec.conditions };
    },
    toneToChipStatus,
    money: currency,
    back() {
      go(this.backTo.screen);
    },
    openWizard() {
      go('wizard');
    },
    openRecord() {
      go('record', this.request.id);
    },
    openEvidence(f) {
      this.evidenceFor = f;
    },
    requestInfo(f) {
      this.evidenceFor = null;
      this.requestFor = f.id;
      this.panelKey += 1;
    },
    resolve({ finding, resolution, note }) {
      const f = this.findings.find((x) => x.id === finding.id);
      f.resolution = resolution;
      f.impact = `${resolution === 'overridden' ? 'Overridden' : 'Dismissed'} by Jordan Lee: ${note}`;
      this.history.unshift({ at: new Date().toISOString(), actor: 'Jordan Lee', action: `${resolution === 'overridden' ? 'Overrode' : 'Dismissed'} “${f.title}”: ${note}` });
      this.evidenceFor = null;
    },
  },
};
</script>
