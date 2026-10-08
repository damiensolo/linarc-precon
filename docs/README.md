# Prototyping docs

How we set up repeatable, design-system-accurate prototyping from Figma with an AI agent (Claude Code in Cursor), what we learned doing it, and the case study built from it.

## Files

| File | What it's for | When it changes |
|---|---|---|
| [1-setup-playbook.md](1-setup-playbook.md) | Step-by-step setup to repeat this from zero, with a check for each step | When a setup step is added, changed or found wrong |
| [2-figma-readiness.md](2-figma-readiness.md) | What "machine-readable Figma" means, as a checklist with evidence | When a Figma issue affects code accuracy |
| [3-verification.md](3-verification.md) | The verification steps, what each one catches and how to run it | When a check is added or a new failure mode appears |
| [4-decisions.md](4-decisions.md) | Key choices, the reasons for them, and the alternatives rejected | When a significant choice is made or reversed |
| [findings-log.md](findings-log.md) | Append-only, dated findings: the raw material for everything else | Whenever something breaks, surprises us, or works notably well |
| [prototypes/](prototypes/) | One record per prototype: gaps, fixes, checks, metrics | At the end of every prototype (skill step 6) |
| [case-study/internal.md](case-study/internal.md) | Internal case study: full detail, real names, file keys and screenshots | At milestones |
| [case-study/public.md](case-study/public.md) | External/public case study: narrative, anonymised | At milestones, after the internal version |

## How these docs stay current

1. **During work:** any setup problem, workaround or surprise gets a `findings-log.md` entry when it's discovered (rule in `CLAUDE.md`).
2. **After each prototype:** step 6 of the `figma-to-prototype` skill writes `prototypes/<slug>.md`. It also updates the playbook, readiness checklist or verification doc if a step changed.
3. **Evidence:** screenshots that illustrate a point go into `case-study/assets/`, not the scratchpad. Name them `<finding-id>-<what>.png`.
4. **Milestones** (first real screen, then every ~5 prototypes): update both case studies from the log and records, and list what still needs proof.

## Case study style: Smart Brevity

Both case studies stay short, ideally readable in under two minutes. Details belong in the working docs, linked from "Go deeper".
- **Headline:** six words or fewer.
- **Lead:** one sentence saying what's new.
- **Why it matters:** one or two sentences.
- **Signposts** in bold or as headings: *The big picture*, *What we found*, *By the numbers*, *What's next*, *Go deeper*.
- **Bullets** of one or two lines, each starting with a bolded point.
- **Numbers over adjectives.** Only measured values; no estimates.
- **Cut anything that doesn't change what the reader knows or does.**

## Public-version rules

`case-study/public.md` must not contain:
- Figma file keys, node IDs, URLs, internal repo paths, registry URLs or tokens.
- Unreleased product screens. Use design-system-level screenshots or redrawn diagrams instead.
- Customer or employee names, or real project data.

Product and company naming in the public version is the author's call; it's written so the name can be added or left out.

`case-study/assets/` is **internal**: screenshots there show internal names and screens. For the public version, make separate redacted or redrawn images in `case-study/assets/public/`.
