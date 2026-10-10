# ExpiryIndicator (candidate)

Proposal and status: `docs/components/ExpiryIndicator.md`. Import: `~/candidates/ExpiryIndicator/ExpiryIndicator.vue`.

| Prop | Type | Default |
|---|---|---|
| `date` | ISO String \| Date \| null | `null` ("No expiry") |
| `warnDays` | Number | `30` |
| `now` | ISO String \| Date | today |
| `emptyLabel` | String | `—` (use "No expiry" on a record that truly has none) |
| `variant` | `inline` \| `timeline` | `inline` |
| `startDate` | ISO String \| Date \| null | `null` (timeline bar start) |

Computed `state`: `current` (green dot, no hint) · `expiring` (yellow dot, "in N days") · `expired` (red dot, "N days ago"; the status beside it says "No longer active") · `none`. Slot `action` for a trailing control (e.g. "Request renewal"). `variant="timeline"` (+ `startDate`): "Expires … · in N days" over a validity bar (ProgressBar `bar-only`); current = neutral fill, expiring yellow, expired red; without `startDate`, text only (wraps). Date-only strings are parsed as local dates (F-049). Registered as the DataGrid slot type `expiry` in `src/modules/prequal/gridSlots.js`.
