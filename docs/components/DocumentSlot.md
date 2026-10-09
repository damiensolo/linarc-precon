# DocumentSlot

- **Stage:** candidate (built 2026-10-09, used by `prequal-portal`)
- **Proposed:** 2026-10-09 · **Used on:** `prequal-portal` (under evidence fields, compact; Documents list, full), later `prequal-review` (Documents tab, read-only) and `prequal-record` (monitoring list)
- **Candidate code:** `src/candidates/DocumentSlot/DocumentSlot.vue`
- **Figma:** — · **Library:** — · **Log:** —

## Purpose
One required document end to end: what the GC needs before upload, the upload zone, the uploaded file, the validation result in plain language, and the extracted values. Screen 4 of the PRD ("Document upload and validation state") is a list of these.

## Why not an existing component
- `DropArea` (V2): the drag-and-drop zone with default / dragover / uploading / error / complete states. Used inside this component for the empty, rejected and processing cases; it has no requirements list, status chip, message or file row.
- `FileUploadV2`: a spreadsheet / CSV importer with sheet parsing; wrong purpose.
- `FileUpload` (V1): legacy palette.
- Figma V3.2: Drop Area exists; no document-slot composition (verify at promotion).

## Anatomy
Card (surface/container, 1px outline in the status tone, radius-6, padding 16) → header: label + "Required / Optional / Required for this site · Expiry: driver" + StatusChip → requirements list (hidden in compact mode once a file exists) → DropArea (no file / rejected / processing) **or** file row(s) (FileCheck icon, name, "Uploaded d MMM") + message line (tone icon + text) + extracted-details grid → footer: Replace file · View extracted details.

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `doc` | slot object (`data/portal.js`) | required | id, label, required, requirements[], expiryDriver, status (DOCUMENT key or null), message, file / files, validThrough, extracted |
| `compact` | Boolean | `false` | under a form field |

Events (to add when wired): `upload(file)`, `replace`.

## Tokens
`surface/container`, `surface/subtle` (file row), `border/subtle`, `border/error/default`, `border/warning/low`, `text/default`, `text/subtle`, `text/soft`, `text/success`, `text/error/default`, `text/warning/low`, `icon/default`, `radius-4/6`, `space-2/8/12/16/20`; StatusChip statuses via `toneToChipStatus` (failed → `warning-medium`? no: error; see status-model §5).

## Behaviour
Status → DropArea state: none → default, rejected → error with the message, processing → uploading (progress), everything else → file row. The outline follows the tone so a failed slot stands out in a long list. Restricted documents (financial statements) carry `restricted: true` for the GC-side read-only variant.

## Open questions for design
- Does a failed-but-uploaded document show the DropArea again (replace by drop) or only the Replace button? (Prototype: button only.)
- Multi-file slots (OSHA 300A × 3): one row per file plus a "n of m" count, as built, or three sub-slots?

## Acceptance
- [ ] Figma component (status variants × compact), built on Drop Area and Status Chip instances, variables bound, both modes
- [ ] `.vue`, `.stories.js`, `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390
