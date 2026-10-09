# RequestStatus

- **Stage:** closed, existing component covers it (2026-10-08, F-034)
- **Proposed:** 2026-10-08 · **Used on:** `prequal-dashboard`, `prequal-review`, `prequal-record`, Qualified Subs
- **Candidate code:** none; screens use `@/components/StatusChip` with `toneToChipStatus()` from `src/modules/prequal/status.js`
- **Figma:** Status Chip set `40005082:4900` already has Success / Warning-Low / Warning-Medium / Neutral / Error / Info / AI · **Library:** `@/components/StatusChip` (`statusChipTokenMap.js`) · **Log:** none needed

> **Correction.** The "why not an existing component" section below was written from a grep that missed the quoted keys in `statusChipTokenMap.js`. StatusChip has seven statuses, not four. Options A and B are moot; kept for the record.

**Tone map:** `neutral → warning-neutral` (grey; Figma "Neutral"), `info → info`, `success → success`, `warning → warning-low` (yellow; `warning-medium` for orange "missing / failed" severities), `error → error`. `fill-style="outline"` (Figma Subtle) in tables; `solid` (Strong) for the recommendation stamp.

## Purpose
Shows one status from `src/modules/prequal/status.js` as text with a tone, so a row's state is readable without colour. One component for all five dimensions; the caller passes the entry.

## Why not an existing component
- `StatusChip` (`@/components/StatusChip`): the right shape (text, optional icon, subtle/strong style) but only four statuses: `success`, `error`, `info`, `ai`. The model needs `warning` and `neutral` too. Figma's Status Chip set has the same four (check whether warning/neutral variants exist before deciding).
- `StatusIndicator` (`@/componentsV2/StatusIndicator`): dot/badge with workflow colours (`active`, `standby`, `cancelled`, `disabled`, `indeterminate`, `complete`); good for a leading dot, not for a labelled status.
- `Tag` / `StatusTag`: legacy palette.

## Options
**A. Extend StatusChip** (additive, P-row): add `warning` and `neutral` statuses to both token maps, Code Connect and stories; add matching `Status=Warning` / `Status=Neutral` variants to the Figma set. The prototype then uses `<StatusChip :status="tone" :label="label" />` with a tone → status map. One chip in the system.
**B. New RequestStatus candidate**: wraps the label/tone entry, renders a StatusChip-like pill with the five tones. Leaves the library untouched until design decides, but duplicates StatusChip's anatomy (a lookalike risk).

Recommendation: **A**, if design agrees the Status Chip set is where these belong.

## API (either option, as seen by screens)
| Prop | Type | Default | Notes |
|---|---|---|---|
| `status` | `{ key, label, tone }` | — | an entry from `status.js` |
| `style` | `subtle \| strong` | `subtle` | StatusChip's existing axis |
| `icon` | Component | `null` | optional leading icon (e.g. conditions marker for "Approved with conditions") |

## Tokens
Per tone: `surface/<tone>/subtle` + `text/<tone>` + `border/<tone>` (subtle), `surface/<tone>` + `text/on-surface/<tone>` (strong). `warning` uses the `warning/low` set; `neutral` uses `surface/neutral` + `text/subtle` + `border/subtle`. All are in the mapped collection and pass the dark audit after P-017.

## Open questions for design
- Confirm the tone for each value in `docs/prequal/status-model.md` (proposals marked there).
- Should "Approved with conditions" be success with a marker, or warning?

## Acceptance
- [ ] Every value in all five dimensions renders with a distinct label; no two values share label and tone
- [ ] If A: StatusChip variants in Figma match the code statuses; Code Connect republished; P-row logged
- [ ] Verified in both themes at 1440 / 1024 / 390
