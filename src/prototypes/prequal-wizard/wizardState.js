// State and step logic shared by both versions of the New request flow:
//   prequal-wizard        (default) full-page create screen with Title Bar / Workflow
//   prequal-wizard-modal  (version B) the same steps in a ModalV2 over the Overview
// Only the container differs, so a comparison between the two is about the pattern, not the content.
import { companyById } from '~/modules/prequal/data';
import { steps, initialDraft } from '~/modules/prequal/data/wizard';
import { currentRoute, go } from '~/modules/prequal/router';

export default {
  data() {
    const route = currentRoute();
    return {
      steps,
      current: route.id && steps.some((s) => s.id === route.id) ? route.id : 'subcontractor',
      draft: initialDraft(),
      adding: false,
      savedAt: null,
      isNarrow: false,
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
      return true;
    },
    savedText() {
      return this.savedAt ? `Draft saved ${this.$moment(this.savedAt).format('h:mm a')}` : '';
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
      if (this.isLast) this.send();
      else this.goTo(steps[this.index + 1].id);
    },
    back() {
      if (this.index > 0) this.goTo(steps[this.index - 1].id);
      else this.close();
    },
    pickCompany(id) {
      this.draft.companyId = id;
      if (id) this.adding = false;
    },
    saveDraft() {
      this.savedAt = new Date();
    },
    close() {
      go('dashboard');
    },
    send() {
      // Prototype: the mock data is static, so the new request isn't added to the Overview.
      go('dashboard');
    },
    openRequest(r) {
      go(['in-progress', 'invited', 'draft'].includes(r.workflow) ? 'dashboard' : 'review', r.id);
    },
    openRecord(q) {
      go('record', q.id);
    },
  },
};
