# Preconstruction › Prequalification › Review queue (`prequal-queue`)

- **Date:** 2026-10-10
- **Source:** `docs/Prequal Full PRD UX.md` “Review queue” (l. 1390–1406) and screen inventory (l. 1602); `docs/prequal/screens.md` §8; assumptions A5–A6 in `docs/prequal/spec.md`
- **Figma:** app map Level 1 · 32 [3818:5154](https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3818-5154) (Documentation › **Prequalifications** app map, page `3766:33584`)
- **URL:** `/?p=prequal-queue`. Rail: Review Queue. Rows → `prequal-review#<request id>`.
- **Status:** verified

## Scope
- **Persona:** GC Prequal Reviewer. No role switch: the queue is reviewer-only (score, confidence, findings and knockouts are all reviewer data).
- **Decision this screen supports:** which submission to open next, and why (knockouts first, then what is ready, then what is waiting on the sub or on checks).
- **Nav:** Preconstruction › Prequalification › Review Queue (D-23). Replaces the rail item’s direct link to the Apex review. The review screen’s back arrow returns here.
- **Data:** `queueRows()` in `src/modules/prequal/queueColumns.js`: the shared requests whose workflow is submitted, under review or info requested (7 of 24). Findings, knockouts, checks n/m, reviewer and recommendation already lived on the request rows.

## Layout (top to bottom)
1. Title bar: “Review queue”, New request.
2. Filter row: SegmentedControl (md) with the PRD’s five quick filters **All · Needs review · Knockouts · Awaiting subcontractor · Checks pending**, an **Assigned to me** checkbox (me = Jordan Lee in the mock; the top nav’s Alex Morgan is an Estimator), and “n requests” / “n of m requests”.
3. DataGrid, list view, Subcontractor frozen left, action pinned right. Columns: Subcontractor · Trade · Request state (one chip: Ready for review / GC is reviewing / More information needed) · Recommendation (chip: Accept / Review / Not recommended) · Score · Confidence (ScoreConfidence cell) · Findings (“3 open · 1 knockout”) · Checks (“12 / 14”) · Assigned reviewer (“Unassigned” when none) · Last activity · action **Review now** (ready) / **Open**.
- Filter definitions: Needs review = submitted or under review; Knockouts = confirmed knockouts > 0; Awaiting subcontractor = information requested; Checks pending = complete < total.

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured (built with Qualified subcontractors in one session) |
| Components used | library: DataGrid (status-chip, button slots), SegmentedControl, Checkbox, Button · candidate: ScoreConfidence (`cell`) through the grid slot |
| New candidates | **0** |
| Library changes | Figma P-033 (done, unpublished): Segmented Navigation Compact gained `Count` = 2…5 × `Selected` = 1…n (14 variants, all bindings kept), a documentation frame and an updated Code Connect template |
| Gaps found | 0 beyond P-033 |

## Component map
| Element | Handling |
|---|---|
| Shell | `PrequalShell` (`screen="queue"`) |
| Quick filters | SegmentedControl V2 (md) + Checkbox (small) |
| Table | DataGrid list view; `queueColumns()`; shared `subcontractorColumn()` / `actionColumn()` / `actionLabel` from `requestColumns.js` |
| Request state, Recommendation | library `status-chip` slot (RECOMMENDATION tones → chip status) |
| Score · Confidence | candidate ScoreConfidence through the `score-confidence` slot |

## Verification
- `yarn build` passes. `yarn shot prequal-queue … 1440,1024,390 1024` exits 0 in light and dark, no console errors, no page overflow (table scrolls inside the grid: 1,600px of columns at 1440; Assigned reviewer and Last activity are off-screen until scrolled, as on the Overview).
- Browser script: rail Review Queue → `?p=prequal-queue`; row 1 Review now → `prequal-review#req-001`; review back arrow → `prequal-queue`; Checks pending → “5 of 7 requests”; + Assigned to me → “2 of 7 requests”.
- Figma: frame 32 built from the Overview frame; table rebuilt with the queue’s nine columns and seven rows (Status Chip and Badge + Text cells; score dots Indeterminate / Active / Cancelled as on 01). Audit of Level 1: 0 unstyled text, 0 unbound paints, spacing or radii.

## Figma map
Level 1: Label/32 under 03 Review; hotspot on the Overview’s rail item with a blue arrow 01 rail → 32; hotspot on row 1 with “Review now” → 03 (enters from the right); the grey back arrow 03 → 32 replaces the old 03 → 02 back arrow. The Notes block gained a bullet on the rail (Requests removed, D-23).

## Findings
Assumptions A5–A6 (`docs/prequal/spec.md`); P-033.

## Update 2026-10-10: compact segmented control in the design system
At the user’s request the quick-filter strip is now a proper design-system component: Segmented Navigation Compact (`604adb6bb6e3ac8b69c4510436026aa1cb230003`, ☉ Data Tables) has `Count` 2 · 3 · 4 · 5 × `Selected` 1…n (14 variants built from the four existing ones, every fill / padding / height / radius still bound: surface/tab-switcher, space-2, space-28, radius-6; segments are Segment Tab instances), a regenerated description, a “Segmented Navigation Compact Documentation” frame beside the set (same builder as the full-height one) and an updated `SegmentedNavigationCompact.figma.js` (Count + five labels). **Pending publish:** once the library is published, the map’s frame 32 swaps its full-height Count=5 instance for `Count=5, Selected=1` of the compact set (the code’s `size="md"`).

## Update 2026-10-10: in-document navigation and loading states (D-24)
Reference implementation of `docs/5-ui-patterns.md` §6. Rows come from a mock request (`mockRequest`, default instant); filters re-query, as a server would. The shell, title bar and filters never change while loading; the grid header shows at once and DataGrid `loading` (P-034) draws skeleton rows only after 200ms; a filter change keeps the rows with “Updating…” in place of the count; “Still loading…” + Cancel after 5s; a failed first load shows “Couldn’t load the review queue.” + Retry above the empty grid. Verified with every `?latency=` scenario sampled every 50ms (F-058), in both themes, and with reduced motion. Open: the Dark-mode skeleton fill (Figma `surface/neutral` = row colour) needs design.

## Update 2026-10-12: views cross-linked with the Filter panel (D-30)
The segmented views stay above the grid and now drive the grid's own filter: a view other than All is a "Queue view is …" condition (the Filter button shows 1), the same views are quick filters in the panel, editing or removing the condition there moves the segment, a second view replaces the first, and a filter that isn't a single view leaves no segment selected. "Assigned to me" is still a query. The count reads "N of 7 requests" while filtered.
