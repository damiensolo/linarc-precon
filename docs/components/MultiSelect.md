# MultiSelect

- **Stage:** library (extension: Figma Select Menu `Type=Tags`, P-023; code SelectV2 `multiple`, P-024; FormV2 `multiselect` switched; Code Connect mapping pending publish)
- **Proposed:** 2026-10-09 · **Used on:** `prequal-portal` (Scope: trades performed, trades subcontracted, geographic areas, sectors; Company: any multi-value field), later `prequal-wizard` (trades, checks)
- **Candidate code:** — (the portal currently renders FormV2's built-in `multiselect` field, see "Why this is a gap")
- **Figma:** Select Menu `Type=Tags` (https://www.figma.com/design/1HxMANBEaYWFqEFtazB20l/?node-id=33214-3536), built on Tag (node 324-666) · **Library:** `src/componentsV2/SelectV2/SelectV2.vue` (`multiple`) · **Log:** P-023, P-024

## Purpose
Pick several values from a fixed list and show them as removable chips inside the field, so a subcontractor can declare the trades, regions and sectors they work in without a free-text field or a long checkbox list.

## Why this is a gap
**Resolved on the Figma side (2026-10-09):** rather than a new component, the user chose to extend `Select Menu` with a `Type=Tags` variant whose value area holds up to four `Tag` instances (`Size=sm, Style=Fill Soft`, exposed), toggled by `Show Tag 1–4`. The tags row wraps (the trigger grows one 20px row at a time; lg 40 / sm 32 for a single row). So this is an **extension** (P-023), not a candidate; the rest of this document is the code-side spec. Open for design: the tags are `Tag` (square), not `Chip` (pill), per the user's choice; Tag `Show Close` is on by default.

- **Figma V3.2:** `Select Menu` is "single-value select trigger"; `Select Menu Item` has no checkbox row; `Chip` exists ("neutral pill label … use for user-removable selections") but no component composes it into a select. There is no multi-select component.
- **Library:** `SelectV2` has `isMultiselect`, but its own docs say "visual only — selection is still single-value" (a checkbox decoration on detailed rows). `MultipleSelectDropdown` / `MultiSelectPopup` are V1 (Box, palette classes, `rounded-md pl-3`).
- **FormV2's `multiselect` field** (`SelectField.vue`) is a hand-rolled trigger + chip + menu written for FormV2 with no Figma counterpart: `0.375rem` radius, `2rem` min height (Input is 40px), chips as `9999px` pills at `0.75rem` with a typed `×`, V1 `Icon` with palette colours (`baseDark2`, `baseRoyalBlue`), placeholder in `text/on-surface/default-inverse`, a menu shadow that uses `--text-soft` as a shadow colour. This is a lookalike inside the library; it is what the user saw as "not our design system" on Scope.

So this is a component in neither Figma nor code (D-15): a candidate, not an extension, unless design decides it is a `Select Menu` variant.

## Anatomy
Field label (Input Field label style) → trigger: `Select Menu` chrome (40px, `border/input/default`, radius-4, chevron) whose value area holds `Chip` instances (size sm, with remove) wrapping to extra rows; placeholder when empty → drop-down: `Select Menu Drop Down` with `Select Menu Item` rows showing a leading Checkbox and the selected state → optional search (SelectV2 `allowSearch`) → help / error text below as Input Field.

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | Array | `[]` | selected option values |
| `options` | `[{ label, value, description? }]` | required | |
| `placeholder` | String | `Select…` | |
| `size` | sm \| lg | `sm` | as SelectV2 |
| `allowSearch` | Boolean | `true` | filter as you type |
| `maxVisibleChips` | Number | `0` (all) | collapse to "+n" after n chips |
| `disabled`, `readOnly`, `errorState`, `clearable` | | | as SelectV2 |

Slots: `chip` (custom chip content), `option`. Events: `input(values[])`, `blur`, `remove(value)`.

## States and variants
Empty · with chips (1 row, wrapping) · open · disabled · read-only · error · focused. Size sm / lg. Both themes.

## Tokens
Trigger and menu: the `Select Menu` / `Select Menu Drop Down` / `Select Menu Item` tokens (`border/input/*`, `surface/container`, `surface/select`, `text/default`, `text/subtle`, `text/inactive` placeholder, `radius-4`, `space-8/12`). Chips: the `Chip` tokens. Checkbox rows: the `Checkbox` tokens. No new token expected (`needs-token`: none).

## Behaviour
Chips wrap; the trigger grows in height. Keyboard: Backspace removes the last chip when the search is empty; Arrow keys move through options; Space toggles; Escape closes. `role="combobox"` + `aria-multiselectable` listbox. Under 390px the chips wrap to as many rows as needed; a `maxVisibleChips` collapse is the alternative.

## Content
Option labels as in the spec (`21 Fire Suppression`, `Northern California`, `Healthcare`); no free text.

## Open questions for design
- A `Multi` boolean on `Select Menu` (chips in the value area) + a `Checkbox` boolean on `Select Menu Item`, or a separate `Multi Select` component? Read from the library 2026-10-09: `Select Menu` has State × Type (Default / Avatar / Status Indicator) × Size and no multi property; `Select Menu Item` Type has Default / Icon L / Icon R / Avatar + Icons / Indicator + Icons / Icon L & R and no checkbox row; `Chip` has Type (Default / Avatar + Remove / Icon + Remove) × Shape (Circle / Square) × Style (Solid / Outline) × Size, so the chip half already exists.
- Chip size inside a 40px trigger: Chip `sm` fits one row; does a wrapped trigger keep 40px per row?
- Collapse to "+n" after a number of chips, or always wrap?

## Acceptance (for promotion to the library)
- [ ] Figma component (or `Select Menu` variants) with the same props, built on Select Menu / Chip / Checkbox instances, variables bound, both modes
- [ ] `.vue` built on SelectV2 + Chip (not a new trigger), `.stories.js` with UsageDocs, `README.md`, `.figma.js`; Code Connect published
- [ ] FormV2 `multiselect` field type switched to it; the hand-rolled chip UI in `SelectField.vue` removed (P-row)
- [ ] Verified in both themes at 1440 / 1024 / 390; no size change across states
