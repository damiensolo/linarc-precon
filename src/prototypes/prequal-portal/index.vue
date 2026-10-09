<template>
  <!-- Subcontractor completion portal (docs/prequal/screens.md §3 and §4; data in src/modules/prequal/data/portal.js).
       External user: the Linarc top nav in a reduced configuration (no module switcher, no tools, no project
       context, account rail with help / notifications / profile only) and no side rail (2026-10-09). The title bar
       carries the request, progress, save state and Submit; the section nav sits in the left panel; the selected
       section (overview, a FormV2 form, the Documents list or Review & submit) in the content area; Previous /
       Save and exit / Next in a fixed bottom panel so the way forward is always on screen.
       Visual rules (2026-10-09 restyle, docs/prototypes/prequal-portal.md "Visual hierarchy"): one container level,
       hairlines not boxes, colour only on the primary action and on states that ask for action, label-only buttons. -->
  <div class="flex h-full flex-col bg-surface-page">
    <!-- Figma: Top Nav Bar Module=Company, whose module cell is the Linarc logomark (Module Icon / Logo Swap, Type=Logo,
         82×72 with the 48px Branding / Logomark), with the Company tools, Bookmarks / Create and project context removed. -->
    <TopNavBar
      :module="{ custom: true }"
      :tools="{ items: [], needBookmarks: false, needCreate: false, isAdmin: false }"
      :context="{ enabled: false }"
      :account="{
        enabled: true,
        show: { announcement: false, message: false, chatSupport: false, help: true, notifications: true, profile: true },
      }"
      :user-details="{ name: request.contact.name, email: request.contact.email }"
    >
      <template #custom_module>
        <span class="flex h-space-72 w-space-84 items-center justify-center" aria-label="Linarc" role="img">
          <LinarcLogoDark :size="48" aria-hidden="true" />
        </span>
      </template>
    </TopNavBar>

    <AppLayout
      class="min-h-0 flex-1"
      :left-panel-enabled="true"
      :left-panel-visible="!isNarrow"
      :left-panel-resizable="false"
      :left-panel-default-width="288"
      :right-panel-enabled="false"
      :bottom-panel-enabled="true"
      :bottom-panel-visible="true"
      :bottom-panel-resizable="false"
      :bottom-panel-default-height="64"
      :bottom-panel-min-height="64"
      :no-bottom-padding="true"
      :scrollable-content="true"
      :persist-preferences="false"
    >
      <template #left-panel>
        <div class="h-full overflow-auto px-space-12 pb-space-12 pt-space-16">
          <PortalSectionNav :groups="navGroups" :selected="current" @select="goTo" />
        </div>
      </template>

      <template #header>
        <span class="flex min-w-0 items-center gap-space-8">
          <span class="inline-flex h-space-24 w-space-24 shrink-0 items-center justify-center rounded-radius-4 bg-surface-neutral font-heading text-fontsize-8 font-bold text-text-default" aria-hidden="true">{{ request.gc.logoText }}</span>
          <span class="truncate font-label text-fontsize-16 font-bold leading-lineheight-24 text-text-default">Prequalification for {{ request.project }}</span>
          <span class="hidden truncate font-label text-fontsize-14 leading-lineheight-20 text-text-subtle lg:inline">· requested by {{ request.gc.name }}</span>
        </span>
      </template>
      <template #header-actions>
        <span class="hidden items-center gap-space-8 font-label text-fontsize-12 leading-lineheight-16 text-text-soft sm:inline-flex">
          <span class="text-text-subtle">{{ completion }}% complete</span>
          <span aria-hidden="true">·</span>
          <span>{{ saveText }}</span>
        </span>
        <Button label="Submit" color-scheme="primary" variant="solid" size="medium" :is-disabled="!ready.canSubmit || submitted" @onClick="submit" />
      </template>

      <template #content>
        <!-- pt-space-16 on top of the layout's own padding: the section title needs room below the title-bar rule. -->
        <div class="flex w-full flex-col gap-space-24 pt-space-16">
          <SelectV2 v-if="isNarrow" label="Section" :options="flatOptions" :value="current" @input="goTo" @change="goTo" />

          <div class="flex flex-col gap-space-4">
            <div class="flex flex-wrap items-baseline justify-between gap-space-8">
              <h1 class="m-0 font-heading text-fontsize-20 font-bold leading-lineheight-28 text-text-default">{{ currentTitle }}</h1>
              <span v-if="currentState" class="font-label text-fontsize-14 leading-lineheight-20" :class="currentState.tone === 'warning' ? 'text-text-warning-low' : 'text-text-subtle'">{{ currentState.label }}</span>
            </div>
            <p v-if="currentSection && currentSection.conditional" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ currentSection.conditional }}</p>
            <p v-if="currentSection && currentSection.note" class="m-0 font-label text-fontsize-14 leading-lineheight-20 text-text-subtle">{{ currentSection.note }}</p>
          </div>

          <PortalOverview
            v-if="current === 'overview'"
            :request="request"
            :company-name="companyName"
            :sections="sections"
            :documents="documents"
            :readiness="ready"
            :completion="completion"
            :consent="consent"
            @consent="consent = $event"
            @open="goTo"
            @continue="goTo(firstIncomplete)"
          />
          <PortalDocuments v-else-if="current === 'documents'" :documents="documents" />
          <PortalReview v-else-if="current === 'review'" :readiness="ready" :submitted="submitted" :gc-name="request.gc.name" @open="goTo" @submit="submit" />
          <FormV2 v-else :key="current" v-model="values[current]" :schema="schemas[current]" :field-types="portalFieldTypes" :flat="true" mode="manual" label-position="top" @submit="onSave">
            <template #footer>
              <span />
            </template>
          </FormV2>
        </div>
      </template>

      <!-- Sticky footer: always visible under the content, never under the section nav. -->
      <template #bottom-panel>
        <footer class="flex h-full items-center justify-between gap-space-12 px-space-20">
          <Button label="Previous" color-scheme="secondary" variant="outline" size="medium" :is-disabled="!prevId" @onClick="goTo(prevId)" />
          <div class="flex items-center gap-space-12">
            <Button label="Save and exit" color-scheme="secondary" variant="minimal" size="medium" @onClick="onSave" />
            <Button :label="nextId ? 'Next' : 'Review and submit'" color-scheme="primary" variant="solid" size="medium" @onClick="goTo(nextId || 'review')" />
          </div>
        </footer>
      </template>
    </AppLayout>
  </div>
