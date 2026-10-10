# CLAUDE.md — `linarc-prototypes`

Sandbox for building **view prototypes** from Figma using the Linarc design system. It consumes the sibling `../linarc-design-components` **from source** through Vite aliases.

**Building from a Figma URL?** Follow the `figma-to-prototype` skill (`.claude/skills/figma-to-prototype/SKILL.md`). **Building a module screen from the written spec (Prequalification)?** Follow `prd-to-prototype` (`.claude/skills/prd-to-prototype/SKILL.md`); it reads `docs/prequal/` and ends by pushing an editable reference to Figma. This file holds the always-on rules and reference.

**Documenting the process is part of the work.** `docs/` holds the setup playbook, Figma readiness checklist, verification steps, decisions, findings log, per-prototype records and two case studies (internal and public); see `docs/README.md`. When any setup problem, workaround or surprise comes up, add a `docs/findings-log.md` entry right away, not at the end.

## Commands

- `yarn dev` → http://localhost:5173 (`?p=<slug>` picks a prototype, `?theme=dark|light` forces a theme)
- `yarn build` → production build (catches import/compile errors)
- `yarn shot <slug>[#hash] [out-dir] [port] [widths] [height]` → full-page light + dark PNGs at exact viewport widths (default 1440, 1024 and 390), plus console errors and a horizontal-overflow warning. Exits 1 on errors. Uses the installed Edge via puppeteer-core (if Edge fails to launch, set `EDGE_PATH` to Chrome, F-041); the dev server must be running. Write output to the scratchpad, not the repo.

## Rules

- **Vue 2.7 Options API, plain JS.** No Composition API, no `<script setup>`, no TypeScript (same as the library).
- **Use existing components.** Prefer `@/componentsV2/*` (fully V3.2-compliant: AppLayout, SideNavV2, InputV2, SelectV2, ModalV2, Popover, Tooltip, SegmentedControl, FormV2, StatusIndicator, …), then `@/components/*` (Button, Checkbox, Radio, Toggle, Chip, StatusChip, Avatar, …). Each has a `*.figma.js` Code Connect file mapping Figma properties to props. Storybook: `yarn storybook` in `../linarc-design-components` (:6006).
- **No lookalikes.** Never hand-build a one-off copy of a library component inside a prototype. If the library is wrong or missing something, fix or add it in the library (see below).
- **Tokens only.** No hex values, no primitive palette classes (`bg-gray-100`, `bg-slate-900`), no raw (`p-6`, `space-x-3`) or arbitrary (`h-[56px]`) values. Use the scales below.
- **Responsive by default.** Layouts must work from 390px (mobile) to 1440px+ (desktop). Use Tailwind's default breakpoints (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536) with flex/grid that reflows; no fixed page widths.
- **Imports:** `import Button from '@/components/Button/Button.vue'`; icons are `import { Search } from '@development/linarc-icons'` (lucide-vue re-exports plus Linarc module icons), rendered in Button `#leftIcon` / `#rightIcon` slots. `@` = library `src`, `~` = this repo's `src`. Don't write `import { X } from '@development/linarc-design-components'`: `build.js` has only a default export.
- **Check both themes.** Theme is the `.dark` class on `<html>`.
- **Border colour classes are `border-border-*`** (`border-border-inactive`, `border-border-subtle`). A bare `border-default` or `border-subtle` matches no token and silently takes Tailwind's preflight grey (#e5e7eb) in both themes (F-043). Before calling a screen done, grep for `border-(default|subtle|inactive|muted|container|neutral|soft)` without the `border-border-` prefix.
- **Patterns and copy come from Figma.** The Figma references define interaction patterns (modal vs drawer vs panel, toasts, tables, states) and writing conventions. If it's unclear which pattern applies, stop and ask; don't guess.
- **Mock data** lives in `src/prototypes/<slug>/data.js`; screens of one module share it in `src/modules/<module>/data/` so a row on one screen leads to the same entity on the next. Make it plausible for construction project management, and mark it `// PLACEHOLDER DATA` until it's been verified.
- **UI patterns are decided; read `docs/5-ui-patterns.md` before building or changing a screen.** In short: create flows are **full-page create screens** (module nav + Title Bar / Workflow with back arrow + centred form column, 56rem for wide forms + fixed bottom-panel footer aligned to that column), **never modals**; modals only for short single-step tasks. One container level, hairlines not boxes, whitespace not rules between sections, colour only where the user must act, one signal per status, label-only buttons (D-17, D-18). Alternatives for comparison are a second slug `<slug>-<variant>` sharing state and components.
- **Status is never a string literal in a template.** Labels and tones come from the module's status vocabulary (`src/modules/prequal/status.js`, documented in `docs/prequal/status-model.md`): text plus colour, never colour alone; red only for knockout / expired / rejected.

## Changing the design system

**Figma is the source of truth (D-14).** When Figma and the library disagree, change the code to match Figma and log it. If a Figma value looks like a slip, keep it as drawn and flag it for design.

Allowed when the library is incorrect, missing a component or token, or lacks functionality the design needs, **as long as every change is flagged and documented**. The full process and the change log are in `../linarc-design-components/PRPs/prototype-changes/README.md`. In short:

- **Bug or mismatch, or an additive prop/slot/variant:** edit in place in the library, minimal and backwards-compatible.
- **Risky change to a widely used component, or experimental:** fork it to `src/forks/<Name>/<Name>.vue` in this repo, with a header comment naming the source path and summarising the diff. Import it as `~/forks/<Name>/<Name>.vue`.
- **Component in Figma but not in code:** create it in the library's `src/componentsV2/<Name>/` with `.vue`, `.stories.js`, `.figma.js` and `README.md`, following existing V2 patterns and Figma variables.
- **Component in neither Figma nor code:** a **candidate** (D-15, next section). Not a library edit yet, and not a prototype-local widget either.
- **Missing token:** don't edit `tokens.css` (it's generated). Log it as `needs-token` and use the closest existing token.
- **Every change:** add a `// PROTOTYPE-CHANGE <date> (P-NNN): …` comment and a row in the log. Library work goes on a `feature/proto-<topic>` branch; ask before switching if the working tree is dirty.

