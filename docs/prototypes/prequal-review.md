# Prequalification › Review (`prequal-review`)

- **Date:** 2026-10-09
- **Source:** `docs/prequal/spec.md` (screen 5, reviewer hierarchy, three levels of proof, decisions), `docs/prequal/screens.md` §5, `docs/5-ui-patterns.md`
- **Figma:** app map Level 1 · 03 [3769:6710](https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3769-6710); Level 2a (section `3779:3081`): tabs 05–09, evidence 11, decision panel 10 and states 12–18
- **URL:** `/?p=prequal-review#req-001` (the Overview's "Review now" opens it; other ids show the same sample with a notice)
- **Status:** verified

## Scope
- **Persona:** the GC Prequal Reviewer. **Decision:** "is this sub safe to approve, on what terms, and what's still unproven?" Reviewer-only screen; estimators see the stamp, status, limits and conditions elsewhere, never this.
- **Nav:** Preconstruction › Prequalification › Review Queue (rail item selected) → request.
- **Pattern (docs/5-ui-patterns.md):** full page under the module nav; **Title Bar / Workflow** header (back arrow to the Overview, company name, `REQ-001` chip, "Status: GC is reviewing"); content on the left; the **Decision panel** in AppLayout's right panel (sticky, own scroll), the placement the RFI screen uses for its activity log. **Below 1024px** the panel moves inline under the strip.
- **Evidence:** "View evidence" on a finding replaces the Decision panel with that finding's evidence (back arrow returns). The spec says "evidence drawer"; the library has no drawer, so the screen's existing panel is reused. **Open for design** (needs-figma: a drawer pattern, or confirm the panel).
- **Request shown:** REQ-001 Apex Electrical, Inc., Harbor Point Clinic, Electrical — Medium Projects v3; score 72, confidence 64%, Review, 0 knockouts, 12 of 14 checks (broker and surety pending, so provisional). Data: `src/modules/prequal/data/review.js`; section scores weighted with the spec's defaults to the overall 72.

## Layout (top to bottom, the spec's reviewer hierarchy)
1. Context line: trade · CSI · state · project · requested limits · submitted · private / public works.
2. **Recommendation strip** (ScoreConfidence `strip`): Recommendation chip · Score 72 / 100 · Confidence 64% · Knockouts 0 confirmed · Checks 12 / 14 complete · "Provisional: 2 checks still running."
3. **TabNavigation:** Overview · Findings (open count, yellow badge) · Submission · Documents · Checks (running count) · History.
4. **Overview tab:** Summary marked "Lintel AI", with a line saying it isn't the record · **Needs your decision** (unresolved knockouts, missing items and findings; informational ones and passes aren't listed) · **Section scores** (label · weight · bar · score · finding count).
5. **Findings tab:** all findings, including resolved and informational, each with the three proof levels.
6. **Submission / Documents / Checks / History tabs:** hairline rows; Checks hides passed results by default ("Show passed (11)").
7. **Decision panel:** readiness list (knockouts, failed required items, open findings, running checks) → Approve with conditions (primary, because a required item failed) · Approve · Request information · Reject → request context → recent activity. Approve and Approve with conditions open a form (trades, limits, valid until, conditions) → confirmation preview → Confirm → done, with "View qualification record". Request information: pick findings + the message the sub sees (never check results). Reject: reason + sub-facing explanation. Override and Dismiss (in the evidence view) need a reason and are written to History.

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured |
| Components used | library: TabNavigation (new), StatusChip, Chip, Button, Checkbox, ProgressBar (`bar-only`), FormV2 (text, number, select, multiselect = SelectV2 `multiple`, textarea), AppLayout right panel via PrequalShell · candidates: ScoreConfidence (`strip` added), EvidenceComparison (**new**), InlineNotice · library additions: P-028 |
| New candidates | **1** (EvidenceComparison). Wizard 0, portal 5, dashboard 3. Up from the wizard because this screen introduces the PRD's core pattern (three levels of proof), which no library or Figma component covers |
| Closed as compositions | Finding card, Decision panel, Section score row, Activity timeline |
| Gaps found | 1 Figma component without code (Tab Navigation → P-028); 1 shell bug (right panel never shown, F-046); 1 open pattern question (evidence drawer) |

