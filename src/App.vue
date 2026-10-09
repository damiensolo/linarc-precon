<template>
  <div class="flex flex-col h-screen bg-surface-page">
    <!-- Sandbox chrome: prototype picker + theme toggle. Not part of any prototype. Hidden with ?chrome=0. -->
    <header
      v-if="showChrome"
      class="flex flex-wrap items-center justify-between gap-space-8 px-space-16 sm:px-space-24 py-space-12 border-b border-border-default bg-surface-container"
    >
      <div class="flex flex-1 flex-wrap items-center gap-space-12 min-w-0">
        <span class="font-heading text-fontsize-14 leading-lineheight-20 font-bold text-text-default">
          Linarc Prototypes
        </span>
        <SelectV2
          v-model="currentSlug"
          class="w-full sm:w-1/2 lg:w-1/3"
          size="small"
          placeholder="Choose a prototype"
          :options="prototypeOptions"
          :visible-item-count="8"
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

      <Button
        :label="isDark ? 'Dark' : 'Light'"
        color-scheme="secondary"
        variant="outline"
        size="small"
        @onClick="toggleTheme"
      />
    </header>

    <main class="flex-1 min-h-0 overflow-auto">
      <component :is="current.component" v-if="current" />
    </main>
  </div>
</template>

<script>
import Button from '@/components/Button/Button.vue';
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import prototypes from '~/prototypes';

const THEME_KEY = 'linarc-prototypes:theme';

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
      // ?chrome=0 renders the prototype full-window, for pixel comparison with Figma frames.
      showChrome: new URLSearchParams(window.location.search).get('chrome') !== '0',
      isDark: false,
    };
  },
  computed: {
    prototypeOptions() {
      return this.prototypes.map((p) => ({ label: p.title, value: p.slug }));
    },
    current() {
      return this.prototypes.find((p) => p.slug === this.currentSlug);
    },
  },
  watch: {
    currentSlug(slug) {
      const url = new URL(window.location.href);
      url.searchParams.set('p', slug);
      window.history.replaceState(null, '', url);
    },
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
  },
  methods: {
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
