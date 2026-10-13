<template>
  <div class="flex flex-col h-screen bg-surface-page">
    <!-- Sandbox chrome: prototype picker + theme toggle. Not part of any prototype. Shown and hidden with the settings
         gear in each screen's top nav (~/modules/sandbox.js); ?chrome=0 starts hidden. -->
    <header
      v-if="showChrome"
      class="flex flex-wrap items-center justify-between gap-space-8 px-space-16 sm:px-space-24 py-space-12 border-b border-border-default bg-surface-container"
    >
      <div class="flex flex-1 basis-full sm:basis-0 flex-wrap items-center gap-space-12 min-w-0">
        <span class="font-heading text-fontsize-14 leading-lineheight-20 font-bold text-text-default">
          Prototypes
        </span>
        <!-- As wide as its longest name (measured in mounted(); capped at the bar's width on a phone). -->
        <SelectV2
          ref="picker"
          v-model="currentSlug"
          class="max-w-full shrink-0"
          :style="pickerWidth ? { width: `${pickerWidth}px` } : null"
          size="small"
          placeholder="Choose a prototype"
          :options="prototypeOptions"
          :visible-item-count="10"
        />
        <!-- Record picker: screens that take a record id in the hash (prototype.records). Sandbox only, like the picker. -->
        <SelectV2
          v-if="recordOptions.length"
          v-model="currentRecord"
          class="w-full sm:w-1/3 lg:w-1/4"
          size="small"
          placeholder="Choose a record"
          :options="recordOptions"
          :visible-item-count="10"
        />
        <a
          v-if="current && current.figma"
          :href="current.figma"
          target="_blank"
          rel="noopener"
          class="font-label text-fontsize-12 leading-lineheight-16 text-text-primary"
        >
          Figma ↗
        </a>
      </div>

      <div class="flex items-center gap-space-8">
        <!-- The demo session (src/modules/prequal/data/session.js): back to the starting data. Sandbox only. -->
        <Button
          v-if="demoChanged"
          label="Reset demo data"
          color-scheme="secondary"
          variant="outline"
          size="small"
          @onClick="resetDemo"
        />
        <!-- Simulated request latency for reviewing loading states (src/modules/mock/request.js). Remounts the screen. -->
        <SelectV2
          v-model="latency"
          class="w-space-124"
          title="Simulated loading speed: how long screens take to load their data"
          size="small"
          placeholder="Simulated latency"
          :options="latencyOptions"
          :allow-search="false"
        />
        <Button
          :label="isDark ? 'Dark' : 'Light'"
          color-scheme="secondary"
          variant="outline"
          size="small"
          @onClick="toggleTheme"
        />
      </div>
    </header>

    <main ref="main" class="flex-1 min-h-0 overflow-auto">
      <!-- Keyed by slug + record id: a link to another record of the same screen remounts it with that record. -->
      <component :is="current.component" v-if="current" :key="`${currentSlug}${routeHash}|${latency}`" />
    </main>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import prototypes from '~/prototypes';
import { NAVIGATE_EVENT } from '~/modules/prequal/router';
import { LATENCY_OPTIONS, latencyScenario } from '~/modules/mock/request';
import { hasChanges, resetSession } from '~/modules/prequal/data/session';
import { sandbox } from '~/modules/sandbox';

const THEME_KEY = 'linarc-prototypes:theme';
const HIDDEN_SLUGS = ['prequal-wizard-modal'];

function readQuerySlug() {
  return new URLSearchParams(window.location.search).get('p');
}

export default {
  name: 'App',
  components: {
    Button,
    SelectV2,
  },
  data() {
    const slug = readQuerySlug();
    const fallback = (prototypes[0] || {}).slug;
    return {
      prototypes,
      currentSlug: prototypes.some((p) => p.slug === slug) ? slug : fallback,
      isDark: false,
      routeHash: window.location.hash,
      latency: latencyScenario(),
      pickerWidth: 0,
      latencyOptions: LATENCY_OPTIONS,
    };
  },
  computed: {
    showChrome() {
      return sandbox.controls;
    },
    prototypeOptions() {
      // Short names: the module prefix ("Preconstruction › ") is dropped; variants kept for comparison stay reachable by
      // URL (?p=<slug>) but aren't listed.
      return this.prototypes
        .filter((p) => !HIDDEN_SLUGS.includes(p.slug))
        .map((p) => ({ label: p.title.replace(/^Preconstruction › /, ''), value: p.slug }));
    },
    current() {
      return this.prototypes.find((p) => p.slug === this.currentSlug);
    },
    demoChanged() {
      return hasChanges();
    },
    recordOptions() {
      return this.current && this.current.records ? this.current.records() : [];
    },
    /** The record id in the hash (`#req-006` or `#req-006/insurance`); setting it opens that record (remounts). */
    currentRecord: {
      get() {
        const id = decodeURIComponent(this.routeHash.slice(1)).split('/')[0];
        return this.recordOptions.some((o) => o.value === id) ? id : null;
      },
      set(id) {
        if (!id || id === this.currentRecord) return;
        const url = new URL(window.location.href);
        url.hash = id;
        window.history.pushState(null, '', url);
        this.routeHash = url.hash;
      },
    },
  },
  watch: {
    latency(value) {
      const url = new URL(window.location.href);
      if (value === 'instant') url.searchParams.delete('latency');
      else url.searchParams.set('latency', value);
      window.history.replaceState(null, '', url);
    },
    currentSlug(slug) {
      const url = new URL(window.location.href);
      url.searchParams.set('p', slug);
      // A record id belongs to the screen it was opened on; picking another screen starts without one.
      if (slug !== readQuerySlug()) {
        url.hash = '';
        this.routeHash = '';
      }
      window.history.replaceState(null, '', url);
    },
  },
  mounted() {
    this.sizePicker();
  },
  created() {
    // ?theme=dark|light wins (shareable links, headless screenshots); else last choice.
    const queryTheme = new URLSearchParams(window.location.search).get('theme');
    try {
      this.isDark = (queryTheme || window.localStorage.getItem(THEME_KEY)) === 'dark';
    } catch (e) {
      this.isDark = queryTheme === 'dark';
    }
    this.applyTheme();
    // In-document navigation (D-24): screens call router.go(), which pushes the URL and fires NAVIGATE_EVENT; Back and
    // Forward fire popstate. Either way only the prototype swaps; the page never reloads, so the shell never blanks.
    window.addEventListener(NAVIGATE_EVENT, this.syncFromUrl);
    window.addEventListener('popstate', this.syncFromUrl);
  },
  beforeDestroy() {
    window.removeEventListener(NAVIGATE_EVENT, this.syncFromUrl);
    window.removeEventListener('popstate', this.syncFromUrl);
  },
  methods: {
    /** Picker width = the longest option label in the trigger's own font + the trigger's padding and chevron. */
    sizePicker() {
      // After the web font loads, or the fallback font's widths would be measured.
      const ready = document.fonts ? document.fonts.ready : Promise.resolve();
      ready.then(() => {
        const root = this.$refs.picker && this.$refs.picker.$el;
        const input = root && root.querySelector('input');
        if (!input) return;
        const css = getComputedStyle(input);
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.font = `${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
        const text = Math.max(...this.prototypeOptions.map((o) => ctx.measureText(o.label).width));
        const chrome = root.offsetWidth - input.clientWidth + parseFloat(css.paddingLeft) + parseFloat(css.paddingRight);
        this.pickerWidth = Math.ceil(text + chrome + 4);
      });
    },
    syncFromUrl() {
      const slug = readQuerySlug();
      if (this.prototypes.some((p) => p.slug === slug)) this.currentSlug = slug;
      this.routeHash = window.location.hash;
      if (this.$refs.main) this.$refs.main.scrollTop = 0;
    },
    resetDemo() {
      resetSession();
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      this.applyTheme();
      try {
        window.localStorage.setItem(THEME_KEY, this.isDark ? 'dark' : 'light');
      } catch (e) {
        // storage unavailable; theme just won't persist
      }
    },
    applyTheme() {
      document.documentElement.classList.toggle('dark', this.isDark);
    },
  },
};
</script>
