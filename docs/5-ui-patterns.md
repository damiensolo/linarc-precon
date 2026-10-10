# UI patterns and visual rules

**Read this before building or changing any screen.** These are decisions the user has made in review, not defaults to re-derive. Each rule points at its decision (`4-decisions.md`) or finding (`findings-log.md`). If a screen seems to need something that breaks a rule here, stop and ask; don't quietly diverge.

Last updated 2026-10-09. Applies to every Prequalification screen and, unless a rule says otherwise, to any module.

## 1. Page patterns: which container for which task (D-18)

| Task | Pattern | Library parts | Example |
|---|---|---|---|
| **Create something** (a request, a document, a record), any multi-field or multi-step flow | **Full-page create screen**, never a modal | Module nav stays (TopNavBar + side rail, via `PrequalShell`). **Title Bar / Workflow** (`Status=Create`) as the page header: back arrow (returns to where the user came from), title, document ID chip; right side empty or a "Draft saved" note. Form in a **centred column** (width rule in §2). Step navigation in a **fixed bottom panel** (AppLayout bottom panel, 64px) whose buttons align to the same centred column | `prequal-wizard`; the app's RFI Create screen (Documentation file, *RFI- Details*) |
| **Multi-step create** | As above, with **ProgressStepper** (library, Figma Stepper Component + Step Trail) at the top of the column; `navigable` so completed steps can be revisited; `labels="active"` under 640px | `componentsV2/ProgressStepper` (P-025) | `prequal-wizard` |
| **List / dashboard** | Full page, **Title Bar / Page** (title + primary action) | `PrequalShell` default header | `prequal-dashboard` |
| **External user, long application** (no Linarc account) | Reduced Linarc top nav (Company variant, logomark), **no side rail**, section nav in the left panel, fixed bottom panel for Previous / Save and exit / Next | AppLayout left + bottom panels | `prequal-portal` |
| **Review / detail of one record with a decision** | Full page, **Title Bar / Workflow** header (back · name · ID chip · `Status:` chip); content left; **decision or activity in AppLayout's right panel** (sticky, own scroll; as the RFI screen's activity log); below 1024px the panel moves inline under the summary | TabNavigation (P-028) for sections; `PrequalShell` `right-panel` | `prequal-review` |
| **Detail of one record without a decision** (e.g. a Qualification Record) | Same frame as review: Title Bar / Workflow header; record on the left; **activity / audit trail in the right panel**; inline at the end below 1024px. Record-level actions in the title bar's right side | `PrequalShell` `right-panel` | `prequal-record` |
| **Supporting detail for one item on a page that has a right panel** (e.g. evidence for a finding) | Opens **in the right panel**, replacing its content, with a back arrow. The library has no drawer; don't invent one (open question for design) | — | `prequal-review` evidence view |
| **Modal (ModalV2)** | Only for short, single-step tasks that don't need page context to be lost or kept: confirmations, a few fields, a choice. **Not for create flows.** | ModalV2 | `prequal-record` Request renewal (pick documents + message) |

- Alternatives the user wants to compare are kept as a **second prototype slug**, `<slug>-<variant>` (picker title "… (version B: …)"), sharing state and step components with the default so only the pattern differs. Example: `prequal-wizard-modal` (the modal version of New request), sharing `src/prototypes/prequal-wizard/wizardState.js` and `components/`.
- The default slug is always the chosen pattern; links from other screens (`router.js`) go to the default.

## 2. Layout and white space (D-17, D-18)

