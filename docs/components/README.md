# Component backlog (candidates)

Components the prototypes need that the design system doesn't have on either side (no Figma component, no library code). Each goes through the stages below; the policy is D-15 in `docs/4-decisions.md` and the rules are in `CLAUDE.md` › "Candidate components".

**Stages:** `proposed` (doc only) → `candidate` (built in `src/candidates/<Name>/`, used by a prototype) → `figma` (drawn as a component in Figma, variables bound, design iterating) → `library` (moved to `../linarc-design-components/src/componentsV2/<Name>/` with stories, README and `.figma.js`; P-row logged) → `connected` (Code Connect published; candidate folder deleted).

Before proposing a new one, check: the library (`@/componentsV2`, `@/components`), the Figma V3.2 component list, and this table. Prefer extending an existing component (logged as a P-row) when the new thing is a variant of it.

| Component | Purpose | Used on | Stage | Proposal | Figma | Library | Notes |
|---|---|---|---|---|---|---|---|
| KPI card | Count + label + optional trend, clickable to filter | 1 | figma | [KpiCard.md](KpiCard.md) | `_Candidates` › KpiCard `40024205:95` | — | `StatisticWidget` exists but is V1-palette with no Figma counterpart |
| Request status | Text + tone chip for the workflow / outcome / lifecycle dimensions | 1, 5, 6 | **existing** (closed) | [RequestStatus.md](RequestStatus.md) | Status Chip (Success / Warning-Low / Warning-Medium / Neutral / Error / Info / AI) | `@/components/StatusChip` | No change needed (F-034); tones map via `toneToChipStatus` in `status.js` |
| Score / Confidence | Compact `72 · 64%` cell, and a strip variant with knockouts and checks n/m | 1, 5 | candidate (cell + strip) | [ScoreConfidence.md](ScoreConfidence.md) | — | — | |
| Expiry indicator | Date with urgency tone and optional timeline bar | 1, 6 | candidate (inline + timeline) | [ExpiryIndicator.md](ExpiryIndicator.md) | — | — | `timeline` added with the record (ProgressBar `bar-only` inside); date-only parsing fixed (F-049); current = neutral bar (accepted 2026-10-09) |
| Template match card | Suggested template, matched-on facts, extra requirements, View / Change | 2 | **closed** (composition) | — | — | — | Wizard step 3: heading + "Suggested from …" + Change template (SelectV2); no component needed |
| Requirement row | Requirement, required?, evidence needed, threshold, score impact | 2 | **closed** for the wizard (composition) | — | — | — | Wizard: label + detail hairline rows by pillar. Revisit for the template admin (Configure › Templates), where rows are edited |
| Check row | Check name, package, availability/dependency, cost | 2 | **closed** (composition) | — | — | — | Wizard: Checkbox + source · turnaround + cost, hairline rows |
| Tab navigation | Underlined tab strip with optional count badges | 5 | **library** (from Figma) | — | Tab Navigation Bar 40022898:113733 + Tab Navigation 40013898:4444 | `componentsV2/TabNavigation` (P-028) | Was in Figma without code (D-12) |
| Progress stepper | Numbered steps joined by a trail | 2 | **library** (from Figma) | — | Stepper Component 40012829:16146 + Step Trail 40012829:17193 | `componentsV2/ProgressStepper` (P-025) | Was in Figma without code (D-12), so not a candidate |
| Section nav (portal) | Grouped section list with completion state | 3 | candidate | [PortalSectionNav.md](PortalSectionNav.md) | — | — | SideNavV2 is the icon rail; not a fit |
| Document upload slot | What’s needed, Upload / Replace, validation status, message, extracted details | 3, 4 | candidate | [DocumentSlot.md](DocumentSlot.md) | — | — | Composes library DropArea + StatusChip; FileUploadV2 is a CSV importer |
| Inline notice | In-page notice: tone, icon, message, actions (field mismatches, readiness) | 2, 3, 5, 6 | candidate | [InlineNotice.md](InlineNotice.md) | — | — | Check the Banners page before promotion |
| Form table fields | FormV2 `repeat` (rows + Add + minimum) and `matrix` (fixed grid) field types | 3 | candidate | [FormTableFields.md](FormTableFields.md) | — | target: `FormV2/fields/` | Row editing pattern open |
| Multi-select | Select several values from a fixed list, shown as removable tags in the field | 3, 2 | **extension** (library) | [MultiSelect.md](MultiSelect.md) | Select Menu `Type=Tags` 33214:3536 (P-023) | SelectV2 `multiple` (P-024) | FormV2 `multiselect` now renders SelectV2 `multiple` with Tag instances (F-039 resolved); Code Connect `Type=Tags` → `multiple` pending |
| Evidence comparison | Declared / Evidenced / Verified columns with sources and the verified mark | 5 | candidate | [EvidenceComparison.md](EvidenceComparison.md) | — | — | Core PRD pattern; compact in finding rows, detailed in the evidence view |
| Finding card | Severity, criterion, requirement, proof columns, actions | 5 | **closed** (composition) | — | — | — | Review screen: hairline row + EvidenceComparison + text action (`prequal-review/components/FindingList.vue`) |
| Section score row | Label, bar, score, finding count | 5 | **closed** (composition) | — | — | — | ProgressBar `bar-only` in a grid row |
| Decision panel | Readiness list, decision actions, approve-with-conditions form | 5 | **closed** (composition) | — | — | — | AppLayout right panel + Buttons + FormV2 |
| Activity timeline | Actor, action, timestamp, version | 5, 6 | **closed** (composition) | — | — | — | Hairline rows on the review History tab and the record's audit trail; no versions needed |
| Qualification card | Status, trades, limits, conditions, valid until | 6, 2 (existing qualification) | **closed** (composition) | — | — | — | Record: key facts `dl` + Approved for table + Conditions rows; wizard step 1: one hairline row per qualification. Revisit if Directory › Companies needs the same block |
| Skeleton | Placeholder line / block / circle in the final layout, restrained shimmer | 8 (queue, via DataGrid) | candidate | [LoadingStates.md](LoadingStates.md) | Only Data Table / Sheet Cell `Type=Skeleton Loader` 40016391:36860 | DataGrid `loading` (P-034) | Dark fill invisible on rows (needs-design) |
| Load region | Region-scoped loading: delay, skeleton, reveal, error + Retry, aria-busy, announcements (+ `createLoad` controller) | 8 (queue) | candidate | [LoadingStates.md](LoadingStates.md) | — | — | Behaviour; rules in `5-ui-patterns.md` §6 (D-24) |
| Load status | Inline "Loading… / Updating… / Still loading…" + Cancel, "Couldn't update." + Retry, in a page's meta line | 8 (queue) | candidate | [LoadingStates.md](LoadingStates.md) | — | — | StatusIndicator `spinner` inside |

Proposal template: [_template.md](_template.md).
