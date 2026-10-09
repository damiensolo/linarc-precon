<template>
  <!-- CANDIDATE 2026-10-09: proposed design-system component, see docs/components/DocumentSlot.md.
       One required document: what's needed, the upload zone (library DropArea) or the uploaded file, the validation
       status (library StatusChip) with its plain-language message, and extracted details. Used under the declared
       field it evidences (compact) and in the Documents list (full). -->
  <section class="document-slot flex flex-col gap-space-12 rounded-radius-6 bg-surface-container p-space-16 outline outline-1 -outline-offset-1" :class="boxOutline" :aria-labelledby="titleId">
    <header class="flex flex-wrap items-start justify-between gap-space-8">
      <div class="flex min-w-0 flex-col gap-space-2">
        <span :id="titleId" class="font-label text-fontsize-14 font-bold leading-lineheight-20 text-text-default">{{ doc.label }}</span>
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ requiredText }}<template v-if="doc.expiryDriver && doc.expiryDriver !== 'None'"> · Expiry: {{ doc.expiryDriver }}</template></span>
      </div>
      <StatusChip v-if="status" :label="status.label" :status="chipStatus" fill-style="outline" type="default" :removable="false" />
    </header>

    <ul v-if="!compact || !doc.status" class="flex list-disc flex-col gap-space-2 pl-space-20 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
      <li v-for="r in doc.requirements" :key="r">{{ r }}</li>
    </ul>

    <!-- Needs an upload: empty, or rejected at intake. -->
    <DropArea
      v-if="!doc.status || doc.status === 'rejected'"
      size="small"
      :state="doc.status === 'rejected' ? 'error' : 'default'"
      :error-message="doc.status === 'rejected' ? doc.message : ''"
      browse-button-label="Choose file"
      media-types-text="PDF, JPG or PNG, up to 25 MB"
    />
    <!-- Processing: the zone shows progress. -->
    <DropArea v-else-if="doc.status === 'processing'" size="small" state="uploading" :file-name="primaryFile.name" :progress="60" :uploading-message="doc.message" />
    <!-- Uploaded and checked: file row + message. -->
    <div v-else class="flex flex-col gap-space-8">
      <div v-for="f in files" :key="f.name" class="flex items-center gap-space-8 rounded-radius-4 bg-surface-subtle px-space-12 py-space-8 font-label text-fontsize-14 leading-lineheight-20">
        <FileCheck :size="16" :stroke-width="1.75" class="shrink-0 text-icon-default" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-text-default">{{ f.name }}</span>
        <span class="shrink-0 text-fontsize-12 leading-lineheight-16 text-text-soft">Uploaded {{ $moment(f.uploadedOn).format('D MMM') }}</span>
      </div>
      <p class="m-0 flex items-start gap-space-8 font-label text-fontsize-14 leading-lineheight-20" :class="messageClass">
        <component :is="messageIcon" :size="16" :stroke-width="1.75" class="mt-space-2 shrink-0" aria-hidden="true" />
        <span>{{ doc.message }}</span>
      </p>
      <dl v-if="showExtracted" class="m-0 grid grid-cols-1 gap-x-space-16 gap-y-space-4 rounded-radius-4 bg-surface-subtle p-space-12 font-label text-fontsize-12 leading-lineheight-16 sm:grid-cols-2">
        <template v-for="(v, k) in doc.extracted">
          <dt :key="k + '-k'" class="text-text-soft">{{ k }}</dt>
          <dd :key="k + '-v'" class="m-0 text-text-default">{{ v }}</dd>
        </template>
      </dl>
    </div>

    <footer v-if="doc.status && doc.status !== 'processing'" class="flex flex-wrap items-center gap-space-8">
      <Button :label="doc.status === 'rejected' ? 'Upload a different file' : 'Replace file'" color-scheme="secondary" variant="outline" size="small" />
      <Button v-if="doc.extracted" :label="showExtracted ? 'Hide extracted details' : 'View extracted details'" color-scheme="primary" variant="text" size="small" @onClick="showExtracted = !showExtracted" />
    </footer>
  </section>
</template>

<script>
import { FileCheck, CircleCheck, CircleAlert, TriangleAlert, Info } from '@development/linarc-icons';
import DropArea from '@/componentsV2/DropArea/DropArea.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import Button from '@/components/Button/Button.vue';
import { DOCUMENT, toneToChipStatus } from '~/modules/prequal/status';

const MESSAGE = {
  success: { cls: 'text-text-success', icon: CircleCheck },
  error: { cls: 'text-text-error', icon: CircleAlert },
  warning: { cls: 'text-text-warning-low', icon: TriangleAlert },
  info: { cls: 'text-text-subtle', icon: Info },
  neutral: { cls: 'text-text-subtle', icon: Info },
};

export default {
  name: 'DocumentSlot',
  components: { DropArea, StatusChip, Button, FileCheck },
  props: {
    /** A document slot from src/modules/prequal/data/portal.js. */
    doc: { type: Object, required: true },
    /** Under a form field: hides the requirements list once a file exists. */
    compact: { type: Boolean, default: false },
  },
  data() {
    return { showExtracted: false };
  },
  computed: {
    titleId() {
      return `doc-slot-${this.doc.id}`;
    },
    status() {
      return this.doc.status ? DOCUMENT[this.doc.status] : null;
    },
    chipStatus() {
      return this.status ? toneToChipStatus(this.status.tone, { strong: this.doc.status === 'failed' }) : 'warning-neutral';
    },
    boxOutline() {
      if (!this.status) return 'outline-border-subtle';
      return { error: 'outline-border-error', warning: 'outline-border-warning-low' }[this.status.tone] || 'outline-border-subtle';
    },
    files() {
      return this.doc.files || (this.doc.file ? [this.doc.file] : []);
    },
    primaryFile() {
      return this.files[0] || { name: '' };
    },
    requiredText() {
      if (this.doc.required === 'site-security') return 'Required for this site';
      return this.doc.required ? 'Required' : 'Optional';
    },
    messageClass() {
      return (MESSAGE[this.status ? this.status.tone : 'neutral'] || MESSAGE.neutral).cls;
    },
    messageIcon() {
      return (MESSAGE[this.status ? this.status.tone : 'neutral'] || MESSAGE.neutral).icon;
    },
  },
};
</script>
