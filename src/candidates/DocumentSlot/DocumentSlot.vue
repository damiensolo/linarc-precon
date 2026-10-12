<template>
  <!-- CANDIDATE 2026-10-09: proposed design-system component, see docs/components/DocumentSlot.md.
       One required document: what's needed, the upload zone (library DropArea) or the uploaded file, the validation
       status with its plain-language message, and extracted details. Used under the declared field it evidences
       (compact) and in the Documents list (full).
       Visual rule (2026-10-09 restyle): no card. In a list the parent draws the hairlines between slots; under a form
       field a single left rule ties the slot to its field. Status is a StatusChip only when the user must act
       (rejected / failed); otherwise a muted word. The message carries colour only for error and warning tones.
       Interactive (CANDIDATE 2026-10-11): choosing or dropping a file emits `upload` ({ doc, files, mode }); the page
       uploads and validates it and feeds the result back through `doc` (processing with `progress`, then the status).
       Replace / Upload a different file / Upload the renewed document / Add the missing form reopen the zone (Cancel
       closes it). A wrong type or a file over 25 MB is refused in place; an upload in progress can be cancelled
       (`cancel`). `doc.uploadError` (set by the page) shows a failed transfer until dismissed. -->
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

    <!-- Read-only (submitted, nothing requested): no upload zone; a missing optional document just says so. -->
    <p v-if="readonly && !doc.status" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">Not uploaded.</p>
    <!-- Uploading, then checking: progress, the file name, and an X that cancels. -->
    <DropArea
      v-else-if="doc.status === 'processing'"
      size="small"
      state="uploading"
      :file-name="primaryFile.name"
      :progress="doc.progress === undefined ? 60 : doc.progress"
      :uploading-message="doc.message"
      :show-close-button="!!doc.cancellable"
      close-button-aria-label="Cancel upload"
      @on-clear="$emit('cancel', { doc })"
    />
    <!-- A refusal in place (wrong type, too large, transfer failed): the X dismisses it and reopens the zone. -->
    <DropArea
      v-else-if="!readonly && refusal"
      size="small"
      state="error"
      :error-message="refusal"
      close-button-aria-label="Dismiss"
      @on-clear="dismiss"
    />
    <!-- Rejected at intake: the reason, until the user picks another file. -->
    <DropArea
      v-else-if="!readonly && doc.status === 'rejected' && !picking"
      size="small"
      state="error"
      :error-message="doc.message"
      close-button-aria-label="Upload a different file"
      @on-clear="picking = true"
    />
    <!-- Needs an upload, or the user asked to replace / add. -->
    <DropArea
      v-else-if="!readonly && (!doc.status || picking)"
      size="small"
      state="default"
      :multiple="multiple"
      accept=".pdf,.jpg,.jpeg,.png"
      :max-file-size="maxBytes"
      :browse-button-label="multiple ? 'Choose files' : 'Choose file'"
      :browse-button-icon="null"
      media-types-text="PDF, JPG or PNG, up to 25 MB"
      @on-upload="onUpload"
      @file-rejected="onRefused"
    />
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

    <footer v-if="doc.status && doc.status !== 'processing' && !refusal" class="flex flex-wrap items-center gap-space-16">
      <Button native-type="button" v-if="!readonly && !picking && doc.status !== 'rejected'" :label="actionLabel" color-scheme="primary" variant="text" size="small" @onClick="open(missingForms ? 'add' : 'replace')" />
      <Button native-type="button" v-if="picking && doc.status" label="Cancel" color-scheme="secondary" variant="minimal" size="small" @onClick="picking = false" />
      <Button native-type="button" v-if="doc.extracted" :label="showExtracted ? 'Hide extracted details' : 'View extracted details'" color-scheme="primary" variant="text" size="small" @onClick="showExtracted = !showExtracted" />
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
    /** CANDIDATE 2026-10-11: the slot can't be changed (application submitted, and this document wasn't requested):
        no upload zone, no Replace. */
    readonly: { type: Boolean, default: false },
  },
  data() {
    return {
      showExtracted: false,
      /** The zone is open to replace or add a file. */
      picking: false,
      mode: 'replace',
      /** A file refused in place: wrong type or too large. */
      refused: '',
      maxBytes: 25 * 1024 * 1024,
    };
  },
  watch: {
    // A new result (or a new upload) closes the zone.
    'doc.status'() {
      this.picking = false;
    },
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
    /** A refusal to show in the zone: refused here (type / size) or a failed transfer reported by the page. */
    refusal() {
      return this.refused || this.doc.uploadError || '';
    },
    /** Several files in one slot: one per year (OSHA 300A) or per person (certification cards). */
    multiple() {
      return !!this.doc.count || this.doc.id === 'cert-cards';
    },
    missingForms() {
      return !!this.doc.count && this.files.length < this.doc.count;
    },
    actionLabel() {
      if (this.missingForms) return this.doc.count - this.files.length === 1 ? 'Add the missing form' : 'Add the missing forms';
      if (this.doc.status === 'expiring' || this.doc.status === 'expired') return 'Upload the renewed document';
      return 'Replace file';
    },
    messageClass() {
      return MESSAGE[this.status ? this.status.tone : ''] || 'text-text-subtle';
    },
  },
  methods: {
    open(mode) {
      this.mode = mode;
      this.picking = true;
    },
    onUpload({ files }) {
      this.refused = '';
      this.$emit('upload', { doc: this.doc, files, mode: this.doc.status === 'rejected' ? 'replace' : this.mode });
      this.mode = 'replace';
    },
    onRefused({ reasons }) {
      const r = reasons[0];
      this.refused = r.reason === 'size'
        ? `${r.file.name} is larger than 25 MB. Upload a smaller file or a compressed PDF.`
        : `${r.file.name} isn’t a PDF, JPG or PNG.`;
    },
    dismiss() {
      if (this.refused) this.refused = '';
      else this.$emit('dismiss-error', { doc: this.doc });
      this.picking = true;
    },
  },
};
</script>