## Component map
| Element | Handling |
|---|---|
| Header | Title Bar / Workflow `Size=Comfortable` via `PrequalShell #header` + `header-size="comfortable"`: HeaderToolIcon `type="back"` (P-038; was a minimal Button + ChevronLeft), title, Chip `size=small`, StatusChip for status |
| Recommendation strip | candidate ScoreConfidence, new `variant="strip"` (props `knockouts`, `checksComplete`, `checksTotal`, `provisional`) |
| Tabs | **library** TabNavigation (P-028) |
| AI summary | text + StatusChip `status="ai"`, label "Lintel AI" |
| Findings | `components/FindingList.vue`: hairline rows; StatusChip only for Knockout / Missing (D-17); **candidate EvidenceComparison** (compact) |
| Evidence view | `components/EvidencePanel.vue` in the right panel: EvidenceComparison `detailed` (sources, dates, extraction confidence), FormV2 textarea reason, Override / Dismiss / Request information |
| Section scores | ProgressBar `bar-only` in a grid row |
| Decision panel | `components/DecisionPanel.vue`: readiness rows with a Check icon, Buttons, FormV2, Checkbox |
| Submission / Documents / Checks / History | `components/ReviewDetails.vue`: hairline rows; DOCUMENT and CHECK vocabularies; chip only for documents that need action |

## Gaps and how they were handled
| Gap | Handling | Log ID |
|---|---|---|
| Figma Tab Navigation has no code | new library component TabNavigation | P-028 |
| `PrequalShell` enabled the right panel but never set it visible (AppLayout `rightPanelVisible` defaults to false) | shell passes `:right-panel-visible="rightPanel"` | F-046 |
| The spec's evidence drawer has no library pattern | evidence opens in the right panel; flagged | needs-figma |
| Proof levels needed empty states (pending check, nothing collected) | `PROOF` gained `pending` and `none`; status model updated | — |
| Detailed review data exists for REQ-001 only | other ids show the sample with an info notice; not faked per company | — |

## Verification
- `yarn build` passes. `yarn shot prequal-review#req-001` at 1440, 1024 and 390, light and dark: exit 0, no console errors, no overflow. Decision panel on the right at 1440 and 1024, inline at 390.
- Puppeteer (temporary script): View evidence opens the evidence view; typing a reason enables Override; overriding drops the Findings badge from 4 to 3 and removes the finding from "Needs your decision"; Approve with conditions → Review decision → confirmation preview → Confirm → "Approved with conditions"; Checks shows 3 rows by default and 14 with "Show passed"; ArrowRight on a tab selects the next one.
- Dark-mode captures reflect the parallel session's dark border-token work (P-026, P-027), not this screen.

## Figma reference
Documentation › Draft: **Review — Light `3758:5648`**, **Dark `3758:8649`** (Dark = the Light frame with the `mapped` collection set to Dark and the logomark `Mode=Dark`). Overview shell with **Review Queue** selected on the rail; **Title Bar / Workflow** `Module=RFI, Status=Draft` (title Apex Electrical, Inc.; Chip `REQ-001`; the Type meta and its divider hidden; Status Chip `Info` "GC is reviewing"; document tools on the right hidden); context line; `ScoreConfidence — strip [candidate]` frame (Status Chip `Info` + labelled values); **Tab Navigation Bar** `Count=6` with the six labels; Summary with Status Chip `AI` "Lintel AI"; the first two findings, each with a `[candidate] EvidenceComparison` frame; **Right panel — Decision** frame (380, `surface/container`, left stroke `border/subtle`) with readiness rows (library check icon on `icon/success`), four Buttons, the request context. All fills, gaps and paddings bound to library variables.
- Flags: the Chip (Solid, sm) in the title bar lost its label in Dark; **fixed in the library 2026-10-09 (P-029, F-050)**, shows here once the library is published; the Tab Navigation count badge was not shown (Show Indicator left off); section scores, other tabs and the evidence view are in the prototype only.

## Findings
F-046 (right panel never visible from the shell). P-028 in the library log. A parallel session used P-026 / P-027 and F-040 to F-043 while this screen was built; this screen's IDs were moved to the next free numbers.

