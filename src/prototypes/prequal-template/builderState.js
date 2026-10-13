// State and step logic for the template builder (screen 10, prequal-template): create, edit (as the next version),
// duplicate and publish a requirement template. docs/prequal/templates-plan.md.
//
// Route: `#new` (a new draft from the Standard baseline; nothing is stored until Save draft or Publish),
// `#<template id>` (the template's draft, or a copy of its published definition that becomes the draft of the next
// version on the first save), `#<id>/<step>` opens a step. Steps: basics · requirements · thresholds · checks ·
// scoring · publish (PRD UX l. 824–835).
//
// Loading (docs/5-ui-patterns.md §6, D-24): the form is local. Save draft and Publish are (mock) server calls and
// honest, as the wizard's: the button disables at once, "Saving…" / "Publishing…" past 200ms, the flow leaves only
// after the request resolves, a failure keeps everything and says so with Retry.
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import { currentRoute, go } from '~/modules/prequal/router';
import { templateById, draftOf, draftVersion, definitionFromBaseline, createTemplate, saveDraft, publishTemplate, archiveTemplate, restoreTemplate, duplicateTemplate, usageOf, warningsFor } from '~/modules/prequal/data/templates';
import { TEMPLATE } from '~/modules/prequal/status';

// `short`: the label under 640px, where only the active step's label shows and six steps must still fit.
export const STEPS = [
  { id: 'basics', label: 'Basics', short: 'Basics' },
  { id: 'requirements', label: 'Requirements', short: 'Requirements' },
  { id: 'thresholds', label: 'Thresholds', short: 'Thresholds' },
  { id: 'checks', label: 'Checks', short: 'Checks' },
  { id: 'scoring', label: 'Scoring & knockouts', short: 'Scoring' },
  { id: 'publish', label: 'Review & publish', short: 'Publish' },
];

