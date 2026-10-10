# ScoreConfidence (candidate)

Proposal and status: `docs/components/ScoreConfidence.md`. Import: `~/candidates/ScoreConfidence/ScoreConfidence.vue`.

| Prop | Type | Default |
|---|---|---|
| `score` | Number \| null | `null` ("—") |
| `confidence` | Number \| null | `null` ("—") |
| `recommendation` | accept \| review \| not-recommended \| null | `null` (no dot) |
| `variant` | `cell` \| `strip` | `cell` |
| `knockouts` | Number | `0` (strip) |
| `checksComplete` / `checksTotal` | Number | — (strip: "12 / 14 complete") |
| `provisional` | Boolean | `false` (strip: "Provisional: n checks still running.") |

`cell` (`72 · 64%`) is used by the dashboard and Requests table; `strip` (stamp + score + confidence + knockouts + checks n/m + provisional note) by `prequal-review`. Also registered as the DataGrid slot type `score-confidence` in `src/modules/prequal/gridSlots.js`.
