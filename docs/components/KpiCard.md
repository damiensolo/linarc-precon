# KpiCard

- **Stage:** figma (built 2026-10-08, used by `prequal-dashboard`; drawn on `_Candidates` 40024205:95)
- **Proposed:** 2026-10-08 · **Used on:** `prequal-dashboard` (3 cards); later Review Queue and Qualified Subs summaries
- **Candidate code:** `src/candidates/KpiCard/KpiCard.vue` 
- **Figma:** V3.2 file, page `_Candidates` (`40024205:82`, not published), component set **KpiCard** `40024205:95` (State=Default `40024205:83`, State=Selected `40024205:89`; properties Label, Value, Hint, Icon swap, Show Icon). On the Documentation reference frames the three cards are plain frames named `[candidate] KpiCard` with the same bindings (`3730:4900`, `:4909`, `:4918` on the Light frame) · **Library:** — · **Log:** —
- **Stage note:** `figma` as of 2026-10-08 (drawn, design iterating). Icon: the ☉ Icons set has no hourglass, so "Waiting for subcontractor" uses clock on both sides.

## Purpose
A count with a label that answers one question at a glance ("Ready for review: 6") and, when clicked, filters the table below it to those rows.

## Why not an existing component
- `@/components/StatisticWidget.vue` and `Widget.vue`: V1 palette (hex, `baseLight4`), fixed `h-24 w-32`, no Figma component, no dark mode. Not extendable without a rewrite.
- `StatisticWidgetWithIcon.vue`: same generation.
- Figma V3.2: no "stat" or "KPI" card component found in the library (verify with `search_design_system` before building; a `Board Card` family exists for Kanban, different purpose).

## Anatomy
Container (surface/container, border/subtle, radius-6, padding space-16 / space-20) → label (label/sm, text/subtle) → value (heading, fontsize-28 or 32, text/default) → optional secondary line (delta or hint, label/sm, text/soft) → optional leading icon with tone. Selected state when it's the active filter.

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | String | — | required |
| `value` | Number \| String | — | required; formatted by the caller |
| `hint` | String | `''` | e.g. "3 overdue" |
| `tone` | `neutral \| info \| success \| warning \| error` | `neutral` | colours the icon and the selected ring only; the value stays `text/default` |
| `icon` | Component | `null` | lucide icon |
| `selected` | Boolean | `false` | active filter |
| `interactive` | Boolean | `true` | renders as a button; `false` renders a static card |
| `loading` | Boolean | `false` | skeleton value |

Slots: `default` (replaces the secondary line). Events: `click`.

## States and variants
Rest · hover · focus-visible · pressed · selected · disabled (non-interactive) · loading. Both themes. One size.

## Tokens
`surface/container`, `surface/subtle` (hover), `surface/select` (selected tint, to confirm), `border/subtle`, `border/primary/focused` (focus ring, outline not border, P-015 rule), `text/subtle`, `text/default`, `text/soft`, `icon/<tone>`, `radius-6`, `space-16`, `space-20`, `space-8`.

## Behaviour
Fills its grid cell; the dashboard lays three in a row at ≥ 1024, stacks at 390. Value doesn't wrap; label truncates at one line with a title attribute. Keyboard: a real `<button>` when interactive; `aria-pressed` for selected. No size change between states (outline for focus/selected).

## Content
Label is the KPI name from `docs/prequal/status-model.md` ("Waiting for subcontractor", "Ready for review", "Renewal needed soon"). Value is a plain count.

## Open questions for design
- Does the selected card use a tint, a stroke, or both? (Figma pattern for "active filter card" needed.)
- Icon or no icon? The wireframe shows none.

## Acceptance (for promotion to the library)
- [x] Figma component with the same props as variants/properties, variables bound, both modes
- [ ] `.vue`, `.stories.js` with UsageDocs, `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390; no size change across states
- [ ] Used by at least one prototype through the library path; candidate folder deleted
