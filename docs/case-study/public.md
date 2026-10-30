# Design for the machine, then repeat

*Case study · AI prototyping on a production design system · three weeks, two modules*

**I had an AI agent rebuild one screen from a design file in 13 minutes using only production components. Three weeks later the same approach had produced a complete ten-screen module with a live demo and an editable design-file map, a reusable template, and a second module built from that template in two weeks, with its first bugs already fed back.**

**Why it matters:** most AI prototypes either look right but use fake parts, or use real parts with the details wrong. The useful question isn't whether an agent can draw a screen. It's whether the second screen is cheaper than the first, and the second module cheaper than the first. Now there are numbers.

## The big picture
An AI agent doesn't see your design. It reads data: layers, properties, variables, and the rules you've written down.
- A size bound to a variable becomes a token the agent can map to code and check.
- A raw number, or a decision nobody wrote down, is a guess waiting to happen.
- A rule that only lives in prose erodes; a rule that runs as a check doesn't.

## Before
- **Setup ate the first days.** Six wiring problems before the app shell was stable: two copies of the framework, a config the dev server couldn't read, build-tool assumptions in the component library.
- **The design file was the weak link.** One component had 23 of 30 variants quietly inconsistent; the first screen's 4 misses out of 18 measured values were all library defaults.
- **Rules lived in prose.** "No hard-coded colours" was a sentence the agent had to remember and a human had to grep for.
- **Every link reloaded the page** and blanked the app; loading states had no agreed shape.
- **Nothing was timed.** Four of the first six screens' records say "not measured".
- **Nothing was hosted.** Only the author could open it.

## After
- **One module, complete:** nine screens plus a variant for comparison, a demo that carries one record from start to decision across every screen, live on a hosted URL with analytics.
- **Every screen and state in the design file** as an editable map built from library instances, with every text, colour, spacing and radius bound to the system.
- **Never blank:** in-document navigation and one loading pattern (nothing for 200ms, then a skeleton in the final layout, content kept on refresh, honest slow and failed states).
- **Conventions are code.** A linter enforces the token, palette, framework and navigation rules before every build.
- **The sandbox became a template.** Wiring, sandbox, shell, loading pattern, agent instructions, checks and docs; one command scaffolds a new app, which built and verified first time.
- **A second module proved it.** Built from the template by a different session in two weeks: eight screens, nine new candidate components, measured at 45 minutes to 1.5 hours from spec to first render and 1.25 to 2.5 hours to verified, per screen.
- **The loop closed in a week.** The second module's first findings were two template bugs (a script name shadowed by the package manager; a screenshot tool that assumed Windows). Both fixed in the template before a third module starts.

## By the numbers

| | After the first week | After three weeks |
|---|---|---|
| Screens | 6 (one module) | 10 (module 1) + 8 (module 2) |
| First render of a screen | 13 min from a design frame; unmeasured from a spec | 45 min – 1.5 h from a spec, measured |
| Verified screen | unmeasured | 1.25 – 2.5 h |
| Findings logged | 50 | 112 across both modules and the template |
| Design-system changes logged for engineering | 29 | 64 |
| New components proposed and built | 8 | 20, of which 12 drawn into the design file |
| Design-file reference | 5 of 6 screens as loose frames | every screen and state on a map |
| Hosted demo | none | live, with analytics |
| Starting a new module | days of wiring | one command, verified first time |

## The formula
1. **Make the design file machine-readable:** variables, consistent variants, component-to-code mappings.
2. **Use only real components:** the production design system, not lookalikes.
3. **Write the rules down once, then make the checkable ones code.**
4. **Let prototypes fix the system:** every change flagged and logged for engineering; what exists nowhere becomes a proposed component first.
5. **Close the loop:** verify in layers, draw the result back into the design file, and extract a template at the first stable module.
6. **Measure the second module.** That's where the method is proven or not.

## What I learned
- **Fix the source, not the output.**
- **Write design decisions down once; then turn the checkable ones into checks.**
- **Extract the template early.** Everything the second module inherited was paid for once.
- **The second user finds the template's bugs.** A command looked right on my machine for two weeks.
- **Rules stated too hard get revised by the next module;** write them so they can be.
- **Audit the bindings, not just the values. Verify the verifier.**

## What's next
Engineering review of the 64 logged changes, promoting the drawn candidates into the library, design review of both maps, and a third module timed from the first command to the first verified screen.
