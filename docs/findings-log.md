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
