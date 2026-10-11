<template>
  <!-- Preconstruction › Prequalification › Review Queue → request: the GC Review Dashboard (docs/prequal/screens.md §5).
       Patterns (docs/5-ui-patterns.md): full page under the module nav; Title Bar / Workflow header (back · company ·
       request ID chip · status); the sticky Decision panel in AppLayout's right panel (as the RFI screen's activity log);
       below 1024px the panel moves inline under the strip. Evidence for a finding opens in the same panel (the library
       has no drawer; flagged). Tabs: TabNavigation (library, P-028). Reviewer view only (estimators never open this).
       Data: src/modules/prequal/data/review.js (req-001). `#<request id>` picks the request. -->
  <PrequalShell screen="review" title="Review" :right-panel="isWide" :scrollable-content="true">
    <template #header>
      <span class="flex min-w-0 items-center gap-space-8">
        <Button label="" aria-label="Back to Review Queue" color-scheme="secondary" variant="minimal" size="medium" @onClick="back">
          <template #leftIcon><ChevronLeft /></template>
        </Button>
        <span class="truncate font-label text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ company.name }}</span>
        <Chip :label="context.displayId" size="small" fill-style="solid" type="default" :removable="false" class="shrink-0" />
        <span class="hidden items-center gap-space-8 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle md:inline-flex">
          Status:
          <StatusChip :label="status.label" :status="toneToChipStatus(status.tone)" fill-style="outline" type="default" :removable="false" />
        </span>
      </span>
    </template>

    <template #content>
      <div class="flex w-full flex-col gap-space-24 pt-space-16">
        <InlineNotice v-if="sampleFor" tone="info" title="Sample review data">
          Detailed review data is mocked for Apex Electrical (REQ-001) only; you opened {{ sampleFor }}.
        </InlineNotice>

        <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
          {{ company.trade }} · CSI {{ company.csi }} · {{ company.state }} · {{ request.project }} ·
          requested {{ money(request.single) }} single / {{ money(request.aggregate) }} aggregate ·
          submitted {{ $moment(context.submittedOn).format('D MMM YYYY') }} · {{ context.publicWorks ? 'Public works' : 'Private' }}
        </p>

        <ScoreConfidence
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
          <EvidencePanel v-if="evidenceFor" :finding="evidenceFor" @close="evidenceFor = null" @request-info="requestInfo" @resolve="resolve" />
          <DecisionPanel v-else v-bind="panelProps" @record="openRecord" @dashboard="back" />
        </div>

        <div class="flex flex-col gap-space-24">
          <TabNavigation v-model="tab" :tabs="tabs" aria-label="Review sections" id-prefix="review-tab" />
          <div role="tabpanel" :aria-labelledby="`review-tab-${tab}`" class="pb-space-24">
            <ReviewOverview v-if="tab === 'overview'" :summary="lintelSummary" :findings="findings" :sections="sectionScores" @tab="tab = $event" @evidence="openEvidence" />
            <FindingList v-else-if="tab === 'findings'" :findings="findings" @evidence="openEvidence" />
            <ReviewDetails v-else :tab="tab" :submission="submission" :documents="documents" :checks="checks" :history="history" />
          </div>
        </div>
      </div>
    </template>

    <template #right-panel>
      <div class="h-full overflow-y-auto p-space-20">
        <EvidencePanel v-if="evidenceFor" :finding="evidenceFor" @close="evidenceFor = null" @request-info="requestInfo" @resolve="resolve" />
        <DecisionPanel v-else :key="panelKey" v-bind="panelProps" @record="openRecord" @dashboard="back" />
      </div>
    </template>
  </PrequalShell>
</template>

<script>
import { ChevronLeft } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import Chip from '@/components/Chip/Chip.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import TabNavigation from '@/componentsV2/TabNavigation/TabNavigation.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import ScoreConfidence from '~/candidates/ScoreConfidence/ScoreConfidence.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import { currency } from '~/candidates/FormTableFields/format';
import { companyById, requestById } from '~/modules/prequal/data';
import * as review from '~/modules/prequal/data/review';
import { requestStatus, toneToChipStatus } from '~/modules/prequal/status';
import { currentRoute, go } from '~/modules/prequal/router';
import ReviewOverview from './components/ReviewOverview.vue';
import FindingList from './components/FindingList.vue';
import ReviewDetails from './components/ReviewDetails.vue';
import DecisionPanel from './components/DecisionPanel.vue';
import EvidencePanel from './components/EvidencePanel.vue';

export default {
  name: 'PrequalReview',
  prototype: {
    title: 'Preconstruction › Prequalification › Review',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3769-6710',
  },
  components: { PrequalShell, Button, Chip, StatusChip, TabNavigation, ScoreConfidence, InlineNotice, ReviewOverview, FindingList, ReviewDetails, DecisionPanel, EvidencePanel, ChevronLeft },
  data() {
    const id = currentRoute().id;
    const asked = id && requestById[id] ? requestById[id] : null;
    return {
      request: { ...requestById[review.REVIEW_ID] },
      sampleFor: asked && asked.id !== review.REVIEW_ID ? `${companyById[asked.company].name} (${asked.id.toUpperCase()})` : '',
      context: review.context,
      lintelSummary: review.lintelSummary,
      sectionScores: review.sectionScores,
      findings: review.findings.map((f) => ({ ...f })),
      checks: review.checks,
      documents: review.documents,
      submission: review.submission,
      history: [...review.history],
      tab: 'overview',
      evidenceFor: null,
      requestFor: null,
      panelKey: 0,
      isWide: true,
    };
  },
  computed: {
    company() {
      return companyById[this.request.company];
    },
    status() {
      return requestStatus(this.request);
    },
    checksComplete() {
      return this.checks.filter((k) => k.status === 'complete').length;
    },
    openCount() {
      return this.findings.filter((f) => f.resolution === 'unresolved' && f.severity !== 'info').length;
    },
    tabs() {
      const running = this.checks.length - this.checksComplete;
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'findings', label: 'Findings', count: this.openCount, countStatus: this.openCount ? 'standby' : undefined },
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
        conditions: review.CONDITIONS,
        context: this.context,
        requestFor: this.requestFor,
      };
    },
  },
  mounted() {
    this.mq = window.matchMedia('(min-width: 1024px)');
    this.isWide = this.mq.matches;
    this.onMq = (e) => { this.isWide = e.matches; };
    this.mq.addEventListener('change', this.onMq);
  },
  beforeDestroy() {
    if (this.mq) this.mq.removeEventListener('change', this.onMq);
  },
  methods: {
    toneToChipStatus,
    money: currency,
    back() {
      go('queue');
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
