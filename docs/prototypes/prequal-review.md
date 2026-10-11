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
| Header | Title Bar / Workflow pattern via `PrequalShell #header`: minimal Button + ChevronLeft, title, Chip `size=small`, StatusChip for status |
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
