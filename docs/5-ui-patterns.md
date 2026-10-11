# UI patterns and visual rules

**Read this before building or changing any screen.** These are decisions the user has made in review, not defaults to re-derive. Each rule points at its decision (`4-decisions.md`) or finding (`findings-log.md`). If a screen seems to need something that breaks a rule here, stop and ask; don't quietly diverge.

Last updated 2026-10-10. Applies to every Prequalification screen and, unless a rule says otherwise, to any module.

## 1. Page patterns: which container for which task (D-18)

| Task | Pattern | Library parts | Example |
|---|---|---|---|
| **Create something** (a request, a document, a record), any multi-field or multi-step flow | **Full-page create screen**, never a modal | Module nav stays (TopNavBar + side rail, via `PrequalShell`). **Title Bar / Workflow** (`Status=Create`) as the page header: back arrow (returns to where the user came from), title, document ID chip; right side empty or a "Draft saved" note. Form in a **centred column** (width rule in §2). Step navigation in a **fixed bottom panel** (AppLayout bottom panel, 64px) whose buttons align to the same centred column | `prequal-wizard`; the app's RFI Create screen (Documentation file, *RFI- Details*) |
| **Multi-step create** | As above, with **ProgressStepper** (library, Figma Stepper Component + Step Trail) at the top of the column; `navigable` so completed steps can be revisited; `labels="active"` under 640px | `componentsV2/ProgressStepper` (P-025) | `prequal-wizard` |
| **List / dashboard** | Full page, **Title Bar / Page** (title + primary action) | `PrequalShell` default header | `prequal-dashboard` |
| **External user, long application** (no Linarc account) | Reduced Linarc top nav (Company variant, logomark), **no side rail**, section nav in the left panel, fixed bottom panel for Previous / Save and exit / Next | AppLayout left + bottom panels | `prequal-portal` |
| **Review / detail of one record with a decision** | Full page, **Title Bar / Workflow** header (back · name · ID chip · `Status:` chip); content left; **decision or activity in AppLayout's right panel** (sticky, own scroll; as the RFI screen's activity log); below 1024px the panel moves inline under the summary | TabNavigation (P-028) for sections; `PrequalShell` `right-panel` | `prequal-review` |
| **Detail of one record without a decision** (e.g. a Qualification Record) | Same frame as review: Title Bar / Workflow header; record on the left; **activity / audit trail in the right panel**; inline at the end below 1024px. Record-level actions in the title bar's right side | `PrequalShell` `right-panel` | `prequal-record` |
| **Supporting detail for one item on a page that has a right panel** (e.g. evidence for a finding) | Opens **in the right panel**, replacing its content, with a back arrow. The library has no drawer; don't invent one (open question for design) | — | `prequal-review` evidence view |
| **Modal (ModalV2)** | Only for short, single-step tasks that don't need page context to be lost or kept: confirmations, a few fields, a choice. **Not for create flows.** | ModalV2 | `prequal-record` Request renewal (pick documents + message) |

- Alternatives the user wants to compare are kept as a **second prototype slug**, `<slug>-<variant>` (picker title "… (version B: …)"), sharing state and step components with the default so only the pattern differs. Example: `prequal-wizard-modal` (the modal version of New request), sharing `src/prototypes/prequal-wizard/wizardState.js` and `components/`.
- The default slug is always the chosen pattern; links from other screens (`router.js`) go to the default.

## 2. Layout and white space (D-17, D-18)

