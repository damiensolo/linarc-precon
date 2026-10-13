# Findings log

Append-only. Newest at the bottom. One entry per finding, using the template below. Don't edit old entries except to add a `Resolved:` line.

```
## F-NNN · YYYY-MM-DD · <short title>
Tags: figma | tooling | design-system | ai-workflow | security
What happened:
Why it mattered:
How it was caught:
What changed: (playbook / code / Figma / docs; link log IDs like P-NNN)
Case study: Y/N, with the one-line lesson if Y
```

---

## F-001 · 2026-10-06 · Registry access tokens in plain text
Tags: security, tooling
What happened: `.npmrc` held three live GitLab personal access tokens.
Why it mattered: anyone with a copy of the folder (zip, share, accidental push) gets registry access.
How it was caught: the initial readiness review of the prototype sandbox.
What changed: tokens removed; the registry config now reads `GITLAB_NPM_TOKEN` and is commented out (see F-011). The tokens need rotating.
Case study: Y. Audit the sandbox before trusting it. Prototyping repos get copied around more than product repos.

## F-002 · 2026-10-06 · Two copies of Vue
Tags: tooling
What happened: library files resolved `vue` from the library's own `node_modules`, while the app used the sandbox's copy.
Why it mattered: components that depend on Vue plugins (portal-vue, vuex, v-click-outside) break in subtle ways with two Vue instances. The simple Radio demo hid the problem.
How it was caught: code review of how the Vite alias resolves imports.
What changed: `resolve.dedupe: ['vue']` in `vite.config.mjs`. Bundle verified to contain one Vue.
Case study: N

## F-003 · 2026-10-06 · Dev-only crash: CommonJS Tailwind config imported by a component
Tags: tooling, design-system
What happened: `src/utils/Colors.js` imports the library's CommonJS `tailwind.config.js`. The production build converts it, but the dev server serves it raw, so the page rendered blank.
Why it mattered: `yarn build` passed, so the setup looked healthy, and the original Radio demo was probably broken in dev all along.
How it was caught: a headless browser render with console capture, not just a build.
What changed: a small Vite plugin re-exports the config as ESM. Rendering in dev is now part of verification.
Case study: Y. "It builds" isn't "it works": render it and read the console.

## F-004 · 2026-10-06 · Production stylesheet not loaded, and it breaks dark mode
Tags: design-system
What happened: the sandbox loaded only `tokens.css`, not the library's `global.css` (scrollbar primitives, base type, body styles) that production apps get. `global.css` also hard-codes `body { color: #06152b }`.
Why it mattered: prototypes would render differently from the product, and loading `global.css` naively would break dark mode.
How it was caught: comparing the sandbox's CSS entry with the library's build entry (`build.js`).
What changed: `style.css` imports `global.css`, then rebinds `body` to tokens.
Case study: N

## F-005 · 2026-10-06 · Wrong import in a Code Connect example
Tags: design-system, ai-workflow
What happened: the demo page showed `import { Radio } from '@development/linarc-design-components'`, but the library only has a default export.
Why it mattered: copy-paste code from documentation would return `undefined`. AI agents copy patterns they see.
How it was caught: checking the export shape of `build.js`.
What changed: CLAUDE.md states the correct import form explicitly.
Case study: Y. Every example the agent can see is training data for its next answer. Wrong examples spread.

## F-006 · 2026-10-06 · 8 MB stylesheet from a catch-all safelist
Tags: design-system, tooling
What happened: the library's Tailwind config safelists `/.*/`, so every possible utility is generated.
Why it mattered: slow builds and a heavy dev stylesheet, but it exists because components build class names at runtime.
How it was caught: build output size.
What changed: nothing (kept on purpose to match production). Logged as a library-level improvement for later.
Case study: N

## F-007 · 2026-10-06 · Figma variable names don't match code class names
Tags: figma, design-system, ai-workflow
What happened: Figma exposes `--space-8`, `--font-size-16` and `--surface-primary-default`. Code uses `gap-space-8`, `text-fontsize-16` and `bg-surface-primary`.
Why it mattered: without a mapping, the agent re-derives (or guesses) each translation every session.
How it was caught: comparing `get_variable_defs` output with `tailwind.config.js`.
What changed: a Figma-variable → Tailwind table in CLAUDE.md, loaded every session.
Case study: Y. Write the translation layer down once. Don't make the agent rediscover it.

## F-008 · 2026-10-06 · Code Connect files are the bridge from Figma properties to props
Tags: figma, ai-workflow
What happened: each library component has a `*.figma.js` mapping Figma properties (Size, Hierarchy, Type, State) to component props.
Why it mattered: it lets the agent turn a Figma instance into the right component call without guessing prop names.
How it was caught: found during setup.
What changed: the skill tells the agent to read the Code Connect file before using a component.
Case study: Y. Code Connect isn't just for Dev Mode; it's machine-readable intent for agents.

## F-009 · 2026-10-06 · Inconsistent Icon Button variants in Figma
Tags: figma, design-system
What happened: a manual fix had changed 7 of the 30 md Icon Button variants. The other 23 still had an unbound 20px icon, all md strokes were inconsistent with sm, and the component set description was out of date.
Why it mattered: code built from any one variant would have been "accurate" to an inconsistent source.
How it was caught: a scripted read of all 90 variants (size, bound variable, stroke), not a visual check.
What changed: all md variants set to 18px bound to `spacing/space-18`, strokes scaled to 1.125px, description updated. Code changed to match (P-001).
Case study: Y. Audit variants with scripts; eyes miss 23-of-30 inconsistencies. Bind sizes to variables so they can't drift.

## F-010 · 2026-10-06 · Headless screenshots weren't at the requested width
Tags: tooling
What happened: headless Edge on Windows has a minimum window size, so a "390px" capture was really a 492px viewport, cropped.
Why it mattered: mobile verification was silently false. A real overflow (the sandbox top bar) was hidden.
How it was caught: measuring `innerWidth` inside the headless page after a screenshot looked wrong.
What changed: `yarn shot` (puppeteer-core + installed Edge) sets exact viewports, takes full-page captures, catches console errors and reports horizontal overflow.
Case study: Y. Verify your verification tools.

## F-011 · 2026-10-06 · Yarn fails when a token variable is unset
Tags: tooling
What happened: after moving the token into `${GITLAB_NPM_TOKEN}`, every `yarn` command failed because the variable wasn't set.
Why it mattered: it blocked installing dev tools.
How it was caught: `yarn add` failed.
What changed: the registry lines are commented out, with instructions for turning them back on.
Case study: N

## F-012 · 2026-10-06 · Wiring test: computed values match Figma exactly
Tags: ai-workflow, design-system
What happened: a test page (md buttons, md icon button, radio, checkbox in AppLayout) was compared against Figma variables: 32×32 button, 18px icon, #2563eb background, 4px radius.
Why it mattered: it proves the chain Figma variable → CSS token → Tailwind class → rendered component is lossless.
How it was caught: a computed-style readout compared against `get_variable_defs`.
What changed: computed-value spot checks became a required verification step.
Case study: Y. Prove accuracy with numbers, not screenshots alone.

## F-013 · 2026-10-06 · Agent instructions: one source of truth, loaded at the right time
Tags: ai-workflow
What happened: we needed rules for the agent in Claude Code and in Cursor's agent, without duplicating them.
Why it mattered: duplicated rules drift. Long always-loaded rules cost context on every task.
How it was caught: design discussion while drafting a `.cursorrules` file.
What changed: always-on rules in CLAUDE.md; the step-by-step Figma workflow as a skill that loads only when needed; the Cursor rule points to both.
Case study: Y. Split "always true" from "how to do X", and let the tooling load each when it's needed.

## F-014 · 2026-10-06 · Code Connect exists in the repo but isn't published to Figma
Tags: figma, ai-workflow
What happened: on the Documentation file, `get_design_context` reported "missing code connect mappings" for every instance (TopNavBar, SideNav, Title Bar, Grid Toolbar, Data Table), although the library has a `.figma.js` for each.
Why it mattered: the agent loses the shortest path from a Figma instance to the component call. Unconfirmed details such as side-nav icon names had to be inferred.
How it was caught: the first design-context call on a product screen.
What changed: a scripted read of instance names and variant properties, matched against the local `.figma.js` files, which worked. Publishing Code Connect (`yarn figma:publish` in the library) is now an open action and a readiness checklist item.
Case study: Y. Code Connect only helps the agent once it's published.

## F-015 · 2026-10-06 · Complex components exposed webpack-only assumptions in the library
Tags: tooling, design-system
What happened: simple components worked, but TopNavBar and DataGrid needed four more sandbox fixes:
- bare imports of library dependencies (`portal-vue`, `moment`) from prototype files;
- `~package` SCSS imports (`datepicker.scss`), which returned a 500;
- `process.env` reads (`process is not defined`);
- global plugins the library's `install()` normally registers (PortalVue, `$moment`).
Why it mattered: the wiring test passed while full layouts couldn't render. Each failure appeared only at runtime, one at a time.
How it was caught: `yarn shot` once it logged failing request URLs (F-019).
What changed: in `vite.config.mjs`, a dependency fallback resolver, a `~pkg` alias and a `process.env` define; in `main.js`, the same globals as the library's `install()`. Playbook step 3 updated.
Case study: Y. A wiring test with simple components doesn't prove the complex ones; test with the heaviest component early.

## F-016 · 2026-10-06 · TopNavBar uses Vue 3's `<Teleport>` in a Vue 2.7 library
Tags: design-system
What happened: TopNavBar and ToolsItem render `<Teleport>`, which Vue 2.7 doesn't have and the library never registers.
Why it mattered: an unknown-element warning, and the drawer and dropdowns mount inline instead of in `body`.
How it was caught: code review while building the first full layout.
What changed: a sandbox shim in `main.js`; logged for the library as P-008.
Case study: N

