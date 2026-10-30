# From one screen to a repeatable factory

*Internal · living draft · updated 2026-10-30 · milestone 3: the first module complete and live, a template extracted, a second module built from it by another session*

**In three weeks an AI agent went from one Figma frame rebuilt in 13 minutes to a ten-screen Prequalification module with an end-to-end demo, a hosted URL and an editable Figma app map; the sandbox it ran in became a template, and a second module (Email) was built from that template in two weeks, with its first week's findings already fed back.**

**Why it matters:** the question was never "can an agent draw a screen". It was whether the output stays inside the design system, whether the second screen is cheaper than the first, and whether a second module is cheaper than the first. All three are now measured, not argued.

## Before (2026-10-06 → 10-09)

- **Setup ate the first days.** Two Vue instances, a CommonJS Tailwind config the dev server couldn't serve, webpack-only imports, a missing Vuex store: six wiring findings (F-002, F-003, F-015, F-016, F-036, F-065) before the shell was stable.
- **Figma was the weak link.** 23 of 30 md Icon Button variants carried an unbound, oversized icon (P-001). On the first product screen, all 4 of 18 measured mismatches were library defaults (F-017).
- **Conventions lived in prose.** "No hex", "no bare `border-subtle`" were rules in CLAUDE.md that a grep had to police by hand (F-043).
- **Every link reloaded the page** and blanked the app, white even in dark mode (F-057); loading had no agreed shape.
- **Time per screen wasn't measured** for 4 of the first 6 screens; "not measured" sat in the records.
- **No hosting** (D-09: the library source isn't available to a hosted build) and nothing anyone else could open.
- State at milestone 2: 6 screens, 50 findings, 20 decisions, 29 library changes.

## After (2026-10-30)

- **One module, complete.** 9 screens plus a modal variant for comparison: overview, review queue, qualified list, new-request wizard, subcontractor portal with simulated uploads, review with decisions, qualification record, templates list and a template builder with custom fields, sections and versions. A demo session (D-29) carries a request from invite to decision across every screen and survives a reload.
- **Live.** Hosted on Vercel since 2026-10-13 as a prebuilt upload (`yarn deploy`, D-09 settled), with page analytics and a settings gear that hides the sandbox controls for reviewers.
- **In Figma as an app map** (D-22): six levels of editable, variable-bound screens and states with labelled arrows; 818 text nodes carry text styles, every fill, gap and radius a variable (F-055).
- **Never blank.** In-document navigation and one loading pattern (D-24): nothing for 200ms, then a skeleton in the final layout; content kept on refresh; honest slow and failed states; three candidates (Skeleton, LoadRegion, LoadStatus) drawn in Figma.
- **Conventions are code.** `yarn lint` enforces the token, palette, border, framework and navigation rules; `yarn verify` runs it before every build.
- **The sandbox is a template.** `linarc-prototype-base` (2026-10-15): wiring, sandbox, a generic shell / router / status vocabulary, the loading candidates, two example screens, the skills, the docs, `yarn create-app`. A scaffolded app built and verified first time.
- **A second module proved it.** `linarc-email` (correspondence and notifications), scaffolded from the template on 2026-10-15 by another session and built 10-17 → 10-29: 8 screens, 9 candidates of its own (a slide-over panel among them, which revised the "no drawers" rule into D-34), 29 decisions, 38 findings, 18 library changes including two new V2 components (NotificationItem, NotificationBar). Its records carry times: 45 min to 1.5 h from spec to first render, 1.25 to 2.5 h to verified, per screen.
- **The loop closed the same week.** The second app's first findings were template bugs: `yarn check` was shadowed by Yarn's built-in command and the screenshot script assumed Windows (its F-004, F-011). Both fixed in the template on 2026-10-30.

## By the numbers

| | Milestone 2 (2026-10-09) | Now (2026-10-30) |
|---|---|---|
| Screens | 6 (one module) | 9 + 1 variant (module 1) · 8 (module 2) |
| First render of a screen | 13 min from a Figma frame; "not measured" from spec | 45 min – 1.5 h from spec (module 2, measured) |
| Verified screen | not measured | 1.25 – 2.5 h (module 2) |
| Findings | 50 | 72 (module 1) · 38 (module 2) · 2 (template) |
| Decisions | 20 | 32 (module 1) · 29 new (module 2) |
| Library changes logged | 29 | 64 (46 from module 1, 18 from module 2); 22 awaiting review |
| Candidates | 8 in use | 11 (module 1, 4 drawn in Figma) · 9 (module 2, 8 drawn) |
| Figma reference | 5 of 6 screens as loose frames | every screen and state on an app map, fully bound |
| Hosting | none | Vercel, prebuilt, analytics |
| New app setup | days of wiring | `yarn create-app`, verified first time |

## What changed in the method

1. **Fix the source, not the output** (unchanged): machine-readable Figma, real components from source, logged library fixes.
2. **Write the rule once, then make it code.** Review feedback became `5-ui-patterns.md`; the rules a grep can check became `yarn lint`.
3. **Extract the template at the first stable module**, not later: everything the second module inherited (wiring, loading, navigation, sandbox, skills) was paid for once.
4. **Measure the second module.** The template's records carry times; the first module's said "not measured".
5. **Feed findings back the same week.** The second app's first-day findings fixed the template before a third app starts.

## What we learned

- **A template is the cheapest way to make conventions stick.** The second module inherited every fix without being told.
- **Rules that only live in prose erode;** rules that run as a linter don't.
- **The second user finds the template's bugs,** not the author: `yarn check` looked right on the author's machine for two weeks.
- **A rule stated too hard gets revised by the next module.** "Don't invent a drawer" became "drawers when they help; here's the candidate" (D-34) once a module needed one.
- **Audit the bindings, not just the values; verify the verifier** (unchanged, and still earning their place: F-050, F-052, the wrong-server capture in the template's verification doc).

## What's next

- **Merge requests** for the 22 library changes awaiting review; **publish the Figma library** so the dark-mode, Select Menu and form-control fixes reach other files.
- **Promote the drawn candidates** (loading states, slide-over panel, thread stream) into the library with stories and Code Connect.
- **Design review** of both app maps; the Email compose flow is still only in code (module 2's F-036).
- **A third module from the template**, timed from `create-app` to the first verified screen, to see whether the second module's times hold.

**Still to prove:** whether design accepts the app maps as a starting point; whether a teammate repeats the setup from the playbook alone; whether the measured times hold for a module with new patterns.

**Go deeper:** [UI patterns](../5-ui-patterns.md) · [module plan](../prequal/00-plan.md) · [screens](../prequal/screens.md) · [candidates](../components/README.md) · [playbook](../1-setup-playbook.md) · [verification](../3-verification.md) · [findings](../findings-log.md) · [decisions](../4-decisions.md) · [template](../../../linarc-prototype-base/README.md) · [template findings](../../../linarc-prototype-base/docs/findings-log.md) · [module 2 findings](../../../linarc-email/docs/findings-log.md) · [module 2 decisions](../../../linarc-email/docs/4-decisions.md) · [library change log](../../../linarc-design-components/PRPs/prototype-changes/README.md)
