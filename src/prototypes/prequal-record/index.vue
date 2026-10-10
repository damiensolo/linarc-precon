<template>
  <!-- Preconstruction › Prequalification › Qualified Subs → record: the Qualification Record (docs/prequal/screens.md §6),
       the durable output of an approval. Patterns (docs/5-ui-patterns.md): full page under the module nav; Title Bar /
       Workflow header (back · company · record ID chip · status); the record on the left; the audit trail in AppLayout's
       right panel (activity, as on the RFI screen), inline at the end below 1024px. Request renewal is a short
       single-step task, so it's a ModalV2 (§1). Estimator/PM sees status, trades, limits and conditions only (PRD §10).
       Data: src/modules/prequal/data/records.js. `#<request id>` picks the record; no hash = Summit (req-021). -->
  <PrequalShell screen="record" title="Qualification record" :right-panel="isWide && isReviewer" :scrollable-content="true">
    <template #header>
      <span class="flex min-w-0 items-center gap-space-8">
        <Button label="" aria-label="Back to Overview" color-scheme="secondary" variant="minimal" size="medium" @onClick="back">
          <template #leftIcon><ChevronLeft /></template>
        </Button>
        <span class="truncate font-label text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ company.name }}</span>
        <Chip v-if="record" :label="record.displayId" size="small" fill-style="solid" type="default" :removable="false" class="shrink-0" />
        <span v-if="record" class="hidden items-center gap-space-8 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle md:inline-flex">
          Status:
          <StatusChip :label="status.label" :status="toneToChipStatus(status.tone)" fill-style="outline" type="default" :removable="false" />
        </span>
      </span>
    </template>

    <template #header-actions>
      <span class="hidden items-center gap-space-8 sm:inline-flex">
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">View as</span>
        <SegmentedControl v-model="role" :options="roleOptions" aria-label="View as" size="md" />
      </span>
      <Button
        v-if="record && isReviewer"
        label="Request renewal"
        color-scheme="secondary"
        variant="outline"
        size="medium"
        @onClick="openRenewal(null)"
      />
    </template>

    <template #content>
      <div class="flex w-full flex-col gap-space-40 pt-space-16 pb-space-24">
        <!-- No record: the request isn't approved (yet) -->
        <InlineNotice v-if="!record" tone="info" :title="`${requestLabel} has no qualification record`">
          A record is created when a reviewer approves the request. Its status is {{ status.label.toLowerCase() }}.
          <template #actions>
            <Button :label="openLabel" color-scheme="secondary" variant="outline" size="small" @onClick="openRequest" />
          </template>
        </InlineNotice>

        <template v-else>
          <p class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
            {{ company.trade }} · CSI {{ company.csi }} · {{ company.state }} · from {{ requestLabel }} ({{ record.project }}) ·
            {{ record.templateName }} · contact {{ company.contact }}
          </p>

          <RecordSummary :record="record" :reviewer="isReviewer" :now="today" :status="status" />

          <MonitoringList
            v-if="isReviewer"
            :documents="documents"
            :now="today"
            :sent="sentNote"
            @renew="openRenewal"
            @remind="remind"
          />
          <p v-else class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
            Documents, scores and the audit trail are visible to prequalification reviewers.
          </p>

          <section v-if="isReviewer && !isWide" class="border-t border-border-subtle pt-space-24">
            <AuditTrail :entries="audit" />
          </section>
        </template>
      </div>

      <RenewalModal
        v-if="record"
        :open="renewalOpen"
        :documents="documents"
        :preselect="renewalFor"
        :contact="company.contact"
        :company-name="company.name"
        :now="today"
        @close="renewalOpen = false"
        @send="sendRenewal"
      />
    </template>

    <template #right-panel>
      <div class="h-full overflow-y-auto p-space-20">
        <AuditTrail :entries="audit" />
      </div>
    </template>
  </PrequalShell>
</template>

<script>
import { ChevronLeft } from '@development/linarc-icons';
import Button from '@/components/Button/Button.vue';
import Chip from '@/components/Chip/Chip.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import { TODAY, companyById, requestById } from '~/modules/prequal/data';
import { DEFAULT_RECORD, recordFor } from '~/modules/prequal/data/records';
import { requestStatus, toneToChipStatus } from '~/modules/prequal/status';
import { currentRoute, go } from '~/modules/prequal/router';
import RecordSummary from './components/RecordSummary.vue';
import MonitoringList from './components/MonitoringList.vue';
import AuditTrail from './components/AuditTrail.vue';
import RenewalModal from './components/RenewalModal.vue';

export default {
  name: 'PrequalRecord',
  prototype: {
    title: 'Preconstruction › Prequalification › Qualification record',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3762-8771',
  },
  components: { PrequalShell, Button, Chip, StatusChip, SegmentedControl, InlineNotice, RecordSummary, MonitoringList, AuditTrail, RenewalModal, ChevronLeft },
  data() {
    const asked = currentRoute().id;
    const id = asked && requestById[asked] ? asked : DEFAULT_RECORD;
    const record = recordFor(id);
    return {
      requestId: id,
      record,
      documents: record ? record.documents.map((d) => ({ ...d })) : [],
      audit: record ? [...record.audit] : [],
      today: TODAY,
      role: 'reviewer',
      roleOptions: [
        { label: 'Reviewer', value: 'reviewer' },
        { label: 'Estimator', value: 'estimator' },
      ],
      renewalOpen: false,
      renewalFor: null,
      sentNote: '',
      isWide: true,
    };
  },
  computed: {
    request() {
      return requestById[this.requestId];
    },
    company() {
      return companyById[this.request.company];
    },
    isReviewer() {
      return this.role === 'reviewer';
    },
    /** Lifecycle once approved (Current / Renewal needed soon / …); the request's status when there's no record. */
    status() {
      if (this.record) return requestStatus({ ...this.request, outcome: this.record.outcome, lifecycle: this.record.lifecycle });
      return requestStatus(this.request);
    },
    requestLabel() {
      return this.requestId.toUpperCase();
    },
    openLabel() {
      return ['submitted', 'under-review'].includes(this.request.workflow) ? 'Open review' : 'Back to Overview';
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
    back() {
      go('dashboard');
    },
    openRequest() {
      if (this.openLabel === 'Open review') go('review', this.requestId);
      else go('dashboard');
    },
    openRenewal(docId) {
      this.renewalFor = docId;
      this.renewalOpen = true;
    },
    sendRenewal({ ids, message }) {
      ids.forEach((id) => {
        const d = this.documents.find((x) => x.id === id);
        d.renewal = { status: 'requested', on: this.today };
      });
      const names = this.documents.filter((d) => ids.includes(d.id)).map((d) => d.label.toLowerCase());
      this.audit.unshift({
        at: `${this.today}T${new Date().toTimeString().slice(0, 8)}`,
        actor: 'Jordan Lee',
        kind: 'renewal',
        action: `Requested renewal from ${this.company.contact}: ${names.join(', ')}.${message ? ` Message: “${message}”` : ''}`,
      });
      this.sentNote = `Renewal requested from ${this.company.contact} for ${ids.length} document${ids.length > 1 ? 's' : ''}.`;
      this.renewalOpen = false;
    },
    remind(doc) {
      this.audit.unshift({
        at: `${this.today}T${new Date().toTimeString().slice(0, 8)}`,
        actor: 'Jordan Lee',
        kind: 'renewal',
        action: `Sent a reminder to ${this.company.contact}: ${doc.label.toLowerCase()} renewal.`,
      });
      this.sentNote = `Reminder sent to ${this.company.contact} for the ${doc.label.toLowerCase()}.`;
    },
  },
};
</script>