## F-017 · 2026-10-06 · First full layout: 13 minutes to verified, with library-vs-Figma mismatches isolated
Tags: ai-workflow, design-system
What happened: the Registry list page (top nav, side nav, title bar, grid toolbar, 18-row table) was built only from library components and checked numerically. 14 of 18 measured values matched Figma exactly. The 4 failures are all in library defaults: DataGrid header 40 vs 44, cell padding 8 vs 24, header text colour, and AppLayout header 48 vs 56. Dark mode exposed hard-coded `bg-white` in the DataGrid toolbar and a slate side-nav token; 390px exposed a non-responsive toolbar.
Why it mattered: every remaining difference traces to a specific library or token decision, not to the prototype, so it's actionable for engineering.
How it was caught: computed values compared against `get_variable_defs`, plus the three-width, two-theme capture.
What changed: P-002 to P-008 logged as needs-review / needs-token in the library change log.
Case study: Y. The workflow turns "looks a bit off" into a list of exact, owned library fixes.

## F-018 · 2026-10-06 · Figma product-screen issues that affect code accuracy
Tags: figma
What happened: on the Package list frame:
- the Workflow Status label is italic 11px, unbound and off the type scale;
- the AI chip has a 0.5px green `border/success` stroke on a violet chip;
- the ACTION column is collapsed to 1px.
Why it mattered: each one is either impossible to express in tokens or ambiguous in intent.
How it was caught: a scripted read of the nodes' bound variables.
What changed: nearest token used, stroke omitted, column not built; all reported. Readiness checklist gains "no off-scale or unbound type sizes".
Case study: N

## F-019 · 2026-10-06 · The screenshot tool needed three more features for full layouts
Tags: tooling
What happened: (1) the sandbox top bar pushed the page down, so captures didn't match the Figma frame; (2) the viewport height was fixed at 900, but the frame is 1024; (3) failing requests were logged without URLs, which hid the cause of a 500.
Why it mattered: you can't compare a page with Figma pixel-for-pixel, or debug it, without these.
How it was caught: the first full-layout run.
What changed: `?chrome=0` (used automatically by `yarn shot`), a `[height]` argument, and failing request URLs in the output.
Case study: N

## F-020 · 2026-10-06 · One stale template had silently blocked every Code Connect publish
Tags: figma, ai-workflow, tooling
What happened: Code Connect looked "done" (135 templates, a publish script), but three templates pointed at Figma components that had since been deleted. `figma connect publish` validates every file and publishes nothing if any fails, so recent mappings never reached Figma (F-014).
Why it mattered: the agent saw zero mappings on a real product screen.
How it was caught: running `figma:publish:dry` instead of assuming the earlier publish still held.
What changed: the stale templates moved to `held-templates/stale-nodes/`; dry run, `figma:check` and publish pass (1,212 mappings). Verified with `get_code_connect_map`: 156 of 156 instances on the Registry screen now resolve. P-009.
Case study: Y. "Set up" isn't "live": verify publishing from the agent's side, and treat a failed dry run as a blocker.

## F-021 · 2026-10-06 · Decision: for library defaults, code is the source of truth
Tags: figma, design-system
What happened: on the 4 mismatches from F-017, the decision was to move Figma to the code's values: Data Table header 40px, cell side padding 8px, header text `text/subtle`, all title bars 48px.
Why it mattered: the components are already live in production; changing code would ripple across every table and page, while Figma changes reach designs through the library update.
How it was caught: the computed-value comparison (F-017).
What changed: 6 header and 12 cell variants, 3 header text layers and 23 title bar variants updated and bound to variables. 3,011 template instances inherited the change with no overrides. P-003, P-004, D-11.
Case study: Y. Pick the source of truth per decision, then make the other side match exactly, with variables.

## F-022 · 2026-10-06 · Cloning a variant drops its component-property links
Tags: figma
What happened: new Status Chip `Status=AI` variants made by cloning the Success variants looked right but lost their links to Label, Icon L, Show Icon L and Show Icon R. Setting those properties on an instance did nothing.
Why it mattered: a variant that ignores its properties breaks reuse and Code Connect, silently.
How it was caught: an instance kept the default map-pin icon after Icon L was set to the sparkle.
What changed: links copied node by node from the source variant (`componentPropertyReferences`). Readiness checklist updated.
Case study: N

## F-023 · 2026-10-06 · Missing Figma components belong in the system, not the prototype
Tags: design-system, figma
What happened: the AI chip (P-002) started as a prototype-local slot. It's now a Status Chip variant in Figma, an `ai` status in StatusChip.vue, and a reusable `status-chip` DataGrid slot, mapped by Code Connect. The prototype uses the library and the local workaround is deleted.
Why it mattered: the next screen with an AI chip gets it for free, and Dev Mode shows the right snippet.
How it was caught: n/a (planned follow-through).
What changed: P-002 done. A remaining system-wide difference was found along the way: Figma Status Chip labels have 4px padding and code doesn't (P-010, needs-review).
Case study: Y. Gaps found while prototyping flow back into the system on both sides.

