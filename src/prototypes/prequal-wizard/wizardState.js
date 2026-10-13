// State and step logic shared by both versions of the New request flow:
//   prequal-wizard        (default) full-page create screen with Title Bar / Workflow
//   prequal-wizard-modal  (version B) the same steps in a ModalV2 over the Overview
// Only the container differs, so a comparison between the two is about the pattern, not the content.
//
// Loading (docs/5-ui-patterns.md §6, D-24): the form is local, so it has no page skeleton. Save draft and Send invite
// are (mock) server calls and honest: the button disables at once (no double submit), "Draft saved …" changes and
// the flow leaves only after the request resolves, "Saving…" / "Sending…" shows only past 200ms, and a failure keeps
// everything entered and says so with Retry. Both versions render the shared LoadStatus on `actionLoad` (the last
// action's controller, createLoad `action`) where they show the saved text; it also announces the result.
import { createLoad } from '~/candidates/LoadRegion/createLoad';
import { mockRequest } from '~/modules/mock/request';
import { companyById } from '~/modules/prequal/data';
import { steps, initialDraft, projectById } from '~/modules/prequal/data/wizard';
import { createRequest } from '~/modules/prequal/data/session';
import { matchTemplate, definitionFor } from '~/modules/prequal/data/templates';
import { currentRoute, go } from '~/modules/prequal/router';

export default {
  data() {
    const route = currentRoute();
    return {
      steps,
      current: route.id && steps.some((s) => s.id === route.id) ? route.id : 'subcontractor',
      draft: initialDraft(),
      /** The estimator picked a template by hand (Change template): the work context no longer re-selects one. */
      templateChosen: false,
      adding: false,
      savedAt: null,
      isNarrow: false,
      draftLoad: createLoad({ label: 'draft', action: { busy: 'Saving', done: 'Saved', error: "Couldn't save the draft." } }),
      sendLoad: createLoad({ label: 'invite', action: { busy: 'Sending', done: 'Sent', error: "Couldn't send the invite." } }),
      /** 'draft' | 'send' | null: the action whose state the save-state slot shows (null: nothing tried yet). */
      lastAction: null,
    };
  },
  computed: {
    index() {
      return steps.findIndex((s) => s.id === this.current);
    },
    isLast() {
      return this.index === steps.length - 1;
    },
    company() {
      return this.draft.companyId ? companyById[this.draft.companyId] : null;
    },
    /** The invite goes to a Linarc company's contact, or to the contact typed for a new company. */
    recipientCompany() {
      if (this.company) return this.company;
      const n = this.draft.newCompany;
      return { name: n.name || 'New company', contact: n.contact || 'Contact', email: n.email || '—' };
    },
    companyName() {
      return this.recipientCompany.name;
    },
    canContinue() {
      if (this.current === 'subcontractor') {
        const n = this.draft.newCompany;
        return Boolean(this.draft.companyId || (this.adding && n.name && n.contact && n.email));
      }
      if (this.current === 'work') {
        const w = this.draft.work;
        return Boolean(w.project && w.trades.length && w.single && w.aggregate);
      }
      // No matching template: the estimator picks one on step 3 before going on (PRD UX l. 1135).
      if (this.current === 'requirements') return Boolean(this.draft.template);
      return true;
    },
    savedText() {
      return this.savedAt ? `Draft saved ${this.$moment(this.savedAt).format('h:mm a')}` : '';
    },
    savingDraft() {
      return this.draftLoad.status === 'loading';
    },
    sending() {
      return this.sendLoad.status === 'loading';
    },
    actionLoad() {
      return this.lastAction === 'send' ? this.sendLoad : this.draftLoad;
    },
    actionFailed() {
      return this.lastAction !== null && this.actionLoad.status === 'error';
    },
    actionRetry() {
      return this.lastAction === 'send' ? this.send : this.saveDraft;
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
    this.sendLoad.destroy();
  },
  methods: {
    goTo(id) {
      if (!id || id === this.current) return;
      this.current = id;
      window.history.replaceState(null, '', `${window.location.search}#${encodeURIComponent(id)}`);
      const el = this.scrollElement();
      if (el) el.scrollTop = 0;
    },
    /** The element that scrolls the step content; each version overrides it. */
    scrollElement() {
      return null;
    },
    next() {
      if (this.sending) return;
      if (this.isLast) this.send();
      else this.goTo(steps[this.index + 1].id);
    },
    back() {
      if (this.index > 0) this.goTo(steps[this.index - 1].id);
      else this.close();
    },
    /** Step 2 edits: the work context picks the template (data/templates.js `matchTemplate`) unless one was chosen. */
    setWork(patch) {
      this.draft.work = { ...this.draft.work, ...patch };
      if (this.templateChosen) return;
      const m = matchTemplate(this.draft.work);
      this.setTemplate(m ? m.id : null, { chosen: false });
    },
    /** Step 3 › Change template, or the match: the request's checks start as the template's. */
    setTemplate(id, { chosen = true } = {}) {
      if (chosen) this.templateChosen = true;
      if (id === this.draft.template) return;
      this.draft.template = id;
      const def = id ? definitionFor(id) : null;
      this.draft.checks = def ? [...def.checks] : [];
    },
    pickCompany(id) {
      this.draft.companyId = id;
      if (id) this.adding = false;
    },
    /** A request whose result the server must confirm; LoadStatus shows its state and announces the result. */
    act(name, load, produce, apply) {
      this.lastAction = name;
      return load.run((signal) => mockRequest(produce, { signal }), apply);
    },
    saveDraft() {
      if (this.savingDraft || this.sending) return;
      this.act('draft', this.draftLoad, () => new Date(), (at) => { this.savedAt = at; });
    },
    close() {
      go('dashboard');
    },
    send() {
      // Disabled at once and guarded here, so a second click does nothing. Leaves only after the server confirms.
      // The request is created in the demo session (data/session.js, D-29): it shows on the Overview as Waiting for
      // subcontractor, its portal opens (sandbox record picker), and the flow continues from there. After sending,
      // the request's tracking view opens (PRD UX l. 1186: delivery, completion and checks).
      if (this.sending) return;
      this.act('send', this.sendLoad, () => {
        const w = this.draft.work;
        return createRequest({
          companyId: this.draft.companyId,
          newCompany: this.draft.newCompany,
          project: (projectById[w.project] || { name: w.project }).name,
          template: this.draft.template,
          single: Number(w.single),
          aggregate: Number(w.aggregate),
          totalChecks: Math.min(15, Math.max(12, this.draft.checks.length)),
        });
      }).then((r) => {
        if (r.ok) go('review', r.value);
      });
    },
    openRequest(r) {
      go(['in-progress', 'invited', 'draft'].includes(r.workflow) ? 'dashboard' : 'review', r.id);
    },
    openRecord(q) {
      go('record', q.id);
    },
  },
};
