# Prequalification › New request wizard (`prequal-wizard`)

- **Date:** 2026-10-09
- **Source:** `docs/prequal/spec.md` (screen 2), `docs/prequal/screens.md` §2
- **Figma:** app map Level 1 · 04 [3769:6836](https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3769-6836); Level 2c (section `3788:2862`): steps 2–4, step-1 states, version B modal
- **URL:** `/?p=prequal-wizard` (default, full-page) · `/?p=prequal-wizard-modal` (version B, modal). `#subcontractor`, `#work`, `#requirements`, `#invite` open a step. The Overview's "New request" opens the default.
- **Status:** verified

## Scope
- **Persona:** an estimator, PM or reviewer at the GC. **Decision:** "who am I inviting, for what work, and what will they be asked for?", without creating a duplicate request.
- **Nav position:** Preconstruction › Prequalification › Overview → New request. The wizard opens over the Overview.
- **Pattern (revised 2026-10-09 at the user's direction, D-18):** a **full-page create screen**, as the app does it today: the RFI "Create" screen (Documentation file, *RFI- Details*) keeps the module nav, puts **Title Bar / Workflow** (`Status=Create`: back arrow, title, document ID chip; in code AppLayout `#header`) above a full-page form. Here: back arrow (returns to the Overview), "New prequalification request", chip `REQ-025`, "Draft saved" on the right; the stepper and step content in a **centred** 56rem column (D-20; first 48rem); Back / Save draft / Next in a fixed bottom panel whose buttons align to that column (D-19, after the user found the left-aligned column left too much empty space and made the footer look misplaced). The rail keeps Overview selected.
- **Version B (comparison):** the first build, the same steps in a ModalV2 over the Overview, kept as `prequal-wizard-modal`. Both versions share `src/prototypes/prequal-wizard/wizardState.js` (state, validation, navigation) and `components/` (the four steps), so they differ only in the container.
- **Scenario (data/wizard.js):** Summit Mechanical LLC for HVAC on Riverside Commons. Summit already has an open request (Eastgate Data Center, ready for review) and an expiring qualification with conditions (Northern Heights), so step 1 shows both the duplicate warning and the qualification on file.
- **Steps:** 1 Subcontractor (search Linarc by name or license; open requests and qualifications on file; or add a company not in Linarc) · 2 Work context (project, trades, size, expected single and aggregate, regions, owner type, prevailing wage, site security) · 3 Requirements & checks (suggested template and why, what the sub will be asked for by pillar, request-specific changes, independent checks with source, turnaround and cost) · 4 Invite (summary with Edit per row, recipient and reminder policy, editable message, Send invite).

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured |
| Time to verified done | not measured |
| Components used (library / candidate / library changes) | 9 library (ModalV2, ProgressStepper (new), SelectV2 incl. `multiple`, FormV2 with text / number / select / multiselect / radio / textarea fields, Checkbox, Button, StatusChip, plus the Overview behind) / 1 candidate reused (InlineNotice) / 1 library addition (P-025) |
| New candidates | **0** (portal: 5, dashboard: 3). The proposed Template match card, Requirement row and Check row are typographic compositions here, not components |
| Gaps found | 1 Figma component without code (Stepper → P-025); 1 missing Figma size (wide Modal, needs-figma); 1 tooling (F-045) |
| Verification rounds before passing | 2 (responsive classes missing in the dev server, F-045) |

## Component map
| Element | Handling |
|---|---|
| Page header | existing: Title Bar / Workflow pattern through `PrequalShell` `#header` (minimal Button with ChevronLeft, title, library Chip `size=small`); shell gained `#header` and `bottom-panel` slots (sandbox code) |
| Step navigation | existing: AppLayout bottom panel (64px, fixed) via `PrequalShell` `bottom-panel` |
| Version B: dialog, title, close, footer | existing: ModalV2 `variant="customSlot"`, `#modal-body`, `#modal-footer`, `right-icon` X |
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
| Figma Modal has no wide size (version B only) | width set in the modal version: `min(48rem, 100vw − 4 × space-16)`; the step area scrolls inside the modal | needs-figma |
| Title Bar / Workflow's right side carries document tools (workflow status, history, comments) that a new request doesn't have yet | not rendered in code; hidden on the Figma instance | — |
| Form column width | Tailwind `max-w-4xl` (56rem, D-20); no width token exists | needs-token (content width) |
| Responsive classes used only by the new files weren't in the dev server's CSS | touch `src/style.css` to make Vite re-run Tailwind | F-045 |
| "Send invite" can't add a row to the static mock data | closes and returns to the Overview; noted, not faked | — |

## Verification
- `yarn build` passes. `yarn shot prequal-wizard[#work|#requirements|#invite]` at 1440 and 390 in light and dark: exit 0, no console errors, no overflow.
- Puppeteer (temporary script): step 3 lists 9 checks; ticking "Litigation and lien search" moves the estimate from $35 to $60; on step 1 clearing the company disables Next and shows "Add a company that isn’t in Linarc"; the scroll area reaches the checks with the footer still visible.
- At 390 the stepper shows numbers and only the current step's label; the footer keeps Back · Save draft · Next on one row.

## Figma reference
**Default (full page):** Documentation › Draft, **New request — Light `3752:6459`**, **Dark `3752:9188`** (x 11281). Overview shell (Top Nav Bar, Side Nav Preconstruction) + **Title Bar / Workflow** `Module=RFI, Status=Create` instance (Title "New prequalification request", Chip label `REQ-025`; Workflow Status and the three Header Tool Icons hidden) + the step 1 content column (896, centred in the content area) + a Bottom panel frame (row centred) (64, `surface/container`, top stroke `border/subtle`) holding the footer. Flag: the Chip (Solid, sm) inside the title bar loses its label in Dark mode; the code chip stays readable (needs-figma). The Module axis has no Preconstruction / Prequalification value; RFI was used because the Create variant is otherwise identical (needs-figma: a module-neutral Create variant).

**Version B (modal):** Documentation file, page Draft: **New request (version B: modal) — Light `3751:4083`**, **Dark `3751:7308`** (x 9641, beside the Overview frames). Step 1 (Subcontractor) over a copy of the Overview, with the library `surface/overlay` scrim.
- Library instances: Modal Components `Type=Title Bar` (title, close; icon and description off), Stepper Component (Active + 3 Default, numbers 1–4 set on the nested badge text), Step Trail `Default` ×3 (fill width), Select Menu `Default / Default / lg`, Status Chip `Warning-Low`, Button (Text sm, Minimal md, Solid md; icons off), triangle-alert icon. Plain frames: body, company text, qualification row, footer; every fill, gap, padding and radius bound to library variables (no unbound solid fills in the dialog; one image fill per frame, the toolbar divider, as on the Overview).
- `[candidate] InlineNotice — warning` is a plain frame (InlineNotice is still a candidate).
- Dialog width 800 (48rem + padding) like the code; Figma's Modal has no wide size (needs-figma).
- Same pass: the `+` icon on "New request" turned off in both Overview frames (`3729:4281`, `3730:7228`) and here, matching the code (D-17).

**Flagged from the push:**
- Figma *Step Trail* is dashed (4 / 4) for Default, Disabled and Error and solid only for Success; the code was solid everywhere and now matches (P-025).
- Figma *Number Badge* `Status=Disabled` loses its number in Dark mode (the not-yet-reached steps read as empty grey dots); the code's badge stays legible. needs-figma: dark text token on the disabled Number Badge.
- The title bar's `REQ-025` Chip (Solid, sm) lost its label in Dark mode: fixed in the library 2026-10-09 (P-029, F-050); it appears here once the library is published.
- Figma shows the library as last published: the Select Menu `Type=Tags` variant (P-023) isn't available here until the library is published, which is why the reference shows step 1 rather than step 2.

## Findings
F-045 (Tailwind in the dev server misses classes that only new files use until the stylesheet is re-processed). P-025 in the library log.

## Revisions
- 2026-10-09: default changed from modal to full-page create screen (D-18); modal kept as `prequal-wizard-modal`.
- 2026-10-09: form column and footer row centred (D-19); on phones the qualification row's text takes a full row. Figma frames `3752:6459` / `3752:9188` updated to match.
- Patterns and visual rules for this and later screens: [../5-ui-patterns.md](../5-ui-patterns.md).
- 2026-10-09: column widened from 48rem to 56rem after the user asked for 10–15% more and research supported wider columns for forms with tables (D-20). Figma content and footer row 896.

## Update 2026-10-10: Figma app map
The Light / Dark frames on the Documentation file's Draft page were deleted at the user's request; the reference is now the Documentation › **Prequalifications** app map (page `3766:33584`), light mode, every screen and state as editable library instances with labelled arrows (D-22). Frames: 04 step 1 `3769:6836`; Level 2c: 23 Work context `3788:2863`, 24 Requirements & checks (full length) `3788:3375`, 25 Invite `3788:3771`, 04a no selection `3789:3612`, 04b add company `3789:3652`, 26 version B modal `3789:3775`. `prototype.figma` points there. Dark mode is checked in code (`yarn shot`), not drawn.

## Update 2026-10-11: loading states (D-24)
Rules: `docs/5-ui-patterns.md` §6. The form is local, so there's no page skeleton. In `wizardState.js` (shared with `prequal-wizard-modal`), **Send invite** and **Save draft** are (mock) requests (`createLoad`, `mockRequest`, `?latency=`): the button disables at once and a second click starts nothing; the flow goes to the Overview and "Draft saved …" changes only after the request resolves; "Sending…" / "Saving…" with an indeterminate spinner shows only past 200ms (title-bar actions here, modal footer in version B); a failure keeps everything entered and shows "Couldn't send the invite." / "Couldn't save the draft." + Retry at every width. Step 1's company history (open requests, qualifications on file) is a region-scoped `LoadRegion` (label "company history"): the company's own details show at once, the history skeleton only past 200ms, a new company is a fresh first load (never the previous company's history), "Couldn't load the company history." + Retry. Instant latency is unchanged.
Verified (puppeteer-core, 50ms samples): send at medium leaves at ~950ms, at fail stays with the message kept and Retry sends; 1 request for 2 clicks; history skeleton from ~250ms, none at instant. `yarn shot` exits 0. At 390 the send error squeezes the title to an ellipsis (acceptable; the error must be visible).
- **Consolidated 2026-10-11:** `wizardState.js` now creates action controllers (`label: 'draft'` / `'invite'`, with the existing wording) and exposes `actionLoad` (the last action) and `actionRetry`; both versions render the shared `LoadStatus` with "Draft saved …" as its slot, replacing the hand-built spinner / error / Retry and the manual announcement ("Draft saved" is announced by LoadStatus). Below sm the line is visually hidden but still announced, except a failure. Re-verified (both versions): 1 request for 2 clicks, "Saving…" / "Sending…" after ~200ms, success after resolve, error + Retry with input kept, Retry succeeds.

