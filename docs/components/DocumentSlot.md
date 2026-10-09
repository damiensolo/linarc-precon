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
No card (revised 2026-10-09, D-17). Full: a block the parent list separates with hairlines (`border/subtle`). Compact (under a form field): no rule or box; vertical space (`space-4` above, `space-12` below) separates it from the next field (user direction 2026-10-09: whitespace, not lines). Header: label + "Required / Optional / Required for this site · Expiry: driver" + status (StatusChip only for rejected / failed, otherwise the status word in `text/subtle`) → requirements list (hidden in compact mode once a file exists) → DropArea without the browse-button icon (no file / rejected / processing) **or** file row(s) (File icon in `icon/subtle`, name, "Uploaded d MMM") + message line (text only; `text/error` or `text/warning/low` for those tones, `text/subtle` otherwise) + extracted-details grid (indented by space only) → footer: Replace file · View extracted details as text buttons.

## API
| Prop | Type | Default | Notes |
|---|---|---|---|
| `doc` | slot object (`data/portal.js`) | required | id, label, required, requirements[], expiryDriver, status (DOCUMENT key or null), message, file / files, validThrough, extracted |
| `compact` | Boolean | `false` | under a form field |

Events (to add when wired): `upload(file)`, `replace`.

## Tokens
`border/subtle`, `text/default`, `text/subtle`, `text/soft`, `text/error/default`, `text/warning/low`, `icon/subtle`, `space-2/8/12/16/20`; StatusChip statuses via `toneToChipStatus` for rejected (error) and failed (error, strong).

## Behaviour
Status → DropArea state: none → default, rejected → error with the message, processing → uploading (progress), everything else → file row. A failed or rejected slot stands out in a long list by its chip and its red message; accepted slots carry no colour. Restricted documents (financial statements) carry `restricted: true` for the GC-side read-only variant.

## Open questions for design
- Does a failed-but-uploaded document show the DropArea again (replace by drop) or only the Replace button? (Prototype: button only.)
- Multi-file slots (OSHA 300A × 3): one row per file plus a "n of m" count, as built, or three sub-slots?

## Acceptance
- [ ] Figma component (status variants × compact), built on Drop Area and Status Chip instances, variables bound, both modes
- [ ] `.vue`, `.stories.js`, `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390
