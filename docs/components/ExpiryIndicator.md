# ExpiryIndicator

- **Stage:** candidate (built 2026-10-08, used by `prequal-dashboard`; `timeline` variant 2026-10-09, used by `prequal-record`)
- **Proposed:** 2026-10-08 · **Used on:** `prequal-dashboard` (Expiration column), `prequal-record` (monitoring list)
- **Candidate code:** `src/candidates/ExpiryIndicator/ExpiryIndicator.vue` 
- **Figma:** — · **Library:** — · **Log:** —

## Purpose
A date with its urgency: current (green) → expiring within the renewal window (yellow/orange) → expired (red), as text ("Expires 30 Sep 2027 · in 22 days") plus tone. The timeline variant adds a bar showing elapsed validity for the record's monitoring list.

## Why not an existing component
- `ProgressBar`: a bar without the date semantics, no tone by urgency.
- `StatusIndicator`: a dot; fine as the leading dot inside this component.
- `Date.vue` / `DatePicker`: input and formatting, no urgency.
- Figma V3.2: no expiry/validity component found (verify).

## Anatomy
Leading dot (StatusIndicator, tone) → date (label/sm, text/default) → relative hint (label/sm, text/subtle: "in 22 days" / "12 days ago") → optional timeline bar (ProgressBar `bar-only`: track `surface/progress-track`, fill by state) under the text in the `timeline` variant → optional trailing action slot ("Request renewal", Button text/sm).

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `date` | String (ISO) \| Date \| null | — | `null` renders "No expiry" in neutral |
| `warnDays` | Number | `30` | window for `expiring` (PRD default, configurable) |
| `startDate` | String \| Date | `null` | needed for the timeline fill |
| `variant` | `inline \| timeline` | `inline` | |
| `now` | Date | `new Date()` | injectable for deterministic screenshots |

Computed `state`: `current` / `expiring` / `expired` / `none`, mapped to `LIFECYCLE` tones from `status.js`. Slots: `action`. Events: none.

## States and variants
inline / timeline × current / expiring / expired / none. Both themes.

## Tokens
`icon/success`, `icon/warning-low` (or `warning-medium`, to confirm), `icon/error`, `text/default`, `text/subtle`, `border/subtle`, `surface/progress-bar` (fill), `space-4`, `space-8`, `radius-round`.

## Behaviour
Date format follows the library's `$moment` locale ("30 Sep 2027"); the relative hint uses `fromNow`. Never colour alone: the hint text carries the state ("expired 12 days ago"). Truncation: the hint drops first at narrow widths. `title` holds the full date.

## Content
"Valid through Dec 2027" (sub-facing, passed document) vs "Expires 30 Sep 2027" (GC-facing). The component takes a `label` prefix prop if both are needed; otherwise the caller composes.

## Built so far (2026-10-09)
- `variant="timeline"`: "Expires 20 Oct 2026 · in 12 days" over a ProgressBar `bar-only` (start → expiry, filled to today). The bar replaces the dot (one colour signal). Without `startDate` it renders the text only and wraps, which is how the record's key facts use it.
- Bar fill: **current = `surface/warning-neutral`**, expiring = `surface/warning-low`, expired = `surface/error/default`. The spec says green for current; D-17 keeps colour for states that need action. **The user accepted the neutral bar for now (2026-10-09).** In light mode the neutral fill reads heavier than the yellow; a lighter neutral progress fill is needed (needs-token).
- Date-only strings (`YYYY-MM-DD`) are read as local midnight (F-049); the library version must keep this.
- Expired hint is "N days ago" in both variants (2026-10-09): the status shown beside it already says "No longer active", so repeating it cost ~110px per table cell.

## Open questions for design
- Yellow vs orange for the expiring window; the PRD UX uses both words.
- Does the dashboard column show the date only, or the date and the hint?

## Acceptance
- [ ] Figma component (inline + timeline), variables bound, both modes
- [ ] `.vue`, `.stories.js`, `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390
