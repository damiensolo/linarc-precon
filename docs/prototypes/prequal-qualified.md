# Preconstruction › Prequalification › Qualified subcontractors (`prequal-qualified`)

- **Date:** 2026-10-10
- **Source:** `docs/Prequal Full PRD UX.md` “Qualified subcontractor list” (l. 1516–1529), data model (l. 630), PM integration (l. 606–608); `docs/prequal/screens.md` §7; assumptions A1–A4 in `docs/prequal/spec.md`
- **Figma:** app map Level 1 · 31 [3818:6279](https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3818-6279) (Documentation › **Prequalifications** app map, page `3766:33584`)
- **URL:** `/?p=prequal-qualified`. Rail: Qualified Subs. Rows → `prequal-record#<request id>`; View decision → `prequal-review#req-023`.
- **Status:** verified

## Scope
- **Persona:** GC Estimator / PM (the PRD’s main reader of the list: “can we use this sub, for what, up to how much”) and the Reviewer, who also gets **Request renewal** on Expiring / Expired rows (assumption A3). The role switch is the same prototype-only control as on the Overview.
- **Decision this screen supports:** who is qualified for what, under which conditions, and whose qualification is about to lapse.
- **Nav:** Preconstruction › Prequalification › Qualified Subs (D-23). Replaces the rail item’s direct link to a single record. The record’s back arrow returns here.
- **Data:** `recordRows()` in `src/modules/prequal/data/records.js`: one row per company with a decision, from its latest closed request (the PRD keys the record by GC and sub, not by project; assumption A2). 8 rows: 3 Current, 2 Renewal needed soon, 1 No longer active, 1 Suspended, 1 Not approved (A1). Apex (req-001) is still under review in the shared data, so it is not listed.

## Layout (top to bottom)
1. Title bar: “Qualified subcontractors”, View as, New request.
2. Filter row: **Status** and **Trade** (SelectV2 `multiple`, clearable) and “n companies” / “n of m companies”. No KPI cards: this is a roster, not a pipeline (the Overview has the pipeline).
3. DataGrid, list view, 40px rows, Subcontractor frozen left, action pinned right (as the Overview). Columns: Subcontractor · Trades (approved scope, joined with “·”) · Status (one chip: the lifecycle, or Not approved) · Single · Aggregate (highest limit on the record) · Conditions (“2 · Project-specific performance and payment bond…”, “None”, or “—”) · Valid until (ExpiryIndicator cell) · Next renewal (earliest dated document still to renew, e.g. “20 Oct 2026 · Surety bonding letter”) · Decided (“Jordan Lee · 2 Oct 2025”) · action.
4. Row action: **View record** (→ record) · **Request renewal** (reviewer; Expiring / Expired; opens the record screen’s `RenewalModal` for that company) · **View decision** (Not approved → the closed review).
- The PRD lists Qualification and Lifecycle as two columns; the status model shows one status per list (D-16), so the outcome is carried by the Conditions column (“Approved with conditions” = a conditions count) and the Not approved status.

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured (built with the Review queue in one session) |
| Components used | library: DataGrid (status-chip, button slots), SelectV2 (`multiple`, P-024), SegmentedControl, Button, ModalV2 + FormV2 + Checkbox (inside RenewalModal) · candidates: ExpiryIndicator (grid slot), ScoreConfidence not used here |
| New candidates | **0** (record 0, review 1, wizard 0, portal 5, dashboard 3) |
| Library changes | none in code; two Figma needs-design rows (P-032 Side Nav Preconstruction still has Requests; P-033 Segmented Navigation Compact caps at 4 segments, used by the queue) |
| Gaps found | 1 tooling (F-056, stale Vite transform) |

## Component map
| Element | Handling |
|---|---|
| Shell | `PrequalShell` (`screen="qualified"`) |
| Filters | SelectV2 `multiple` + `show-checkmark-on-selected`, `w-full sm:w-1/3 lg:w-1/5` |
| Table | DataGrid list view; columns in `src/modules/prequal/recordColumns.js`; shared `subcontractorColumn()` / `actionColumn()` from `requestColumns.js` |
| Status cell | library `status-chip` slot, tone → `toneToChipStatus` |
| Valid until | candidate ExpiryIndicator through the `expiry` slot |
| Request renewal | `~/prototypes/prequal-record/components/RenewalModal.vue` reused as is |

