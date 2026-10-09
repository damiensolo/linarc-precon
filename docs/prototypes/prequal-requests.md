# Preconstruction › Prequalification › Requests (`prequal-requests`, formerly `registry-list`)

- **Date:** 2026-10-06
- **Figma:** https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=1708-58317 (Package list, 1440×1024)
- **URL:** `/?p=prequal-requests` (add `&chrome=0` for a full-window comparison)
- **Status:** done. First full-layout test of the workflow.

## Metrics
| Measure | Value |
|---|---|
| Time from Figma link to first render | ~10 min (link 15:28:57; first clean render after three sandbox fixes) |
| Time to verified done | 13 min (15:28:57 → 15:42:01) |
| Components used (library / forked / new) | 8 library (TopNavBar, SideNavV2, AppLayout, StatusIndicator, Button, DataGrid, linarc-icons, DateCell) / 0 forked / 1 prototype-local slot (AI chip) |
| Gaps found | 14 (6 library-vs-Figma, 4 Figma, 3 sandbox, 1 publishing) |
| Verification rounds before passing | 4 (datepicker SCSS 500 → `process` undefined → clean → Admin tool removed) |
| Computed-value checks (pass/total) | 14/18; the 4 failures are library-vs-Figma mismatches, listed below |

## Components
- **TopNavBar:** module Document (`DocsModuleIcon`); Bookmarks and Create; tools Plans, Cloud Drive, RFI, Submittals (`isSelected`), Specbook, Configure; `isAdmin: false`; Northern Heights context with a location dropdown; account icons. Collapses to the hamburger drawer at 390px.
- **SideNavV2:** Submittals rail with Registry selected. Hidden below `md`.
- **AppLayout:** `#header` "Registry", `#header-actions` with StatusIndicator (dot, active), italic label and the Create Package Button (md, primary solid, `Plus` icon). Default content padding (20 / top 8) matches Figma exactly.
- **DataGrid:** list view; Sequence column (number plus hover checkbox, select-all); 6 columns at Figma widths; `DateInput` for Created On; views strip and "+"; print, template, download and settings; `rowHeight` 40.
- **AI chip:** prototype-local `AiChipSlot`, registered through DataGrid's public `registerSlotType`, with tokens taken from the Figma node.

## Computed values compared with Figma variables
| Element | Figma | Rendered | |
|---|---|---|---|
| Top nav height | `space-72` | 72 | ✅ |
| Create Package button | h `space-32`, `surface-primary-default` #2563eb, `radius-4`, Medium 14, p `space-8` | 32, rgb(37,99,235), 4px, 500 14px, 8px | ✅ |
| Content inset | toolbar at x+20, y+8 | x+20, y+8 | ✅ |
| Row height | `space-40` | 40 | ✅ |
| Cell text | body/xs/regular, `text-default` | 400 12px, #18181b | ✅ |
| AI chip | h 24, r round, p 8, gap 4, `fills/violet` #f5f3ff, `text/accent/violet` #8b5cf6, SemiBold 12, 16px icon | 60×24, 1024px, 8px, rgb(245,243,255), rgb(139,92,246), 600 12px, 16px | ✅ |
| Title bar height | `space-56` | 48 | ❌ library |
| Table header height | 44 | 40 | ❌ library |
| Header / cell horizontal padding | `space-24` | 8 | ❌ library |
| Header text colour | `text-soft` #6b7280 | `text-subtle` #52525b | ❌ library |

## Gaps and how they were handled
| Gap | Handling | Log ID |
|---|---|---|
| No "AI Chip + Text" cell type in DataGrid | Prototype-local slot via `registerSlotType`; library candidate | P-002 (needs-review) |
| DataGrid list header 40 (Figma 44), cell padding 8 (Figma 24), header text `text-subtle` (Figma `text-soft`) | **Asked**: would change every list table in production | P-003 (needs-review) |
| AppLayout header 48 (Figma Title Bar / Page 56) | **Asked**, same reason | P-004 (needs-review) |
| DataGrid toolbar row hard-codes `bg-white` / `text-gray-*`, so it stays white in dark mode | Reported (token-rule violation) | P-005 (needs-review) |
| `--surface-side-nav` dark value is slate #64748b | Reported (token / design question) | P-006 (needs-token) |
| DataGrid toolbar not responsive: right cluster overlaps the view strip at 390px; Figma has "Type=Responsive" with an overflow menu | Reported | P-007 (needs-review) |
| DataGrid hides Highlight in list view; Figma shows it | Reported | P-007 |
| TopNavBar uses `<Teleport>` (Vue 3) in a Vue 2.7 library | Sandbox shim renders it inline | P-008 (needs-review) |
| View-type strip icons differ from Figma's set | Reported, minor | — |
| Workflow Status label: Figma italic 11px, unbound and off the type scale | Used `fontsize-12`; Figma fix needed | F-018 |
| AI chip has a 0.5px **green** `border/success` stroke in Figma | Omitted; likely a Figma slip | F-018 |
| ACTION column collapsed to 1px in Figma | Not built; confirm intent | F-018 |
| Side nav icons for Registry and Logs not confirmed (Code Connect not published) | Inferred lucide icons | F-014 |
| Code Connect not published to Figma: `get_design_context` reports no mappings | Read instance data with a script instead | F-014 |

