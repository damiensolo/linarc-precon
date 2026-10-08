# Linarc Prototypes Sandbox

An independent sibling workspace to `linarc-design-components`, for building view prototypes from Figma.

## Purpose
- An isolated prototyping environment that uses the design system from source (`../linarc-design-components/src`).
- UI built 100% in-system, using tokens and components.
- Zero modifications to the core component library.

## Running
```bash
yarn dev
```
Runs at http://localhost:5173. Use `?p=<slug>` to pick a prototype and `?theme=dark` to force dark mode.

## New prototype
Copy `src/prototypes/_blank/` to `src/prototypes/<slug>/`. It appears in the picker automatically.
See [CLAUDE.md](CLAUDE.md) for the Figma workflow, the token mapping and the rules.
