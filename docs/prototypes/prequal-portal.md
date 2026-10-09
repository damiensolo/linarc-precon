# Prequalification › Subcontractor portal (`prequal-portal`)

- **Date:** 2026-10-09
- **Source:** `docs/prequal/sub-portal-data.md` (fields, documents, submission rules), `docs/prequal/screens.md` §3 and §4
- **Figma:** not yet pushed (see "Figma reference")
- **URL:** `/?p=prequal-portal` (`#<section id>` opens a section: `#safety`, `#documents`, `#review`; `&chrome=0` full-window)
- **Status:** verified; Figma reference pending

## Scope
- **Persona:** the invited subcontractor (no Linarc account). Request shown: Northstar Fire Protection for Harbor Point Clinic, Healthcare Specialty v1, 67% complete.
- **Decision this screen supports:** "what do I still have to do, and will it go through?" The Overview lists everything outstanding; Review & submit sorts it into blocks / flagged / pending (Q7: failures flag, don't block).
- **Shell (revised 2026-10-09 at the user's direction):** the Linarc **TopNavBar as a reduced Company variant**: the module cell is the Linarc logomark (`module.custom` + `#custom_module` with `LinarcLogoDark` at 48px in the 82×72 cell, as Figma's `Module Icon / Logo Swap, Type=Logo`), no tools, no Bookmarks / Create, no project context, account rail with help / notifications / profile only (the subcontractor contact as the user). **No side rail.** `AppLayout` title bar carries the request ("Prequalification for Harbor Point Clinic · requested by Harborview Construction Group"), "67% complete · Saved …" and Submit; the section nav sits in the left panel; the section title and its completion chip head the content; Previous / Save and exit / Next footer. Under 768px the left panel hides and a SelectV2 picks the section. **Figma:** `Top Nav Bar Module=Company` with the tool cells, Bookmarks / Create and the context dropdown hidden; a `Module=External` (or `Company` with a "Show tools" boolean) is the cleaner long-term form, flagged for design (see Gaps).
- **Data:** `src/modules/prequal/data/portal.js` (`portalRequest`, `pillars`, `sections`, `documents`, `readiness()`, `completion()`); labels and tones from `status.js`.

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured |
| Time to verified done | not measured |
| Components used (library / candidate / library fixes) | 10 library (AppLayout, FormV2 + its text/number/select/multiselect/radio fields, SelectV2, DropArea, StatusChip, StatusIndicator, ProgressBar, Checkbox, Button) / 5 candidates / 2 library fixes (P-018, P-019) |
| Gaps found | 5 candidates; 1 closed as existing (threshold hint = FormV2 `help`); 4 sandbox setup gaps (F-036) |
| Verification rounds before passing | 3 (two build failures from library imports, then the dark-mode fix) |
| Computed-value checks (pass/total) | not run (no new interactive sizing; FormV2 and DropArea are library components) |

## Component map
| Element | Handling |
|---|---|
| Top nav (Company variant reduced: Linarc logomark, help, notifications, profile) | existing: TopNavBar with `module.custom` + `#custom_module` (`LinarcLogoDark` from `@development/linarc-icons`), `tools.items: []`, `context.enabled: false`, `account.show` subset |
| Title bar (GC tile, request, "n% complete · Saved", Submit) | existing: AppLayout `#header` / `#header-actions`, Button |
| Section nav (4 pillars + Submit group, states) | **candidate** `PortalSectionNav` |
| Section forms (11 sections) | existing: **FormV2** from schemas built by `portalFields.js` (`sectionSchema`, `sectionValues`); built-in text / number / select / multiselect / radio fields; `help` carries the threshold ("Requirement: ≤ 1.00") |
| Repeating records, grids | **candidate** `repeat` / `matrix` FormV2 field types (`FormTableFields`) registered through `fieldTypes` |
| Computed value (working capital) | small custom `computed` field type in `portalFields.js` (prototype-local; too small to be a candidate) |
| Declared-vs-document mismatch | **candidate** `InlineNotice` as a `notice` field type directly under the field |
| Evidence under a field; Documents list | **candidate** `DocumentSlot` as a `document` field type (compact) and as the Documents section (full); composes library DropArea + StatusChip + Button |
| Overview, Review & submit | page components in `src/prototypes/prequal-portal/components/`; InlineNotice, StatusIndicator, Checkbox, Button |
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

## Verification
- `yarn build` passes. `yarn shot prequal-portal … 5173` (Chrome) exits 0 at 1440 / 1024 / 390 in light and dark: no console errors, no overflow.
- Section captures by hash (puppeteer, temporary script): Safety (matrix, mismatch notice, EMR slot under it, OSHA 300A slot), Documents (17 required: 9 accepted · 3 in review · 3 action needed · 2 missing; grouped slots), Review & submit (8 blocking, 3 flagged, 3 pending; Submit disabled with the reason), Experience in dark (tables, Add buttons, radio), Capacity empty at 1024, Safety at 390 (section select, stacked slot). All without page errors after P-019.
- Dark mode before P-019: FormV2 table cells, radio labels and Add buttons were nearly invisible (V1 palette); after: tokens.
- Not exercised: actual uploads (DropArea is static), row editing in repeat/matrix, FormV2 validation on Capacity (required rules show after touch).

## Figma reference
Not pushed yet. The screen is a new shell (no Linarc nav) built mostly from candidates, so the Figma version would be largely plain frames plus Drop Area / Status Chip / Progress Bar instances; proposed to push after design has looked at the prototype (see the report of 2026-10-09).

## Findings
F-036 (sandbox setup gaps surfaced by FormV2), plus P-018 and P-019 in the library log.

## Screenshots
Scratchpad only; copy the Safety 1440 light pair (before / after P-019) to `docs/case-study/assets/` at the next milestone: they show the dark-mode class of bug the audit rules catch.
