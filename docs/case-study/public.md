# Design for the machine first

*Case study · AI prototyping on a production design system*

**I got an AI agent to build a full product screen from a design file in 13 minutes, using only real production components, and to check it number by number. The breakthrough wasn't the prompt. It was the design file.**

**Why it matters:** most AI prototypes either look right but use fake components, or use real components with the details wrong. Both cost engineering time.

## The big picture
An AI agent doesn't see your design. It reads data: layers, properties, variables.
- A size bound to a variable becomes a token the agent can map to code and check.
- A raw number is a guess waiting to happen.

## What I found
- **The design file was the weak link.** One component had 23 of 30 variants quietly inconsistent after a partial manual fix. A script found it in seconds; eyes never would.
- **Every mismatch had an owner.** The first full screen matched 14 of 18 measured values. All 4 misses were defaults in the component library, not the prototype.
- **"Set up" isn't "live."** The component-to-code mappings looked done, but one stale file had blocked every publish. The agent saw none of them.
- **A design stroke isn't a CSS border.** A button shrank 2px when pressed. My checks only measured it at rest.
- **Dark mode needs a script.** Three rounds of screenshots found 6 wrong colour variables. One scripted audit found 54.
- **Even the test tools lied.** A "mobile" screenshot was really rendered 100px wider, which hid a layout bug.

## By the numbers
- **13 min** from design link to a verified full product screen.
- **14 of 18** measured values matched the design on the first pass. The other 4 are now fixed.
- **54** dark-mode bugs found in one pass of 271 colour variables.

## The formula
1. **Make the design file machine-readable:** variables, consistent variants, component-to-code mappings.
2. **Use only real components:** the production design system, not lookalikes.
3. **Write the rules down once:** a token map, a step-by-step workflow for the agent, and which side is the source of truth.
4. **Let prototypes fix the system:** every change is flagged and logged for engineering.
5. **Verify in layers:** build, render, both themes, real screen sizes, every interaction state, then numbers against the design.

## What I learned
- **Fix the source, not the output.**
- **Audit with scripts, not eyes.**
- **Measure every state, not just rest.**
- **Verify the verifier.**

## What's next
More screens, to see whether 13 minutes holds, and a hosted build anyone can open.
