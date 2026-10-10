# ScoreConfidence

- **Stage:** candidate (cell built 2026-10-08 for `prequal-dashboard`; strip 2026-10-09 for `prequal-review`)
- **Proposed:** 2026-10-08 · **Used on:** `prequal-dashboard` (cell), `prequal-review` (strip), Review Queue
- **Candidate code:** `src/candidates/ScoreConfidence/ScoreConfidence.vue` 
- **Figma:** — · **Library:** — · **Log:** —

## Purpose
Shows the two numbers the PRD insists are read together and never alone: **Score** (how well the sub meets the criteria) and **Confidence** (how much of that rests on evidence). The strip variant adds the recommendation stamp, knockouts and checks n/m, with a "provisional" marker while checks are pending.

## Why not an existing component
- `ProgressBar` / `CircleProgress`: a single value; no pairing, no stamp.
- Status Chip: could carry the recommendation word, but not the numbers.
- Figma V3.2: no score or rating component (verify with `search_design_system`).

## Anatomy
**Cell** (table): `72` (label/md, text/default) `·` `64%` (label/sm, text/subtle), optional leading recommendation dot (StatusIndicator) with tone. Width hugs; min 72px.
**Strip** (review header): five labelled values in a row: Recommendation (RequestStatus strong), Score `72 / 100`, Confidence `64%`, Knockouts `0 confirmed`, Checks `12 / 14 complete`; an info line below when provisional. Wraps to two rows at 390.

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `score` | Number \| null | — | 0–100; `null` renders "—" (not yet scored) |
| `confidence` | Number \| null | — | 0–100 (%) |
| `recommendation` | `accept \| review \| not-recommended \| null` | `null` | from `RECOMMENDATION` in `status.js` |
| `knockouts` | Number | `0` | strip only |
| `checksComplete`, `checksTotal` | Number | — | strip only |
| `provisional` | Boolean | `false` | true while checks are pending; adds the note |
| `variant` | `cell \| strip` | `cell` | |

Slots: `note` (provisional text). Events: none (the row/strip is not itself a control).

## States and variants
cell / strip · scored / unscored · provisional · each recommendation tone. Both themes.

## Tokens
`text/default`, `text/subtle`, `text/soft`, `surface/container`, `border/subtle`, recommendation tones via RequestStatus, `space-4`, `space-8`, `space-16`, `space-24`, `radius-6`.

## Behaviour
Numbers are tabular (`tabular-nums` via existing utility if the library has one; otherwise note as needs-token). Score and confidence are never colour-coded by value (the recommendation carries the colour); a low confidence is shown by the number, optionally with a tooltip "64% of the score rests on evidence or verification". ARIA: a group with a label "Score 72 of 100, confidence 64 percent".

## Content
From the spec: `Score 72 · Confidence 64%`; bands Accept ≥ 80, Review 60–79, Not recommended < 60 (configurable; the component doesn't compute the band, the data does).

## Open questions for design
- Should the cell show the recommendation dot, or is the Status column enough?
- Strip layout: one row of five at 1440, or stamp left and the four numbers right?

## Acceptance
- [ ] Figma component (cell + strip variants), variables bound, both modes
- [ ] `.vue`, `.stories.js`, `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390