## Verification
- `yarn build` passes. `yarn shot prequal-qualified … 1440,1024,390 1024` exits 0 in light and dark, no console errors, no page overflow (the table scrolls inside the grid, as the Overview does; 1,640px of columns at 1440).
- Browser script (puppeteer): rail Qualified Subs → `?p=prequal-qualified`; row 1 View record → `prequal-record#req-017`; record back arrow → `prequal-qualified`; Request renewal on Tidewater opens the modal with “Will Grant, Tidewater Waterproofing”; Harbor View decision → `prequal-review#req-023`.
- Figma: frame 31 built from the Overview frame (shell, title bar, toolbar, Data Table column frames rebuilt with the eight columns and eight rows; Select Menu instances for the filters). Audit of Level 1 after the build: 91 screen texts, 0 unstyled; 0 unbound paints, spacing or radii (F-055 rule).

## Figma map
Level 1: Label/31, hotspots on the Overview’s rail item and on rows 1 and 4, arrows 01 rail → 31 (blue), 31 → “Level 2b · 19 Record” connector (View record), dashed orange 31 → “Level 2b · 20 Renewal modal” (Request renewal). Level 2b’s back connector now reads “← Back arrow · Level 1 · 31 Qualified subcontractors”. Known map gaps: the Select Menu shows “Any status” as a value rather than a placeholder (the component has no placeholder state); the Requests rail item is hidden per instance until P-032 lands in the library.

## Findings
F-056. Assumptions A1–A4 (`docs/prequal/spec.md`).

## Update 2026-10-11: loading states (D-24)
Same as the review queue: rows come from `createLoad({ label: 'qualified subcontractors' })` + `mockRequest` (`?latency=`). Shell, title bar, View as, New request and the Status / Trade filters stay outside the region (the Trade options come from the roster, not from the loaded rows, so the filter renders at once). The grid is a `LoadRegion content-loads` with DataGrid `:loading` skeleton rows under the real header. `LoadStatus` replaces the count span ("N companies" / "N of M companies", hidden until the first answer); `LoadStatus`'s own fixed 24px line keeps it the same height empty, loading and loaded, so at 390 (where it wraps onto its own line) the grid doesn't move. Filter changes re-query and keep the rows with "Updating…".

**Verified** (puppeteer-core, Chrome, 50ms sampling): instant / fast no skeleton, no announcement; medium / slow / fail skeleton after the delay; "Still loading… Cancel" at ~5s; grid y 277 constant through every load at 1440 and 453 at 390; refresh keeps 8 rows → "3 of 8 companies"; superseding filters end on the last request (2 of 8); fail shows "Couldn't load the qualified subcontractors." + Retry; fail-once + Retry loads; every run ends `aria-busy="false"`. `yarn build` passes; `yarn shot` exits 0. Not loading-related: a long Status choice ("Renewal needed soon") wraps inside the 1/5-width SelectV2 and grows the filter row by 26px.
- **Consolidated 2026-10-11:** the `min-h-space-32 pb-space-8` workaround is removed (it no longer applied: `LoadStatus`'s root is `display: contents`); measured with the shared line alone, the grid header stays at 373 (390) and 265 (1440) through Loading… / count / Updating… / Couldn't update. The renewal modal (shared with the record) does its own request and emits `send` only after it resolves; `sendRenewal` stays synchronous (no second delay or request). Fixed in passing: the modal's `open` watcher is now immediate, because this screen mounts it already open and the first open had nothing preselected and an empty message.

## Update 2026-10-12: filters in the grid's Filter panel (D-30, P-041, P-042)
The Status and Trade selects above the table are gone. Filtering is in the grid's Filter panel: Status (is / is any of), Trade (matches any of a company's trades), Valid until (date conditions), Number of conditions; quick filters Renewal needed soon, Current, No longer active, Has conditions, Expires in 30 days. The Filter button shows the number of active conditions and the result line reads "N of 8 companies · Clear filters" while filtered. Verified by script in both themes (see F-069).
Revised the same day: the "N of 8 companies · Clear filters" line is gone (the badge shows a filter is active and the panel clears it); the panel is 800px so a Valid until date range fits (P-044).

