# Loading states: Skeleton · LoadRegion · LoadStatus (+ `createLoad`)

- **Stage:** candidate
- **Proposed:** 2026-10-10 · **Used on:** `prequal-queue` (reference implementation); every screen that loads data
- **Candidate code:** `src/candidates/Skeleton/Skeleton.vue`, `src/candidates/LoadRegion/LoadRegion.vue` + `createLoad.js`, `src/candidates/LoadStatus/LoadStatus.vue`
- **Figma:** not drawn yet (the only Figma skeleton is Data Table / Sheet Cell `Type=Skeleton Loader`, 40016391:36860) · **Library:** DataGrid `loading` (P-034) · **Log:** P-034, D-24, F-057, F-058
- **Rules:** `docs/5-ui-patterns.md` §6

## Purpose
One way to load data anywhere in the app: answer at once, show nothing for fast results, show the final layout as a skeleton for slow first loads, keep content during refreshes, be honest when slow or failed, and always end.

## Why not an existing component
- **Spinner** (`@/components/Spinner.vue`, Figma Spinner): a 100px hard-coded orange ring meant for the whole content area, which is the full-screen loader the rules forbid. Not exported.
- **StatusIndicator `type="spinner"`**: the right 16px indeterminate marker, used *inside* LoadStatus.
- **DataGrid**: had no loading state (its Code Connect said so); now has `loading` (P-034) using the Figma Skeleton Loader cell. LoadRegion wraps it (`content-loads`).
- **DataGridToolbar "Loading views…" pill**: specific to saved views.
- Nothing in the library owns the timing, the stale-request rule or the announcements, which is most of the value.

## Anatomy
- **`createLoad({ label })`**: a reactive controller per data region. State: `status` (idle / loading / ready / error / cancelled), `hasData`, `indicator`, `slow`, `fromSkeleton`, `error`, `announcement`. Methods: `run(request, apply)`, `cancel()`, `destroy()`.
- **LoadRegion**: the region that loads. `aria-busy`, a polite live region, then one of: content (fades in once after a seen skeleton) · the `#skeleton` slot (invisible for the first 200ms, reserving the layout) · an error/cancel notice with Retry. `content-loads` keeps a self-loading child (DataGrid) mounted and passes `skeleton`.
- **LoadStatus**: the inline meta-line indicator: spinner + "Loading…" / "Updating…" / "Still loading…" (+ Cancel when slow), or "Couldn't update." + Retry after a failed refresh; otherwise its default slot (e.g. "12 requests").
- **Skeleton**: `line` (sm/md/lg = 20/24/28 line boxes), `block`, `circle`; width from the parent's class.

## API
| Part | Prop | Type | Default | Notes |
|---|---|---|---|---|
| createLoad | `label` | String | `'content'` | lower case, for announcements |
| createLoad | `indicatorDelayMs` | Number | 200 | `LOAD_TIMING` |
| createLoad | `slowAfterMs` | Number | 5000 | `LOAD_TIMING` |
| LoadRegion | `load` | Object | required | controller |
| LoadRegion | `content-loads` | Boolean | false | default slot gets `{ skeleton }` and stays mounted |
| LoadStatus | `load` | Object | required | same controller |
| LoadStatus | `cancellable` | Boolean | true | Cancel once slow |
| Skeleton | `shape` | String | `'line'` | line / block / circle |
| Skeleton | `size` | String | `'sm'` | line height sm 20 / md 24 / lg 28 |

Slots: LoadRegion default, `skeleton`, `error` (`{ error, retry }`); LoadStatus default. Events: `retry` (LoadRegion, LoadStatus).
CSS custom properties: `--skeleton-shimmer-ms` (1600ms), `--load-reveal-ms` (160ms).

## States and variants
idle → loading (hidden 0–200ms → indicator → slow at 5s) → ready | error | cancelled. First load vs refresh (`hasData`). Both themes; reduced motion = static skeleton, no fade.

## Tokens
`surface/neutral` (skeleton fill, from Figma), `surface/soft` (shimmer highlight), `radius-6`, `space-8` (cell padding), `space-20/24/28` (line heights), text `label/sm` + `text/subtle` (LoadStatus). **needs-token:** motion durations (none exist in Figma or `tokens.css`); a skeleton fill that is visible on dark rows (see questions).

## Behaviour
Region-scoped; never covers the shell. Latest request wins; superseded answers are ignored. Timers cleared on settle and on `destroy()`. Skeletons `aria-hidden`; announcements only on start (after the delay), slow, and done (only if start was announced); errors `role="alert"`.

## Content
"Loading…", "Updating…", "Still loading…", "Cancel", "Couldn't load the {label}.", "Couldn't update.", "Loading stopped.", "Retry". No stage names, percentages or time estimates unless the backend reports them.

## Open questions for design
- **Dark skeleton is invisible**: Figma binds the cell bar to `surface/neutral` (#1e1e1e), the same as the dark row. Use `surface/subtle` (5% white) or add `surface/skeleton`?
- Should the shimmer exist in Figma at all (Smart Animate prototype), or stay a code-only behaviour documented here?
- Button busy state for submits (none in code; check Figma Button).
- Motion tokens: `motion/duration/fast` 160, `motion/duration/loop` 1600, `motion/delay/indicator` 200?

## Acceptance (for promotion to the library)
- [ ] Figma: a Skeleton component (line / block / circle) with variables bound, both modes; LoadStatus states as variants
- [ ] `.vue`, `.stories.js` with UsageDocs (stories driven by a fake latency), `README.md`, `.figma.js`; Code Connect published
- [ ] Verified in both themes at 1440 / 1024 / 390 with the loading-state timeline check (`docs/3-verification.md`)
- [ ] Used by at least one prototype through the library path; candidate folders deleted
