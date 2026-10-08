# Design for the machine first

*Case study · AI prototyping on a production design system*

**I got an AI agent to build UI prototypes that match the design to the pixel, using only real production components. The breakthrough wasn't the prompt. It was the design file.**

**Why it matters:** most AI prototypes either look right but use fake components, or use real components with the details wrong. Both cost engineering time.

## The big picture
An AI agent doesn't see your design. It reads data: layers, properties, variables.
- A size bound to a variable becomes a token the agent can map to code and check.
- A raw number is a guess waiting to happen.

## What I found
- **The design file was the weak link.** One component had 23 of 30 variants quietly inconsistent after a partial manual fix. A script found it in seconds; eyes never would.
- **"It builds" hid "it's broken."** A clean build masked a blank page.
- **Even the test tools lied.** A "mobile" screenshot was really rendered 100px wider, which hid a layout bug.

## By the numbers
- **5 of 5** measured values (size, icon, colour, radius) matched the design exactly.
- **0** manual adjustments.

## The formula
1. **Make the design file machine-readable:** variables, consistent variants, component-to-code mappings.
2. **Use only real components:** the production design system, not lookalikes.
3. **Write the rules down once:** a token map and a step-by-step workflow for the agent.
4. **Let prototypes fix the system:** every change is flagged and logged for engineering.
5. **Verify in layers:** build, render, themes, real screen sizes, then numbers against the design.

## What I learned
- **Fix the source, not the output.**
- **Audit with scripts, not eyes.**
- **Verify the verifier.**

## What's next
Full product screens, measuring time from design to verified prototype.
