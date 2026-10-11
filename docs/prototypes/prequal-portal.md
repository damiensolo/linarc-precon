# Prequalification › Subcontractor portal (`prequal-portal`)

- **Date:** 2026-10-09
- **Source:** `docs/prequal/sub-portal-data.md` (fields, documents, submission rules), `docs/prequal/screens.md` §3 and §4
- **Figma:** app map Level 3 · 27 Overview [3793:4665](https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3793-4665) · 28 Insurance `3794:5002` · 29 Documents `3794:5301` · 30 Review & submit `3793:5026` · document-slot states 29a–29f
- **URL:** `/?p=prequal-portal` (`#<section id>` opens a section: `#safety`, `#documents`, `#review`; `&chrome=0` full-window)
- **Status:** verified; restyled for visual hierarchy 2026-10-09 (see below); in the Figma app map (Level 3, 2026-10-10)

## Scope
- **Persona:** the invited subcontractor (no Linarc account). Request shown: Northstar Fire Protection for Harbor Point Clinic, Healthcare Specialty v1, 67% complete.
- **Decision this screen supports:** "what do I still have to do, and will it go through?" The Overview lists everything outstanding; Review & submit sorts it into blocks / flagged / pending (Q7: failures flag, don't block).
- **Shell (revised 2026-10-09 at the user's direction):** the Linarc **TopNavBar as a reduced Company variant**: the module cell is the Linarc logomark (`module.custom` + `#custom_module` with `LinarcLogoDark` at 48px in the 82×72 cell, as Figma's `Module Icon / Logo Swap, Type=Logo`), no tools, no Bookmarks / Create, no project context, account rail with help / notifications / profile only (the subcontractor contact as the user). **No side rail.** `AppLayout` title bar carries the request ("Prequalification for Harbor Point Clinic · requested by Harborview Construction Group"), "67% complete · Saved …" and Submit; the section nav sits in the left panel; the section title and its completion state head the content; Previous / Save and exit / Next sit in the `AppLayout` **bottom panel** (64px, not resizable, edge-to-edge) so they stay on screen under the content column however long the form is (user direction 2026-10-09). Under 768px the left panel hides and a SelectV2 picks the section. **Figma:** `Top Nav Bar Module=Company` with the tool cells, Bookmarks / Create and the context dropdown hidden; a `Module=External` (or `Company` with a "Show tools" boolean) is the cleaner long-term form, flagged for design (see Gaps).
- **Data:** `src/modules/prequal/data/portal.js` (`portalRequest`, `pillars`, `sections`, `documents`, `readiness()`, `completion()`); labels and tones from `status.js`.

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured |
| Time to verified done | not measured |
| Components used (library / candidate / library fixes) | 9 library (AppLayout, FormV2 + its text/number/select/multiselect/radio fields, SelectV2, DropArea, StatusChip, ProgressBar, Checkbox, Button; StatusIndicator dropped in the restyle) / 5 candidates / 4 library changes (P-018, P-019, P-020, P-021) |
| Gaps found | 5 candidates; 1 closed as existing (threshold hint = FormV2 `help`); 4 sandbox setup gaps (F-036); 1 Figma mismatch found by eye (DropArea glyph, P-020 / F-037) |
| Verification rounds before passing | 3 (two build failures from library imports, then the dark-mode fix), plus 1 design-review round (restyle, F-038) |
| Computed-value checks (pass/total) | not run (no new interactive sizing; FormV2 and DropArea are library components) |

## Component map
| Element | Handling |
|---|---|
| Top nav (Company variant reduced: Linarc logomark, help, notifications, profile) | existing: TopNavBar with `module.custom` + `#custom_module` (`LinarcLogoDark` from `@development/linarc-icons`), `tools.items: []`, `context.enabled: false`, `account.show` subset |
| Title bar (GC tile, request, "n% complete · Saved", Submit) | existing: AppLayout `#header` / `#header-actions`, Button |
| Section nav (4 pillars + Submit group, states) | **candidate** `PortalSectionNav` (check mark = complete, warning text = needs attention, muted text otherwise) |
| Section forms (11 sections) | existing: **FormV2** (`flat`, P-021) from schemas built by `portalFields.js` (`sectionSchema`, `sectionValues`); built-in text / number / select / radio fields; multiselect = SelectV2 `multiple` with Tag instances (Figma Select Menu `Type=Tags`, P-023 / P-024) over placeholder option lists (CSI trades, regions, sectors) with the selected values merged in; `help` carries the threshold ("Requirement: ≤ 1.00") |
| Previous / Save and exit / Next | existing: AppLayout `#bottom-panel` (fixed, 64px) + Button, label only |
| Outstanding-item lists (Overview, Review & submit) | page component `components/PortalItemList.vue`: heading with count, hairline rows, "Open" text button; no per-row box or dot |
| Repeating records, grids | **candidate** `repeat` / `matrix` FormV2 field types (`FormTableFields`) registered through `fieldTypes` |
| Computed value (working capital) | small custom `computed` field type in `portalFields.js` (prototype-local; too small to be a candidate) |
| Declared-vs-document mismatch | **candidate** `InlineNotice` as a `notice` field type directly under the field |
| Evidence under a field; Documents list | **candidate** `DocumentSlot` as a `document` field type (compact: whitespace only) and as the Documents section (full: hairline rows); composes library DropArea (browse button without its Plus icon) + StatusChip (only when action is needed) + Button (text variant) |
| Overview, Review & submit | page components in `src/prototypes/prequal-portal/components/`; PortalItemList, InlineNotice, Checkbox, Button |
| Narrow-screen section picker | existing: SelectV2 |

Five candidates against three on the dashboard: expected for a new shell and persona (external form), and all five are reusable by screens 2 and 5. Say so if the wizard needs more than two.

## Gaps and how they were handled
| Gap | Handling | Log ID |
|---|---|---|
| InputV2 / SelectV2 / FormV2 need the Vuelidate plugin; the sandbox didn't install it | sandbox: `Vue.use(Vuelidate)` in `src/main.js` | F-036 |
| `@/components/TextEditorV2` is a directory with only `index.vue`; Vite had no `.vue` in `resolve.extensions` | sandbox: `extensions` with `.vue` in `vite.config.mjs` | F-036 |
| TextEditorV2 imports `Icon` by a root-absolute path (`/src/components/Icon.vue`) | library fix in place (alias import); 20 more root-absolute imports remain in legacy components, listed in the log row | P-018 |
| A dependency of the editor's colour picker imports CommonJS `clamp` as a default export; served raw in dev | sandbox: ESM shim `src/shims/clamp.js` aliased for `clamp` | F-036 |
| FormV2 and its fields style themselves with the V1 palette (`theme('colors.baseDark')` …): unreadable in dark mode | library fix in place: 76 references in 10 files → V3.2 token variables, by property role | P-019 |
| Edge still won't launch for screenshots | Chrome via `EDGE_PATH` | F-035 |
| Figma Top Nav Bar `Module=Company` always shows the Company tools, Bookmarks / Create and the project context; the external user needs them hidden | code configures the existing component; the Figma reference hides those cells on a Company instance; a `Show tools` boolean or `Module=External` variant flagged for design | needs-figma |
| DropArea glyph rendered at 56px with a 4.7px stroke in slate; Figma draws it at 36px, 2px stroke, `border/default` | library fix in place (size, `absolute-stroke-width`, colour); the `sm` variant's browse button size (Figma `lg`, code `medium`) flagged, not changed | P-020 |
| FormSection always draws a card, so the form sat as a box inside the content area | library: additive `flat` prop on FormV2 → FormSection | P-021 |

## Visual hierarchy (restyle 2026-10-09)
Review requested by the user after the first build: too many containers, borders and strokes; colour and icons on everything; status shown as dot + coloured text + chip. References studied on Mobbin (web): **Linear** settings and forms, **Mercury** onboarding (6-step company application with document upload), **Airwallex** verification (grouped step list with check marks), **Remote** and **ElevenLabs** multi-step forms, **Revolut Business** receipts upload. What they do, in the order it mattered here:

1. **One container level.** Linear groups related rows in a single hairline card and never nests a card inside it; sections are separated by whitespace and a heading, not by boxes. The portal had a FormV2 card containing DocumentSlot cards containing tinted file rows: three levels.
2. **Hairlines, not boxes.** Lists are rows divided by 1px `border/subtle`; the list has no outline of its own. Section breaks are a hairline above the next heading.
3. **Colour means "act here".** The primary button and the states that need action are the only colour on the page. Done states are a check mark; neutral states are muted words. Linear's settings pages have exactly one accent (the primary toggle / button) and grey everything else.
4. **One signal per status.** A row shows a check *or* a word *or* a chip, never two of them in the same colour.
5. **Icons only where they carry meaning the label doesn't.** Buttons are label-only (Mercury, Airwallex, Linear); a file icon marks a file row; the warning/error notice keeps its icon because the fill alone is not accessible.
6. **Type does the hierarchy:** page title › section heading › row title › muted secondary line, two greys only (`text/default`, `text/subtle`, with `text/soft` for metadata).
7. **The way forward is always visible:** a fixed footer (Mercury, ElevenLabs, Remote) rather than buttons at the end of a long scroll.

Applied: PortalSectionNav (dots removed; check / warning word / muted word), DocumentSlot (card removed; hairline rows in the list, a left rule under a field; chip only for action needed; message coloured only for error / warning; text-variant buttons), InlineNotice (warning / error = tinted fill + icon, no outline; info / success = plain text block), PortalItemList (replaces boxed rows with dots on Overview and Review), PortalDocuments (counts as a sentence, red only on "action needed"), section header state as text, FormV2 `flat`, AppLayout bottom panel footer, all `+` and Submit / chevron icons removed from buttons (dashboard and Requests "New request", RepeatField "Add", portal Submit / Submit application / Previous / Next / Continue). These rules are recorded as D-17 and apply to the next screens. Later the same day: `space-16` added above the section title (36px below the title-bar rule instead of 20) and above the section nav so the two columns start level; the user found the title too close to the rule.

Not changed, for design to decide: whether Previous / Next get their chevrons back; whether the nav group labels should be uppercase (Figma side-nav groups are); the DropArea `sm` browse-button size (see P-020).

## Verification
- `yarn build` passes. `yarn shot prequal-portal … 5173` (Chrome) exits 0 at 1440 / 1024 / 390 in light and dark: no console errors, no overflow.
- Section captures by hash (puppeteer, temporary script): Safety (matrix, mismatch notice, EMR slot under it, OSHA 300A slot), Documents (17 required: 9 accepted · 3 in review · 3 action needed · 2 missing; grouped slots), Review & submit (8 blocking, 3 flagged, 3 pending; Submit disabled with the reason), Experience in dark (tables, Add buttons, radio), Capacity empty at 1024, Safety at 390 (section select, stacked slot). All without page errors after P-019.
- Dark mode before P-019: FormV2 table cells, radio labels and Add buttons were nearly invisible (V1 palette); after: tokens.
- Not exercised: actual uploads (DropArea is static), row editing in repeat/matrix, FormV2 validation on Capacity (required rules show after touch).
- Scope interaction (2026-10-09, puppeteer, temporary script): open the menu (14 options, `aria-multiselectable`), add two values, re-click one (no duplicate), click outside (closes), remove a tag by its close control: tags update each time, no console errors.
- Scope and table subsections (2026-10-09, later the same day): `yarn build` passes; Scope at 1440 and 390 in both themes, Experience and References at 1440, Company at 1440, the Overview at 1440 / 1024 / 390, all exit 0 with no overflow.
- Restyle (2026-10-09): `yarn build` passes; `yarn shot prequal-portal#documents|#safety|#review` and the Overview at 1440 (light + dark), Overview and Safety at 390, exit 0 with no overflow. Before / after pairs in the scratchpad (`before/`, `after1/`); the bottom panel stays fixed at 390 with the three buttons on one row.

## Figma reference
Not pushed yet. The screen is a new shell (no Linarc nav) built mostly from candidates, so the Figma version would be largely plain frames plus Drop Area / Status Chip / Progress Bar instances; proposed to push after design has looked at the prototype (see the report of 2026-10-09).

## Design-system deviations (audit 2026-10-09)
Asked by the user after the restyle: are the portal's components and tokens the system's, and what needs adding? Checked: every class in `src/candidates`, `src/prototypes/prequal-portal` and `src/modules/prequal` (no hex, no primitive palette, no raw or arbitrary values; the only non-token classes are the resets `m-0` / `p-0` and the layout guards `min-w-0` / `min-h-0`), the library components the portal renders, and the Figma components behind them.

| Where | Deviation | Suggested action |
|---|---|---|
| FormV2 `multiselect` field (`SelectField.vue`), used on Scope and Company | A hand-rolled trigger + chips + menu inside the library: rem sizes (2rem trigger vs the 40px Input, 0.375rem radius, 9999px pill chips at 0.75rem, typed `×`), V1 `Icon` with palette colours, placeholder in `text/on-surface/default-inverse`, menu shadow coloured with `--text-soft`. No Figma counterpart; SelectV2's `isMultiselect` is visual only | **Figma: done** 2026-10-09 as Select Menu `Type=Tags` with four exposed Tag instances and `Show Tag 1–4` (P-023). **Code: done** as SelectV2 `multiple` (Tag instances in the trigger, P-024); FormV2 `multiselect` renders it, the hand-rolled chip UI is gone. Spec: [MultiSelect.md](../components/MultiSelect.md); F-039 |
| FormV2 field chrome (`FieldRenderer.vue`, `FormSection.vue`, `RadioField.vue`) | Label 13px / 600, help and error 12px, section title 15px / 700, gaps 6px and 2px, all literal rem. the system's field label style is `label/sm/medium` (14px) and help `body/xs/regular` (12px), as read from Drop Area's label; 13px and 15px have no font-size token | P-row: FormV2 typography and spacing to tokens (`--font-size-14` / `--line-height-20` / `--font-weight-medium` for labels, `--font-size-12` for help, `--space-4/8/12` for gaps). No new token needed |
| FormV2 `FileField` | V1 `Icon` (`attach`, `close`) with palette colours | Not rendered by the portal (DocumentSlot wraps DropArea). P-row with the one above, or replace by DropArea |
| DropArea browse button | Figma: Primary Outline, `lg` in both sizes; code was Primary Solid, `medium` in `small` | Variant fixed to outline (P-020, second pass). Size left as code and flagged: a 40px button inside the `sm` zone looks wrong next to Figma's own `sm` Input (36px); design to confirm |
| DropArea state glyph | 56 / 64px, scaled stroke, slate | Fixed to Figma (P-020) |
| Candidate `FormTableFields` tables | Hand-built `<table>` with hairline rows and uppercase 12px headers | Intentional (candidate; DataGrid is far too heavy for 3-row matrices), but the header style should be taken from Figma Data Table / Cell header text style at promotion |
| Candidate `PortalSectionNav` group label | 12px regular `text/soft`, sentence case; Figma side-nav section labels are uppercase | Design to choose; one-line change either way |
| Section state next to the page title | Plain text instead of Status Chip | Deliberate (D-17); the chip stays available via `toneToChipStatus` if design prefers it |

Everything else on the page is a library component rendered with its Figma props (TopNavBar, AppLayout incl. bottom panel, Button, SelectV2 single, InputV2 via FormV2 text / number fields, Radio via FormV2 radio, StatusChip, ProgressBar, Checkbox, DropArea) or a documented candidate using tokens only.

## Findings
F-036 (sandbox setup gaps surfaced by FormV2), F-037 (DropArea glyph: a Figma mismatch the audit didn't catch), F-038 (the restyle: container nesting from composing candidates inside library cards), plus P-018 to P-021 in the library log.

## Screenshots
Scratchpad only; copy the Safety 1440 light pair (before / after P-019) to `docs/case-study/assets/` at the next milestone: they show the dark-mode class of bug the audit rules catch.

## Update 2026-10-10: first Figma reference (app map Level 3)
Built in the Documentation › **Prequalifications** app map (page `3766:33584`), section `3792:5020`, light mode, from library instances: Top Nav Bar `Module=Company` (logomark; Top Nav Modules, project selector, announcements, messages and chat hidden, leaving help · notifications · profile), a request title bar (GC tile, title, progress, disabled Submit), the section nav as a `[candidate] PortalSectionNav` frame, Input Field / Progress Bar / Checkbox / Button / Status Chip / Drop Area instances, and document slots as `[candidate] DocumentSlot` frames. Frames: 27 Overview `3793:4665` (full length), 28 Insurance `3794:5002` (viewport; evidence slot under each field, mismatch notice), 29 Documents `3794:5301` (viewport), 30 Review & submit `3793:5026` (full length), slot states 29a rejected `3794:5506`, 29b processing `3794:5544`, 29c needs review `3794:5574`, 29d accepted with extracted details `3794:5602`, 29e partly uploaded `3794:5653`, 29f missing `3794:5689`. Known gap: the Progress Bar component only has 0/25/50/75/100% variants and its track ignores a resize, so 27 shows 75% fill with the label "67%".