## Update 2026-10-10: Figma app map
The Light / Dark frames on the Documentation file's Draft page were deleted at the user's request; the reference is now the Documentation › **Prequalifications** app map (page `3766:33584`), light mode, every screen and state as editable library instances with labelled arrows (D-22). Frames: 03 `3769:6710`; Level 2a section `3779:3081` with tab crops (Findings `3781:2142`, Submission `3781:2324`, Documents `3781:2436`, Checks `3781:2519`, History `3781:2573`) and panel crops (decision `3779:3082`, evidence `3779:3126`, approve with conditions `3779:3266`, confirm `3779:3514`, approved `3779:3599`, request information `3779:3669`, sent `3779:3780`, reject `3779:3839`, not approved `3779:3946`). `prototype.figma` points there. Dark mode is checked in code (`yarn shot`), not drawn.

## Update 2026-10-10: Review queue
The rail item Review Queue now opens the Review queue list (screen 8, `prequal-queue`); its rows open this screen (Review now / Open) and the back arrow returns to the queue instead of the Overview. Figma: Level 1 arrow “32→03 Review now” and the grey back arrow 03→32 replace the old 03→02 back arrow.

## Update 2026-10-11: loading states (D-24)
The review now comes from a (mock) request (`createLoad` + `LoadRegion`, `docs/5-ui-patterns.md` §6; `?latency=` to try it). The shell and the title bar frame (back arrow) render at once; the company name (a title-sized Skeleton line in its place), ID chip and status wait for the data. The main column is one `LoadRegion` whose `#skeleton` (`components/ReviewSkeleton.vue`) draws the final layout: meta line (1–3 lines by width), the score strip's five label/value pairs at their real widths, the tab row, Summary / Needs your decision / Section scores; below 1024px it includes the inline Decision panel placeholder. The right panel is a `LoadRegion secondary` on the same controller (no duplicate announcements): `components/DecisionPanelSkeleton.vue` while loading, empty on failure (the main region shows "Couldn't load the review." + Retry), and it fades in with the column. Tabs stay local (no request). The `#default` slot is a `<template #default>` so the content is only evaluated once the data exists.
- **Honest submits:** Confirm (approve / approve with conditions), Send request (request information), Reject request and the evidence view's Override / Dismiss run a mock request. The buttons (and Back / Cancel) disable at once, a double click sends once, "Saving…" / "Sending…" with an indeterminate spinner shows only after 200ms ("Still …" after 5s, no Cancel: a write can't be taken back), the Done state / finding change only after it resolves, and a failure keeps the form with an error ("Couldn't save the decision. Nothing was changed.") and Retry. The shared `LoadStatus` (`variant="notice"`, action controllers) holds that line.
- **Verified** (puppeteer-core, Chrome): instant and fast show no skeleton and announce nothing; medium shows the skeleton 210ms after the request starts and the content at ~930ms; slow adds "Still loading review…" at ~5s; fail ends in the error + Retry (aria-busy false), fail-once + Retry loads. The tab row's y is the same in skeleton and content at 1440 (282), 1024 (364) and 390 (1221). Submits: Confirm disabled on the same frame as the double click, "Saving…" at ~245ms, Approved at ~930ms; fail → error + Retry at ~1240ms, Retry succeeds. `yarn build` and `yarn shot` pass.
- **Consolidated 2026-10-11:** `components/SubmitStatus.vue` is deleted. DecisionPanel uses two action controllers (decision: Saving / "Couldn't save the decision. Nothing was changed."; information request: Sending / "Couldn't send the request. Nothing was sent.") and one `LoadStatus variant="notice"` after the form, outside the mode switch, so it stays mounted into Done and announces "Decision saved" / "Information request sent"; EvidencePanel uses one for the resolution. The right panel's hand-copied loading logic and fade CSS are replaced by `LoadRegion secondary`. Re-verified for Confirm, Send request, Reject, Override, Dismiss at medium and fail: all pass; Override / Dismiss success isn't announced (the evidence view closes on success).

## Update 2026-10-11: title bar back button (D-25, P-038)
The header is Title Bar / Workflow `Size=Comfortable`: `PrequalShell header-size="comfortable"` (64px, 12px around the button, 20px sides) and the back button is the library **HeaderToolIcon `type="back"`** (grey fill, no border at rest: Figma `Show Border` off; hover adds a darker stroke, pressed darkens the fill, 2px keyboard focus ring), replacing the borderless minimal Button. Measured: button 40×40 at top 12 / left 20 in both themes, focus ring 2px, no console errors.
Also: the "Sample review data" notice is removed (F-061); every request opens the mocked Apex review as the app would show it. Tab badges now sit on whole pixels in every state (TabNavigation, P-037, F-060).

