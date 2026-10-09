# DocumentSlot (candidate)

Proposal and status: `docs/components/DocumentSlot.md`. Import: `~/candidates/DocumentSlot/DocumentSlot.vue`.

| Prop | Type | Default |
|---|---|---|
| `doc` | document slot object (`src/modules/prequal/data/portal.js`: id, label, required, requirements[], expiryDriver, status, message, file / files, validThrough, extracted) | required |
| `compact` | Boolean | `false` |

Composes library `DropArea` (empty / rejected / processing; browse button without its icon), `StatusChip` (only for rejected / failed, tone from DOCUMENT in `status.js`; other statuses are a muted word) and `Button` (text variant: Replace, View extracted details). Not a lookalike of FileUploadV2: that is a spreadsheet/CSV importer. No card: the parent list separates full slots with hairlines; `compact` relies on vertical space, not a rule, to sit under its field (D-17).
