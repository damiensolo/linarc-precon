# Fix Figma first, then build

*Internal · living draft · updated 2026-10-08 · first product screen done (Preconstruction › Prequalification › Requests)*

**An AI agent built a full product screen from Figma in 13 minutes using only library components, and every mismatch it found traced to a specific bug in Figma, the library or the tokens.**

**Why it matters:** prototypes built this way can go straight to engineering, and each one improves the library. 17 changes are logged so far, each ready for an MR.

## The big picture
The agent doesn't see a picture. It reads layers, variables and component mappings.
- Bound variables → it maps them to tokens and checks the output against them.
- Raw values → it guesses.

## What we found
- **Figma was the first weak link.** 23 of the 30 md Icon Button variants had an unbound, oversized icon. A script found it in one pass; eyes had missed it (P-001).
- **Every mismatch had an owner.** On the first product screen, 14 of 18 measured values matched Figma. All 4 misses were library defaults, not the prototype (F-017).
- **The source-of-truth rule changed twice.** First code won by default (D-11), then the sibling component broke ties (F-024). Now Figma wins and code changes to match (D-14).
- **"Set up" isn't "live."** One stale template had blocked every Code Connect publish, so the agent saw 0 mappings. Now 156 of 156 instances resolve (F-020). Later, a publish passed validation but showed the wrong icon in Dev Mode (F-027).
- **A Figma stroke isn't a CSS border.** The CTA shrank 2px when pressed. Our checks only measured buttons at rest; the user caught it (F-029).
- **Dark mode needs a script.** Three rounds of screenshots found 6 wrong variables. One audit of 271 variables found 54 (F-032).
- **The test tools lied too.** Headless Edge rendered "390px" at 492px and hid an overflow (F-010).

## By the numbers
- **13 min** from Figma link to a verified first product screen: top nav, side nav, title bar, toolbar and an 18-row table.
- **14/18** computed values matched Figma on the first pass. The 4 misses have since been fixed.
- **5/5** computed values matched exactly on the wiring test.
- **156/156** component instances on the screen resolve to code in Dev Mode.
- **54** dark-mode variable bugs found by one scripted audit.
- **32** findings, **14** decisions, **17** library changes (7 done, 10 awaiting review, 0 merged).

## How it works
1. **Machine-readable Figma:** bound variables, consistent variants, published Code Connect.
2. **Real components:** the design system consumed from source.
3. **Written-down rules:** a token mapping table, a step-by-step agent skill, and Figma as the source of truth.
4. **Tracked fixes:** library gaps get fixed, flagged and logged for an MR.
5. **Layered checks:** build → render → both themes → exact widths → every interaction state → numbers against Figma, plus a variable audit before publishing.

## What we learned
- **Fix the source, not the output.**
- **Bind everything to variables.**
- **Decide the source of truth once, and write it down.**
- **Audit with scripts, not eyes.**
- **Read back what you publish.**
- **Measure every state, not just rest.**
- **"It builds" isn't "it works." Verify the verifier.**

## What's next
- **Get the changes merged:** 10 of the 17 await review. Open questions are toolbar responsiveness (P-007), Teleport (P-008), chip label padding (P-010) and tree indent (P-011).
- **Real content for Requests:** the table still uses the registry placeholder data.
- **Hosting:** Vercel, blocked until the library source is available at build time (D-09).

**Still to prove:** whether 13 minutes holds on a second screen; how much passes first time without the user catching something; whether a teammate can repeat the setup from the playbook.

**Go deeper:** [playbook](../1-setup-playbook.md) · [Figma readiness](../2-figma-readiness.md) · [verification](../3-verification.md) · [findings](../findings-log.md) · [decisions](../4-decisions.md) · [Requests record](../prototypes/registry-list.md) · [library change log](../../../linarc-design-components/PRPs/prototype-changes/README.md)
