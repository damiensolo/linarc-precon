# ExpiryIndicator (candidate)

Proposal and status: `docs/components/ExpiryIndicator.md`. Import: `~/candidates/ExpiryIndicator/ExpiryIndicator.vue`.

| Prop | Type | Default |
|---|---|---|
| `date` | ISO String \| Date \| null | `null` ("No expiry") |
| `warnDays` | Number | `30` |
| `now` | ISO String \| Date | today |
| `emptyLabel` | String | `—` (use "No expiry" on a record that truly has none) |

Computed `state`: `current` (green dot, no hint) · `expiring` (yellow dot, "in N days") · `expired` (red dot, "no longer active · N days ago") · `none`. Slot `action` for a trailing control (e.g. "Request renewal"). Inline variant only for now; `timeline` comes with the Qualification Record. Registered as the DataGrid slot type `expiry` in `src/modules/prequal/gridSlots.js`.
