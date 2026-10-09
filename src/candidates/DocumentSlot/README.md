# DocumentSlot (candidate)

Proposal and status: `docs/components/DocumentSlot.md`. Import: `~/candidates/DocumentSlot/DocumentSlot.vue`.

| Prop | Type | Default |
|---|---|---|
| `doc` | document slot object (`src/modules/prequal/data/portal.js`: id, label, required, requirements[], expiryDriver, status, message, file / files, validThrough, extracted) | required |
| `compact` | Boolean | `false` |

Composes library `DropArea` (empty / rejected / processing), `StatusChip` (validation status, tone from DOCUMENT in `status.js`) and `Button` (Replace, View extracted details). Not a lookalike of FileUploadV2: that is a spreadsheet/CSV importer. The slot's outline follows the status tone (error / warning / subtle).
