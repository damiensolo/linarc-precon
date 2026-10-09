# Candidate components

Components proposed for the design system that exist on neither side yet (no Figma component, no library code). Policy: D-15 in `docs/4-decisions.md`; backlog and proposal docs in `docs/components/`.

- One folder per component: `src/candidates/<Name>/<Name>.vue` plus `README.md` (copy the API table from the proposal). Import as `~/candidates/<Name>/<Name>.vue`.
- Header comment on the `.vue`: `<!-- CANDIDATE <date>: proposed design-system component, see docs/components/<Name>.md. Not a prototype-local widget. -->`
- Same rules as the library: Vue 2.7 Options API, token classes only, both themes, responsive, no lookalike of an existing component.
- Build it as it will ship: props, not page-specific data; slots for content; no imports from `src/prototypes/`.
- When promoted to `../linarc-design-components/src/componentsV2/<Name>/`, delete the folder here and switch imports to `@/componentsV2/<Name>/<Name>.vue`.
