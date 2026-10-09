# InlineNotice (candidate)

Proposal and status: `docs/components/InlineNotice.md`. Import: `~/candidates/InlineNotice/InlineNotice.vue`.

| Prop | Type | Default |
|---|---|---|
| `tone` | warning \| error \| info \| success | `warning` |
| `title` | String | `''` |
| `message` | String | `''` (or default slot) |

Slot `actions` for buttons. `role="alert"` for warning / error, `status` otherwise. Tokens per tone: `surface/<tone>/subtle`, `border/<tone>`, `icon/<tone>`, `text/<tone>` (warning uses the `warning-low` set).
