# Component backlog (candidates)

Components the prototypes need that the design system doesn't have on either side (no Figma component, no library code). Each goes through the stages below; the policy is D-15 in `docs/4-decisions.md` and the rules are in `CLAUDE.md` › "Candidate components".

**Stages:** `proposed` (doc only) → `candidate` (built in `src/candidates/<Name>/`, used by a prototype) → `figma` (drawn as a component in Figma, variables bound, design iterating) → `library` (moved to `../linarc-design-components/src/componentsV2/<Name>/` with stories, README and `.figma.js`; P-row logged) → `connected` (Code Connect published; candidate folder deleted).

Before proposing a new one, check: the library (`@/componentsV2`, `@/components`), the Figma V3.2 component list, and this table. Prefer extending an existing component (logged as a P-row) when the new thing is a variant of it.

| Component | Purpose | Used on | Stage | Proposal | Figma | Library | Notes |
|---|---|---|---|---|---|---|---|
| KPI card | Count + label + optional trend, clickable to filter | 1 | figma | [KpiCard.md](KpiCard.md) | `_Candidates` › KpiCard `40024205:95` | — | `StatisticWidget` exists but is V1-palette with no Figma counterpart |
| Request status | Text + tone chip for the workflow / outcome / lifecycle dimensions | 1, 5, 6 | **existing** (closed) | [RequestStatus.md](RequestStatus.md) | Status Chip (Success / Warning-Low / Warning-Medium / Neutral / Error / Info / AI) | `@/components/StatusChip` | No change needed (F-034); tones map via `toneToChipStatus` in `status.js` |
| Score / Confidence | Compact `72 · 64%` cell, and a strip variant with knockouts and checks n/m | 1, 5 | candidate (cell) | [ScoreConfidence.md](ScoreConfidence.md) | — | — | |
| Expiry indicator | Date with urgency tone and optional timeline bar | 1, 6 | candidate (inline) | [ExpiryIndicator.md](ExpiryIndicator.md) | — | — | |
| Template match card | Suggested template, matched-on facts, extra requirements, View / Change | 2 | proposed | — | — | — | |
| Requirement row | Requirement, required?, evidence needed, threshold, score impact | 2 | proposed | — | — | — | PRD "requirements matrix" (admin / wizard). On screen 3 the threshold is FormV2 field `help` + DocumentSlot: no component needed |
| Check row | Check name, package, availability/dependency, cost | 2 | proposed | — | — | — | |
| Section nav (portal) | Grouped section list with completion state | 3 | candidate | [PortalSectionNav.md](PortalSectionNav.md) | — | — | SideNavV2 is the icon rail; not a fit |
| Document upload slot | What’s needed, Upload / Replace, validation status, message, extracted details | 3, 4, 5 | candidate | [DocumentSlot.md](DocumentSlot.md) | — | — | Composes library DropArea + StatusChip; FileUploadV2 is a CSV importer |
| Inline notice | In-page notice: tone, icon, message, actions (field mismatches, readiness) | 3, 5, 2 | candidate | [InlineNotice.md](InlineNotice.md) | — | — | Check the Banners page before promotion |
| Form table fields | FormV2 `repeat` (rows + Add + minimum) and `matrix` (fixed grid) field types | 3, 2 | candidate | [FormTableFields.md](FormTableFields.md) | — | target: `FormV2/fields/` | Row editing pattern open |
| Evidence comparison | Declared / Evidenced / Verified columns with sources and the verified mark | 5 | proposed | — | — | — | Core PRD pattern |
| Finding card | Severity, criterion, requirement, proof columns, actions | 5 | proposed | — | — | — | |
| Section score row | Label, bar, score, finding count | 5 | proposed | — | — | — | Check ProgressBar first |
| Decision panel | Readiness list, decision actions, approve-with-conditions form | 5 | proposed | — | — | — | AppLayout right panel + a form; may not be a component |
| Activity timeline | Actor, action, timestamp, version | 5, 6 | proposed | — | — | — | Check FeedTimeline / TimeLine first |
| Qualification card | Status, trades, limits, conditions, valid until | 6, 2 (existing qualification) | proposed | — | — | — | |

Proposal template: [_template.md](_template.md).
