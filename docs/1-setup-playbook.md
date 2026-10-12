# Setup playbook

Repeat this to stand up accurate, design-system-based prototyping from Figma with an AI agent. Each step ends with a **Check**. Don't move on until it passes. Findings referenced as F-NNN are in [findings-log.md](findings-log.md).

## 0. Prerequisites

- Node 22, Yarn classic, Git, Microsoft Edge (used for headless verification).
- Cursor (or VS Code) with the Claude Code extension.
- A Figma seat with access to the design system file.
- The design system library checked out as a sibling folder: `../linarc-design-components`.

**Check:** `node -v`, `yarn -v` and `git --version` all work, and Edge exists at `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` (or set `EDGE_PATH`; if Edge won't launch headless, point `EDGE_PATH` at Chrome, F-041).

## 1. Prepare Figma first

The quality of the generated UI is capped by the quality of the Figma source. Work through [2-figma-readiness.md](2-figma-readiness.md) for every component and screen you'll prototype from. At minimum:
- Sizes, spacing, radius, colour and type are **bound to variables**, not raw values.
- All variants in a component set are consistent (scripted audit, F-009).
- Components have descriptions and Code Connect mappings.

**Check:** `get_variable_defs` on a sample component returns variable names, not just hex/px values.

## 2. Library ready to consume

```bash
cd ../linarc-design-components && yarn install
```

**Check:** `ls node_modules/vue node_modules/@development/linarc-icons` succeeds.

## 3. Sandbox wiring

In the prototypes repo:
1. `yarn install`. If it fails with `Failed to replace env in config`, the registry lines in `.npmrc` are active without `GITLAB_NPM_TOKEN` set (F-011).
2. `vite.config.mjs` must have:
   - aliases `@` → library `src`, `~` → this `src`, and `@development/linarc-icons` → the library's installed copy;
   - `resolve.dedupe: ['vue']` (F-002);
   - the plugin that serves the library's CommonJS `tailwind.config.js` as ESM (F-003);
   - a dependency fallback resolver, so prototype files can import the library's dependencies (F-015);
   - an alias that maps webpack-style `~package` SCSS imports to the library's `node_modules` (F-015);
   - `define: { 'process.env': { NODE_ENV } }`, with no `VUE_APP_*` values, so prototypes never call real APIs (F-015);
   - `fs.allow` that includes the parent folder.
   - `src/main.js` registers what the library's `install()` would: PortalVue and `$moment`, plus a `<Teleport>` shim for TopNavBar (F-016).
3. `tailwind.config.js` spreads the library config and adds the library's `src` to `content`.
4. `src/style.css` imports the library's `global.css`, then rebinds `body` colour and background to tokens (F-004).
5. No secrets in `.npmrc` (F-001).

**Check:** `yarn build` passes, **and** `yarn dev` + `yarn shot prequal-requests <out>` exits 0 with both themes rendered (F-003: building isn't enough).

## 4. Connect the agent to Figma

- Claude Code: connect the Figma connector in claude.ai settings.
- Cursor's own agent (optional): add the Figma MCP server in Cursor's MCP settings.

**Check:** ask the agent to run `whoami` (it should show your Figma account and seat) and `get_metadata` on the design system file (it should list pages).

## 5. Agent instructions

| File | Role |
|---|---|
| `CLAUDE.md` | Always-on rules: stack, components, tokens, the change policy, the Figma-variable → Tailwind table, known limits |
| `.claude/skills/figma-to-prototype/SKILL.md` | Step-by-step workflow, loaded only for Figma → UI tasks |
| `.cursor/rules/prototype.mdc` | Points Cursor's agent to the two files above |
| `../linarc-design-components/PRPs/prototype-changes/README.md` | How to change the library during prototyping, plus the change log |

Keep the token mapping table current (F-007). Don't duplicate rules between files (F-013).

**Check:** in a new session, the skill appears in the agent's skill list, and asking "what framework do we use?" gets "Vue 2.7 Options API".

## 6. Wiring test

Build a throwaway prototype with a few core components (buttons, an icon button, a radio, a checkbox) in the app layout shell. Verify it with every step in [3-verification.md](3-verification.md), including computed values against Figma variables (F-012).

Include at least one **heavy** component (DataGrid, TopNavBar) in the wiring test. Simple components passed while full layouts still failed on webpack-only assumptions (F-015).

**Check:** all checks pass. Delete the test prototype.

## 7. Start prototyping

Give the agent a Figma frame URL. It follows the skill: read the design, map components and report gaps, fix the design system if needed (flagged and logged), build, verify, record.

## Resolution gaps found later (F-036)

The library was built for webpack; each of these appeared the first time a prototype imported the component that needed it. All are in place now; listed so the next gap is recognised quickly.
- **Plugins the library expects on the Vue instance:** `Vue.use(PortalVue)`, `Vue.use(Vuelidate)` (InputV2, SelectV2, FormV2), `Vue.prototype.$moment` — mirror `src/build.js` in `src/main.js`.
- **`.vue` directory imports** (`@/components/TextEditorV2` → `index.vue`): `resolve.extensions` must include `.vue`.
- **Root-absolute imports** (`/src/components/Icon.vue`) resolve only with the library as root; fix in the library (P-018 lists the 21 occurrences).
- **CommonJS default imports from the library's node_modules** (`clamp`): Vite doesn't pre-bundle deps resolved from the sibling repo; alias an ESM shim in `src/shims/`.
- **A Vuex store** (F-065): DatePicker (FormV2 `date` fields) reads `DatePicker/getHolidays` and `getWorkingDays` from the host app's store. Without one the calendar throws on open and renders as a 2px box. `src/main.js` installs Vuex (aliased to the library's `node_modules/vuex/dist/vuex.esm.js` in `vite.config.mjs`) with the same mock module as Storybook's `preview.js`. Add modules there when another store-bound component appears (Storybook's preview lists the known ones, e.g. `grid` for SpreadSheetV2).