## Update 2026-10-11: title bar back button (D-25, P-038)
The header is Title Bar / Workflow `Size=Comfortable`: `PrequalShell header-size="comfortable"` (64px, 12px around the button, 20px sides) and the back button is the library **HeaderToolIcon `type="back"`** (grey fill, no border at rest: Figma `Show Border` off; hover adds a darker stroke, pressed darkens the fill, 2px keyboard focus ring), replacing the borderless minimal Button. Measured: button 40×40 at top 12 / left 20 in both themes, focus ring 2px, no console errors.

## Update 2026-10-11: Send invite creates the request (D-29)
Send invite now creates a real request in the demo session (`data/session.js` `createRequest`): next number (REQ-025…), the chosen or new company, project, template, limits, checks. It appears on the Overview as Waiting for subcontractor (the KPI counts it) and the request's tracking view opens (PRD UX l. 1186). Its portal opens from the sandbox record picker; from there the whole flow runs.

## Update 2026-10-12: the template comes from Configure › Templates
Step 3's template is matched from the definitions in `src/modules/prequal/data/templates.js` (`matchTemplate`: trades, size band, project types; secure-site, federal and prevailing-wage templates only when the work says so) as the work context changes, until the estimator picks one (Change template lists Active templates). No match shows “No matching template” with a pick and keeps Next disabled (PRD UX l. 1135). The checklist is the template's (`checklistOf`, the same list the builder's Review & publish shows) and the request's checks start as the template's. Both versions (`wizardState.setWork` / `setTemplate`).
