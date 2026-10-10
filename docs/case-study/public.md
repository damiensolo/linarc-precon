# Design for the machine first

*Case study · AI prototyping on a production design system*

**I got an AI agent to build a full product screen from a design file in 13 minutes, using only real production components. Then I gave it a written spec instead of designs, and it built a six-screen module and drew each screen back into the design file for review.**

**Why it matters:** most AI prototypes either look right but use fake components, or use real components with the details wrong. Both cost engineering time. This way, design and engineering start from the same parts.

## The big picture
An AI agent doesn't see your design. It reads data: layers, properties, variables, and the rules you've written down.
- A size bound to a variable becomes a token the agent can map to code and check.
- A raw number, or a decision nobody wrote down, is a guess waiting to happen.

## What I found
- **The design file was the weak link.** One component had 23 of 30 variants quietly inconsistent. A script found it in seconds.
- **Every mismatch had an owner.** The first screen matched 14 of 18 measured values; all 4 misses were library defaults.
- **The system got cheaper to build with.** New components needed per screen went 3, 5, 0, 1, 0. Later screens reused earlier parts.
- **Some components existed only in the design file.** The agent added them to the code library instead of faking them on the page.
- **My design feedback became rules.** "No modals for create flows" and "no boxes inside boxes" went into one written patterns doc, and later screens followed them unprompted.
- **Audits have blind spots.** A colour audit passed every variable, yet a label vanished in dark mode: a correct variable was used on the wrong background.
- **Small misses still need a human eye.** Step badges rendered 4px too small. I caught it, not the checks.

## By the numbers
- **13 min** from design link to the first verified product screen.
- **6** screens built from a written spec, each from production components.
- **5 of 6** drawn back into the design file as editable light and dark frames.
- **54** dark-mode bugs found in one pass of 271 colour variables.

## The formula
1. **Make the design file machine-readable:** variables, consistent variants, component-to-code mappings.
2. **Use only real components:** the production design system, not lookalikes.
3. **Write the rules down once:** tokens, the agent's workflow, the source of truth, and your design decisions.
4. **Let prototypes fix the system:** every change is flagged and logged for engineering.
5. **Close the loop:** verify in layers, then put the result back in the design file for review.

## What I learned
- **Fix the source, not the output.**
- **Write design decisions down once.**
- **Audit the bindings, not just the values.**
- **Verify the verifier.**

## What's next
Design review of the six screens, then promoting the new components into the library and a hosted build anyone can open.
