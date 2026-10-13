// Guided fixes (user request 2026-10-13): a Review & publish warning sends the admin to the exact item. The builder sets
// `focus` ({ key, n }) after switching steps; a step that mixes this in scrolls the element tagged
// `data-target="<key>"` (or a FormV2 field, `data-field-id`) into the middle of the view and marks it for a moment
// (`is-targeted`, styled in prequal-template/index.vue), so there is nothing to scan for.
export default {
  props: {
    /** { key, n } from builderState; `n` changes on every send so the same key can be targeted twice. */
    focus: { type: Object, default: null },
  },
  watch: {
    focus: { handler: 'revealFocus', immediate: true },
  },
  methods: {
    revealFocus() {
      const f = this.focus;
      if (!f || !f.key) return;
      this.$nextTick(() => {
        const key = f.key;
        const root = this.$el;
        if (!root || !root.querySelector) return;
        const sel = key.startsWith('field:') ? `[data-field-id="${key.slice(6)}"]` : `[data-target="${key}"]`;
        const el = root.querySelector(sel) || (root.matches && root.matches(sel) ? root : null);
        if (!el) return;
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        el.classList.add('is-targeted');
        clearTimeout(this.$_targetTimer);
        this.$_targetTimer = setTimeout(() => el.classList.remove('is-targeted'), 3000);
      });
    },
  },
  beforeDestroy() {
    clearTimeout(this.$_targetTimer);
  },
};
