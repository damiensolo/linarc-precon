# ScoreConfidence (candidate)

Proposal and status: `docs/components/ScoreConfidence.md`. Import: `~/candidates/ScoreConfidence/ScoreConfidence.vue`.

| Prop | Type | Default |
|---|---|---|
| `score` | Number \| null | `null` ("—") |
| `confidence` | Number \| null | `null` ("—") |
| `recommendation` | accept \| review \| not-recommended \| null | `null` (no dot) |

Cell variant only for now; the `strip` variant (stamp + score + confidence + knockouts + checks n/m + provisional note) comes with the GC Review Dashboard. Also registered as the DataGrid slot type `score-confidence` in `src/modules/prequal/gridSlots.js`.
