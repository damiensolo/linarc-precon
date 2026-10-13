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

Layout (2026-10-11): both fields are `min-w-0`, and RepeatField's table scrolls inside `overflow-x-auto`, so a wide table never widens the form (F-065).

Editable (2026-10-11): RepeatField opens an inline row editor (a FormV2 built from the columns: `input` text | number | date | select, `options`, `optional`, `wide`) with Add / Save and Cancel, plus Edit and Remove per row; MatrixField's value cells are small InputV2s. Both emit `input` and `blur` like any FormV2 field. Rules come from the schema: `required` and `minLength` (minimum rows) for tables, a custom “every cell” rule for grids. Their buttons pass `native-type="button"` (P-039, F-066).

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

**Revised 2026-10-11 (alignment, D-26, §7):** MatrixField's table hugs its content; editable cells are 124px left-aligned inputs at form size with headers left over them; read-only values stay right-aligned with tabular digits. RepeatField's read-only money / number / percent columns are right-aligned (headers too). Both scroll boxes are `relative` so the sr-only "Actions" header can't widen the page.

**Extended 2026-10-12 (template builder, screens 9–10):** the same two fields configure rows that ship with the table instead of entering them. RepeatField column flags: `editOnly` (editor only: help text, options), `readOnly` (table only: a derived value), `lockedFor(row)` (not editable for that row: a default field's name and type), `visibleIf` (a FormV2 rule, e.g. options only for selects), `default`, `toInput` / `fromInput` (one option per line ⇄ array), `display(value, row)`, `format: 'list'`, options as `{ label, value }`; field props `removable(row)`, `rowTitle(row)`, `muted(row)`, `newRow()`, `editLabel`, `emptyText`, `addLabel: ''` (no Add). MatrixField: `column.readOnly` (a text column beside the inputs) and `props.total = { label, target, suffix }` (a total line that says “✓” or what to add / remove). Used standalone (outside FormV2) on the builder, which the field contract allows.

**Reorder (2026-10-12, user request):** `props.reorderable(row)` rows show a grip (lucide GripVertical, `text/soft`) in a first column and are draggable (native HTML drag and drop); dropping on any row places the dragged row before or after it (upper or lower half). The field emits `input` with the new order and `blur`. Rows without a stable `id` key by index. Used on the template builder's requirements tables for custom fields; the portal's tables are unaffected unless the prop is set.

**Editor reveal (2026-10-12, user request):** when the row editor opens (Add, Edit) it is scrolled into the middle of the nearest scroll view (`scrollIntoView({ block: 'center' })`, smooth unless `prefers-reduced-motion`) so its Add / Cancel are on screen, and it enters and leaves with a 160ms opacity + translate transition (none under reduced motion). A column with `input: 'checkbox'` renders a FormV2 checkbox whose own label is the column label (for progressive options such as the template builder's "Put this field in a group").
