<template>
  <!-- Preconstruction › Prequalification › Qualified Subs (list, prequal-qualified) → record: the Qualification Record (docs/prequal/screens.md §6),
       the durable output of an approval. Patterns (docs/5-ui-patterns.md): full page under the module nav; Title Bar /
       Workflow header (back · company · record ID chip · status); the record on the left; the audit trail in AppLayout's
       right panel (activity, as on the RFI screen), inline at the end below 1024px. Request renewal is a short
       single-step task, so it's a ModalV2 (§1). Estimator/PM sees status, trades, limits and conditions only (PRD §10).
       Data: src/modules/prequal/data/records.js. `#<request id>` picks the record; no hash = Summit (req-021).
       Loading (docs/5-ui-patterns.md §6): the record comes from a (mock) request. The shell, the back arrow and "View as"
       stay; the company name, ID chip, status, the record column and the audit trail wait for it, as skeletons in the
       final layout after 200ms ("Request renewal" stays in place, disabled). Request renewal and Send reminder submit
       honestly (disabled at once, confirmation only after the answer, error + Retry). Try the sandbox Latency select. -->
  <PrequalShell screen="record" header-size="comfortable" title="Qualification record" :right-panel="isWide && isReviewer" :scrollable-content="true">
    <template #header>
      <span class="flex min-w-0 items-center gap-space-8">
        <!-- Title Bar / Workflow Size=Comfortable: the back button has a visible container (HeaderToolIcon type="back", P-038). -->
        <HeaderToolIcon type="back" aria-label="Back to Qualified Subs" @click="back" />
        <span v-if="load.hasData" class="truncate font-label text-fontsize-16 font-bold leading-lineheight-24 text-text-default">{{ company.name }}</span>
        <!-- The name depends on the record: a title-sized line holds its place (invisible for the first 200ms). -->
        <Skeleton v-else size="md" class="w-space-124 shrink-0" :class="{ invisible: !load.indicator }" />
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
      <!-- Kept in place (disabled) while the record loads, so the title bar doesn't shift when it arrives. -->
      <Button
        v-if="isReviewer && (record || !load.hasData)"
        label="Request renewal"
        color-scheme="secondary"
        variant="outline"
        size="medium"
        :is-disabled="!load.hasData"
        @onClick="openRenewal(null)"
      />
    </template>

    <template #content>
      <LoadRegion class="w-full pt-space-16 pb-space-24" :load="load" @retry="fetch">
        <!-- v-slot keeps the content lazy: it is only evaluated once the record has arrived. -->
        <template #default>
          <div class="flex w-full flex-col gap-space-40">
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
                :pending="reminding"
                @renew="openRenewal"
                @remind="remind"
              >
                <template #status>
                  <LoadStatus :load="reminder" :active="!!remindFor" variant="notice" @retry="remind(remindFor)" />
                </template>
              </MonitoringList>
              <p v-else class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
                Documents, scores and the audit trail are visible to prequalification reviewers.
              </p>

              <section v-if="isReviewer && !isWide" class="border-t border-border-subtle pt-space-24">
                <AuditTrail :entries="audit" />
              </section>
            </template>
          </div>
        </template>

        <template #skeleton>
          <RecordSkeleton :reviewer="isReviewer" />
        </template>
      </LoadRegion>

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
      <!-- Same request as the record column: a secondary LoadRegion (skeleton and reveal, but no second live region or
           error notice; the main region announces the load and shows the error + Retry, this panel stays empty). -->
      <div class="h-full overflow-y-auto p-space-20">
        <LoadRegion secondary :load="load">
          <template #default>
            <AuditTrail :entries="audit" />
          </template>
          <template #skeleton>
            <AuditTrailSkeleton />
          </template>
        </LoadRegion>
      </div>
    </template>
  </PrequalShell>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import HeaderToolIcon from '@/componentsV2/HeaderToolIcon/HeaderToolIcon.vue';
import Chip from '@/components/Chip/Chip.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import SegmentedControl from '@/componentsV2/SegmentedControl/SegmentedControl.vue';
import PrequalShell from '~/modules/prequal/PrequalShell.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import LoadRegion from '~/candidates/LoadRegion/LoadRegion.vue';
import Skeleton from '~/candidates/Skeleton/Skeleton.vue';
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import { TODAY, companyById, requestById } from '~/modules/prequal/data';
import { DEFAULT_RECORD, recordFor } from '~/modules/prequal/data/records';
import { requestStatus, toneToChipStatus } from '~/modules/prequal/status';
import { currentRoute, go } from '~/modules/prequal/router';
import RecordSummary from './components/RecordSummary.vue';
import MonitoringList from './components/MonitoringList.vue';
import AuditTrail from './components/AuditTrail.vue';
import RenewalModal from './components/RenewalModal.vue';
import RecordSkeleton from './components/RecordSkeleton.vue';
import AuditTrailSkeleton from './components/AuditTrailSkeleton.vue';
import LoadStatus from '~/candidates/LoadStatus/LoadStatus.vue';

export default {
  name: 'PrequalRecord',
  prototype: {
    title: 'Preconstruction › Prequalification › Qualification record',
    figma: 'https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3783-8437',
  },
  components: { PrequalShell, Button, HeaderToolIcon, Chip, StatusChip, SegmentedControl, InlineNotice, RecordSummary, MonitoringList, AuditTrail, RenewalModal, LoadRegion, Skeleton, RecordSkeleton, AuditTrailSkeleton, LoadStatus },
  data() {
    const asked = currentRoute().id;
    const id = asked && requestById[asked] ? asked : DEFAULT_RECORD;
    return {
      requestId: id,
      // Filled by fetch(); nothing derived from them renders before the record arrives.
      record: null,
      documents: [],
      audit: [],
      load: createLoad({ label: 'qualification record' }),
      /** Send reminder: its own submit; remindFor is the document being (or last) reminded. */
      reminder: createLoad({ label: 'reminder', action: { busy: 'Sending', done: 'Sent', error: "Couldn't send the reminder. Nothing was sent." } }),
      remindFor: null,
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
    reminding() {
      return this.reminder.status === 'loading';
    },
    /** Every request now opens on the review screen: its review, its decision, or its tracking view. */
    openLabel() {
      const w = this.request.workflow;
      if (['submitted', 'under-review', 'info-requested'].includes(w)) return 'Open review';
      if (w === 'closed') return 'View decision';
      return 'Open request';
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
    this.reminder.destroy();
  },
  methods: {
    fetch() {
      this.load.run(
        (signal) =>
          mockRequest(() => {
            const record = recordFor(this.requestId);
            return {
              record,
              documents: record ? record.documents.map((d) => ({ ...d })) : [],
              audit: record ? [...record.audit] : [],
            };
          }, { signal }),
        (r) => Object.assign(this, r),
      );
    },
    toneToChipStatus,
    back() {
      go('qualified');
    },
    openRequest() {
      go('review', this.requestId);
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
      if (this.reminding) return;
      this.remindFor = doc;
      this.reminder.run(
        (signal) => mockRequest(() => doc.id, { signal }),
        () => {
          this.audit.unshift({
            at: `${this.today}T${new Date().toTimeString().slice(0, 8)}`,
            actor: 'Jordan Lee',
            kind: 'renewal',
            action: `Sent a reminder to ${this.company.contact}: ${doc.label.toLowerCase()} renewal.`,
          });
          this.sentNote = `Reminder sent to ${this.company.contact} for the ${doc.label.toLowerCase()}.`;
          this.remindFor = null;
        },
      );
    },
  },
};
</script>
