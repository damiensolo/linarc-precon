# FormTableFields (candidates): RepeatField and MatrixField

Proposal and status: `docs/components/FormTableFields.md`. Two FormV2 field types that the registry doesn't have, following the FormV2 field contract (`_baseFieldProps`: value, field, formValues, errors, disabled, required, readOnly, labelPosition):

- **`repeat`** (`RepeatField.vue`): rows of a record (licenses, past projects, references) shown as a table with an Add button and a "n of m required" counter. `field.props`: `columns: [{ key, label, format? }]`, `minimum`, `addLabel`.
- **`matrix`** (`MatrixField.vue`): a fixed grid of values (EMR by year, workforce by role). `field.props.columns` as above; the first column is the row label.

Register through FormV2's `fieldTypes` prop: `{ repeat: RepeatField, matrix: MatrixField }` (see `src/modules/prequal/portalFields.js`). Row editing (inline or in a drawer) is out of scope for the prototype and is the main open question for design.
