# Prequalification › New request wizard (`prequal-wizard`)

- **Date:** 2026-10-09
- **Source:** `docs/prequal/spec.md` (screen 2), `docs/prequal/screens.md` §2
- **Figma:** Light [3751:4083](https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3751-4083) · Dark `3751:7308` (Documentation › Draft)
- **URL:** `/?p=prequal-wizard` (`#subcontractor`, `#work`, `#requirements`, `#invite` open a step). Reached from the Overview's "New request".
- **Status:** verified

## Scope
- **Persona:** an estimator, PM or reviewer at the GC. **Decision:** "who am I inviting, for what work, and what will they be asked for?", without creating a duplicate request.
- **Nav position:** Preconstruction › Prequalification › Overview → New request. The wizard opens over the Overview.
- **Pattern (from the V3.2 library, 2026-10-09):** Modal (`ModalV2`, `customSlot`) with a progress stepper (Figma *Stepper Component* + *Step Trail*). The library has no drawer; *Single Select Option* ("use in wizards") has no code yet and wasn't needed. The open item "modal or drawer" in `screens.md` is closed by this.
- **Scenario (data/wizard.js):** Summit Mechanical LLC for HVAC on Riverside Commons. Summit already has an open request (Eastgate Data Center, ready for review) and an expiring qualification with conditions (Northern Heights), so step 1 shows both the duplicate warning and the qualification on file.
- **Steps:** 1 Subcontractor (search Linarc by name or license; open requests and qualifications on file; or add a company not in Linarc) · 2 Work context (project, trades, size, expected single and aggregate, regions, owner type, prevailing wage, site security) · 3 Requirements & checks (suggested template and why, what the sub will be asked for by pillar, request-specific changes, independent checks with source, turnaround and cost) · 4 Invite (summary with Edit per row, recipient and reminder policy, editable message, Send invite).

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured |
| Time to verified done | not measured |
| Components used (library / candidate / library changes) | 9 library (ModalV2, ProgressStepper (new), SelectV2 incl. `multiple`, FormV2 with text / number / select / multiselect / radio / textarea fields, Checkbox, Button, StatusChip, plus the Overview behind) / 1 candidate reused (InlineNotice) / 1 library addition (P-025) |
| New candidates | **0** (portal: 5, dashboard: 3). The proposed Template match card, Requirement row and Check row are typographic compositions here, not components |
| Gaps found | 1 Figma component without code (Stepper → P-025); 1 missing Figma size (wide Modal, needs-figma); 1 tooling (F-041) |
| Verification rounds before passing | 2 (responsive classes missing in the dev server, F-041) |

## Component map
| Element | Handling |
|---|---|
| Dialog, title, close, footer | existing: ModalV2 `variant="customSlot"`, `#modal-body`, `#modal-footer`, `right-icon` X |
| Progress | **new library component** ProgressStepper (Figma Stepper Component + Step Trail), `navigable`, `fluid`, `labels="active"` under 640px (P-025) |
| Company search | existing: SelectV2 `item-type="detailed"` (name + "trade · CSI · state"), `clearable` |
| Open request warning | candidate InlineNotice (warning) with a text action |
| Qualifications on file | hairline rows; status via StatusChip from `requestStatus()` |
| New company, work context, message | existing: FormV2 `flat` (P-021) with text, select, multiselect (SelectV2 `multiple`, P-024), number, radio, textarea |
| Template, requirements, changes | headings + hairline rows (D-17); template change via SelectV2 |
| Checks | Checkbox rows with source · turnaround and cost; total |
| Summary | `<dl>` hairline rows with an Edit text button per row |
| Back / Cancel · Save draft · Next / Send invite | Button, label only (D-17) |

## Gaps and how they were handled
| Gap | Handling | Log ID |
|---|---|---|
| Figma progress stepper has no code | new library component ProgressStepper (`.vue`, story, Code Connect, README) | P-025 |
| Figma Modal has no wide size; ModalV2 `customSlot` takes its width from the content | width set in the wizard: `min(48rem, 100vw − 4 × space-16)`; the step area scrolls inside the modal so the footer stays visible (D-17) | needs-figma |
| Responsive classes used only by the new files weren't in the dev server's CSS | touch `src/style.css` to make Vite re-run Tailwind | F-041 |
| "Send invite" can't add a row to the static mock data | closes and returns to the Overview; noted, not faked | — |

## Verification
- `yarn build` passes. `yarn shot prequal-wizard[#work|#requirements|#invite]` at 1440 and 390 in light and dark: exit 0, no console errors, no overflow.
- Puppeteer (temporary script): step 3 lists 9 checks; ticking "Litigation and lien search" moves the estimate from $35 to $60; on step 1 clearing the company disables Next and shows "Add a company that isn’t in Linarc"; the scroll area reaches the checks with the footer still visible.
- At 390 the stepper shows numbers and only the current step's label; the footer keeps Back · Save draft · Next on one row.

## Figma reference
Documentation file, page Draft: **New request — Light `3751:4083`**, **Dark `3751:7308`** (x 9641, beside the Overview frames). Step 1 (Subcontractor) over a copy of the Overview, with the library `surface/overlay` scrim.
- Library instances: Modal Components `Type=Title Bar` (title, close; icon and description off), Stepper Component (Active + 3 Default, numbers 1–4 set on the nested badge text), Step Trail `Default` ×3 (fill width), Select Menu `Default / Default / lg`, Status Chip `Warning-Low`, Button (Text sm, Minimal md, Solid md; icons off), triangle-alert icon. Plain frames: body, company text, qualification row, footer; every fill, gap, padding and radius bound to library variables (no unbound solid fills in the dialog; one image fill per frame, the toolbar divider, as on the Overview).
- `[candidate] InlineNotice — warning` is a plain frame (InlineNotice is still a candidate).
- Dialog width 800 (48rem + padding) like the code; Figma's Modal has no wide size (needs-figma).
- Same pass: the `+` icon on "New request" turned off in both Overview frames (`3729:4281`, `3730:7228`) and here, matching the code (D-17).

**Flagged from the push:**
- Figma *Step Trail* is dashed (4 / 4) for Default, Disabled and Error and solid only for Success; the code was solid everywhere and now matches (P-025).
- Figma *Number Badge* `Status=Disabled` loses its number in Dark mode (the not-yet-reached steps read as empty grey dots); the code's badge stays legible. needs-figma: dark text token on the disabled Number Badge.
- Figma shows the library as last published: the Select Menu `Type=Tags` variant (P-023) isn't available here until the library is published, which is why the reference shows step 1 rather than step 2.

## Findings
F-041 (Tailwind in the dev server misses classes that only new files use until the stylesheet is re-processed). P-025 in the library log.
