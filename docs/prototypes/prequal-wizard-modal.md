# Prequalification › New request, version B: modal (`prequal-wizard-modal`)

- **Date:** 2026-10-09
- **Figma:** app map Level 2c · 26 [3789:3775](https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3789-3775) (comparison only)
- **URL:** `/?p=prequal-wizard-modal` (`#work`, `#requirements`, `#invite` open a step)
- **Status:** verified; kept for comparison

The first build of the New request wizard: the four steps in a `ModalV2` (`customSlot`) over the Overview, with ProgressStepper at the top and Back / Save draft / Next in the dialog footer. The user chose the full-page create screen as the default (D-18) and asked to keep this one as a second version to compare against.

Everything except the container is shared with the default (`prequal-wizard`): state, validation and navigation in `src/prototypes/prequal-wizard/wizardState.js`, the steps in `src/prototypes/prequal-wizard/components/`. Scenario, component map, verification and findings: [prequal-wizard.md](prequal-wizard.md).

Differences worth looking at in the comparison:
- The modal keeps the Overview visible behind a scrim; the full page keeps the module nav and the title bar's back arrow instead.
- The modal needs its own width (no wide Modal size in Figma) and scrolls the steps inside the dialog; the full page scrolls the content area and pins the footer to the window.
- On a phone both end up full-screen; the full page keeps the top nav, the modal covers it.

## Update 2026-10-10: Figma app map
The Light / Dark frames on the Documentation file's Draft page were deleted at the user's request; the reference is now the Documentation › **Prequalifications** app map (page `3766:33584`), light mode, every screen and state as editable library instances with labelled arrows (D-22). Frame: 26 `3789:3775`. `prototype.figma` points there. Dark mode is checked in code (`yarn shot`), not drawn.

## Update 2026-10-11: loading states (D-24)
Shares `prequal-wizard/wizardState.js`, so Send invite / Save draft are honest here too (see [prequal-wizard.md](prequal-wizard.md)): "Sending…" / "Saving…" and "Couldn't send the invite." + Retry sit in the modal footer where "Draft saved …" was. Verified with the same timeline (medium leaves after ~1s, fail keeps the message, 1 request for 2 clicks); `yarn shot` exits 0.
- **Consolidated 2026-10-11:** the footer line is the shared `LoadStatus` on `wizardState`'s `actionLoad` (see [prequal-wizard.md](prequal-wizard.md)); re-verified Send invite and Save draft at medium and fail.
