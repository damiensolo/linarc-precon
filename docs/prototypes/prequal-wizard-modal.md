# Prequalification › New request, version B: modal (`prequal-wizard-modal`)

- **Date:** 2026-10-09
- **Figma:** Documentation › Draft, New request (version B: modal) — Light `3751:4083` / Dark `3751:7308`
- **URL:** `/?p=prequal-wizard-modal` (`#work`, `#requirements`, `#invite` open a step)
- **Status:** verified; kept for comparison

The first build of the New request wizard: the four steps in a `ModalV2` (`customSlot`) over the Overview, with ProgressStepper at the top and Back / Save draft / Next in the dialog footer. The user chose the full-page create screen as the default (D-18) and asked to keep this one as a second version to compare against.

Everything except the container is shared with the default (`prequal-wizard`): state, validation and navigation in `src/prototypes/prequal-wizard/wizardState.js`, the steps in `src/prototypes/prequal-wizard/components/`. Scenario, component map, verification and findings: [prequal-wizard.md](prequal-wizard.md).

Differences worth looking at in the comparison:
- The modal keeps the Overview visible behind a scrim; the full page keeps the module nav and the title bar's back arrow instead.
- The modal needs its own width (no wide Modal size in Figma) and scrolls the steps inside the dialog; the full page scrolls the content area and pins the footer to the window.
- On a phone both end up full-screen; the full page keeps the top nav, the modal covers it.
