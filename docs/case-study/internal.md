# Fix Figma first, then let AI build

*Internal · living draft · updated 2026-10-06 · setup verified, first product screen next*

**AI agents can now build prototypes from our real design system that match Figma to the token, but only after the Figma file is made machine-readable.**

**Why it matters:** prototypes built this way can go straight to engineering. No lookalike components, and no rounds of "that's the wrong size."

## The big picture
The agent doesn't see a picture. It reads layers, variables and component mappings.
- Bound variables → it maps them to tokens and checks the output against them.
- Raw values → it guesses.

## What we found
- **Figma was the weak link.** 23 of the 30 md Icon Button variants had an unbound, oversized icon after a partial manual fix. A script found it in one pass; eyes had missed it. Fixed in Figma and code (P-001).
- **A passing build hid a blank page.** Only a real render with console capture showed it (F-003).
- **The test tools lied too.** Headless Edge rendered "390px" at 492px and hid an overflow. We replaced it (F-010).

## By the numbers
- **5/5** computed values matched Figma variables exactly: size, icon, colour (#2563eb), radius.
- **0** manual adjustments needed.
- **13** findings, **10** decisions, **1** library fix logged.

## How it works
1. **Machine-readable Figma:** bound variables, consistent variants, Code Connect.
2. **Real components:** the design system consumed from source.
3. **Written-down rules:** a token mapping table and a step-by-step agent skill.
4. **Tracked fixes:** library gaps get fixed, flagged and logged for an MR.
5. **Layered checks:** build → render → themes → exact widths → numbers against Figma.

## What we learned
- **Fix the source, not the output.**
- **Bind everything to variables.**
- **Audit with scripts, not eyes.**
- **"It builds" isn't "it works."**
- **Verify the verifier.**

## What's next
The first product screen will supply the missing numbers: time from link to verified prototype, and how much works first time. Hosting on Vercel follows.

**Go deeper:** [playbook](../1-setup-playbook.md) · [Figma readiness](../2-figma-readiness.md) · [verification](../3-verification.md) · [findings](../findings-log.md) · [decisions](../4-decisions.md)