- **Form and reading content sit in a centred column** on create screens. Don't leave a left-aligned column with empty space on the right unless a right panel fills it.
- **Column width (D-20):** `max-w-4xl` (**56rem / 896px**) for wide forms, meaning two-column field pairs, tables, checklists or summaries (the New request wizard). `max-w-3xl` (48rem / 768px) or narrower for short single-column forms. Basis: ~720px is the common standard maximum for forms, and wider is accepted when a form carries tabular data ([Pega form design](https://docs.pega.com/ui-kit-design-documentation/form-design)). Two columns from about six fields, 24px gutter, one column below 768px. Long help text and paragraphs stay short, because body text reads best at 50–75 characters per line ([Baymard](https://baymard.com/blog/line-length-readability)); if a paragraph runs past two lines at 56rem, shorten it rather than narrowing the form.
- **A fixed footer's buttons align to the content column** (Back / Cancel at the column's left edge, primary action at its right edge); the bar itself spans the content area with its top rule.
- **Whitespace separates sections, not lines or boxes.** Section breaks: a heading plus space (`gap-space-24` to `gap-space-40`); no left rules or indent lines to mark a subsection (removed from DocumentSlot at the user's request).
- **Page / section title needs room below the title-bar rule:** content starts with `pt-space-16` on top of AppLayout's own padding (portal: 36px from the rule).
- **Subsections inside a form get their own 16px bold heading** (repeat / matrix tables use `props.title`), with ~40px between subsections; the 13px form label is not used for a subsection.
- Responsive from 390 to 1440+: rows that pair text with a chip and an action wrap so the text takes the full width on phones (`w-full sm:w-auto sm:flex-1`).

- **Scroll areas (F-051, P-030):** one scrollbar style everywhere, from the global styles (Figma Scrollbar: thin rounded thumb, no track, no arrows); never style one locally. **Padding goes inside the scrolling element** so the bar sits at the panel's edge and content ends at least 16px (normally 20px) before it: AppLayout does this for `scrollable-content`; a custom scroller (`overflow-y-auto`) gets its own `p-space-20`. No content flush with a scrollbar, no nested vertical scroll areas, and horizontal scrolling only inside data grids. Number columns end with the row's own padding, never at the bar.
- **Data tables (DataGrid):** size each column to its widest real content plus the cell padding (measure, don't guess); the name column is `frozen` (pinned left) and the row action is a `type: 'Actions'`, `frozen: true` column (pinned right), so the action stays visible when a wide table scrolls sideways. Don't repeat in one cell what another column already says (e.g. Expiration doesn't restate "No longer active").

## 3. Containers, lines, colour, icons (D-17)

- **One container level per view.** Lists are rows divided by 1px `border-border-subtle` hairlines; the list has no outline of its own. Never a card inside a card. Use FormV2 `flat` (P-021) when the form is the page.
- **Colour means "act here".** Only the primary button and states that need action are coloured. Done = a check mark or a muted word; neutral states = muted words. Red only for knockout / expired / rejected.
- **One signal per status:** a check *or* a word *or* a chip, never two together.
- **Buttons are label-only.** No `+` on Add / New, no Send icon on Submit, no chevrons on Previous / Next / Continue. An icon only where it carries meaning the label lacks (icon-only buttons, the title bar back arrow, a file glyph on a file row).
- **Notices:** warning / error = tinted fill + tone icon, no outline (InlineNotice); info / success = plain text block.

## 4. Components to use (instead of hand-built versions)

| Need | Use | Not |
|---|---|---|
| Multi-value select (trades, regions, sectors) | **SelectV2 `multiple`** (P-024) = Figma Select Menu `Type=Tags` (P-023); FormV2 `multiselect` renders it | FormV2's old hand-rolled chip select (removed, F-039) |
| Step progress | **ProgressStepper** (P-025) | custom dots / numbered lists |
| Create-screen header | Title Bar / Workflow pattern through `PrequalShell` `#header` | Title Bar / Page with a back button added by hand |
| Step navigation bar | AppLayout bottom panel (`PrequalShell` `bottom-panel`) | buttons at the end of a long scroll |
| Page sections as tabs | **TabNavigation** (P-028) | SegmentedControl (that's for view modes) |
| A value compared across sources | **EvidenceComparison** (candidate) | ad-hoc tables |
| A right panel from `PrequalShell` | `right-panel` prop (sets enabled **and** visible, F-046) | AppLayout `right-panel-enabled` alone (stays hidden) |
| Upload zone | library DropArea (icon 36px, 2px stroke, `border/default`, outline browse button, P-020) | — |

## 5. Open design flags (don't "fix" in code without a decision)

- Figma Number Badge `Status=Disabled` loses its number in Dark mode; code renders it readably (needs-figma). (Chip `Style=Solid` had the same problem; fixed in Figma 2026-10-09, P-029 / F-050, visible in other files once the library is published.)
- Figma Modal has no wide size; Title Bar / Workflow has no module-neutral Create variant (needs-figma).
- No content-width token: the form columns use Tailwind `max-w-4xl` / `max-w-3xl` (needs-token: `layout/form-wide`, `layout/form`).
- ProgressStepper active label is bold in code, Regular in Figma (P-025, for design).
