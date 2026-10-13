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

## Sharing (Vercel)
The site is built locally and only `dist/` is uploaded (Vercel can't build it: it compiles `../linarc-design-components` from source).
```bash
npm i -g vercel     # once
vercel login        # once
vercel link         # once, in this folder
yarn deploy         # build + publish to the production URL
```
`yarn deploy:preview` publishes a throwaway preview URL instead.

## New prototype
Create `src/prototypes/<slug>/index.vue` (export `prototype: { title, figma }` from the component; see an existing prototype). It appears in the picker automatically.
See [CLAUDE.md](CLAUDE.md) for the Figma workflow, the token mapping and the rules.
