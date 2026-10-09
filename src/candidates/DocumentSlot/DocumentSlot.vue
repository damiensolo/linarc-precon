<template>
  <!-- CANDIDATE 2026-10-09: proposed design-system component, see docs/components/DocumentSlot.md.
       One required document: what's needed, the upload zone (library DropArea) or the uploaded file, the validation
       status with its plain-language message, and extracted details. Used under the declared field it evidences
       (compact) and in the Documents list (full).
       Visual rule (2026-10-09 restyle): no card. In a list the parent draws the hairlines between slots; under a form
       field a single left rule ties the slot to its field. Status is a StatusChip only when the user must act
       (rejected / failed); otherwise a muted word. The message carries colour only for error and warning tones. -->
  <section class="document-slot flex flex-col gap-space-12" :class="compact ? 'pb-space-12 pt-space-4' : 'py-space-16'" :aria-labelledby="titleId">
    <header class="flex flex-wrap items-start justify-between gap-space-8">
      <div class="flex min-w-0 flex-col gap-space-2">
        <span :id="titleId" class="font-label text-fontsize-14 font-bold leading-lineheight-20 text-text-default">{{ doc.label }}</span>
        <span class="font-label text-fontsize-12 leading-lineheight-16 text-text-soft">{{ requiredText }}<template v-if="doc.expiryDriver && doc.expiryDriver !== 'None'"> · Expiry: {{ doc.expiryDriver }}</template></span>
      </div>
      <StatusChip v-if="status && actionNeeded" :label="status.label" :status="chipStatus" fill-style="outline" type="default" :removable="false" />
      <span v-else-if="status" class="font-label text-fontsize-12 leading-lineheight-16 text-text-subtle">{{ status.label }}</span>
    </header>

    <ul v-if="!compact || !doc.status" class="m-0 flex list-disc flex-col gap-space-2 pl-space-20 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">
      <li v-for="r in doc.requirements" :key="r">{{ r }}</li>
    </ul>

    <!-- Needs an upload: empty, or rejected at intake. -->
    <DropArea
      v-if="!doc.status || doc.status === 'rejected'"
      size="small"
      :state="doc.status === 'rejected' ? 'error' : 'default'"
      :error-message="doc.status === 'rejected' ? doc.message : ''"
      browse-button-label="Choose file"
      :browse-button-icon="null"
      media-types-text="PDF, JPG or PNG, up to 25 MB"
    />
    <!-- Processing: the zone shows progress. -->
    <DropArea v-else-if="doc.status === 'processing'" size="small" state="uploading" :file-name="primaryFile.name" :progress="60" :uploading-message="doc.message" />
    <!-- Uploaded and checked: file row + message. -->
    <div v-else class="flex flex-col gap-space-8">
      <div v-for="f in files" :key="f.name" class="flex items-center gap-space-8 font-label text-fontsize-14 leading-lineheight-20">
        <File :size="16" :stroke-width="1.75" class="shrink-0 text-icon-subtle" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-text-default">{{ f.name }}</span>
        <span class="shrink-0 text-fontsize-12 leading-lineheight-16 text-text-soft">Uploaded {{ $moment(f.uploadedOn).format('D MMM') }}</span>
      </div>
      <p class="m-0 font-label text-fontsize-14 leading-lineheight-20" :class="messageClass">{{ doc.message }}</p>
      <dl v-if="showExtracted" class="m-0 grid grid-cols-1 gap-x-space-16 gap-y-space-4 pt-space-4 font-label text-fontsize-12 leading-lineheight-16 sm:grid-cols-2">
        <template v-for="(v, k) in doc.extracted">
          <dt :key="k + '-k'" class="text-text-soft">{{ k }}</dt>
          <dd :key="k + '-v'" class="m-0 text-text-default">{{ v }}</dd>
        </template>
      </dl>
    </div>

    <footer v-if="doc.status && doc.status !== 'processing'" class="flex flex-wrap items-center gap-space-16">
      <Button :label="doc.status === 'rejected' ? 'Upload a different file' : 'Replace file'" color-scheme="primary" variant="text" size="small" />
      <Button v-if="doc.extracted" :label="showExtracted ? 'Hide extracted details' : 'View extracted details'" color-scheme="primary" variant="text" size="small" @onClick="showExtracted = !showExtracted" />
    </footer>
  </section>
</template>

<script>
import { File } from '@development/linarc-icons';
import DropArea from '@/componentsV2/DropArea/DropArea.vue';
import StatusChip from '@/components/StatusChip/StatusChip.vue';
import Button from '@/components/Button/Button.vue';
import { DOCUMENT, toneToChipStatus } from '~/modules/prequal/status';

// Only the tones that ask for action are coloured; a passed check is said by the status word, not by green text.
const MESSAGE = { error: 'text-text-error', warning: 'text-text-warning-low' };

export default {
  name: 'DocumentSlot',
  components: { DropArea, StatusChip, Button, File },
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
    actionNeeded() {
      return this.doc.status === 'failed' || this.doc.status === 'rejected';
    },
    chipStatus() {
      return this.status ? toneToChipStatus(this.status.tone, { strong: this.doc.status === 'failed' }) : 'warning-neutral';
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
      return MESSAGE[this.status ? this.status.tone : ''] || 'text-text-subtle';
    },
  },
};
</script>
