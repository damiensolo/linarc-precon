# Prequalification › Qualification Record (`prequal-record`)

- **Date:** 2026-10-09
- **Source:** `docs/prequal/spec.md` (Decisions and the Qualification Record, screen 6, visibility by role), `docs/prequal/screens.md` §6, `docs/5-ui-patterns.md`
- **Figma:** app map Level 2b · 19 [3783:8437](https://www.figma.com/design/9ANM41f3QwNjt27Sl08i8O/Documentation?node-id=3783-8437) · renewal modal `3783:11459` · renewal sent `3783:11584` · Estimator view `3783:8624`
- **URL:** `/?p=prequal-record` (Summit Mechanical, renewal needed soon) · `#req-001` (Apex: the record the review screen's approval creates) · `#req-022` (expired) · `#req-003` (not approved: no record). Rail: Qualified Subs. Review screen: "View qualification record".
- **Status:** verified

## Scope
- **Persona:** the GC Prequal Reviewer (and Estimator/PM, restricted). **Decision:** "can we use this sub, for what, up to how much, on what terms, and is it still current?"; for the reviewer also "what needs renewing?"
- **Nav:** Preconstruction › Prequalification › Qualified Subs (rail) → record. Since 2026-10-10 the rail item opens the Qualified subcontractors list (screen 7, `prequal-qualified`); its rows open this screen, and the back arrow returns to it.
- **Pattern (docs/5-ui-patterns.md):** full page under the module nav; **Title Bar / Workflow** header (back · company · `QR-021` chip · `Status:` lifecycle chip), View as + Request renewal on the right. Record on the left; **audit trail in AppLayout's right panel** (activity, as the RFI screen and the review screen); below 1024px it moves inline at the end. **Request renewal is a ModalV2**: a short single-step task (§1).
- **Data:** `src/modules/prequal/data/records.js`: Summit (req-021) and Apex (req-001) written out; every other approved request gets a record built from its row. Status from `status.js`: OUTCOME, LIFECYCLE, and two new vocabularies, CONDITION (Open / In force / Met) and RENEWAL (Renewal requested / Renewal received).

## Layout (top to bottom)
1. Context line: trade · CSI · state · from REQ-nnn (project) · template · contact.
2. Key facts: Outcome · Valid until (ExpiryIndicator, plus "Earliest key document: …") · Approved (who, when) · Recommendation at approval (stamp; reviewer also sees score and confidence). Below 768px a Status fact appears too, because the title bar hides its status there.
3. **Approved for**: trade × scope × single-project limit × aggregate limit (hairline table; stacked labels on phones).
4. **Conditions**: each with its note; Open is a chip (needs action), In force and Met are muted words (one signal per status, D-17).
5. **Overrides at approval** (reviewer): finding, quoted reason, actor, date.
6. **Monitoring** (reviewer): summary ("8 documents · 1 expiring within 30 days"), then every document soonest-expiry first with an **ExpiryIndicator `timeline`** (validity bar issue → expiry, filled to today). Row action: **Request renewal** when expiring or expired and not yet requested; otherwise "Renewal requested 28 Sep" + **Send reminder**.
7. **Audit trail** (reviewer, right panel): newest first; actor, action, time, and a kind word (Override / Renewal / Monitoring).
- **Estimator/PM view:** status, outcome, valid until, stamp, approved-for and conditions only; a line says documents, scores and the audit trail are visible to reviewers; no right panel.

## Metrics
| Measure | Value |
|---|---|
| Time from spec to first render | not measured |
| Components used | library: StatusChip, Chip, Button, SegmentedControl, ModalV2 (default variant + `modal-body`), FormV2 (textarea), Checkbox, ProgressBar (`bar-only`, `colorStops`, inside ExpiryIndicator), StatusIndicator · candidates: ExpiryIndicator (**`timeline` variant added**), InlineNotice |
| New candidates | **0**. Review 1, wizard 0, portal 5, dashboard 3 |
| Closed as compositions | Qualification card (key facts + Approved for + Conditions), Activity timeline (now closed for 5 and 6) |
| Library changes | none |
| Gaps found | 1 candidate bug (date-only strings shown a day early west of UTC, F-049) |

## Component map
| Element | Handling |
|---|---|
| Header | Title Bar / Workflow pattern via `PrequalShell #header` (as review) |
| Key facts | `dl` grid, 1 → 2 → 4 columns (4 from `xl`, so Valid until never collides at 1024) |
| Valid until | candidate ExpiryIndicator, `timeline` variant without `startDate` (wraps, no bar) |
| Approved for | `role=table` grid of hairline rows (composition) |
| Conditions | hairline rows + StatusChip for Open only |
| Monitoring | `components/MonitoringList.vue`: hairline rows + ExpiryIndicator `timeline` + text Buttons |
| Audit trail | `components/AuditTrail.vue`: hairline rows |
| Request renewal | `components/RenewalModal.vue`: ModalV2 default variant, Checkbox per dated document (expiring ones preselected, or the row it came from), FormV2 textarea for the message the sub sees, Send request disabled until something is picked |
| No record | InlineNotice (info) + "Open review" / "Back to Overview" |

## Gaps and decisions
| Item | Handling | Log ID |
|---|---|---|
| ExpiryIndicator parsed `"2026-10-20"` as UTC midnight: shown as 19 Oct in US time zones (dashboard Expiration column too) | candidate fixed: date-only strings read as local midnight | F-049 |
| Spec: monitoring timelines "green → yellow → red" | **current = neutral bar**, expiring = yellow, expired = red (D-17: colour only where the user must act). **Accepted by the user 2026-10-09** | decided |
| Neutral bar is `surface/warning-neutral`: reads heavier than the yellow bar in light mode | kept (accepted "for now" 2026-10-09); a lighter neutral fill can come with a token later (needs-token: `surface/progress/neutral`?) | needs-token |
| Which renewals need human approval (open product decision) | Linarc sends automatic requests at 30 days (audit shows "Linarc sent…"); the reviewer can request any dated document early | — |
| No Qualified Subs list screen | rail opens the default record | — |
| Review screen doesn't persist its decision | Apex's record (req-001) is written as that decision's outcome | — |

## Verification
- `yarn build` passes. `yarn shot prequal-record`, `prequal-record#req-001` and `prequal-dashboard` (shares ExpiryIndicator): exit 0, no console errors, no overflow, 1440 / 1024 / 390, light and dark. Tall captures (2000px) checked for the full page.
- Puppeteer (temporary script): default record shows Summit, Renewal needed soon, 20 Oct 2026; Request renewal opens the modal; checking the contractor license and sending closes it, adds "Renewal requested 8 Oct" to that row, a confirmation line and a new top audit entry. Estimator view hides Monitoring, score, overrides and the audit trail, keeps the stamp and limits. `#req-001`: Apex, Current, Open condition, 1 Jan 2027. `#req-022`: No longer active, "Expired 15 Sep 2026". `#req-003`: "REQ-003 has no qualification record" + Open review. No console errors.
- Bare border classes: none.

## Figma reference
Documentation › Draft: **Qualification Record — Light `3762:8771`**, **Dark `3763:8698`** (Dark = the Light frame with `mapped` set to Dark and `Branding / Logomark` `Mode=Dark`). Cloned from the Review frame (`3758:5648`): Overview shell with **Qualified Subs** selected on the rail; **Title Bar / Workflow** (title Summit Mechanical LLC, Chip `QR-021`, Status Chip `Warning-Low` "Renewal needed soon"); content rebuilt as auto-layout frames: context line, key facts, Approved for table, Conditions, Overrides, Monitoring rows each with an `ExpiryIndicator — timeline [candidate]` frame (track `surface/progress-track`, fill `surface/warning/low` or `surface/warning/neutral`); right panel "Audit trail" (380, `surface/container`, left stroke `border/subtle`). Text colours, hairlines (`border/subtle`) and gaps / paddings (`spacing/space-*`) bound to library variables. 0 image fills.
- Not drawn: the title bar's View as and Request renewal (the Title Bar / Workflow instance has no right-side slot for them; its document tools are hidden), the Request renewal modal, the Estimator view and phone layout. The Chip (Solid, sm) label missing in Dark was fixed in the library (P-029, F-050); it appears here once the library is published.
- Building it: an unscoped `findOne(name === 'Content')` matched a layer inside the Top Nav Bar instance and cleared it; the clone was deleted and rebuilt with direct-child lookups. Empty auto-layout frames keep a 100px height even when set to Hug; give them an explicit size.

## Findings
F-049 (ExpiryIndicator date-only parsing), F-050 (dark chip label; fixed in Figma, P-029).

## Update 2026-10-10: Figma app map
The Light / Dark frames on the Documentation file's Draft page were deleted at the user's request; the reference is now the Documentation › **Prequalifications** app map (page `3766:33584`), light mode, every screen and state as editable library instances with labelled arrows (D-22). Frames (Level 2b section `3783:8436`): 19 Record `3783:8437` (Request renewal drawn as an overlay: Title Bar / Workflow has no actions slot in this variant), 20 modal `3783:11459`, 21 sent `3783:11584`, 22 Estimator / PM view `3783:8624`. `prototype.figma` points there. Dark mode is checked in code (`yarn shot`), not drawn.

## Update 2026-10-10: Qualified subcontractors list
The back arrow and the “no record” notice now return to `prequal-qualified` (screen 7) instead of the Overview; the list’s Request renewal action reuses this screen’s `RenewalModal`. Figma: Level 2b’s back connector reads “← Back arrow · Level 1 · 31 Qualified subcontractors”; the row-action connector lists 01 and 31.

## Update 2026-10-11: loading states (D-24)
The record now comes from a (mock) request (`createLoad` + `LoadRegion`, `docs/5-ui-patterns.md` §6; `?latency=` to try it). The shell, the back arrow and View as render at once; the company name (a title-sized Skeleton line in its place), record ID chip and status wait for the data; **Request renewal** stays in the title bar, disabled, so nothing shifts when the record arrives (it disappears as before when the request has no record). The record column is one `LoadRegion` whose `#skeleton` (`components/RecordSkeleton.vue`) draws the final layout: meta line, the four key facts (Valid until at its real height, plus Status below md), Approved for (column header from sm, stacked rows below), Conditions and, for reviewers, Monitoring. The audit trail panel is a `LoadRegion secondary` on the same controller (`components/AuditTrailSkeleton.vue` while loading, empty on failure, no second live region; the column shows "Couldn't load the qualification record." + Retry). The "no record" notice only appears once the answer says so. The `#default` slot is a `<template #default>` so the content is only evaluated once the data exists.
- **Honest submits:** RenewalModal's Send request runs a mock request: Send request and Cancel disable at once, the modal can't be dismissed mid-send, "Sending…" shows after 200ms, `send` is emitted (audit entry + confirmation line, modal closes) only after it resolves, and a failure keeps the modal open with "Couldn't send the renewal request. Nothing was sent." + Retry. Send reminder does the same inline in Monitoring (`MonitoringList` gained `pending` and a `#status` slot). The shared `LoadStatus` (`variant="notice"`, action controllers) holds the line. The Qualified Subs list reuses RenewalModal and gets the same behaviour.
- **Verified** (puppeteer-core, Chrome): instant and fast show no skeleton and announce nothing; medium shows the skeleton 214ms after the request starts, content at ~930ms; slow adds "Still loading qualification record…"; fail → error + Retry, fail-once + Retry loads. The Approved for heading's y is the same in skeleton and content at 1440 (318), 1024 (382) and 390 (562). Submits: double click sends once, "Sending…" at ~240ms, confirmation only at ~930ms; fail → error + Retry, Retry succeeds. `yarn build` and `yarn shot` pass.
- **Consolidated 2026-10-11:** `components/SubmitStatus.vue` is deleted; Send request and Send reminder use `LoadStatus variant="notice"` on `createLoad({ label: 'renewal request' | 'reminder', action })`, and the audit panel's hand-copied reveal CSS is gone (`LoadRegion secondary`). Re-verified: disabled at click, 1 request for 2 clicks, "Sending…" at ~210–260ms, confirmation after resolve, error notice + Retry with the message kept, Retry succeeds. The "…sent" announcement is not heard: the modal / status line unmounts on success (the confirmation line `role="status"` carries it).

## Update 2026-10-11: title bar back button (D-25, P-038)
The header is Title Bar / Workflow `Size=Comfortable`: `PrequalShell header-size="comfortable"` (64px, 12px around the button, 20px sides) and the back button is the library **HeaderToolIcon `type="back"`** (grey fill, no border at rest: Figma `Show Border` off; hover adds a darker stroke, pressed darkens the fill, 2px keyboard focus ring), replacing the borderless minimal Button. Measured: button 40×40 at top 12 / left 20 in both themes, focus ring 2px, no console errors.

## Update 2026-10-11: every approved request has a written record
The six approved requests that used `genericRecord` now have hand-written records (`src/modules/prequal/data/recordDetails.js`), one per lifecycle story: Delta (Current, two trades), Oakmont (Current), Prairie (Current, approved with conditions: bond in force, ASB registration **open**, a renewal **received** and being checked, two overrides), Tidewater (Renewal needed soon: renewed certificate received 7 Oct, endorsement still requested), Cascade (No longer active: GL lapsed after two reminders; license-inactive monitoring alert; re-applying as REQ-006) and Bluewater (Suspended after an OSHA monitoring alert). Valid until is the earliest key-document expiry on every record (checked by script). `genericRecord` stays as a fallback. The no-record notice now links to the request on the review screen (Open review / View decision / Open request) instead of back to the list.