- **Form and reading content sit in a centred column** on create screens. Don't leave a left-aligned column with empty space on the right unless a right panel fills it.
- **Column width (D-20):** `max-w-4xl` (**56rem / 896px**) for wide forms, meaning two-column field pairs, tables, checklists or summaries (the New request wizard). `max-w-3xl` (48rem / 768px) or narrower for short single-column forms. Basis: ~720px is the common standard maximum for forms, and wider is accepted when a form carries tabular data ([Pega form design](https://docs.pega.com/ui-kit-design-documentation/form-design)). Two columns from about six fields, 24px gutter, one column below 768px. Long help text and paragraphs stay short, because body text reads best at 50–75 characters per line ([Baymard](https://baymard.com/blog/line-length-readability)); if a paragraph runs past two lines at 56rem, shorten it rather than narrowing the form.
- **A fixed footer's buttons align to the content column** (Back / Cancel at the column's left edge, primary action at its right edge); the bar itself spans the content area with its top rule.
- **Whitespace separates sections, not lines or boxes.** Section breaks: a heading plus space (`gap-space-24` to `gap-space-40`); no left rules or indent lines to mark a subsection (removed from DocumentSlot at the user's request).
- **Page / section title needs room below the title-bar rule:** content starts with `pt-space-16` on top of AppLayout's own padding (portal: 36px from the rule).
- **Subsections inside a form get their own 16px bold heading** (repeat / matrix tables use `props.title`), with ~40px between subsections; the 13px form label is not used for a subsection.
- Responsive from 390 to 1440+: rows that pair text with a chip and an action wrap so the text takes the full width on phones (`w-full sm:w-auto sm:flex-1`).

- **Scroll areas (F-051, P-030):** one scrollbar style everywhere, from the global styles (Figma Scrollbar: thin rounded thumb, no track, no arrows); never style one locally. **Padding goes inside the scrolling element** so the bar sits at the panel's edge and content ends at least 16px (normally 20px) before it: AppLayout does this for `scrollable-content`; a custom scroller (`overflow-y-auto`) gets its own `p-space-20`. No content flush with a scrollbar, no nested vertical scroll areas, and horizontal scrolling only inside data grids. Number columns end with the row's own padding, never at the bar.
- **Data tables (DataGrid):** size each column to its widest real content plus the cell padding (measure, don't guess); the name column is `frozen` (pinned left) and the row action is a `type: 'Actions'`, `frozen: true` column (pinned right), so the action stays visible when a wide table scrolls sideways. Don't repeat in one cell what another column already says (e.g. Expiration doesn't restate "No longer active").

## 3. Containers, lines, colour, icons (D-17)

- **One container level per view.** Lists are rows divided by 1px `border-border-subtle` hairlines; the list has no outline of its own. Never a card inside a card. Use FormV2 `flat` (P-021) when the form is the page.
- **Colour means "act here".** Only the primary button and states that need action are coloured. Done = a check mark or a muted word; neutral states = muted words. Red only for knockout / expired / rejected.
- **One signal per status:** a check *or* a word *or* a chip, never two together.
- **Buttons are label-only.** No `+` on Add / New, no Send icon on Submit, no chevrons on Previous / Next / Continue. An icon only where it carries meaning the label lacks (icon-only buttons, the title bar back arrow, a file glyph on a file row).
- **Notices:** warning / error = tinted fill + tone icon, no outline (InlineNotice); info / success = plain text block.

## 4. Components to use (instead of hand-built versions)

| Need | Use | Not |
|---|---|---|
| Multi-value select (trades, regions, sectors) | **SelectV2 `multiple`** (P-024) = Figma Select Menu `Type=Tags` (P-023); FormV2 `multiselect` renders it | FormV2's old hand-rolled chip select (removed, F-039) |
| Step progress | **ProgressStepper** (P-025) | custom dots / numbered lists |
| Create-screen header | Title Bar / Workflow pattern through `PrequalShell` `#header` | Title Bar / Page with a back button added by hand |
| Back button in a title bar (detail and create screens) | **HeaderToolIcon `type="back"`** + `PrequalShell header-size="comfortable"` (Title Bar / Workflow `Size=Comfortable`, D-25, P-038) | a minimal Button with a chevron (doesn't read as a button) |
| Step navigation bar | AppLayout bottom panel (`PrequalShell` `bottom-panel`) | buttons at the end of a long scroll |
| Page sections as tabs | **TabNavigation** (P-028) | SegmentedControl (that's for view modes) |
| A value compared across sources | **EvidenceComparison** (candidate) | ad-hoc tables |
| A right panel from `PrequalShell` | `right-panel` prop (sets enabled **and** visible, F-046) | AppLayout `right-panel-enabled` alone (stays hidden) |
| Upload zone | library DropArea (icon 36px, 2px stroke, `border/default`, outline browse button, P-020) | — |
| Moving between screens | `router.go(screen, id)` / `href()` (in-document, D-24) | `location.assign`, `<a href>` page loads |
| Data that loads (first load, refresh, failure) | **LoadRegion** + **LoadStatus** + `createLoad()` (candidates, §6); DataGrid `loading` (P-034) for tables; **Skeleton** for other layouts | a full-screen spinner, an empty state shown while loading, a hand-made pulse |

## 5. Open design flags (don't "fix" in code without a decision)

- Figma Number Badge `Status=Disabled` loses its number in Dark mode; code renders it readably (needs-figma). (Chip `Style=Solid` had the same problem; fixed in Figma 2026-10-09, P-029 / F-050, visible in other files once the library is published.)
- Figma Modal has no wide size; Title Bar / Workflow has no module-neutral Create variant (needs-figma).
- No content-width token: the form columns use Tailwind `max-w-4xl` / `max-w-3xl` (needs-token: `layout/form-wide`, `layout/form`).
- ProgressStepper active label is bold in code, Regular in Figma (P-025, for design).
- No motion tokens (duration, easing) exist in Figma or `tokens.css`; the loading timings in §6 are CSS custom properties and JS constants until they do (needs-token).

## 6. Navigation, loading and transitions (D-24)

The goal is an interface that answers every action at once and makes waiting calm, without pretending work is done. These rules apply to every screen and module; the parts are reusable (§4).

### Never blank the app

- **Moving between screens never reloads the page.** `router.go()` pushes the URL and swaps only the screen; the top nav and rail stay where they are, Back / Forward work (`popstate`). A full reload blanks everything, white even in Dark mode, until the scripts and CSS load again (F-057).
- **Keep what's valid on screen.** The shell, the title bar, the page heading, filters and table headers don't depend on the data, so they render at once. Only the region whose data is pending changes.
- **Never a full-screen or page-blocking spinner.** Loading is shown inside the region that is loading (a `LoadRegion`), never over the whole page.

### Timing

| When | What shows | Value (configurable) |
|---|---|---|
| Answer in under 200ms | **Nothing.** The result replaces the old view directly; no loader flash | `LOAD_TIMING.indicatorDelayMs` = 200 |
| After 200ms, nothing on screen yet (first load) | **Skeleton** in the final layout (headings, labels and value rows in place); the grid header stays real | same |
| After 200ms, content already on screen (refresh, filter, sort) | **Keep the content**; a small inline indicator ("Updating…") in the page's meta line | same |
| After 5s | Add **"Still loading…"** and a **Cancel** (no stage names, no percentages, no time remaining) | `LOAD_TIMING.slowAfterMs` = 5000 |
| Result arrives | Show it **immediately**. If a skeleton was seen, fade it in once (opacity only) | `--load-reveal-ms` = 160ms |
| Skeleton animation | One soft highlight sweeping left to right, all skeletons in phase | `--skeleton-shimmer-ms` = 1600ms |

- **No artificial waiting.** Never hold a result to finish a shimmer cycle or meet a minimum display time.
- **The 200ms grace period also reserves space.** The skeleton (or the content component's own placeholder mode) is rendered invisible from the first frame, so when it appears nothing moves, and when content replaces it nothing jumps.
- **Navigation itself is not a request.** A screen swap takes 46–83ms in the dev build (measured 2026-10-10), so it shows no loader; the new screen and its selected rail item are the acknowledgement.

### Acknowledge, and never double-submit

- The control the user touched changes **at once**: the segmented filter selects, the rail item highlights, a submit button is disabled (`is-disabled` while `load.status === 'loading'`) before the request starts, so a second click does nothing. (Figma's Button has `Type=Spinner-*` busy types; code doesn't yet, P-036.)
- **Latest request wins.** A new request (another filter, a retry) supersedes the running one; the old answer is ignored when it arrives, never applied (`createLoad` does this). An indicator already showing stays on across superseding requests (no off-and-on flicker).

### Honest states, always ending

- Unknown progress = **indeterminate** indicator (StatusIndicator `type="spinner"`). Use a percentage only when the backend reports real progress.
- Don't show results that aren't results: no "0 requests" or empty state while loading, no "Saved" or success message before the server confirms.
- Every load ends in **ready, error or cancelled**; timers are cleared and pending answers dropped when the screen is left (`load.destroy()` in `beforeDestroy`).
- **Failure with nothing on screen:** an error notice in the region ("Couldn't load the review queue.") with **Retry**; the table frame stays. **Failure on refresh:** keep the content, and show "Couldn't update." with Retry in the meta line. **Cancel:** with content, back to it; without content, "Loading stopped." with Retry.

### Accessibility

- The loading region has `aria-busy="true"` while its request runs.
- One polite live region per loading region announces **meaningful changes only**: "Loading review queue…" (only once the indicator shows), "Still loading…", "Review queue loaded" (only if the start was announced). Never per animation cycle. Errors use `role="alert"`.
- Skeletons are `aria-hidden`.
- **`prefers-reduced-motion: reduce`:** skeletons are static (no shimmer), content appears without the fade. (The library spinner still rotates; flagged.)

### Tokens and Figma

- Placeholder fill **`surface/skeleton`** (Light gray/100, Dark gray/800), shimmer band **`surface/skeleton-highlight`** (gray/50, gray/700); Tailwind `bg-surface-skeleton`. Never `surface/neutral` for a placeholder: in Dark it equals the table row (P-035).
- Figma: **Skeleton**, **Load Status** and **Load Region** are candidate components on the design system's `_Candidates` page (40024347:89, :169, :224); tables use Data Table / Sheet Cell `Type=Skeleton Loader`. Draw screens' loading states from these instances.
- Submit buttons: Figma's Button has `Type=Spinner-*` busy types; code has no busy state yet (P-036), so code disables the button while sending.

### How to build it

```js
// data():
load: createLoad({ label: 'review queue' }),   // ~/candidates/LoadRegion/createLoad.js
// created(): this.fetch();   beforeDestroy(): this.load.destroy();
fetch() {
  this.load.run(
    (signal) => api.getQueue({ filter: this.filter }, { signal }),   // prototypes: mockRequest(() => data, { signal })
    (result) => { this.rows = result.rows; },                        // applied before the state turns ready
  );
},
```

```vue
<LoadStatus :load="load" @retry="fetch">{{ summary }}</LoadStatus>     <!-- in the page's meta line -->
<LoadRegion v-slot="{ skeleton }" :load="load" content-loads @retry="fetch">
  <DataGrid :data="rows" :loading="skeleton" … />                      <!-- tables: DataGrid's own skeleton rows -->
</LoadRegion>
<!-- Other layouts: <LoadRegion :load="load"> <template #default>content</template> <template #skeleton> <Skeleton … /> rows </template> -->
<!-- A second region of the same load (right panel, nav): <LoadRegion secondary :load="load"> -->
```

```js
// A write: same controller, action wording; the button disables while load.status === 'loading'
save: createLoad({ label: 'changes', action: { busy: 'Saving', done: 'Saved', error: "Couldn't save." } }),
```

```vue
<LoadStatus :load="save" @retry="onSave">Saved {{ savedAgo }}</LoadStatus>   <!-- "Saving…" after 200ms; error + Retry; announces "Changes saved" -->
<LoadStatus :load="send" variant="notice" @retry="send" />                    <!-- form-level failure as an InlineNotice -->
```

- Put LoadRegion content in `<template #default>`: plain slot children are evaluated by the page at once and throw while the data is still null.
- KPI cards: `<KpiCard loading>` (value and hint become skeletons; the label stays).

- **Reviewing loading states:** prototype data is static and answers instantly. The sandbox header's **Latency** select (or `?latency=fast|medium|slow|fail|fail-once`) delays or fails the mock request (`src/modules/mock/request.js`). Reference implementation: `prequal-queue`.