## Update 2026-10-11: every request has its own review (realistic demo data)
At the user's request, the mock data now covers every request and every state, so the module can be demoed end to end. The screen loads the request in the hash (`#req-004`; REQ-001 when there's none):
- **Reviews** for all 15 requests with a submission: `reviewFor(id)` in `src/modules/prequal/data/review.js` (Apex, unchanged) and `data/dossiers.js` (14 more), built from per-company declared profiles (`data/profiles.js`) plus hand-written findings with all three proof levels, check and document overrides, history, decision defaults and an AI summary each. Every dossier matches its list row: open findings, knockouts, checks n of m, and section scores whose weighted sum is the overall score (a scratchpad script checks all of it).
- **States covered:** Accept with nothing open (Ironline, Summit REQ-002), Review with a missing item (Apex, Bluewater REQ-004), Not recommended with a knockout (Granite: Nevada debarment), checks queued / running / failed to run (Pioneer, Bluewater), a resolved finding (Ironline umbrella), More information needed with the request shown (Cascade REQ-006, Pioneer), and eight decided reviews (approved, approved with conditions with overrides, not approved).
- **Decision panel** is data-driven (`defaults`: trades, valid until and its reason, preselected conditions, message, reject reason); the solid button follows the recommendation (Approve / Approve with conditions / Request information / Reject) with a one-line reason; `infoRequest` shows “Waiting for the subcontractor” above the decisions; `decided` replaces the decisions with the decision, read-only (A8). The evidence view is read-only on decided reviews; the Overview's “Needs your decision” reads “Open at the decision” there.
- **Tracking view** for the nine requests not yet submitted (A7): `components/RequestProgress.vue` (progress bar and portal sections by group, chip only on Needs attention) and `components/TrackingPanel.vue` (delivery, Send reminder as an honest submit, request context, recent activity); data in `data/tracking.js` (Northstar REQ-008 uses the portal prototype's own section states). `ReviewSkeleton` has a `tracking` variant, chosen before the load from the request's stage.
- **Back** goes to the request's list: Review Queue, Qualified Subs (decided) or Overview (not yet submitted).
- **Verified:** `yarn build` passes; a puppeteer walk opens all 24 requests (right company, right panel, right back target, tab counts) and nine record URLs with no console errors; `yarn shot` at 1440 / 1024 / 390, light and dark, for REQ-003, 004, 006, 008, 010, 016, 019, 023: exit 0, no overflow.
- Supersedes the gap row “Detailed review data exists for REQ-001 only” and the F-061 note that every request opens the Apex review. Figma (added the same day): **Level 2d · Request stages** section (`3845:6158`, below Level 3): 33 tracking view (Northstar, `3845:6177`), 34 Draft panel (`3846:6340`), 35 Waiting for the subcontractor (`3846:6412`), 36 Decision — approved with conditions, read-only (`3846:6493`), 37 Decision — not approved (`3846:6582`), with labels, connectors to Levels 1 / 2a / 2b, arrows and notes. Built by cloning 03 and panel 10 so every text keeps its style and every fill / gap / padding its variable; audit of the nine new frames: 263 texts, 0 unstyled, 0 unbound. Map gap noted there: an approved request's review is only reachable by URL (the record has no “View review” link).

## Update 2026-10-11: the review is part of the end-to-end flow (D-29)
Opening a Ready for review request starts it (GC is reviewing, A11). Confirm, Send request and Reject request record the decision in the demo session (`data/session.js`): approvals create the qualification record (`records.js` `sessionRecord`: the approved trades and limits, the chosen conditions as Open, the documents as reviewed, the audit trail from the session's history) and the request appears on Qualified Subs; Request information opens the requested items in the portal, and the sub's response turns the panel's block into **Response received** with what came back; Reject shows Not approved in the panel, the portal and (when the company has no approval) Qualified Subs. Override / Dismiss persist. A request submitted in the demo gets a review generated from its submission (`data/submissionReview.js`).

## Update 2026-10-12: Lintel AI tag tooltip (P-043, §9)
The "Lintel AI" tag on the Overview summary shows the library Tooltip on hover and keyboard focus: "This content was generated using AI and may contain errors or omissions. Verify important information before relying on it." The library tooltip now wraps at 250px (it was one line). Verified: 250×102 tooltip on hover and on focus, both themes, no console errors. Map: crop frame 03c in Level 2a.