</template>

<script>
// LinarcLogoDark: the stacked Linarc mark with the white wordmark, for dark surfaces (Figma Branding / Logomark Mode=Dark).
import { LinarcLogoDark } from '@development/linarc-icons';
import TopNavBar from '@/components/TopNavBar/index.vue';
import AppLayout from '@/componentsV2/AppLayout/AppLayout.vue';
import FormV2 from '@/componentsV2/FormV2/FormV2.vue';
import SelectV2 from '@/componentsV2/SelectV2/SelectV2.vue';
import Button from '@/components/Button/Button.vue';
import PortalSectionNav from '~/candidates/PortalSectionNav/PortalSectionNav.vue';
import PortalOverview from './components/PortalOverview.vue';
import PortalDocuments from './components/PortalDocuments.vue';
import PortalReview from './components/PortalReview.vue';
import { portalRequest, pillars, sections, documents, readiness, completion } from '~/modules/prequal/data/portal';
import { companyById, requestById } from '~/modules/prequal/data';
import { SECTION } from '~/modules/prequal/status';
import { portalFieldTypes, sectionSchema, sectionValues } from '~/modules/prequal/portalFields';
import { currentRoute } from '~/modules/prequal/router';

const FORM_SECTIONS = sections.filter((s) => s.id !== 'documents' && s.id !== 'review');

export default {
  name: 'PrequalPortal',
  prototype: {
    title: 'Prequalification › Subcontractor portal',
    figma: '',
  },
  components: { TopNavBar, AppLayout, FormV2, SelectV2, Button, PortalSectionNav, PortalOverview, PortalDocuments, PortalReview, LinarcLogoDark },
  data() {
    const route = currentRoute();
    const known = ['overview', ...sections.map((s) => s.id)];
    return {
      request: portalRequest,
      companyName: companyById[requestById[portalRequest.requestId].company].name,
      sections,
      documents,
      pillars,
      portalFieldTypes,
      schemas: Object.fromEntries(FORM_SECTIONS.map((s) => [s.id, sectionSchema(s)])),
      values: Object.fromEntries(FORM_SECTIONS.map((s) => [s.id, sectionValues(s)])),
      current: route.id && known.includes(route.id) ? route.id : 'overview',
      consent: true,
      submitted: false,
      savedAt: new Date('2026-10-08T14:12:00'),
      isNarrow: false,
      ready: readiness(),
      completion: completion(),
    };
  },
  computed: {
    order() {
      return ['overview', ...pillars.flatMap((p) => p.sections)];
    },
    navGroups() {
      const byId = Object.fromEntries(sections.map((s) => [s.id, s]));
      return [
        { id: 'start', label: '', items: [{ id: 'overview', label: 'Overview' }] },
        ...pillars.map((p) => ({ id: p.id, label: p.label, items: p.sections.map((id) => ({ id, label: byId[id].label, state: id === 'review' ? undefined : byId[id].state })) })),
      ];
    },
    flatOptions() {
      return this.navGroups.flatMap((g) => g.items.map((i) => ({ value: i.id, label: g.label ? `${g.label} › ${i.label}` : i.label })));
    },
    currentSection() {
      return sections.find((s) => s.id === this.current) || null;
    },
    currentTitle() {
      return this.current === 'overview' ? 'Overview' : this.currentSection.label;
    },
    currentState() {
      if (!this.currentSection || this.current === 'review') return null;
      return SECTION[this.currentSection.state] || null;
    },
    prevId() {
      const i = this.order.indexOf(this.current);
      return i > 0 ? this.order[i - 1] : null;
    },
    nextId() {
      const i = this.order.indexOf(this.current);
      return i >= 0 && i < this.order.length - 1 ? this.order[i + 1] : null;
    },
    firstIncomplete() {
      return this.order.find((id) => id !== 'overview' && id !== 'review' && id !== 'documents' && !['complete', 'submitted'].includes(sections.find((s) => s.id === id).state)) || 'documents';
    },
    saveText() {
      return `Saved ${this.$moment(this.savedAt).fromNow()}`;
    },
  },
  mounted() {
    this.mq = window.matchMedia('(max-width: 767px)');
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
      window.history.replaceState(null, '', `#${encodeURIComponent(id)}`);
      const body = this.$el.querySelector('.lnrc-app-layout__content-body');
      if (body) body.scrollTop = 0;
    },
    onSave() {
      this.savedAt = new Date();
    },
    submit() {
      if (!this.ready.canSubmit) return;
      this.submitted = true;
      this.goTo('review');
    },
  },
};
</script>
