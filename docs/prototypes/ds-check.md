# Design system wiring check (`ds-check`)

- **Date:** 2026-10-06
- **Figma:** design system file (Button, Icon Button `27124:27624`, Radio `27223:28995`, Checkbox)
- **URL:** `/?p=ds-check`
- **Status:** done (temporary; delete when no longer needed)

## Metrics
| Measure | Value |
|---|---|
| Time from Figma link to first render | Not measured (first run) |
| Time to verified done | Not measured (first run) |
| Components used (library / forked / new) | 5 / 0 / 0 |
| Gaps found | 1 (icon slot import path), fixed in the sandbox config |
| Verification rounds before passing | 1 |
| Computed-value checks (pass/total) | 5/5 |

## Components
`AppLayout` (`#header`, `#content`); `Button` md primary solid, md secondary outline, md icon-only with `Search` from `@development/linarc-icons` in `#leftIcon`; `Radio` ×2 with `v-model`; `Checkbox` with `v-model`.

## Gaps and how they were handled
| Gap | Handling | Log ID |
|---|---|---|
| `@development/linarc-icons` wasn't importable from prototypes | Vite alias to the library's installed copy | — (sandbox config) |

## Verification
- Build passed; dev rendered with no console errors; both themes rendered.
- Computed values against `get_variable_defs` for the md Primary Solid icon button: 32×32 (`--space-32`), 18px icon (`--space-18`), `rgb(37, 99, 235)` = #2563eb (`--surface-primary-default`), 4px radius (`--radius-4`). Primary button 32px tall, Lato 14px.
- Exact-viewport capture at 390px exposed a sandbox top-bar overflow (F-010), now fixed.

## Findings
F-010, F-012.
