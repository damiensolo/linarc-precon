# KpiCard (candidate)

Proposal and status: `docs/components/KpiCard.md`. Import: `~/candidates/KpiCard/KpiCard.vue`.

| Prop | Type | Default |
|---|---|---|
| `label` | String | required |
| `value` | Number \| String | required |
| `hint` | String | `''` |
| `tone` | neutral \| info \| success \| warning \| error | `neutral` |
| `icon` | lucide component | `null` |
| `selected` | Boolean | `false` |
| `interactive` | Boolean | `true` |
| `loading` | Boolean | `false` |

Slot `default` replaces the hint line. Emits `click`. Renders a `<button aria-pressed>` when interactive, a `<div>` otherwise. Strokes are outlines (no size change between rest, focus and selected; P-015 rule).
