# PortalSectionNav (candidate)

Proposal and status: `docs/components/PortalSectionNav.md`. Import: `~/candidates/PortalSectionNav/PortalSectionNav.vue`.

| Prop | Type | Default |
|---|---|---|
| `groups` | `[{ id, label, items: [{ id, label, state? }] }]` | required |
| `selected` | String (item id) | `''` |
| `ariaLabel` | String | `Application sections` |

Emits `select(id)`. `state` is a SECTION key from `src/modules/prequal/status.js` (not-started / in-progress / complete / needs-attention / submitted) and renders as a StatusIndicator dot plus the label. Selected row: `surface/datatable/select-opaque` + `text/primary`; `aria-current="page"`.