export default {
  data() {
    const route = currentRoute();
    const [idPart, stepPart] = (route.id || 'new').split('/');
    const isNew = idPart === 'new';
    const record = isNew ? null : templateById(idPart);
    return {
      steps: STEPS,
      templateId: isNew || !record ? null : idPart,
      record,
      def: record ? draftOf(idPart) : definitionFromBaseline('standard'),
      // A published template opens on Review & publish (its summary, and whether a next version is in progress); a
      // never-published draft opens on Basics.
      current: STEPS.some((s) => s.id === stepPart) ? stepPart : record && record.published ? 'publish' : 'basics',
      dirty: false,
      savedAt: null,
      isNarrow: false,
      confirm: null, // 'publish' | 'archive' | 'discard' | null
      draftLoad: createLoad({ label: 'draft', action: { busy: 'Saving', done: 'Saved', error: "Couldn't save the draft." } }),
      publishLoad: createLoad({ label: 'template', action: { busy: 'Publishing', done: 'Published', error: "Couldn't publish the template." } }),
      lastAction: null,
    };
  },
  computed: {
    index() {
      return STEPS.findIndex((s) => s.id === this.current);
    },
    /** Every step is configured from the baseline, so every step can be opened (the stepper only lets completed
     *  steps be revisited by default; here the others are marked complete). */
    stepperSteps() {
      return STEPS.map((s) => ({ id: s.id, label: this.isNarrow ? s.short : s.label, ...(s.id === this.current ? {} : { state: 'success' }) }));
    },
    isLast() {
      return this.index === STEPS.length - 1;
    },
    isNew() {
      return !this.templateId;
    },
    status() {
      // A Draft until published; an active or archived template being edited shows its published state until the
      // first change, then the next version's Draft.
      if (!this.record) return TEMPLATE.draft;
      if (this.record.draft || this.dirty) return TEMPLATE.draft;
      return TEMPLATE[this.record.status];
    },
    version() {
      if (!this.record) return 1;
      return this.record.draft || this.dirty ? draftVersion(this.record) : this.record.version;
    },
    /** The version publishing would create. */
    nextVersion() {
      return this.record ? draftVersion(this.record) : 1;
    },
    title() {
      return (this.def.name && this.def.name.trim()) || (this.isNew ? 'New template' : 'Untitled template');
    },
    usage() {
      return this.templateId ? usageOf(this.templateId) : { active: 0, total: 0 };
    },
    warnings() {
      return warningsFor(this.def);
    },
    canPublish() {
      return !this.warnings.some((w) => w.blocking);
    },
    savedText() {
      return this.savedAt ? `Draft saved ${this.$moment(this.savedAt).format('h:mm a')}` : '';
    },
    saving() {
      return this.draftLoad.status === 'loading';
    },
    publishing() {
      return this.publishLoad.status === 'loading';
    },
    busy() {
      return this.saving || this.publishing;
    },
    actionLoad() {
      return this.lastAction === 'publish' ? this.publishLoad : this.draftLoad;
    },
    actionFailed() {
      return this.lastAction !== null && this.actionLoad.status === 'error';
    },
    actionRetry() {
      return this.lastAction === 'publish' ? this.publish : this.save;
    },
    publishLabel() {
      if (this.record && this.record.status === 'archived') return 'Publish and restore';
      return 'Publish';
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
    this.draftLoad.destroy();
    this.publishLoad.destroy();
  },
  methods: {
    /** Every edit comes through here: the step components emit the changed part of the definition. */
    update(patch) {
      this.def = { ...this.def, ...patch };
      this.dirty = true;
    },
    /** Basics › baseline (new templates only): rebuild from the baseline, keeping what was typed. */
    rebase(baselineId) {
      const { name, trades, sizeBands } = this.def;
      this.def = definitionFromBaseline(baselineId, { name, trades, sizeBands });
      this.dirty = true;
    },
    goTo(id) {
      if (!id || id === this.current) return;
      this.current = id;
      const base = this.templateId || 'new';
      window.history.replaceState(null, '', `${window.location.search}#${encodeURIComponent(`${base}/${id}`)}`);
      const el = this.scrollElement();
      if (el) el.scrollTop = 0;
    },
    scrollElement() {
      return this.$el.querySelector('.lnrc-app-layout__content-body');
    },
    next() {
      if (this.busy) return;
      if (this.isLast) this.confirm = 'publish';
      else this.goTo(STEPS[this.index + 1].id);
    },
    back() {
      if (this.index > 0) this.goTo(STEPS[this.index - 1].id);
      else this.leave();
    },
    /** Back arrow / Cancel: ask about unsaved changes, otherwise return to the list. */
    leave() {
      if (this.dirty) this.confirm = 'discard';
      else go('templates');
    },
    act(name, load, produce, apply) {
      this.lastAction = name;
      return load.run((signal) => mockRequest(produce, { signal }), apply);
    },
    /** The record this draft belongs to; created on the first save of a new template. */
    ensureRecord() {
      if (!this.templateId) {
        this.templateId = createTemplate(this.def.baseline);
        window.history.replaceState(null, '', `${window.location.search}#${encodeURIComponent(`${this.templateId}/${this.current}`)}`);
      }
      return this.templateId;
    },
    save() {
      if (this.busy) return Promise.resolve({ ok: false });
      return this.act('draft', this.draftLoad, () => {
        const id = this.ensureRecord();
        saveDraft(id, this.def);
        return new Date();
      }, (at) => {
        this.savedAt = at;
        this.dirty = false;
        this.record = templateById(this.templateId);
      });
    },
    publish() {
      if (this.busy) return;
      this.confirm = null;
      this.act('publish', this.publishLoad, () => {
        const id = this.ensureRecord();
        return publishTemplate(id, this.def);
      }).then((r) => {
        if (r.ok) go('templates');
      });
    },
    archive() {
      this.confirm = null;
      if (!this.templateId) return;
      archiveTemplate(this.templateId);
      go('templates');
    },
    restore() {
      if (!this.templateId) return;
      restoreTemplate(this.templateId);
      this.record = templateById(this.templateId);
    },
    duplicate() {
      if (!this.templateId) return;
      const id = duplicateTemplate(this.templateId);
      go('template', id);
    },
    discard() {
      this.confirm = null;
      go('templates');
    },
    /** Preview as subcontractor (plan T8): the portal on a sample request from the definition being edited. The draft
     *  is saved first so the preview shows what's on screen. */
    preview() {
      if (this.busy) return;
      const open = () => {
        try { window.sessionStorage.setItem('linarc-prototypes:preview-return', `${this.templateId}/${this.current}`); } catch (e) { /* storage blocked */ }
        go('portal', `preview-${this.templateId}`);
      };
      if (this.dirty || this.isNew) this.save().then((r) => { if (r.ok) open(); });
      else open();
    },
  },
};