## Verification
- `yarn build` passes. `yarn shot registry-list … 1440,1024,390 1024` exits 0: no console errors, no failed requests, no page overflow.
- Light at 1440 matches Figma in structure, content, typography and colour, apart from the four ❌ rows above.
- Dark mode shows two library issues (toolbar row, side nav colour).
- At 390px the nav collapses correctly; the toolbar overlaps (P-007) and the table scrolls horizontally.

## Follow-up (2026-10-06, same day)
- **P-003 / P-004 resolved by aligning Figma to code** (D-11). Re-measured: header 40, padding 8, header text `text-subtle`, title bar 48 now match the updated Figma.
- **P-002 done:** the AI chip is the library's StatusChip (`status: 'ai'`) via the new `status-chip` slot; the prototype-local slot is deleted. Rendered chip: 62×24, rgb(245,243,255) / rgb(139,92,246), round, 600 12px, 16px icon. Figma's variant is 69 wide because Status Chip labels carry 4px padding in Figma only (P-010).
- **Code Connect published** (P-009): all 156 instances on this frame now resolve to components.
- After this follow-up, every library-vs-Figma mismatch from the first pass is closed except P-005 to P-008 and P-010 (still needs-review).

## Findings
F-014, F-015, F-016, F-017, F-018, F-019, F-020, F-021, F-022, F-023.

## Screenshots
`docs/case-study/assets/F-017-figma-registry-list.png` (target), `F-017-registry-list-1440-light.png`, `F-017-registry-list-1440-dark-toolbar-sidenav.png`, `F-017-registry-list-390-toolbar-overlap.png`.

## Follow-up (2026-10-07): Finance › Prequalification shell
- **Top nav:** `Module=Finance-SC` (1HxMANBEaYWFqEFtazB20l 40015592:242478). Finance module icon; tools Bidding (new, `Gavel`), Contract (selected, `text-accent-green` as in Figma), Monthly Billing, Change Orders, T&M, Recurring cost, Costs, Analytics, Configure. Bookmarks hidden (`needBookmarks: false`). At 1440 the library moves Analytics and Configure into "More".
- **Side nav:** Side Nav Finance, Contract rail (`Selected=Budget`, 40015720:14968) with Prequalification added first and active (`ClipboardCheck`).
- **Title bar:** "Prequalification". Table content is unchanged from the registry layout.
- Icons are the closest Lucide shapes; Figma's Finance icons aren't in linarc-icons (F-026).
- `yarn shot` at 1440 / 1024 / 390 exits 0 with no overflow warnings.
- **Revision (same day):** Bidding is the active tool (green); Contract is default. The side nav label is "Prequal" (screen readers still read "Prequalification"), replacing the soft-hyphen break. The main CTA is "Add Contractor". `yarn shot` passes again.

## Follow-up (2026-10-07): Preconstruction module (D-13)
- **Nav:** Preconstruction module (teal, "Precon" rail label) with Bidding, Prequalification (active), Directory, Configure. Each tool has its own side-nav rail; clicking a tool switches the rail and the title follows the selected item. The page is **Prequalification › Requests**; the table is still the registry placeholder.
- **Figma (P-014):** new variants in Module Icon / Selector, Top Nav Modules, Top Nav Bar / By Module and Top Nav Bar; a new Side Nav Preconstruction set; 11 Preconstruction Module icon sets; 7 new ☉ Icons masters. Descriptions written on every new or changed set.
- **Code (P-014):** `PreconstructionModuleIcon`, a Storybook story, Code Connect for every new node (published; all rails resolve to real icons).
- **Verification:** `yarn build` passes; `yarn shot` at 1440 / 1024 / 390 exits 0 with no overflow warnings; tool clicks checked with puppeteer (Bidding → Bid Projects, Directory → Companies, Configure → Templates, no page errors).
- Findings F-027, F-028.
- **Dark mode (2026-10-07):** toolbar row and right-cluster buttons now use Figma's tokens (P-005); side nav dark background fixed at the variable (P-006). Figma docs on the Navigation Bar page now include Preconstruction (module list, Properties, a Preconstruction block, side-nav rail list and its own icon group). F-030.
- **Dark mode, part 2 (2026-10-07):** row hover, view-type hover and every DataGrid popover now follow the theme (P-016). F-031.
- **Dark mode, part 3 (2026-10-07):** system-wide variable audit and fixes (P-017, F-032). The page is consistently dark; the AI chip is the one open item.
- **Pushed to Figma (2026-10-08):** editable Light and Dark copies of this screen on the Documentation file, Draft page (nodes 3726:76047 and 3726:77558). Built from the library: Top Nav Bar Module=Preconstruction (Prequalification selected in teal, Bookmarks hidden), Side Nav Preconstruction Selected=Prequalification (Requests selected), Title Bar / Page ("Requests", "Add Contractor"), Grid Primary Toolbar and Data Table header/cell instances. The Dark copy sets the `mapped` collection to Dark. Updating the library updates both copies.
