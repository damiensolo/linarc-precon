# CLAUDE.md — `linarc-prototypes`

Sandbox for building **view prototypes** from Figma using the Linarc design system. It consumes the sibling `../linarc-design-components` **from source** through Vite aliases.

**Building from a Figma URL?** Follow the `figma-to-prototype` skill (`.claude/skills/figma-to-prototype/SKILL.md`). This file holds the always-on rules and reference.

**Documenting the process is part of the work.** `docs/` holds the setup playbook, Figma readiness checklist, verification steps, decisions, findings log, per-prototype records and two case studies (internal and public); see `docs/README.md`. When any setup problem, workaround or surprise comes up, add a `docs/findings-log.md` entry right away, not at the end.

## Commands

- `yarn dev` → http://localhost:5173 (`?p=<slug>` picks a prototype, `?theme=dark|light` forces a theme)
- `yarn build` → production build (catches import/compile errors)
- `yarn shot <slug> [out-dir] [port] [widths] [height]` → full-page light + dark PNGs at exact viewport widths (default 1440, 1024 and 390), plus console errors and a horizontal-overflow warning. Exits 1 on errors. Uses the installed Edge via puppeteer-core; the dev server must be running. Write output to the scratchpad, not the repo.

## Rules

- **Vue 2.7 Options API, plain JS.** No Composition API, no `<script setup>`, no TypeScript (same as the library).
- **Use existing components.** Prefer `@/componentsV2/*` (fully V3.2-compliant: AppLayout, SideNavV2, InputV2, SelectV2, ModalV2, Popover, Tooltip, SegmentedControl, FormV2, StatusIndicator, …), then `@/components/*` (Button, Checkbox, Radio, Toggle, Chip, StatusChip, Avatar, …). Each has a `*.figma.js` Code Connect file mapping Figma properties to props. Storybook: `yarn storybook` in `../linarc-design-components` (:6006).
- **No lookalikes.** Never hand-build a one-off copy of a library component inside a prototype. If the library is wrong or missing something, fix or add it in the library (see below).
- **Tokens only.** No hex values, no primitive palette classes (`bg-gray-100`, `bg-slate-900`), no raw (`p-6`, `space-x-3`) or arbitrary (`h-[56px]`) values. Use the scales below.
- **Responsive by default.** Layouts must work from 390px (mobile) to 1440px+ (desktop). Use Tailwind's default breakpoints (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536) with flex/grid that reflows; no fixed page widths.
- **Imports:** `import Button from '@/components/Button/Button.vue'`; icons are `import { Search } from '@development/linarc-icons'` (lucide-vue re-exports plus Linarc module icons), rendered in Button `#leftIcon` / `#rightIcon` slots. `@` = library `src`, `~` = this repo's `src`. Don't write `import { X } from '@development/linarc-design-components'`: `build.js` has only a default export.
- **Check both themes.** Theme is the `.dark` class on `<html>`.
- **Patterns and copy come from Figma.** The Figma references define interaction patterns (modal vs drawer vs panel, toasts, tables, states) and writing conventions. If it's unclear which pattern applies, stop and ask; don't guess.
- **Mock data** lives in `src/prototypes/<slug>/data.js`. Make it plausible for construction project management, and mark it `// PLACEHOLDER DATA` until it's been verified.

## Changing the design system

**Figma is the source of truth (D-14).** When Figma and the library disagree, change the code to match Figma and log it. If a Figma value looks like a slip, keep it as drawn and flag it for design.

Allowed when the library is incorrect, missing a component or token, or lacks functionality the design needs, **as long as every change is flagged and documented**. The full process and the change log are in `../linarc-design-components/PRPs/prototype-changes/README.md`. In short:

- **Bug or mismatch, or an additive prop/slot/variant:** edit in place in the library, minimal and backwards-compatible.
- **Risky change to a widely used component, or experimental:** fork it to `src/forks/<Name>/<Name>.vue` in this repo, with a header comment naming the source path and summarising the diff. Import it as `~/forks/<Name>/<Name>.vue`.
- **Component in Figma but not in code:** create it in the library's `src/componentsV2/<Name>/` with `.vue`, `.stories.js`, `.figma.js` and `README.md`, following existing V2 patterns and Figma variables.
- **Missing token:** don't edit `tokens.css` (it's generated). Log it as `needs-token` and use the closest existing token.
- **Every change:** add a `// PROTOTYPE-CHANGE <date> (P-NNN): …` comment and a row in the log. Library work goes on a `feature/proto-<topic>` branch; ask before switching if the working tree is dirty.

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
- No production app shell is available yet. Compose page shells from Figma product screens using `AppLayout`, `TopNavBar` and `SideNavV2`.
- **Hosting (later):** the plan is a Vercel (or similar) URL. A hosted build needs the library source at build time, so it will require a monorepo, a git submodule or the published package. Not set up yet.
- Legacy `@/components/TextEditor` uses webpack-only `require()` in its template and won't work under Vite. Use `TextEditorV2`.
- CSS output is ~8 MB because the library safelists every class (`pattern: /.*/`) to support dynamic class names. This is expected; don't override it.
- `src/prototypes/ds-check/` is a temporary wiring test (buttons, icon button, radio, checkbox in AppLayout). Delete it when no longer needed.