## Module prototypes and candidate components

The Prequalification module (`docs/prequal/`: plan, spec, status model, screen inventory) is built as a set of screens that behave as one product area.

- **Slugs:** `prequal-<screen>` (`prequal-dashboard`, `prequal-wizard`, `prequal-portal`, `prequal-review`, `prequal-record`). Shell = Preconstruction top nav + Prequalification rail (D-13), except the subcontractor portal (external user: reduced Linarc top nav, Company variant with logomark, no side rail, no PrequalShell).
- **Shared data and vocabulary:** `src/modules/prequal/` (`status.js`, `nav.js`, `data/`). Screens import from there. **Shell and routing:** every GC-side screen renders inside `~/modules/prequal/PrequalShell.vue`; links between screens use `~/modules/prequal/router.js` (`go(screen, id)`, `href(screen, id)`), which sets `?p=<slug>` and puts the record id in the hash, so each screen stays its own prototype slug for the picker and `yarn shot`.
- **Candidate components** (D-15): when a screen needs a component that exists in neither Figma nor the library, it's proposed first (`docs/components/<Name>.md` from `_template.md`, row in `docs/components/README.md`), then built in `src/candidates/<Name>/<Name>.vue` (rules in `src/candidates/README.md`), imported as `~/candidates/<Name>/<Name>.vue`, then drawn in Figma with variables bound for a design iteration, and only then promoted into the library with stories, README, `.figma.js` and a P-row. A candidate is built as it will ship: props and slots, no page data, no imports from `src/prototypes/`. Header comment `CANDIDATE <date>`.
- **Before proposing a candidate**, check the library, the Figma component list and the backlog; a variant of an existing component is an extension (P-row), not a candidate. Each screen should need fewer candidates than the one before; if not, say so.
- **Every screen ends in Figma** as editable Light + Dark frames on the Documentation file's Draft page (skill step 6), so design reviews there.

## Figma variable → Tailwind class

| Figma variable | Tailwind class |
|---|---|
| `--text-*` (e.g. `--text-default`, `--text-inactive`) | `text-text-default`, `text-text-inactive` |
| `--surface-*` (e.g. `--surface-container`, `--surface-primary-default`) | `bg-surface-container`, `bg-surface-primary` (`-hover`, `-active`, `-disabled`) |
| `--border-*` | `border-border-default`, `border-border-subtle` |
| `--icon-primary-default`, `--icon-inactive` | `border-icon-primary`, `bg-icon-primary`, `text-icon-inactive` |
| `--space-N` | `p-space-N`, `gap-space-N`, `m-space-N`, `w-space-N`, `h-space-N` (0,2,4,8,10,12,16,18,20,24,28,32,36,40,44,48,56,64,72,80,84,88,124) |
| `--radius-N` | `rounded-radius-N` (0,2,4,6,12,20,32,round) |
| `--font-size-N` | `text-fontsize-N` (8,12,14,16,18,20,24,28,32,36) |
| `--line-height-N` | `leading-lineheight-N` |
| `--letter-spacing-N` | `tracking-letterspacing-N` |
| `--font-family-label` / heading | `font-label` / `font-heading` |
| text style `label/md/regular` | `font-label font-normal text-fontsize-16 leading-lineheight-24 tracking-letterspacing-4` |
| text style `label/sm/regular` | `font-label font-normal text-fontsize-14 leading-lineheight-20 tracking-letterspacing-0` |

Not in the table? Look it up: `../linarc-design-components/tailwind.config.js` (class → CSS var) and `src/styles/tokens.css` (`:root` = light, `.dark` = dark).

Design system Figma file: `1HxMANBEaYWFqEFtazB20l` (Linarc Design System V3.2).

## Setup notes / known limits

- `src/style.css` loads the library's `global.css` (same as production), then rebinds `body` colour to tokens because `global.css` hardcodes `#06152b`.
- `vite.config.mjs`: `resolve.dedupe: ['vue']` keeps a single Vue instance. A small plugin serves the library's CommonJS `tailwind.config.js` as ESM (it's imported by `src/utils/Colors.js`; dev crashes without the plugin).
- Library dependencies (including `@development/linarc-icons`) resolve from `../linarc-design-components/node_modules`, so that repo must have `yarn install` done.
- `src/main.js` mirrors the plugins the library's `build.js` installs: PortalVue, **Vuelidate** (InputV2, SelectV2, FormV2 validate through `this.$v`), `$moment`. `vite.config.mjs` adds `.vue` to `resolve.extensions` (directory imports like `@/components/TextEditorV2`) and aliases CommonJS `clamp` to an ESM shim in `src/shims/`. A new "could not resolve / no default export" error from a library import is usually another of these; see F-036 and the playbook's "Resolution gaps" list.
- No production app shell is available yet. Compose page shells from Figma product screens using `AppLayout`, `TopNavBar` and `SideNavV2`.
- **Hosting (later):** the plan is a Vercel (or similar) URL. A hosted build needs the library source at build time, so it will require a monorepo, a git submodule or the published package. Not set up yet.
- Legacy `@/components/TextEditor` uses webpack-only `require()` in its template and won't work under Vite. Use `TextEditorV2`.
- CSS output is ~8 MB because the library safelists every class (`pattern: /.*/`) to support dynamic class names. This is expected; don't override it.
