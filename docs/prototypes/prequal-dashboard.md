# Preconstruction › Prequalification › Overview — GC Request Dashboard (`prequal-dashboard`)

- **Date:** 2026-10-08
- **Source:** `docs/prequal/spec.md` §screens 1, `docs/prequal/screens.md` §1 (no Figma frame; this prototype is the reference pushed to Figma)
- **Figma:** https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3729-4281 (Light) · `node-id=3730-7228` (Dark); see "Figma reference" below
- **URL:** `/?p=prequal-dashboard` (add `&chrome=0` for a full-window comparison; `#<request id>` is carried by links out of this page)
- **Status:** verified; in Figma (KpiCard drawn as a component; ScoreConfidence and ExpiryIndicator still text placeholders there)

## Scope
- **Persona:** GC Prequal Reviewer first (full columns). The "View as" switch shows the Estimator/PM view: Score · Confidence hidden (PRD §10). Findings and knockouts are not columns here; they belong to the review screen.
- **Decision this screen supports:** what needs my attention now, and in which order: waiting on the sub, ready for me, about to lapse.
- **Nav:** Preconstruction › Prequalification › Overview (Q1). Rail items Requests / Review Queue / Qualified Subs navigate through `router.js` once those screens exist.
- **Data:** `src/modules/prequal/data/` (24 requests across every workflow, outcome and lifecycle value), `status.js` for labels and tones, `TODAY = 2026-10-08` so expiry states are stable.

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured (setup and the shell were built in the same session) |
| Time to verified done | not measured |
| Components used (library / candidate / new) | 7 library (PrequalShell's TopNavBar, SideNavV2, AppLayout; Button, DataGrid, SegmentedControl, StatusChip via the `status-chip` slot, StatusIndicator inside two candidates) / 3 candidates / 0 library changes |
| Gaps found | 4 proposed, 1 closed as existing (F-034), 3 built as candidates |
| Verification rounds before passing | 2 (alignment and the role switch fixed after round 1) |
| Computed-value checks (pass/total) | 6/6 (see Verification) |

## Component map
| Element | Handling |
|---|---|
| Shell (top nav Preconstruction, Prequal rail, title bar) | existing: `~/modules/prequal/PrequalShell.vue` (TopNavBar, SideNavV2, AppLayout) |
| "New request" CTA | existing: Button primary solid md + Plus; `go('wizard')`, inert until the wizard exists |
| "View as" Reviewer / Estimator | existing: SegmentedControl V2 (md) |
| KPI cards ×3 | **candidate** `KpiCard` (`docs/components/KpiCard.md`); click filters the table; `aria-pressed` |
| Table | existing: DataGrid list view, 40px rows, toolbar as on the Requests page |
| Status cell | existing: StatusChip through the `status-chip` slot; tone → status via `toneToChipStatus()` (F-034: no extension needed) |
| Score · Confidence cell | **candidate** `ScoreConfidence` (cell variant), registered as DataGrid slot `score-confidence` (`gridSlots.js`) |
| Expiration cell | **candidate** `ExpiryIndicator` (inline variant), slot `expiry` |
| Row action (Review now / View record / Open) | existing: Button text/sm through the `button` slot; row click goes to the review screen or the record |

DataGrid note for later screens: a column with only a `center` slot is centred by `DecoratedCell`; pin the slot `left` (or `right`) and blank the centre text (`{ type: 'text', componentProps: { value: '' } }`) to keep the column value for sorting while rendering the slot once.

## Gaps and how they were handled
| Gap | Handling | Log ID |
|---|---|---|
| No KPI / stat card in the library (StatisticWidget is V1) or in Figma (`search_design_system`: only Gauge / charts) | candidate | docs/components/KpiCard.md |
| No paired score + confidence display | candidate | docs/components/ScoreConfidence.md |
| No date-with-urgency display | candidate | docs/components/ExpiryIndicator.md |
| StatusChip "only four statuses" | not a gap: it has seven; grep had missed quoted keys | F-034 |
| `focus-visible:-outline-offset-2` on KpiCard renders as -1px (base offset) while `focus-visible:outline-2` applies | cosmetic; the focus stroke is drawn at 2px, 1px further in than designed. Likely the negative-prefixed variant isn't generated for the custom offset scale | note for P-015 follow-up |
| Edge wouldn't launch for `yarn shot` (pending update) | `EDGE_PATH` → Chrome | F-035 |

## Verification
- `yarn build` passes. `yarn shot prequal-dashboard … 5173` (Chrome, F-035) exits 0 at 1440 / 1024 / 390, light and dark: no console errors, no overflow warning.
- 1440: KPI row + table; status chips, score dots and expiry dashes render; dark mode uses dark surfaces (card `#131313`, chip `rgba(59,130,246,.2)` / text `#60a5fa`). 1024: three KPI cards still in a row; the top nav collapses tools into "More". 390: cards stack; the rail hides behind the hamburger; toolbar right-cluster overlap is the known P-007.
- Scripted (puppeteer, Chrome): KpiCard bounding box identical at rest / Tab-focus / pressed / selected (428.3 × 112 at 103,128); `aria-pressed="true"` when selected; clicking "Waiting for subcontractor" leaves only Waiting / Completing / More-information rows; clicking again restores all; switching to Estimator removes the "SCORE · CONFIDENCE" header (1 → 0).
- Computed: card bg light `#f4f4f5`-on-hover / dark `#131313`; status chip light `#f0f6fe` / `#1d4ed8` ("GC is reviewing"); both from tokens.
- Not exercised: DataGrid filter and sort on the slot columns (sorting uses the underlying field: `statusLabel`, `score`, `validUntil`).

## Figma reference
- Documentation file `9ANM41f3QwNjt27Sl08i8O`, Draft page: **Light** `3729:4281`, **Dark** `3730:7228` (mapped collection set to Light / Dark; dark logomark). Cloned from the Requests Light frame (`3726:76047`), then: rail Overview selected, title "Overview", CTA "New request", KPI row inserted, 14 rows, columns S.No 56 / SUBCONTRACTOR 220 / TRADE 120 / PROJECT 160 / TEMPLATE 210 / STATUS 250 / SCORE · CONFIDENCE 150 / EXPIRATION 152 (= 1318; LAST ACTIVITY and the action column don't fit at 1440 and are also off-screen in the prototype).
- **Status cells** are library `Data Table / Cell` `Type=Status Chip` with the nested Status Chip set to Info / Warning-Low / Neutral and the user-facing label; icons off, Style Subtle.
- **Candidates on the frame:** the three KPI cards are `[candidate] KpiCard` frames (`3730:4900`, `:4909`, `:4918`) with every fill, stroke, padding, gap and radius bound to library variables; the real component lives on the V3.2 `_Candidates` page (`40024205:95`). Score · Confidence and Expiration are **plain Text cells** ("72 · 64%", "—") standing in for the ScoreConfidence and ExpiryIndicator candidates, which are not drawn in Figma yet (next: draw them on `_Candidates`, then replace the cells).
- Figma shows the library as last published; the dark-mode variable fixes from P-016 / P-017 appear only after the library is published.

## Findings
F-034, F-035.

## Screenshots
Scratchpad only for now; copy the 1440 light/dark pair to `docs/case-study/assets/` at the next milestone.

## Update 2026-10-09: column widths and pinned action
At the user's request the request table (`src/modules/prequal/requestColumns.js`, shared by the Overview and Requests) was tightened to measured content widths (Subcontractor 210, Trade 130, Project 155, Template 210, Status 275, Score · Confidence 150, Expiration 190, Last activity 180 flex, action 110; was ~1,830px wide, now 1,555px at 1440 in a 1,307px scroller), and the row action became a `type: 'Actions'`, `frozen: true` column, pinned to the right edge (the `cell` button still renders). Checked with puppeteer: all row actions stay visible at scroll 0 and 150px, the subcontractor stays pinned left, no console errors. Expired rows' Expiration hint shortened to "N days ago" (Status already says "No longer active"). Scrollbars: P-030 / F-051.