## F-024 · 2026-10-07 · Deciding which side is right: use the sibling component as tie-breaker
Tags: figma, design-system
What happened: Status Chip disagreed with code in opposite directions. Text-only chips: Figma 8px vs code 16px. Icon chips: Figma had 4px label padding, code had none. The sibling Chip settled it: in code it pads icon labels by 4px (Figma's pattern), while StatusChip's 16px text-only padding is documented in its spec and live in production.
Why it mattered: "code wins" or "Figma wins" as a blanket rule would have been wrong in one of the two cases.
How it was caught: comparing both chip types, then the sibling component, in code and Figma.
What changed: Figma aligned for text-only chips and vertical padding (P-012); a code change request for icon-chip labels (P-010); a tree-indent code request (P-011: code 20px vs the 16px grid step). D-11 refined.
Case study: Y. Code wins by default, unless the code contradicts its own component family; then the code gets a change request.

## F-025 · 2026-10-07 · Fixed heights hide wrong padding values in Figma
Tags: figma
What happened: Status Chip declared `space-8` vertical padding, but its fixed 24px height rendered 4px. Sheet "Status Chip" and "Priority Indicator" cells have the same pattern (8 + 24 + 8 inside a fixed 36). One chip variant was fixed-width (89px) instead of hugging (81px).
Why it mattered: the agent reads declared variables. A declared 8 that renders as 4 gets translated into the wrong code value.
How it was caught: comparing declared padding with child positions before and after rebinding.
What changed: Status Chip rebound to what it renders (no layer moved). The readiness checklist gains "declared padding must equal rendered padding; hug unless fixed is intended". The sheet Status Chip and Priority Indicator cells were rebound the same way (space-4, centred). They had rendered centred all along, so nothing moved; only the declared values were wrong.
Case study: N

## F-026 · 2026-10-07 · Module icons in Figma aren't in the icon package
Tags: figma, design-system
What happened: switching the shell to Finance (SC), the top nav tools and the Finance side nav use custom icons (`Finance/Prime Contract`, `Finance Module / Icon 3`, …). `@development/linarc-icons` exports only the module logos, not these, so the prototype uses the closest Lucide shapes. The long label "Prequalification" also overflowed the fixed 82px side-nav rail: labels wrap only at spaces, so one long word clips.
Why it mattered: the rendered icons differ slightly from Figma, and real product labels can clip.
How it was caught: reading the Figma icon component names, then the 1440 screenshot.
What changed: Lucide substitutes are documented in `registry-list/data.js`. The label was shortened to "Prequal" (a soft-hyphen break was tried first and rejected as still looking cut off). Library candidates (not logged as changes yet): export the Finance/Document module icon sets, and let SideNavV2 labels break long words.
Case study: N

## F-027 · 2026-10-07 · Adding a module to the nav system touches eight places
Tags: figma, design-system, ai-workflow
What happened: one new module (Preconstruction) needed: a module tile variant, four top-nav sets (tile, tool strip, module strip, full bar), a new side-nav set, 11 icon sets for the selected-state tiles, 7 new ☉ Icons masters, a code module icon, four Code Connect templates plus a new one, and two icon registries.
Why it mattered: miss one and the design looks finished but Dev Mode shows placeholders. First publish: every rail's selected row came out as `OverviewIcon`, because a selected row only exposes its "Icon Solid" swap and the template only read "Icon Line".
How it was caught: `get_code_connect_map` on each new set after publishing, not just `figma:check` (which passed).
What changed: P-014. The Preconstruction template falls back to "Icon Solid". The other side-nav templates (Finance, Document, …) have the same gap for their selected rows; not changed here.
Case study: Y. "Validation passes" isn't "Dev Mode shows the right code": read back the published snippet.

## F-028 · 2026-10-07 · Figma clone gotchas: overrides survive a variant swap, grids stack clones
Tags: figma, tooling
What happened: (1) A full Top Nav Bar cloned from Finance kept Finance's tool labels and icons after its nested strip was swapped to Module=Preconstruction, because the overrides carried over by layer id. `resetOverrides()` on the nested strip also reset its variant property; resetting each tool cell instead worked. (2) Sets cloned into a GRID frame all landed in one cell, stacked on top of each other. (3) Long single words ("Preconstruction", "Prequalification", "subcontractors") break mid-word in the 82px module and side-nav rails, in Figma and in code.
Why it mattered: the screenshot looked plausible at a glance; the stale labels only showed up on a close read.
How it was caught: a screenshot after every structural write.
What changed: rail labels shortened ("Precon", "Qualified Subs") and the readiness checklist below gained two items.
Case study: N

## F-029 · 2026-10-07 · State strokes as CSS borders resize the component
Tags: design-system, figma
What happened: the "Add Contractor" CTA got 2px narrower while pressed. Button.vue drew strokes as CSS borders and changed their width per state (`border-2` → `border-1` on `:active`). Height is fixed but width hugs the content, so the edge moved. Five of the eight hierarchy × variant combinations changed size in at least one state. Figma was fine: its strokes take no layout space, so every md variant is 79×32 in every state.
Why it mattered: buttons in a toolbar or title bar shifted their neighbours on every click and focus. It's the kind of 1–2px jitter that reads as "cheap" without anyone being able to say why. The same translation also made every bordered button wider than Figma, and put focus rings inside instead of outside.
How it was caught: the user noticed it on the prototype. The verification only measured buttons at rest.
What changed: Figma made the source of truth (D-14). P-015: all strokes are outlines placed as in Figma (inside / outside), so Button now matches Figma's size, stroke widths and stroke sides in every state. Token-backed `outlineWidth` / `outlineOffset` scales added. Verification now measures every interactive component in each state (3-verification.md, figma-to-prototype skill).
Case study: Y. A Figma stroke and a CSS border are different things: one is paint, the other is layout. Translate strokes to outlines (inside = negative offset, outside = 0), and measure every state, not only the rest state.

## F-030 · 2026-10-07 · Dark mode: one hard-coded class and one wrong variable
Tags: design-system, figma
What happened: in dark mode the DataGrid toolbar was a white bar and the side nav was mid grey. The toolbar was a code bug: `bg-white` and `gray-*` classes, while the Figma component has no fill and uses tokens. The side nav was a variable bug: `surface/side-nav` mapped to slate/500 in Dark, so Figma and code were both "correct" against a wrong value.
Why it mattered: both were logged on the first prototype (P-005, P-006) and survived because nobody looked at dark mode against the dark Figma mode. The fixes differ: one is a code change, the other a variable change that has to reach Figma, the token source, the generated CSS and Tokens Studio.
How it was caught: the user's dark-mode screenshots.
What changed: P-005 (toolbar tokens, matching Figma), P-006 (Dark → zinc/800 in Figma, `tokens/src`, rebuilt `tokens.css`). Remaining: DataGrid popover panels still hard-code white; Tokens Studio needs the same token edit.
Case study: N

## F-031 · 2026-10-07 · Dark mode needs an audit, not spot fixes
Tags: design-system, figma
What happened: after the toolbar and side nav (F-030), dark mode still showed a pale row hover, a pale toolbar hover and white popovers. Causes: three more mapped variables with light values in Dark (`row-active`, `row-hover`, `primary/muted`), 80 primitive colour classes in DataGrid, and hex colours inside SVG attributes and component CSS. Another eight status variables are light in Dark and still open.
Why it mattered: each report fixed one surface and the next screenshot found another. A variable that is wrong in Dark is invisible in Figma unless someone previews the Dark mode, and wrong everywhere in code.
How it was caught: user screenshots, then a sweep: every `surface/*` Dark value compared with its Light value, and a grep for primitive colour classes and raw hex.
What changed: P-016. Proposed for the readiness checklist: for each mapped variable, the Dark value must be dark when the Light value is light (a script can flag it); and no primitive colour class or raw hex in components (lint rule).
Case study: Y. Dark mode breaks quietly: audit the variables and grep the code, don't wait for screenshots.

## F-032 · 2026-10-07 · A 271-variable audit found 54 dark-mode bugs in one pass
Tags: design-system, figma, ai-workflow
What happened: instead of fixing dark mode one screenshot at a time, every mapped colour variable was resolved in both modes and checked by role: backgrounds must be dark in Dark, text ≥ 4.5:1 and icons ≥ 3:1 on the dark container, disabled must get dimmer. 54 Dark values were wrong: pastel status and row backgrounds, white Gantt rows, a white focused input, dark-blue links (3.3:1), white text on light solid chips (2.5:1), disabled icons brighter than enabled ones.
Why it mattered: three rounds of screenshots had found 6 variables; the audit found 9× more in minutes, and is now a script to run before every publish.
How it was caught: a use_figma script over the mapped collection, then a gallery page in both modes to check the changes by eye.
What changed: P-017. One variable (`container-raised`) is used for two roles (Toggle knob and modal panels); the code panels moved to `surface/container` rather than breaking the knob.
Case study: Y. Audit variables by role, with a script, before publishing a library — dark mode bugs are invisible until someone looks, and screenshots only find them one at a time.


## F-033 · 2026-10-08 · PRD arrived as chat transcripts; distilled before building
Tags: ai-workflow
What happened: the three Prequalification PRD files are AI chat exports (one is ~27k tokens with repeated sections, a stray "Continue" exchange and a dangling instruction at the end of another). Reading them each session would cost more than the spec itself and risks acting on text that isn't a requirement.
Why it mattered: a module of six screens needs one stable source every session reads; the originals also hold open product decisions that must not be silently resolved by the prototype.
How it was caught: reading all three before planning.
What changed: `docs/prequal/spec.md` (distilled, marks [proposed] design choices vs PRD requirements, lists open product decisions), `status-model.md` (D-16), `screens.md`, `00-plan.md`; the originals stay untouched and gitignored in `docs/prd/`. New skill `prd-to-prototype` reads the distilled set. Candidate-component policy D-15 with a backlog in `docs/components/`.
Case study: Y. Distil a PRD into a short working spec that separates requirements from proposals before any screen is built; the agent reads it every session.

## F-034 · 2026-10-08 · A grep said StatusChip had 4 statuses; it has 7
Tags: ai-workflow, design-system
What happened: while planning the dashboard I grepped `statusChipTokenMap.js` for `^\s*[a-z-]*:\s*{` and saw success / error / info / ai. The map also has `'warning-low'`, `'warning-medium'` and `'warning-neutral'` as quoted keys, which the pattern skipped. The plan then proposed "extend StatusChip" and the user agreed, on a false premise.
Why it mattered: a library change (code + Figma variants + Code Connect) would have duplicated what exists; one wasted design-system iteration and a confusing P-row.
How it was caught: reading the token map and `StatusChip.figma.js` before editing.
What changed: question 4 closed with no change; `toneToChipStatus()` maps the model's five tones onto the existing statuses. Skill `prd-to-prototype` step 2 already says "read the component before calling it a gap"; this is the example of why. No code or Figma change.
Case study: Y. Before proposing a design-system change, read the component's source and Code Connect file, not a grep summary.

## F-035 · 2026-10-08 · Edge exits with code 0 while an update is pending; `yarn shot` needs another browser
Tags: tooling
What happened: `yarn shot` failed with "Failed to launch the browser process: Code: 0" and an empty stderr, in every launch mode (default profile, separate profile, extra flags). Running `msedge.exe --headless=new --dump-dom about:blank` by hand also exited 0 with no output. The Edge install had two version folders (153 and 154) side by side: an update downloaded and waiting for Edge to restart; the launcher stub hands off and exits.
Why it mattered: the whole verification step depends on a browser launch; the error text points at puppeteer, not at Edge.
How it was caught: a standalone launch test script, then running Edge directly.
What changed: used the script's existing `EDGE_PATH` override with the installed Chrome (`EDGE_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" yarn shot …`). Added to docs/3-verification.md. Restarting Edge once would also clear it.
Case study: N.

## F-036 · 2026-10-09 · Four sandbox gaps surfaced the first time a V2 form was rendered
Tags: tooling, design-system
What happened: the first screen to use FormV2 / InputV2 / SelectV2 hit four separate failures: (1) `this.$v` undefined: the V2 inputs validate with Vuelidate, which the library installs in `build.js` but the sandbox's `main.js` didn't; (2) `Could not load …/TextEditorV2`: the import names a directory holding only `index.vue`, which webpack resolves through its `.vue` extension and Vite doesn't by default; (3) `Could not resolve '/src/components/Icon.vue'`: a root-absolute import that only works when the bundler root is the library (P-018; 20 more exist in legacy components); (4) `clamp … does not provide an export named 'default'`: a CommonJS dependency of the editor's colour picker, served raw in dev because it lives in the sibling repo's node_modules.
Why it mattered: each one blocked the whole page; none is visible from the component's API. The dashboard and requests pages never touched this chain.
How it was caught: `yarn build` for (2) and (3); `yarn shot` page errors for (1) and (4).
What changed: `src/main.js` installs Vuelidate; `vite.config.mjs` adds `.vue` to `resolve.extensions` and aliases `clamp` to `src/shims/clamp.js`; TextEditorV2's import fixed in the library (P-018). CLAUDE.md setup notes and the setup playbook updated.
Case study: Y. A sandbox that consumes a library from source inherits the library's bundler assumptions one import at a time; list them in the playbook as they appear.

## F-037 · 2026-10-09 · The DropArea glyph didn't match Figma, and the audit couldn't have caught it
Tags: figma, design-system
What happened: the user saw the upload glyph in the portal as "too thick and dark". Figma's Drop Area (27222:30173) draws `file-up` at 36×36 with a 2px stroke in `border/default` in both sizes; the library rendered it at 56px (small) / 64px (large) with lucide's `stroke-width="2"`, which is in viewBox units and scales with the icon (4.7px / 5.3px rendered), in `icon/secondary` (slate). The component description in Figma even lists "border/default (icon glyph)".
Why it mattered: an icon that is 2.3× too heavy changes the weight of every form section that has a document slot; a variable audit (P-017) compares colours, not glyph geometry, so this class of mismatch only shows up when someone looks.
How it was caught: by eye, in design review. Confirmed with `use_figma` reading the vector `strokeWeight` and bound variables of the variant.
What changed: library DropArea: 36px in both sizes, `absolute-stroke-width` on the state icon so `iconStrokeWidth` is in pixels, default colour `text-border-default` (P-020). Flagged, not changed: the `sm` variant's browse button is Button `lg` in Figma and `medium` in code.
Case study: Y. Lucide stroke widths scale with the rendered size; any Figma-to-code icon check needs the rendered stroke, not the attribute. A Figma component description that names the token for a sub-part ("icon glyph") is the fastest way to find the intended binding.

## F-038 · 2026-10-09 · Composing candidates inside library cards nested containers three deep
Tags: design-system, ai-workflow
What happened: the first portal build put a card around every unit: FormSection's own card (library default), a DocumentSlot card inside it, a tinted file row inside that, a boxed InlineNotice next to it, and boxed rows with coloured dots in every list. Each piece was reasonable alone; together the screen was mostly lines. Status was shown three ways at once (dot, coloured word, chip).
Why it mattered: the user's review: too many containers, borders and strokes, colour and icons competing with what the subcontractor needs to act on. The Overview, which had fewer nested boxes, read better; the forms, which had the most, read worst.
How it was caught: design review by the user; then a Mobbin pass (Linear, Mercury, Airwallex, Remote, ElevenLabs, Revolut Business) to name what the good examples do differently: one container level, hairlines not boxes, colour only where the user must act, one signal per status, label-only buttons, a fixed footer.
What changed: rules recorded as D-17; candidates restyled (PortalSectionNav, DocumentSlot, InlineNotice) and their proposal docs updated; a `flat` prop on FormV2 (P-021) so a form that is the page doesn't bring its own card; AppLayout bottom panel used as the sticky footer; `+` / Send / chevron icons removed from buttons; `yarn shot` accepts `slug#hash` so portal sections can be captured without a throwaway script.
Case study: Y. Library components default to being self-contained cards; a screen composed of several of them needs a layout rule that says which one owns the container, or every level draws its own.

## F-039 · 2026-10-09 · The Scope multiselect wasn't the design system: FormV2 ships its own chip select
Tags: design-system, figma
What happened: the user flagged the Scope section's multi-value fields as "not our design system". They are FormV2's built-in `multiselect` field type: `SelectField.vue` renders SelectV2 for single values but a hand-rolled trigger, chips and menu for multi, with its own sizes in rem (2rem trigger, 0.375rem radius, 9999px pill chips at 0.75rem, a typed `×`), V1 `Icon` with palette colours, the placeholder in `text/on-surface/default-inverse` and a menu shadow coloured with `--text-soft`. Figma has no multi-select at all (`Select Menu` is single-value; `Chip` exists but nothing composes it), and SelectV2's `isMultiselect` is documented as visual only.
Why it mattered: a lookalike inside the library passes every "use library components" check and still looks foreign. The same audit found FormV2's field chrome (label 13px/600, help 12px, 6px gaps, 15px section title) written in rem with no token behind it, and `FileField` using V1 icons.
How it was caught: the user's eye; confirmed by reading `SelectField.vue`, `SelectV2.vue` (`isMultiselect` doc) and `search_design_system` for select / chip components.
What changed: proposal `docs/components/MultiSelect.md` (candidate: SelectV2 trigger + Chip + Checkbox rows; Figma `Multi` variant of Select Menu or a new component); backlog row; the deviations listed in `docs/prototypes/prequal-portal.md` › "Design-system deviations" with the suggested P-rows. No code change yet: the portal keeps FormV2's field until the candidate exists.
Case study: Y. "Uses library components" is necessary, not sufficient: check that the component itself has a Figma counterpart, or it is a lookalike one level down.
Resolved: 2026-10-09, Figma Select Menu `Type=Tags` (P-023) and SelectV2 `multiple` (P-024); FormV2 `multiselect` renders it; Scope uses the result.

## F-040 · 2026-10-09 · Tag's close icon was 24px in Figma, 16px in code
Tags: figma, design-system
What happened: the user flagged the Tag close × as too large. In Figma all 9 variants used the 24×24 `x 1-24px` instance at its native size, unbound, including the 20px-tall sm tag, where it overflowed the container. Code (Tag.vue) already rendered lucide `X` at 16px with a 1.5px absolute stroke, the same as Chip's icons in both Figma and code. The Tag documentation frame never stated an icon size, so nothing contradicted the 24.
Why it mattered: Dev Mode and anyone measuring Figma would build tags 8px wider than production, and the sm tag looked broken in designs.
How it was caught: the user's eye; confirmed by a scripted read of every variant's icon instance (size, bindings, stroke).
What changed: P-022. Figma: icon 16×16 bound to `spacing/space-16` in all variants (glyph 8×8, stroke 1.5, unchanged); documentation updated (anatomy legend, a `spacing/space-16` token row, component description). Code: spec comment only. Readiness checklist: the stroke-scaling rule was narrowed, because the 16px glyphs in Chip and Tag keep 1.5px.
Case study: N

## F-044 · 2026-10-09 · A Figma frame created by the API carries a white fill; it only showed in Disabled and Dark
(Renumbered from F-040 on 2026-10-09: a parallel session had used F-040.)
Tags: figma, tooling
What happened: extending Select Menu with `Type=Tags` (P-023), the tags row was made with `figma.createAutoLayout`, which, like `createFrame`, gives the frame an opaque white fill. On the Default and Focused variants it was invisible (white on white). On the Disabled variants it showed as a white block inside the grey field, and in a Dark-mode check it hid the tags completely, which first looked like a Tag dark-token defect.
Why it mattered: the published component would have shipped with a white block in two of six variants and in every dark screen; the light Default screenshot, which is the one usually taken, passes.
How it was caught: a temporary explicit-mode frame (Light + Dark side by side) with the variant and three Tag styles for comparison, then reading every fill layer with its resolved colour: the Tag tokens resolved correctly (text 250, fill white at 5%), so the block had to be a parent frame.
What changed: fills cleared on the six Tags rows; the check frame deleted after the screenshot. Rule for `use_figma` scripts: clear `fills` on every container frame you create inside a component, and screenshot a Disabled variant and a Dark instance before calling a component done.
Case study: Y. Verify in the state and the mode where the background is not white.

## F-041 · 2026-10-09 · The sandbox's own picker broke the "no lookalikes" rule; Edge stopped launching
Tags: design-system, tooling
What happened: (1) The prototype picker in `src/App.vue` was a native `<select>` styled with token classes. It looked off next to real components (OS chevron, native popup), and the user flagged it. It is now the library's `SelectV2` (small, searchable, `{ label, value }` options). (2) While verifying, puppeteer-core could no longer launch Edge ("Failed to launch the browser process", empty stderr), with or without the sandbox, `--no-sandbox` or a fresh profile. Edge 153 and 154 are installed side by side, which suggests an update waiting for a restart.
Why it mattered: (1) the chrome is the first thing every reviewer sees, and the rules apply to it too. (2) With no browser there's no `yarn shot`, so every visual check falls back to `yarn build`, which catches compile errors only.
How it was caught: (1) the user's screenshot; (2) every `yarn shot` and one-off puppeteer run since 2026-10-08.
What changed: App.vue uses SelectV2. Edge is unresolved; restart Edge (or Windows) to finish the update, or set `EDGE_PATH` to another Chromium browser.
Case study: N
Resolved: 2026-10-09, `EDGE_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" yarn shot …` works (Chrome is installed). Edge still fails while the 153→154 update waits for a restart.

## F-045 · 2026-10-09 · The dev server's Tailwind missed classes that only new files use
(Renumbered from F-041 on 2026-10-09: a parallel session had used F-041.)
Tags: tooling
What happened: the wizard's `sm:flex-row`, `sm:basis-1/3` and `sm:gap-space-16` worked in `yarn build` but not on the long-running dev server: the rows stayed stacked at 1440. `getComputedStyle` showed `flex-direction: column`; the production CSS had the rules inside `@media (width>=640px)` after `flex-col`. The dev server's stylesheet had been generated before the new folder `src/prototypes/prequal-wizard/` existed and hadn't been re-processed, and with the catch-all safelist (D-04) only base utilities are guaranteed, not responsive variants.
Why it mattered: a layout that looks wrong in screenshots but is right in the build sends you after a CSS bug that isn't there.
How it was caught: screenshots at 1440 showed mobile layout; a probe compared the dev server's computed style with the build's CSS.
What changed: `touch src/style.css` makes Vite re-run PostCSS / Tailwind (about a minute with the 8 MB stylesheet; the first `yarn shot` right after can time out). Added to `docs/3-verification.md`.
Case study: N.

## F-042 · 2026-10-09 · Dark-mode borders were 2–10× harsher than light; the dark token source had 57 unbuilt changes
Tags: design-system, figma, tooling
What happened: the user flagged dark mode's borders as too heavy next to Linear's. Measured against each mode's container surface, light hairlines (`border/subtle`, `muted`, `inactive`, `soft`) sit at 1.1–1.5:1, but their Dark values sat at 1.8–7:1, `border/neutral` at 17:1 (zinc/100, brighter than light's zinc/400), the secondary outline set at 10–15:1, and `border/secondary/active` darker than the surface it outlines. Linear's dark UI (Mobbin screens, pixels sampled) keeps rings, row dividers and chip outlines at 1.1–1.3:1 and separates regions with surface steps (#070707 page → #0f0f0f panel → #181818 group band), not lines. While mirroring the fix into code, `tokens/src/mapped/Dark.json` turned out to carry P-017's 57 dark-mode audit values (2026-10-07) uncommitted and never built, so `tokens.css` was stale against its own source.
Why it mattered: every card, table row and chip in dark mode glowed, and the prototype's dark screenshots were not a fair review surface. A stale generated file means code and Figma disagree in ways nobody logged.
How it was caught: contrast ratios computed for every neutral border in both modes, pixel sampling of the Linear screenshots, then `git diff` on the token source after the rebuild touched 72 values instead of 15.
What changed: P-026. Figma: 15 Dark values rebound to existing primitives (white-alpha/50, /100, /200; zinc 400–700; gray 400–700), so each token keeps roughly its light-mode weight; no new tokens. Code: same values in `Dark.json`, `yarn tokens:build`; the rebuild also compiled P-017's 57 pending values, flagged in the P-row. Not changed, flagged for design: `surface/container` Dark (#131313) is darker than `surface/page` (#18181b), the inverse of Linear's layering, and `surface/container-raised` Dark is white. Verification: Edge cannot launch for `yarn shot` (F-041), so `EDGE_PATH` pointed at Chrome; the first run after a `tokens.css` rebuild times out while Vite reprocesses the 8 MB stylesheet (same as F-041's touch note). Figma's `saveVersionHistoryAsync` is not supported by `use_figma`, so no checkpoint was saved before the variable write; the before values are in the P-row.
Case study: Y. Balance dark borders by contrast ratio against the dark surface, not by picking a "dark-looking" shade; and rebuild generated files before judging the code side.

## F-043 · 2026-10-09 · A bare `border-default` class is silently Tailwind's preflight grey; and a nav edge was bound to a button-state token
Tags: design-system, tooling
What happened: after P-026 the user still saw heavy lines under the top nav and the title bar in dark mode. (1) The title bar, side nav and panel edges in `AppLayout.vue` were written as `border-b border-default`. In this Tailwind config border colours are `border-border-*` (`colors.border.default`), so `border-default` matches nothing, and the edge takes the preflight border colour, Tailwind's gray-200 (#e5e7eb), in both themes. Pixel sampling showed the same #e5e7eb in light and dark, which is what gave it away: no token is identical in both modes there. Same bug in `TaskCodeModal.vue` and `Avatar.vue` (`border-container`). (2) The 2px nav edge was bound, in Figma and code, to `border/secondary/active`, a secondary-button state; P-026 made that token brighter for buttons and the nav line followed.
Why it mattered: an invalid token class is invisible in light mode, where #e5e7eb is a plausible hairline, and only shows up as a wrong colour in dark mode. A nav edge tied to a button state changes whenever the button is tuned.
How it was caught: pixel sampling the screenshot in both themes, then reading the stroke bindings on the Figma Top Nav Bar and Title Bar components.
What changed: P-027. Figma: 29 nav strokes rebound to `border/container-invert`; descriptions updated. Code: `TopNavBar/index.vue`, `AppLayout.vue`, `TaskCodeModal.vue`, `Avatar.vue` use the `border-border-*` classes Figma binds (inactive for title bar, side nav, panel edges, modal dividers; subtle for toolbar row and footer). Rule added to CLAUDE.md: border colour classes are `border-border-*`; grep for bare `border-(default|subtle|inactive|muted|container|neutral|soft)` before calling a screen done. Remaining bare uses are comments, plus `SelectV2.fieldBorderColorToken` (`border-inactive` for the disabled field; see P-027).
Case study: Y. A class that matches no token fails silently to the framework default; sample the pixel in both themes, and anything identical in both is suspect.

## F-046 · 2026-10-09 · The shell's right panel was enabled but never shown
Tags: design-system, tooling
What happened: the review screen passed `right-panel` to `PrequalShell`, which set AppLayout's `rightPanelEnabled` but not `rightPanelVisible`. AppLayout defaults `rightPanelVisible` to false (panels open on demand), so the Decision panel was mounted but hidden at 1440; the phone layout, which renders the panel inline, looked right.
Why it mattered: the screen's key element was missing on desktop with no error.
How it was caught: the first 1440 screenshot had no right panel while the 390 one had the decision content.
What changed: `PrequalShell` passes `:right-panel-visible="rightPanel"`. For AppLayout consumers: enabled is not visible.
Case study: N.

## F-047 · 2026-10-09 · Two sessions numbered log entries at the same time
Tags: ai-workflow, tooling
What happened: a parallel session (dark-mode border tokens) appended to the same change log and findings log while this session built screens 2 and 5. Both picked the next free number from what they had read earlier, so P-022, F-040 and F-041 were used twice and P-026 was taken before this session wrote it.
Why it mattered: duplicate IDs make references ambiguous, and the logs are what later sessions rely on after a context reset.
How it was caught: re-reading the log tails before appending (the TabNavigation row would have been the second P-026).
What changed: this session's entries were renumbered (P-023, F-044, F-045, P-028) with a note on each; the parallel session's entries were left as written. Rule: read the log tail immediately before appending, and re-check the number after writing.
Case study: Y. Shared append-only logs need a re-read right before each write when more than one agent works in the repo.

## F-048 · 2026-10-09 · Stepper and tab badges rendered at 12px instead of Figma's 16px
Tags: design-system, figma
What happened: ProgressStepper (P-025) and TabNavigation (P-028) rendered StatusIndicator `size="sm"` with `layout="inline"`. In code, inline sm is a 12px circle; Figma's Stepper Component and Tab Navigation use Number Badge Size=sm, a 16px circle in a 20px slot, which is code's `layout="contained"`. The digits looked cramped and the badges read as not ours.
Why it mattered: the components were the library's, but the size mapping was wrong, so they didn't match Figma.
How it was caught: the user asked whether the wizard's step badges came from the design system. Inspecting the Figma instances (20×20 slot, 16px circle, Show Stroke off) against StatusIndicator's size table showed the mismatch.
What changed: both components now pass `layout="contained"`; measured 16×16 in the wizard and review screens. Lesson: Figma's Status Indicator has no layout property, so a Figma Size maps to code's `contained` layout. Use `inline` only for avatar-corner overlays.
Case study: N.

## F-049 · 2026-10-09 · Expiry dates showed a day early
Tags: prototype, candidate
What happened: ExpiryIndicator built dates with `new Date('2026-10-20')`. A date-only ISO string is parsed as UTC midnight, which is 19 Oct in any time zone west of UTC, so the record's Valid until read "19 Oct 2026" against data saying 20 Oct. The dashboard's Expiration column had the same off-by-one since screen 1.
Why it mattered: expiry dates are the point of monitoring; a wrong day on a compliance date is a trust problem, and it only shows in some time zones.
How it was caught: the record's first 1440 capture showed 19 Oct next to an audit entry saying 20 Oct.
What changed: the candidate reads `YYYY-MM-DD` strings as local midnight (`toDate`). `$moment` already parsed them as local, which is why the other dates on the screens were right. Promotion note: the library version should take this behaviour.
Case study: N.

## F-050 · 2026-10-09 · The dark-mode audit checked variables, not where they're bound
Tags: figma, dark-mode, design-system
What happened: the ID chip in every Title Bar / Workflow lost its label in Dark mode (flagged on screens 2, 5 and 6). The Chip `Style=Solid` label was bound to `text/on-surface/default`. That variable is correct for its own job (content on a strong coloured fill, black in both modes) and passed the 271-variable audit (F-032), but it was used on `surface/subtle`, which is 5% white in Dark.
Why it mattered: a variable-by-variable audit can't see a right variable in the wrong place; the bug only shows where a component combines the two.
How it was caught: the Dark copies of the screen references, three times, before it was fixed.
What changed: the 12 Solid variants' labels now use `text/default`, matching the Outline variants and the code (P-029). Audit idea for later: for each component variant, resolve the text colour against its own background in both modes and check contrast (≥ 4.5:1), rather than checking variables alone.
Case study: Y. Variable audits and binding audits catch different bugs.

## F-051 · 2026-10-09 · Default scrollbars, content touching them, and screenshots that hid both
Tags: design-system, figma, verification
What happened: the user saw grey 15px scrollbars with arrow buttons across the screens, and numbers and controls pressed against them. Three causes: (1) Figma's Scrollbar component (thin rounded thumb) is meant to be "applied by the global scrollbar styles", but the code had none, so browsers drew their default; (2) AppLayout put its 20px padding outside the scrolling element, so the scrollbar sat inside the padding, flush with the content; (3) TabNavigation's −1px tab margin made the tab strip scroll 1px vertically.
Why it mattered: it read as unfinished UI on every screen, and no check caught it.
How it was caught: by the user, in their own browser. Headless Chrome launches with `--hide-scrollbars`, so all `yarn shot` captures were scrollbar-free; the verification never saw what users see.
What changed: P-030 (global styles from the Figma Scrollbar, padding inside AppLayout's scrollport, tab strip overflow). `scripts/screenshot.mjs` now keeps scrollbars (`ignoreDefaultArgs: ['--hide-scrollbars']`). Measured after: scrollbar 8px, content ends 20px before it on review and record. New rule in docs/5-ui-patterns.md §2: padding sits inside scroll areas; content never touches a scrollbar.
Case study: Y. The test browser hid a whole class of defect; verify the verifier again.

## F-052 · 2026-10-09 · Hiding overflow and translate-centring both looked fine in headless Chrome and broke on Windows
Tags: design-system, tooling
What happened: on the review screen the tab strip showed a vertical scrollbar and the count badges' digits sat off-centre, both in the user's Edge. (1) The tabs overlapped the strip's own bottom border by 1px (`-mb-px`), so the strip had 1px of vertical overflow. An earlier fix (P-030) hid it with `overflow-y-hidden`, but the scrollbar still showed. (2) StatusIndicator centred the badge circle with `absolute` + `translate(-50%)`. Transformed boxes aren't pixel-snapped and text is, so on a half-pixel row the circle and its digit drifted about 1px apart.
Why it mattered: both are the "looks cheap" kind of defect, in components used across the module (tabs, top-nav notifications, stepper).
How it was caught: the user's screenshot. Headless Chrome uses overlay scrollbars, so `yarn shot` can't show (1). Measuring `scrollHeight` against `clientHeight`, and the circle's `y` (297.5), found both.
What changed: P-031. The overlap was removed rather than hidden; the badge is flex-centred, and the digit's box is trimmed to cap height. Verification gains two checks: any `overflow-*` container must have `scrollHeight == clientHeight` on the axis that shouldn't scroll, and centred badges and icons must not use translate. Edge still won't launch for puppeteer (F-041), so these checks ran in installed Chrome (`EDGE_PATH` can point at it).
Case study: Y. Fix overflow at its source, don't hide it; and headless screenshots won't show the user's scrollbars, so measure them.

## F-053 · 2026-10-10 · Building the Figma app map: what the Plugin API needed
Tags: figma, process
What happened: 40+ screens and states were drawn on the Prequalifications page from library instances, cloning the nearest existing frame and editing it. Surprises: (1) `figma.skipInvisibleInstanceChildren` is on by default, so hidden instance layers vanish from `children` and an index-based hide hits the wrong layer; set it to false first. (2) Changing a property or visibility on an instance sublayer re-creates its nested nodes, so ids captured before the change throw "node does not exist"; look nodes up again after each change. (3) Textarea `State=Default` draws its label absolutely 24px above its own top, so it overlaps whatever is above; wrap it in a frame with 24px top padding. (4) In Checkbox, the inner frame named "Checkbox" is the box, not the row; filling it stretches the box. (5) A cloned text node keeps `layoutAlign=STRETCH` and a fixed width from its source, so `textAutoResize` silently stays NONE; reset `layoutAlign` first. (6) Title Bar / Workflow has no actions slot in the variants used, so the record's "Request renewal" is an overlay instance. (7) The Progress Bar track ignores resize (only 25% steps).
Also found: the review summary's prose-measure change (D-21 in the previous session: summary capped at 65ch, shorter disclaimer, same rule on the portal intro, wizard sentences, record override reasons and InlineNotice) is **not in the repo**; the working tree was clean at the start of this session and none of it is present. The Figma review frame (03) still shows the 528px summary. Flagged to the user; not redone without asking.
Why it mattered: each surprise cost a failed call; written down they cost nothing next time. The missing change means code and Figma disagree on the review summary until it is restored or dropped.
What changed: D-22; `prd-to-prototype` step 6 now targets the app map with these gotchas; CLAUDE.md rule updated.
Case study: Y (the map is the module's single design reference).

## F-054 · 2026-10-10 · Portal title bar in Figma was a flat row: everything packed left, nothing could resize
Tags: figma
What happened: "Title bar — request" (Documentation file, Prequalifications page) was a plain 1440px auto-layout frame with 9 hugging children aligned left, plus a fixed 10px "spacer" that couldn't push anything right. It was copied by hand into four portal screens. Resizing the bar couldn't keep progress, save state and Submit pinned right, and nothing truncated.
Why it mattered: the frame didn't describe the layout the code already has (AppLayout `#header` with flex-1 min-w-0 and truncate, and `#header-actions` with shrink-0), so it couldn't show how the bar behaves at other widths.
How it was caught: the user, on the Figma frame.
What changed: it is now the local component **Title bar / Portal request** (3801:5124). Leading (GC tile, title, "requested by") fills the width and clips. Trailing (progress · saved, Submit) hugs and stays pinned right. The bar is space-between, padding `space-20`, gap `space-8`, height `space-48`. "requested by" truncates with an ellipsis. Properties: Title, Requested by, Progress, Saved, Show requested by, Show progress & save, and the exposed nested Button. The four portal copies are now instances. Tested at 1440 / 1024 / 768 / 520: Trailing stays 20px from the right edge. Figma limit: a hug-width title can't truncate, so below about 600px the title clips unless "Show progress & save" is off, as the code does below sm. The code gained `pr-space-8` to match the Figma gap. The loose frames 3799:5074 and 3799:5038 are untouched.
Case study: N

## F-055 · 2026-10-10 · Generated Figma screens carried no text styles and raw spacing
Tags: figma, design-system
What happened: the user noticed that text styles and variables were not connected on many of the app-map screens. Audit of the five map sections (nodes outside instances): 818 of 818 text nodes had no text style; 632 paddings, 389 gaps and 79 radii were raw numbers; every fill and stroke was bound (they had been cloned from bound nodes). Cause: text was made by cloning a text node and changing `characters`, which copies font, size and colour binding but not a style; `createAutoLayout` paddings and gaps were set as numbers.
Why it mattered: unstyled text and raw spacing do not follow the design system when a style or token changes, and the Dark mode of the `mapped` collection only re-themes what is bound; the screens looked right but were not structured as design-system output, which the user requires.
What changed: one script bound everything: text to library styles by size and weight (14/20 → `label/sm/*`, 12/16 → `label/xs/*`, 16/24 → `label/md/*`, 28/36 → `heading/md/bold`, 8 → `label/2xs`; 22 mixed-weight texts got a style per range with `setRangeTextStyleIdAsync`; 12 ranges inside instances that overrides had detached were rebound), paddings and gaps to `spacing/space-N`, radii to `border radius/radius-N` (all four corners). Re-audit: 0 unstyled, 0 unbound. Library gap: no 20/28 text style, so section headings and score-strip values use `title/lg/bold` (20/24); flagged for design. Rule and audit script added to `prd-to-prototype` step 6; saved as a standing preference.
Case study: Y. "Looks right" is not the bar for generated design files; bound to the system is.

## F-056 · 2026-10-10 · The Vite dev server kept serving a stale module after a scripted edit
Tags: tooling
What happened: after a Python script rewrote `src/modules/prequal/data/records.js` (adding `recordRows`), `yarn shot` failed on every page with “does not provide an export named recordRows”. `yarn build` passed. Fetching the module from the dev server showed the old transform (same `?t=` stamp): the file watcher had not seen the write.
Why it mattered: the screenshots looked like a code error; time could have gone into a cycle that did not exist.
How it was caught: the build passed while the dev server failed, so the server was suspected; `curl` of the served module confirmed it.
What changed: `touch` on the edited files made Vite re-transform them. Rule for the playbook: when `yarn shot` reports a missing export that `yarn build` accepts, touch the file (or restart `yarn dev`) before debugging the code.
Case study: N.

## F-057 · 2026-10-10 · Every link between screens reloaded the page and blanked the app
Tags: tooling, ai-workflow
What happened: the user saw the whole screen go white when going from Overview to Review Queue. `router.go()` used `window.location.assign`, a full document load: the browser drops the page and paints white (also in Dark mode, since the theme class is set by script) until Vite serves every module and the ~8MB CSS again. Measured in headless Chrome against the dev server: a fully white frame, 4.3s until the queue rendered (`sameDocument: false`). The module was designed this way on purpose ("a page load; the mock data is static so nothing is lost", `router.js`), which was true for data and wrong for the experience.
Why it mattered: it made the prototype feel broken, and it hid that the screens themselves are fast.
How it was caught: user report; measured with a CDP screencast that samples the top nav, rail and content in every frame after the click.
What changed: `go()` now pushes history and fires `prototype:navigate`; App.vue swaps the prototype (keyed by slug + record hash) and listens to `popstate` for Back / Forward. After: same document, 0 blank frames in light and dark, 46–83ms of script per swap (8 rail clicks), row → review → Back → Back → Forward all correct, no console errors. Rule: `docs/5-ui-patterns.md` §6, D-24.
Case study: Y. Perceived performance is mostly architecture: the shell was blanking for a reason that had nothing to do with loading data.

## F-058 · 2026-10-10 · Building the loading pattern: three timing traps and an invisible dark skeleton
Tags: design-system, figma, tooling
What happened: testing the new loading states with simulated latency (fast 120ms, medium 900ms, slow 6.5s, fail, fail-once, refresh, superseded requests, reduced motion), sampled every 50ms:
1. A 120ms answer still triggered the loader and announced "loaded": the request was started in a microtask, so it only began after the first render (~110ms of DataGrid mount), while the 200ms indicator clock was already running. Fixed by starting the request synchronously in `run()`.
2. Two filter clicks 300ms apart turned "Updating…" off and back on; a superseding run now keeps an indicator that is already showing.
3. On a failed first load the error notice replaced the whole grid, header included; the table frame now stays below the notice.
4. Figma's skeleton cell is bound to `surface/neutral`, which in Dark mode equals the table row colour (#1e1e1e on #1e1e1e). Only the shimmer band is visible; with reduced motion nothing is. Kept as drawn (D-14) and flagged (P-034).
Why it mattered: each would have shown the exact flashes and flickers the pattern exists to prevent, and none is visible in a static screenshot.
How it was caught: a scripted timeline of aria-busy, skeleton rows, real rows, the meta line and the live-region text; screenshots of each state in both themes.
What changed: `createLoad` (synchronous start, indicator continuity), `LoadRegion` (error above kept content), verification step added to `docs/3-verification.md` ("Loading states"). Dark skeleton colour: needs-design.
Case study: Y. Loading states are timelines, not screenshots; test them by sampling over time.
Resolved (item 4): 2026-10-11, new tokens `surface/skeleton` / `surface/skeleton-highlight` in Figma and code (P-035); Dark bar #2b2e33 on row #1e1e1e, visible with reduced motion.

## F-059 · 2026-10-11 · Rolling the loading pattern out to every screen: what the shared parts were missing
Tags: design-system, ai-workflow
What happened: the pattern (D-24) went onto all eight Prequalification screens in three parallel passes (dashboard + qualified, review + record, portal + wizard), then one consolidation pass. Each pass hit the same gaps and worked around them locally: two copies of a `SubmitStatus` component, hand-built spinner lines and manual announcements for Save / Submit / Send, a right panel copying LoadRegion's logic to avoid a second live region, hand-built KPI skeleton frames (KpiCard's own placeholder was 32px for a 36px value: a 4px shift), and `whitespace-nowrap` / `min-h` patches around LoadStatus. Also found: plain LoadRegion slot children are evaluated by the page at once and threw while the record was null (`<template #default>` fixes it); a write's success announcement was lost when success closed its form (the live region left with it); `RenewalModal` mounted open had nothing preselected (watcher not `immediate`).
Why it mattered: three local copies of the same behaviour is how lookalikes start; the lost announcements meant screen-reader users never heard that a reminder or renewal was sent.
How it was caught: the agents' reports listed every workaround as a proposed shared change; the consolidation pass measured each fix (submit timelines, 14 flows; first-load timelines on 8 slugs; a script reading the body-level live region).
What changed: `createLoad({ action })` (write wording, no Cancel, always confirms), app-level `announce()`, LoadStatus `variant="notice"`, `active`, `size="xs"`, a 24px line held only while it shows something, LoadRegion `secondary`, KpiCard `loading` with Skeleton blocks; local copies deleted. Figma Load Status gained `State=Saving` / `Couldn't save`. Still open: LoadStatus can't hide its visual part at narrow widths (screens wrap it in `sr-only sm:not-sr-only`); at 390 the wizard's inline send error squeezes the page title; clicking the qualified grid's “Request renewal” button also fires the row click and navigates to the record (DataGrid, pre-existing).
Case study: Y. Parallel agents converge on the same missing abstraction; their workarounds are the spec for the shared component.

## F-060 · 2026-10-11 · Borders that take layout space put centred items on half pixels
Tags: design-system, verification
What happened: the user saw the tab number badge sit low in inactive tabs and correctly in the selected tab. Measured at 1x: the inactive badge's top was 15.5px, the selected 14px. The tab's bottom line was a CSS border (1px / 4px) inside a fixed 48px box, so the inactive content box was 47px and the centred badge landed on a half pixel; the circle anti-aliased while the digit snapped separately. The same cause appeared the same day in the new 64px title bar (1px bottom border → back button at 11.5px). P-031 had fixed the digit inside the badge; this was the badge inside the tab.
Why it mattered: a 1px drift reads as "broken" on badges and icon buttons, and only at 1x (most Windows laptops at 100%), so it hides in 2x screenshots.
How it was caught: user report; a puppeteer script measuring element tops at deviceScaleFactor 1 and 1.25 (the earlier 2x screenshot showed nothing wrong).
What changed: tab lines and the comfortable title bar's line are inset box-shadows (Figma strokes don't take layout space either), P-037 / P-038; badge top 16px and button top 12px in every state. Verification: measure fractional tops at 1x when an item is centred in a box with a border (`docs/3-verification.md`).
Case study: Y. "Figma strokes don't take space; CSS borders do" is a general translation rule.

## F-061 · 2026-10-11 · A prototype-only notice was showing on the review screen
Tags: ai-workflow, prototype-data
What happened: only one review (Apex, REQ-001) is mocked, so opening any other request showed an info notice, "Sample review data: … you opened Bluewater Plumbing Co. (REQ-004)", above the real screen. The user asked what it was for.
Why it mattered: it isn't part of the product; reviewers can't tell sandbox scaffolding from design.
What changed: removed; every request opens the Apex review exactly as the app would render it. Rule: explain mock-data gaps in the docs, never in the screen.
Case study: N.

## F-064 · 2026-10-11 · One mocked review hid three states nobody had designed (renumbered from F-062, which a parallel session also used)
Tags: prototype-data, design-gap
What happened: the review screen only had Apex's data, so every row opened Apex. Writing a review for each of the 24 requests showed that three states had no design: a request the sub hasn't submitted (opened a review that can't exist), a request waiting on information the reviewer asked for (nothing said what was asked), and a decided request (the four decision buttons stayed live on a closed review).
Why it mattered: a demo walks through rows at random; with one review, every click told the same story, and the gaps only show when the data varies.
What changed: per-request reviews, records and tracking data (D-26); the tracking view, a read-only decided panel and a waiting-for-subcontractor block; assumptions A7–A9 for product. A scratchpad script checks every review against its list row (open findings, knockouts, checks, weighted section scores, valid until = earliest key document), so the numbers stay consistent when data is edited.
Case study: Y. Varied, internally consistent mock data is a design tool, not just demo polish.

## F-062 · 2026-10-11 · Hiding a filling sibling un-pins the user menu in Figma's Top Nav Bar
Tags: figma, design-system
What happened: on the Documentation app map (Subcontractor portal, 3792:5020) all four Top Nav Bar `Module=Company` instances showed the user menu packed left against the logo. The portal hides Top Nav Modules (the external user has no modules), and the library's Nav Bar only kept the menu on the right because Dashboard filled the space under `SPACE_BETWEEN`. With one visible child, `SPACE_BETWEEN` packs it to the start. Three instances already carried an alignment override that didn't help; one had `MIN`.
Why it mattered: the portal reference didn't look like the app (code keeps the menu right), and any screen that hides the modules would repeat it.
What changed: design system Nav Bar (40010567:33639, both sizes) now packs right (`MAX`). With Dashboard visible it renders identically (checked: same child positions), with it hidden the menu stays pinned right; description updated. The four app-map instances' Nav Bar override set to `MAX` so they're right before the library is published.
Rule for pushing screens to Figma: after hiding a layer in an instance, check that what remains still sits where the component intends (a filling sibling often does the pinning).
Case study: N.

## F-063 · 2026-10-11 · Side nav selector was blue, not the module's teal
Tags: design-system, prototype-shell
What happened: the selected rail item's selector bar rendered blue on every Prequalification screen. Figma's Side Nav components all use a black tile (`surface/strong`) plus a selector in the module accent (Precon: `icon/accent/teal`, matching the top nav's Precon teal). SideNavV2 takes the accent through `selector-color` and falls back to `surface/primary` blue; PrequalShell never passed it.
What changed: PrequalShell passes `selector-color="var(--icon-accent-teal)"`. Measured: light #14b8a6, dark #2dd4bf, no console errors. No library change needed.
Rule: a module shell sets both its top-nav `selectedColor` and its rail `selector-color` to the module accent.
Case study: N.

## F-065 · 2026-10-11 · Wide tables squeezed the portal's section nav
Tags: layout, candidate
What happened: with five realistic past projects (long owner and sector names), the Experience section's tables were wider than the content column; the grid item grew and AppLayout shrank the 288px left panel, clipping the nav's checkmarks and “In progres”. It was already happening on Northstar with three projects, just less visibly. yarn shot reported no overflow because the page itself didn't scroll sideways.
What changed: RepeatField and MatrixField roots are `min-w-0`; RepeatField's table sits in `overflow-x-auto` (MatrixField already had it). The table scrolls inside the field; the nav keeps its width.
Lesson: placeholder data that is too short hides layout bugs; test list and table screens with the longest realistic values. Also: `yarn shot` couldn't save a capture whose hash held a `/` (`#req-006/insurance`); the file name now replaces it.
Case study: N.

## F-066 · 2026-10-11 · Every library Button inside a form was a submit button
Tags: library-bug, forms
What happened: making the portal's tables editable, “Add” in the row editor submitted the whole section form (FormV2 renders a `<form>`) and ran its validation, so the new row was lost and “Some answers are missing” appeared. `Button.vue` renders a bare `<button>`, whose default type is submit. The same was true of RepeatField's Edit / Remove, DocumentSlot's Replace and the library DropArea's Browse button: every action inside a form section submitted it.
What changed: P-039, an additive `nativeType` prop on Button (default unset, behaviour unchanged elsewhere); DropArea's Browse and the candidates' in-form buttons pass `native-type="button"`.
Case study: Y. A default that only bites when components are composed (a button inside a form) survives component-level stories; end-to-end flows find it.

## F-064 · 2026-10-11 · Number inputs were right-aligned everywhere, and nobody had decided that
Tags: design-system, ux
What happened: the user found portal values at the far right of full-width fields (Year established "2009" ~500px from its label) and the EMR / TRIR tables stretched across the form with right-aligned inputs. Two sources: the library's InputV2 added `text-right` to every `type="number"` (Figma's Input Field is left-aligned for every type, Currency included), and the prototypes' MatrixField used the read-only table rule (numbers right, table full width) for data entry.
Why it mattered: right alignment is a reading convention for comparing a column; in a form it separates the value from its label. Through the library default it reached every number field in the app.
What changed: InputV2 left by default, `align="right"` opt-in; FormV2 TextField `props.width: 'short'`; MatrixField hugs its content with 124px left-aligned inputs (read-only stays right); RepeatField's read-only money / number / percent columns right-aligned (they were left). Portal number fields use the short width. P-039, D-26, `docs/5-ui-patterns.md` §7. Also found: a `sr-only` header inside a table's `overflow-x-auto` box escaped it (absolute positioning, no positioned ancestor) and widened the page by 254px at 390 once the table grew; the scrollers are now `relative`.
How it was caught: user review; computed widths and page `scrollWidth` at 390 in a puppeteer script.
Case study: Y. A component default that contradicts Figma silently becomes a product-wide pattern.

## F-065 · 2026-10-11 · The date field looked right and didn't work: the sandbox had no Vuex store
Tags: setup, design-system
What happened: in the portal's Add project form (and the other row editors with a date: license and certification expiry), the "Finished" field showed a calendar icon but clicking it did nothing useful: the popup rendered as a 2×2px box and the console showed `Cannot read properties of undefined (reading 'getters')` from DatePicker's TableDate. The right component was in use (Figma Input Field Type=Date → FormV2 `date` → library DatePicker); DatePicker reads holidays and working days from a namespaced Vuex module that the production app and Storybook provide, and the sandbox never installed Vuex. FormV2's DateField registers a stub module, but only when a store exists. A second issue showed once it opened: the legacy DatePicker's V1 inline styles (white, 32px, #adc1d1 border) didn't match the form and stayed white in dark mode.
Why it mattered: every date entry in the portal was unusable, and the console error only appears when the popup opens, so `yarn shot` (no interaction) never caught it.
What changed: `src/main.js` installs Vuex with Storybook's mock `DatePicker` module (aliased to the library's vuex in `vite.config.mjs`); FormV2 DateField matches InputV2 in both themes (P-040). Also fixed InputV2's border class, which had fallen back to preflight grey (dark mode now uses Figma's border/input/default). Verified: popup opens at 250×272 with the month grid, picking the 15th fills "10/15/2026", typing works, no console errors, both themes. Rule added to the setup playbook's resolution gaps.
Verification gap: screenshots don't open popovers. Interactive components (date pickers, selects, menus) need an open-and-pick check in a script.
Case study: Y. A component can be correct and still fail because the host app's contract (a store) is missing.

## F-067 · 2026-10-11 · The app map kept the old title bar after the library gained the Comfortable size
Tags: figma, process
What happened: the user found the back button on the Documentation app map (screen 33, Northstar) still drawn as the 48px Title Bar / Workflow with the white Tool-type icon, not the app's 64px bar with the grey Back button. All 10 Title Bar / Workflow instances on the Prequalifications page (screens 03, 04, 19, 22, 23, 24, 25, 33 and two thumbnails) were `Size=Default`: they were drawn before P-038 added `Size=Comfortable`, and new screens are made by cloning old ones (prd-to-prototype step 6), so the old variant kept propagating. A second, library-side fault showed after swapping: the 9 Comfortable variants built for P-038 had lost their property bindings when cloned (title text not bound to `Title`, AI-tag frame not bound to `Show AI Tag`), so every Comfortable instance read "Create RFI".
Why it mattered: design review happens on the app map (D-22), so the map showed a back button the app no longer has.
What changed: library (Title Bar / Workflow 40017329:40863): `Title` and `Show AI Tag` rebound on all 9 Comfortable variants (needs a library publish). App map: the 10 instances swapped to `Size=Comfortable` of the same Status, titles kept, content below the bar moved down 16px (4px on the 0.25 thumbnails), frames grown to match, hotspots and arrow ends moved with them (back-button hotspots 8px, centred on the new button). The skill's step 6 now says detail and create screens use the Comfortable bar and how to swap a cloned one.
Case study: Y. Cloning reference screens copies their outdated library variants; a variant change in the library needs a sweep of the map.

## F-068 · 2026-10-11 · The app map's side nav hid an item and the map had drifted from the app
Tags: figma, process
What happened: the user found the Documentation app map's side rail missing items and the teal selection not showing. All 15 Side Nav Preconstruction instances carried overrides from when the map was first drawn: the second item was hidden and still labelled "Requests" (removed from the rail by D-23, replaced by Review Queue), the Review queue screen moved the selection by hand, and screen 33 relabelled the third item as "Review Queue" (losing Qualified Subs) with a manual selector fill. The library component itself was right. A full audit of the page against the running app (three read-only agents, one per level, plus Level 1 by hand) then found broader drift, because the app kept changing after screens were drawn: grid toolbars showing tools the app doesn't have (paint roller, upload, five views), the queue filter drawn with the 40px Segmented Navigation instead of the 28px Compact one, stale table data (trades, conditions, expiry countdowns), new app content missing (tab badges, "All findings", Recent activity, hairlines, ✓ on verified values), changed copy, reordered portal states, and a library fault from P-038 (the Comfortable title bar's back button kept the old icon's stroke). It also found three app copy bugs (singular "2 required item failed", "Inc.." double period, straight apostrophe), fixed in the review screen.
Why it mattered: design review happens on the app map (D-22); a map that silently drifts from the app reviews the wrong thing.
What changed: rails reset to the library items with the app's selection and the teal selector; Level 1 toolbars, filter and table data matched; Level 2–3 frames fixed from the audit lists; Comfortable title bar back button stroke removed in the library (needs publish); app copy fixed. Design-system questions the audit raised (title bar ID chip outlined vs filled, divider before "Status:", label / helper / button-label typography, input height 36 vs 40, textarea border, active stepper weight, portal section-nav check colour, the prototype-only "View as" switch) are listed for a decision, not changed. The skill's step 6 now says how to set rail selection and which toolbar / segmented components to use.
Case study: Y. A reference map built from the app needs a re-audit whenever the app changes; per-instance overrides are where drift hides.

## F-069 · 2026-10-12 · The grid's select filters had never worked after the first refresh
Tags: design-system, ux
What happened: moving the qualified-subcontractor filters into the DataGrid Filter panel (D-30), the Status condition offered text operators ("contains", "equals") and a free-text value, even with `customProps.treatAsSelectFilter` and explicit options set as PRP 29 documents. The toolbar feeds the panel from `ColumnModel.getAllColumnsWithState()`, which projected field, label, type and visibility but not `customProps`, so every select-filter column silently fell back to text. Two more gaps showed on the way: the panel had no "is any of" (the FilterService evaluated it, but nothing could pick it), and a list cell (a company's trades) was stringified and never matched. The SelectV2 multi-select the user had flagged (stacked tags, two kinds of ×, a text input that seemed dead) was also the value control any "is any of" would use.
Why it mattered: select filtering on DataGrid columns was broken for every consumer, and nothing in Storybook exercised the path after a refresh.
What changed: P-041 (SelectV2 one-line multi trigger), P-042 (customProps projected, isAnyOf / isNoneOf with a multi-value picker, list cells as sets). Qualified subcontractors and the Review queue use the panel with quick filters; the queue's segmented views are cross-linked with it. Verified in the browser: quick filter → 2 of 8 and badge 1; adding Current to "is any of" → 5 of 8; three statuses → 6; Has conditions and Expires in 30 days stack (badges 2, 3); Clear all → 8; queue segment Knockouts ↔ panel "Queue view is Knockouts", a second view quick filter replaces the first, Clear all returns the segment to All; both themes, no console errors; all screens pass `yarn shot`; build passes.
Case study: Y. A documented option that a projection layer drops looks like user error until the data path is traced.

## F-070 · 2026-10-12 · Six stepper steps don't fit at 390px, and the stepper's sr-only spans escape a scroll box
Tags: design-system, tooling
What happened: the template builder has six steps (the PRD's builder flow). ProgressStepper with `labels="active"` and `fluid` still needs 6 badges + 5 trails (16px minimum each) + 11 gaps ≈ 312px before the active label, so "Requirements" (≈95px) overflows the 350px column at 390px; the wizard's four steps fit. Wrapping the stepper in an `overflow-x-auto` box kept the page from scrolling sideways, except for 4px: the stepper's `sr-only` spans (step name, "(completed)") are absolutely positioned and, with no positioned ancestor inside the scroll box, escaped it. `yarn shot` flagged the 4px.
Why it mattered: a 4px horizontal page scroll on phones; the stepper is a library component used by every multi-step create screen.
How it was caught: `yarn shot … 390` overflow warning; bisected by hiding elements until `scrollWidth` dropped.
What changed: the builder's stepper sits in a `relative min-w-0 overflow-x-auto` box and uses short labels under 640px (`STEPS.short`). Same root cause as F-065 (RepeatField's sr-only "Actions" header). For the library: ProgressStepper's `labels="active"` mode could let trails shrink to 8px and its `nav` could be `relative`, so a six-step strip fits without a scroll box (needs-figma: the Stepper Component's narrow behaviour isn't drawn).
Case study: Y. Screen-reader-only text is still laid out; it needs a positioned ancestor inside any scroll box, or it widens the page.

## F-071 · 2026-10-12 · A segmented control beside a heading read as a filter
Tags: design-system, ai-workflow
What happened: the template builder's Requirements step put a SegmentedControl (Required · Optional · Not requested) in each section's heading to set whether the section is asked. In review the user read it as a filter of the rows below, expected an "All" option, and found it "not working": switching it to Not requested collapsed the table instead of filtering it.
Why it mattered: the same component means two things on the module's screens (view switch on the Review queue, state on the builder), and a control that looks like a filter but changes data is the wrong affordance for a per-item setting.
How it was caught: user review 2026-10-12.
What changed: the section's state is a small SelectV2 (Required · Optional · Not asked) beside the heading; one SegmentedControl at the top of the step is a real filter, All by default, with "n of m fields" when narrowed. Rule for the module: a segmented control switches views or filters a list; a per-item state uses a select or radios (docs/5-ui-patterns.md §4).
Case study: Y. The affordance decides what people try; a segmented strip says "filter this".
