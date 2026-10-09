# PortalSectionNav

- **Stage:** candidate (built 2026-10-09, used by `prequal-portal`)
- **Proposed:** 2026-10-09 · **Used on:** `prequal-portal` (left panel); later any multi-step application (template builder, wizard summary)
- **Candidate code:** `src/candidates/PortalSectionNav/PortalSectionNav.vue`
- **Figma:** — · **Library:** — · **Log:** —

## Purpose
A grouped list of sections with a completion state per row, so an external user always knows where they are, what's done and what needs attention (the sub-portal's four pillars).

## Why not an existing component
- `SideNavV2`: the 82px icon rail for Linarc modules; no groups, no per-item state, labels too short.
- `LAccordion` / `Accordion`: table accordions, not navigation.
- Figma V3.2 "☉ Navigation" page: module rails and tab bars; no grouped section list with states (verify at promotion).

## Anatomy
Revised 2026-10-09 (D-17): one signal per row. Group label (label/xs regular, `text/soft`) → rows: label (label/sm) · right-aligned state: a 16px Check (`icon/default`) for complete / submitted, the state word in `text/warning/low` for needs attention, the state word in `text/soft` for in progress / not started. No dots. Selected row: `surface/datatable/select-opaque` + `text/primary`.

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `groups` | `[{ id, label, items: [{ id, label, state? }] }]` | required | `state` from SECTION in `status.js` |
| `selected` | String | `''` | item id |
| `ariaLabel` | String | `Application sections` | |

Events: `select(id)`. `aria-current="page"` on the selected row; rows are buttons.

## Tokens
`text/soft`, `text/default`, `text/primary/default`, `text/warning/low`, `icon/default`, `surface/datatable/select-opaque`, `surface/subtle` (hover), `border/primary/focused` (focus outline), `radius-4`, `space-2/4/8/12/20`.

## Behaviour
Hidden under 768px; the page offers a SelectV2 with "Group › Section" options instead. Long labels truncate with a title attribute. Keyboard: tab through rows; focus ring is an outline (no size change).

## Open questions for design
- Should groups collapse? (The portal has 5 groups / 13 rows, which fits without collapsing.)
- Is `select-opaque` the right selected fill outside tables, or should it be `surface/primary/muted`?

## Acceptance
- [ ] Figma component (row states × selected), variables bound, both modes
- [ ] `.vue`, `.stories.js`, `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390
