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
| Library changes | none in code; Figma P-033 (Segmented Navigation Compact has no five-segment variant, so the map uses the full-height Count=5 set) |
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
