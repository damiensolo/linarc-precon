# Fix Figma first, then build

*Internal · living draft · updated 2026-10-09 · milestone 2: Prequalification module, six MVP screens built from the written spec*

**An AI agent built the six-screen Prequalification module from a written spec, not from Figma frames, using library components, then pushed each screen back to Figma as editable Light and Dark frames for design review.**

**Why it matters:** design gets an editable, token-bound starting point, and engineering gets screens made of real components. Every gap went into the library or a logged candidate, not into one-off page code. 29 library changes are logged, each ready for an MR.

## The big picture
The agent doesn't see a picture. It reads layers, variables, component mappings and written rules.
- Bound variables → it maps them to tokens and checks the output against them.
- Raw values or unwritten decisions → it guesses.

## What we found
- **Milestone 1 (first screen): Figma was the weak link.** 23 of 30 md Icon Button variants had an unbound, oversized icon (P-001). On the first product screen, all 4 of the 18 measured mismatches were library defaults (F-017).
- **The library shrank the work screen by screen.** New candidate components per screen: 3 (dashboard), 5 (portal), 0 (wizard), 1 (review), 0 (record). Later screens reused what earlier ones added.
- **Figma had components that code didn't.** The Stepper and Tab Navigation existed only in Figma; the agent built them into the library instead of hand-coding lookalikes (P-025, P-028).
- **The user's design review became rules.** "No modals for create", "centre the form", "no boxes inside boxes" became decisions D-17 to D-20 and a single patterns doc. Later screens followed them without being told again.
- **Small misses still needed a human eye.** Step badges rendered at 12px instead of Figma's 16px; the user spotted it (F-048).
- **Bugs hid in shared parts.** Expiry dates showed one day early in US time zones from screen 1 until screen 6 (F-049).
- **Audits have blind spots.** The dark-mode variable audit passed a correct variable used in the wrong place: the ID chip's label vanished in Dark on every screen until it was rebound (F-050).
- **Two agents, one log.** A parallel session wrote the same change-log numbers. The fix is to re-read the log just before every append (F-047).

## By the numbers
- **13 min** from Figma link to the first verified product screen (milestone 1).
- **6** MVP screens built from the spec, plus a modal version B of the create flow for comparison.
- **5 of 6** screens have editable Light and Dark Figma references; the subcontractor portal is still pending.
- **8** candidate components in use (9 proposed; multi-select became a library extension); **2** Figma components given code.
- **50** findings, **20** decisions, **29** library changes (8 done, 19 awaiting review, 1 awaiting library publish, 1 needing code).

## How it works
1. **Machine-readable Figma:** bound variables, consistent variants, published Code Connect.
2. **Real components:** the design system consumed from source.
3. **Written-down rules:** the token table, agent skills, Figma as source of truth, and a UI patterns doc of the user's design decisions.
4. **Tracked fixes:** library gaps fixed and logged; components missing on both sides become candidates first.
5. **Layered checks:** build → render → both themes → three widths → interactions scripted → numbers against Figma → editable Figma frames back for review.

## What we learned
- **Fix the source, not the output.**
- **Write design decisions down once.** The agent repeats only what's written.
- **Each screen should need fewer new parts than the last; if not, ask why.**
- **Audit with scripts, and audit the bindings, not just the values.**
- **Shared logs need a re-read before every write.**
- **"It builds" isn't "it works." Verify the verifier.**

## What's next
- **Design review in Figma** of the six screens, then promote the candidates (Figma component → library → Code Connect).
- **Publish the Figma library** so the dark-mode chip fix (P-029) and the new Select Menu tags variant reach other files.
- **Portal Figma reference**, and merge requests for the 19 changes awaiting review.
- **Hosting:** Vercel, blocked until the library source is available at build time (D-09).

**Still to prove:** time per screen from the spec (not measured this round); whether design accepts the Figma frames as a starting point; whether a teammate can repeat the setup from the playbook.

**Go deeper:** [UI patterns](../5-ui-patterns.md) · [module plan](../prequal/00-plan.md) · [screens](../prequal/screens.md) · [candidates](../components/README.md) · [playbook](../1-setup-playbook.md) · [verification](../3-verification.md) · [findings](../findings-log.md) · [decisions](../4-decisions.md) · [Requests record](../prototypes/prequal-requests.md) · [library change log](../../../linarc-design-components/PRPs/prototype-changes/README.md)
