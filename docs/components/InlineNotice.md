# InlineNotice

- **Stage:** candidate (built 2026-10-09, used by `prequal-portal`)
- **Proposed:** 2026-10-09 · **Used on:** `prequal-portal` (field mismatches, disclosure, readiness), later `prequal-review` (provisional recommendation), `prequal-wizard` (no matching template)
- **Candidate code:** `src/candidates/InlineNotice/InlineNotice.vue`
- **Figma:** — · **Library:** — · **Log:** —

## Purpose
A notice that sits in the page flow, under a field or above a section: tone + icon + message, optional title and actions. The PRD's "Action needed: your entered limit does not match the uploaded document" is this component.

## Why not an existing component
- `AlertWrapper`: a notification-event wrapper (objectId), not a visual notice.
- `Toastification` / Snackbar: transient toasts; the mismatch must stay on screen next to the field.
- `StatusChip`: a label, no message body or actions.
- Figma V3.2: Banners page exists ("☉ Banners"); check whether a banner component covers the in-page case before promotion. If it does, this becomes an extension of Banner, not a new component.

## Anatomy
Box (tone surface subtle, 1px tone outline, radius-4, padding 12/8) → tone icon (16px) → title (bold, tone text) → message (text/default) → actions row.

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | warning \| error \| info \| success | `warning` | |
| `title` | String | `''` | |
| `message` | String | `''` | or the default slot |

Slots: `default` (message), `actions`. Role: `alert` for warning/error, `status` otherwise.

## Tokens
`surface/<tone>/subtle`, `border/<tone>`, `icon/<tone>`, `text/<tone>`, `text/default`, `radius-4`, `space-8`, `space-12`. Warning uses the `warning-low` set.

## Open questions for design
- Banner vs inline notice: one component with a `placement` axis, or two?
- Should warning use `warning-low` (yellow) or `warning-medium` (orange)? The status model reserves orange for "missing / failed".

## Acceptance
- [ ] Figma component (4 tones × with/without title × with/without actions), variables bound, both modes
- [ ] `.vue`, `.stories.js`, `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390
