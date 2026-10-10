---
name: prd-to-prototype
description: Build a module screen in linarc-prototypes from the written spec (no Figma frame yet), using the design system, candidate components for what's missing, then push an editable Light + Dark reference to Figma. Use for the Prequalification module screens, or any request that names a screen from docs/prequal/screens.md or a PRD rather than a Figma URL.
---

# PRD → prototype → Figma reference

Stack and rules: `CLAUDE.md` (always-on rules, change policy, token table, candidate-component rules). This skill is the workflow. When design hands a Figma frame back for a screen, switch to `figma-to-prototype` for that revision.

## 0. Read (every session, before planning)

1. `docs/prequal/00-plan.md` → open questions and decisions. **Don't build against an unanswered question that changes the screen; ask.**
2. `docs/prequal/spec.md` (not the raw `docs/prd/` files; they're long transcripts), `docs/prequal/status-model.md`, the screen's row and section in `docs/prequal/screens.md`.
3. `docs/components/README.md` → which candidates exist already and at what stage. `src/modules/prequal/` → shared status vocabulary and mock data.
4. The previous screen's record in `docs/prototypes/` for conventions already chosen.
5. **`docs/5-ui-patterns.md`**: the page pattern for each kind of task (create = full-page with Title Bar / Workflow, not a modal), layout, white space and visual rules the user has already decided. Don't re-open them.

## 1. Scope the screen

Write, in the prototype record (`docs/prototypes/<slug>.md`, from `_template.md`, started now, finished in step 7):
- Persona and what they must decide on this screen (one sentence each).
- Nav position (module › tool › rail item; D-13) and the page title.
- Data the screen needs: which shared entities (`requests`, `companies`, `findings`, `documents`, `records`) and which status dimensions.
- The Figma pattern to use for each interaction (modal vs drawer vs panel, table vs list, toasts). Start from `docs/5-ui-patterns.md` (e.g. create flows are full-page screens, not modals); then the V3.2 library's existing product screens in the Documentation file; if none fits, **stop and ask** rather than inventing one.

## 2. Component map

For every element on the screen, one line: element → `existing` (library component + props) / `extend` (library component + the additive change, gets a P-row) / `candidate` (name, proposal doc). Rules:
- Check `@/componentsV2` first, then `@/components`, then the Figma component list (`get_metadata` on the V3.2 file's component pages or `search_design_system`), then the backlog, before calling anything a candidate.
- A variant of an existing component is an **extend**, not a candidate.
- Each candidate gets `docs/components/<Name>.md` (template `_template.md`) **before** it's built, and a row in `docs/components/README.md`.
- Count them. If a screen needs more candidates than the previous one, say so in the record; the component boundaries probably need rethinking.

## 3. Data

- Shared, module-wide mock data lives in `src/modules/prequal/data/` and the status vocabulary in `src/modules/prequal/status.js`. Screens import from there; a row on the dashboard must lead to the same company on the review screen and the record.
- Every status rendered on screen comes from `status.js` (label + tone); never a string literal in a template.
- Realistic construction subcontractors, trades, CSI divisions, dollar values and dates; fictional names; marked `// PLACEHOLDER DATA`.
- Role-restricted fields (score, confidence, financials) are present in the data and gated in the view by a `role` value, so the same prototype can show Reviewer and Estimator views.

## 4. Build

- Create `src/prototypes/<slug>/index.vue` (start from the previous screen). `prototype: { title: 'Preconstruction › Prequalification › <Item>', figma: '' }` until the Figma reference exists; then put the Light frame URL there.
- Shell: `~/modules/prequal/PrequalShell.vue` (Preconstruction top nav, Prequalification rail, `AppLayout`; props `screen` and `title`, slots `header-actions`, `content`, `right-panel`). Cross-screen links go through `~/modules/prequal/router.js` (`go(screen, id)` / `href(screen, id)`): each screen keeps its own slug, the record id travels in the hash, so `yarn shot <slug>` and the picker keep working. The subcontractor portal has no Linarc nav (external user) and doesn't use the shell.
- Pass 1 with existing components only; candidates are stubbed with the nearest existing component so the page works end to end. Pass 2 builds the candidates in `src/candidates/<Name>/` and swaps them in.
- Everything else as `CLAUDE.md`: Vue 2.7 Options API, tokens only, responsive 390 → 1440+, both themes, icons from `@development/linarc-icons`.

## 5. Verify (required before reporting done)

Same as `figma-to-prototype` step 5: `yarn shot <slug> <scratchpad>/shots` exits 0 with no overflow warnings; inspect all six captures; spot-check 2–3 computed values; run the state-change check on any new interactive candidate (no size change at rest / focus / pressed). Plus for this workflow:
- Every status value in the data renders with text and tone (loop the data; no unmapped status).
- Both roles render (toggle `role` in data) with the restricted columns hidden for Estimator/PM.
- Dark mode of each candidate uses tokens that pass the dark audit rules (`PRPs/figma/scripts/23-dark-mode-audit.js` thresholds: text ≥ 4.5:1, icons ≥ 3:1 on `surface/container`).

## 6. Push to Figma (editable reference)

Target: Documentation file `9ANM41f3QwNjt27Sl08i8O`, page **Draft** (`3572:57686`), to the right of the existing frames. Produce a Light and a Dark copy. Procedure that worked (2026-10-08, record in `docs/prototypes/prequal-requests.md`):

1. **Start from the nearest existing screen** on that page and clone it (`node.clone()`), rather than composing from scratch: `Precon › Prequalification › Requests — Light` (`3726:76047`) has the Precon shell, title bar, toolbar and data table already as library instances. Rename, move to clear space.
2. **Swap and set properties** through the library sets (all published, import with `importComponentSetByKeyAsync`): Top Nav Bar `214148172a3102db4d886021f46636c4c06a409c` (variant `Module=Preconstruction`), Side Nav Preconstruction `f3ee73389c0c6171750f81976ca0b0d4b8edac65` (`Selected=…`, rail rows are `Side Nav Icons` instances with `State`), Title Bar / Page `352b8ee7d08099fc9ca86b57acaf0f8c66ddee12` (`Title#…`, Button `Label#…`), Grid Primary Toolbar `d3b264181ce98895d7192c3f434f50c40fcd26c9`, Data Table / Header `c02b4fcc7103c7dccf34378ff3d7a623e62327d6`, Data Table / Cell `e9034498a4e881d69878eb249ef95bce12e25f29` (`Type=Text | S.No | AI Chip + Text | …`).
   - Nested instances are addressed as `I<instanceId>;<childId>`; `findOne` won't reach them. Don't call `resetOverrides()` on a nested instance (it drops its variant); reset children individually.
   - The Preconstruction top nav ships with Bidding selected in teal; to select another tool, set `State=Selected` on its `Navbar Tools Icon`, then rebind its vector strokes to `border/accent/teal` and the label to `text/accent/teal` (the Selected variant's default is orange), and put Bidding back to `border/subtle` / `text/muted`. Hide the `Bookmarks` quick link (`visible = false`).
3. **Candidates** are built as components in the **V3.2 library file** (`1HxMANBEaYWFqEFtazB20l`) on the page **`_Candidates`** (create it if missing; the `_` prefix keeps the page out of library publishing). `figma.createComponent()` (a set with variants when there are states) with auto-layout, every fill / stroke / gap / radius / text colour bound to that file's local `mapped` and spacing variables (`getLocalVariablesAsync`), text in **Lato** (load the style first), `description` from the proposal doc. Return the component IDs and put them in the proposal doc.
   An unpublished page can't be imported into the Documentation file, so on the reference screen a candidate appears as a **plain frame named `[candidate] <Name>`** built with the same bindings (variables there are the library's, imported by key). Note the pairing in the prototype record. When the component is promoted and published, replace the frame with a real instance.
4. **Modes:** the `mapped` collection (reach it via `surface/page`, key `6ca26c24f8992d1097aded2f5a99453ec0a1cfe4`) has `Light` and `Dark`. `light.setExplicitVariableModeForCollection(col, lightModeId)`; clone, rename `— Dark`, set Dark; set `Branding / Logomark` `Mode=Dark` on the dark copy.
5. **Check:** one `get_screenshot` per copy; a read-only count of node types and image fills (the only image fill should be the library toolbar's divider line). Record node IDs in the prototype record and set `prototype.figma` in the `.vue`.

Figma shows the library **as last published**; variable fixes pending publish won't appear. Say so in the report.

## 7. Record

1. Finish `docs/prototypes/<slug>.md`: metrics (measured or "not measured"), component map with how each gap was handled, candidate list, verification results, Figma node IDs.
2. `docs/prequal/screens.md`: status column and any decided TBDs. `docs/components/README.md`: stage per candidate. `docs/prequal/00-plan.md`: answers received, decisions made.
3. `docs/findings-log.md` entry for anything that broke, surprised, or worked notably well.
4. Report: URL (`/?p=<slug>`), both Figma links, the component map summary (n existing / n extended / n candidates), what needs a decision, and what Figma won't show until the library is published.
