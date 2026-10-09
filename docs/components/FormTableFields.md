# FormTableFields: RepeatField and MatrixField (FormV2 field types)

- **Stage:** candidate (built 2026-10-09, used by `prequal-portal`)
- **Proposed:** 2026-10-09 · **Used on:** `prequal-portal` (licenses, principals, past projects, references, EMR / injury / revenue / workforce grids); later `prequal-wizard` (requirements matrix) and the template builder
- **Candidate code:** `src/candidates/FormTableFields/RepeatField.vue`, `MatrixField.vue`, `format.js`
- **Figma:** — · **Library:** target is `src/componentsV2/FormV2/fields/` + the built-in registry · **Log:** —

## Purpose
Two FormV2 field types the registry lacks: **repeat** (zero or more rows of a record, with a minimum) and **matrix** (a fixed grid of values, e.g. year × EMR, role × certifications). The PRD's data model is full of both.

## Why not an existing component
- FormV2 built-ins: text, number, select, multiselect, radio, checkbox, switch, textarea, date, rich-text, file; nothing repeating or tabular. FormV2 explicitly supports custom types through `fieldTypes`, which is how these are plugged in (`src/modules/prequal/portalFields.js`).
- `DataGrid`: far too heavy for 3–6 rows inside a form, and not a form field.
- `Table` (V1): legacy palette, not a field.

## API (FormV2 field contract, `_baseFieldProps`)
`field.props.columns: [{ key, label, format? }]` with `format` ∈ currency · number · percent · yesno · date; `key` may be a dotted path. Repeat adds `minimum` and `addLabel`. Value: array of row objects. Emits `input` / `blur` as any field.

## Tokens
`border/subtle` (row rules), `text/subtle` (headers, row labels), `text/default`, `text/soft`, `text/warning/low` ("n of m required" short), `space-4/8`; Button secondary outline sm for Add.

## Behaviour
Matrix scrolls horizontally under 640px. Numbers right-aligned, tabular. Repeat shows "None added yet." when empty.

## Open questions for design
- Row editing: inline (table cells become inputs), a drawer per row, or a modal? The prototype only lists rows and offers Add.
- Should repeat rows be reorderable (FormV2 has `reorderable` for sections)?

## Acceptance
- [ ] Figma: table-in-form pattern on the Forms page (header row, body rows, Add action), variables bound, both modes
- [ ] Moved to `componentsV2/FormV2/fields/` and registered in `fieldRegistry.js`; stories; README; `.figma.js`
- [ ] Verified in both themes at 1440 / 1024 / 390

**Revised 2026-10-09 (hierarchy):** each table field is a subsection. The schema passes `props.title` (and `props.required`) and leaves `label` empty, so FieldRenderer draws no 13px label; the field draws its own 16px bold heading with the required mark, keeps `space-8` above and below, and the section grid gap is 24px, so neighbouring subsections sit ~40px apart. Row padding `space-10`. Asked for by the user on Experience & workforce and References ("too dense, hierarchy not used well").
