# EvidenceComparison (candidate)

Proposal and status: `docs/components/EvidenceComparison.md`. Import: `~/candidates/EvidenceComparison/EvidenceComparison.vue`.

| Prop | Type | Default |
|---|---|---|
| `proof` | `{ declared, evidenced, verified }`, each `{ value, state, source?, at?, confidence? }` (`state` = PROOF key in `src/modules/prequal/status.js`) | required |
| `detailed` | Boolean | `false` |

Three columns (Declared · Document · Independent check), stacked on phones. Contradicted in `text/error`; Verified with a check; the rest muted. "Verified at all three levels" line when every level is verified.
