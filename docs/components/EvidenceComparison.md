# EvidenceComparison

- **Stage:** candidate (built 2026-10-09, used by `prequal-review`)
- **Proposed:** 2026-10-09 · **Used on:** `prequal-review` (finding rows: compact; evidence panel: detailed), later `prequal-record` (approved parameters) and the portal (the sub sees declared vs document when the GC shares a finding)
- **Candidate code:** `src/candidates/EvidenceComparison/EvidenceComparison.vue`
- **Figma:** — · **Library:** — · **Log:** —

## Purpose
The PRD's core visual pattern: one value shown at its three levels of proof (what the sub **declared**, what the **document** says, what an **independent** check returned) so the reviewer sees at a glance whether they agree, which one is wrong, and what is still pending. Agreement raises confidence; disagreement is the finding.

## Why not an existing component
- DataGrid / Data Table: a full grid for one value is heavy and has no per-cell proof state or source line.
- StatusChip: a label, not a value comparison.
- Figma V3.2: nothing compares a value across sources (`search_design_system`: compare, evidence, proof → no match).
- FormTableFields `matrix`: a static table without states or sources.

## Anatomy
Three equal columns (stack on phones): column label (12px `text/soft`: Declared / Document / Independent check) → value (14px `text/default`; "—" when empty) → state (12px): `Verified` with a check icon (the distinct "verified" mark), `Contradicted` in `text/error`, `Pending` / `Declared` / `Evidenced` / `Not collected` in `text/subtle`. Detailed mode adds source and date (12px `text/subtle`) and the extraction confidence for the document column. Columns are separated by space, no boxes (D-17).

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `proof` | `{ declared, evidenced, verified }`, each `{ value, state, source?, at?, confidence? }` | required | `state` from `PROOF` in `status.js` |
| `detailed` | Boolean | `false` | adds source, date and extraction confidence |

## Behaviour
When all three levels are verified and equal, the component shows a single "Verified at all three levels" line above the columns. Colour only for Contradicted (red) and the verified check; everything else muted.

## Open questions for design
- The "fully verified" mark: a check icon plus words for now; the spec asks for a distinct icon.
- Should Contradicted mark *which* level disagrees (declared vs document) or the whole row?

## Acceptance
- [ ] Figma component (compact / detailed × states), variables bound, both modes
- [ ] `.vue`, `.stories.js`, `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390
