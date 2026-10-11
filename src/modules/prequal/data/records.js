// PLACEHOLDER DATA — Qualification Records (screen 6). A record exists for every approved request in ./index.js
// (outcome qualified / qualified-with-conditions). Two are written out in full:
//   req-021 Summit Mechanical: approved with conditions a year ago, now "Renewal needed soon" (bonding letter expires
//            20 Oct 2026, renewal requested 28 Sep); the default record, because it shows monitoring at work.
//   req-001 Apex Electrical: the end of the vertical slice: the record the review screen's "Approve with conditions"
//            creates (approved 8 Oct 2026 by Jordan Lee). The review prototype doesn't persist its decision, so this
//            record is written as that decision's outcome.
// The others are built from their request row by `genericRecord`. Status keys come from ../status.js
// (OUTCOME, LIFECYCLE, CONDITION, RENEWAL, DOCUMENT). "Today" for the mock is 2026-10-08 (TODAY in ./index.js).
import { companyById, requestById, requests, reviewerById, templates } from './index';
import { requestStatus, LIFECYCLE, OUTCOME } from '../status';
import * as review from './review';

const addDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const displayId = (requestId) => `QR-${requestId.split('-')[1]}`;

/**
 * Record shape:
 * { id, displayId, requestId, company, project, template, outcome, lifecycle, approvedBy, approvedOn, validUntil,
 *   validUntilDriver, recommendation: { stamp, score, confidence }, trades: [{ trade, csi, scope, single, aggregate }],
 *   conditions: [{ id, label, status, note }], overrides: [{ finding, reason, actor, at }],
 *   documents: [{ id, label, issued, expires, key, renewal: null | { status, on } , note }],
 *   audit: [{ at, actor, action, kind }]  // kind: decision | override | monitoring | renewal | submission
 * }
 * `key` documents drive valid-until (earliest key expiry, or 12 months). Restricted documents (financials) are
 * reviewer-only, as on the review screen.
 */
const SUMMIT = {
  id: 'req-021',
  requestId: 'req-021',
  approvedBy: 'jordan',
  approvedOn: '2025-10-02',
  validUntilDriver: 'Surety bonding letter',
  trades: [
    { trade: 'HVAC', csi: '23', scope: 'All projects', single: 3000000, aggregate: 6000000 },
    { trade: 'Plumbing (process piping)', csi: '22', scope: 'Under $1M per contract', single: 1000000, aggregate: 2000000 },
  ],
  conditions: [
    { id: 'bond', label: 'Project-specific performance and payment bond on contracts above $1M', status: 'in-force', note: 'Applied to Northern Heights (bond #TRV-4471, Travelers)' },
    { id: 'retainage', label: 'Increased retainage (10%) on the first contract', status: 'met', note: 'Northern Heights retainage released at 50% complete, 14 Aug 2026' },
  ],
  overrides: [
    { finding: 'EMR 1.08 for 2023, above the 1.00 threshold', reason: 'Single 2023 incident with corrective actions documented; EMR 0.97 for 2025 confirmed by WCIRB.', actor: 'Jordan Lee', at: '2025-09-30T15:20:00' },
  ],
  documents: [
    { id: 'bond', label: 'Surety bonding letter', issued: '2025-10-20', expires: '2026-10-20', key: true, renewal: { status: 'requested', on: '2026-09-28' }, note: 'Travelers · $3M single / $12M aggregate' },
    { id: 'license', label: 'Contractor license (C-20)', issued: '2024-11-30', expires: '2026-11-30', key: true, renewal: null, note: 'CSLB #845120' },
    { id: 'emr', label: 'EMR ratesheet', issued: '2026-01-01', expires: '2027-01-01', key: true, renewal: null, note: 'Mod 0.97, WCIRB' },
    { id: 'osha300a', label: 'OSHA 300A, last 3 years', issued: '2026-02-01', expires: '2027-02-01', key: false, renewal: null, note: '2023, 2024, 2025' },
    { id: 'coi', label: 'Certificate of insurance (ACORD 25)', issued: '2026-04-01', expires: '2027-04-01', key: true, renewal: null, note: 'GL $2M / $4M · umbrella $5M · replaced 1 Apr 2026' },
    { id: 'ai', label: 'Additional insured endorsement', issued: '2026-04-01', expires: '2027-04-01', key: false, renewal: null, note: 'CG 20 10 and CG 20 37' },
    { id: 'fin', label: 'Financial statements (reviewed), 2025', issued: '2026-03-15', expires: '2027-03-31', key: false, renewal: null, note: 'Restricted: reviewers only', restricted: true },
    { id: 'w9', label: 'W-9', issued: '2025-09-18', expires: null, key: false, renewal: null, note: 'No expiry' },
  ],
  audit: [
    { at: '2026-09-28T06:00:00', actor: 'Linarc', kind: 'renewal', action: 'Sent a renewal request to Dev Patel: surety bonding letter expires 20 Oct 2026. Status changed to Renewal needed soon.' },
    { at: '2026-08-14T10:05:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Marked “Increased retainage (10%)” as met: retainage released on Northern Heights.' },
    { at: '2026-04-01T08:30:00', actor: 'Linarc', kind: 'monitoring', action: 'Accepted a new certificate of insurance (valid through 1 Apr 2027); the previous certificate is superseded.' },
    { at: '2026-03-18T08:30:00', actor: 'Linarc', kind: 'monitoring', action: 'Accepted 2025 financial statements (valid through 31 Mar 2027).' },
    { at: '2025-10-02T16:40:00', actor: 'Jordan Lee', kind: 'decision', action: 'Approved with conditions: HVAC $3M / $6M, process piping $1M / $2M, valid until 20 Oct 2026.' },
    { at: '2025-09-30T15:20:00', actor: 'Jordan Lee', kind: 'override', action: 'Overrode “EMR 1.08 for 2023”: single 2023 incident with corrective actions documented; EMR 0.97 for 2025.' },
    { at: '2025-09-24T09:00:00', actor: 'Jordan Lee', kind: 'decision', action: 'Started review.' },
    { at: '2025-09-20T17:12:00', actor: 'Dev Patel', kind: 'submission', action: 'Submitted the prequalification (Mechanical — Large Projects v2).' },
  ],
};

// Apex: the outcome of the review screen (req-001). Documents and the bonding finding come from ./review.js.
const reviewDoc = (id) => review.documents.find((d) => d.id === id);
const APEX = {
  id: 'req-001',
  requestId: 'req-001',
  approvedBy: 'jordan',
  approvedOn: '2026-10-08',
  outcome: 'qualified-with-conditions',
  lifecycle: 'current',
  validUntil: '2027-01-01',
  validUntilDriver: 'EMR ratesheet',
  trades: [{ trade: 'Electrical', csi: '26', scope: 'All projects', single: 2000000, aggregate: 5000000 }],
  conditions: [
    { id: 'umbrella', label: review.CONDITIONS.find((c) => c.id === 'umbrella').label, status: 'open', note: 'Broker confirmation from Lockton still running; requested from Maria Chen on 8 Oct 2026' },
    { id: 'bond', label: review.CONDITIONS.find((c) => c.id === 'bond').label, status: 'in-force', note: 'Remaining bonding capacity $0.8M is below the $2M single limit' },
  ],
  overrides: [
    { finding: 'Remaining bonding capacity below the requested single limit', reason: 'Accepted with a project-specific bond condition; surety confirmation still running.', actor: 'Jordan Lee', at: '2026-10-08T11:40:00' },
  ],
  documents: [
    { id: 'emr', label: reviewDoc('emr').label, issued: '2026-01-01', expires: reviewDoc('emr').validThrough, key: true, renewal: null, note: reviewDoc('emr').note },
    { id: 'osha300a', label: reviewDoc('osha300a').label, issued: '2026-02-01', expires: reviewDoc('osha300a').validThrough, key: false, renewal: null, note: reviewDoc('osha300a').note },
    { id: 'coi', label: reviewDoc('coi').label, issued: '2026-03-31', expires: reviewDoc('coi').validThrough, key: true, renewal: null, note: 'Umbrella $3M; corrected certificate is a condition' },
    { id: 'ai', label: reviewDoc('ai').label, issued: '2026-03-31', expires: reviewDoc('ai').validThrough, key: false, renewal: null, note: reviewDoc('ai').note },
    { id: 'fin', label: reviewDoc('fin').label, issued: '2026-03-31', expires: reviewDoc('fin').validThrough, key: false, renewal: null, note: reviewDoc('fin').note, restricted: true },
    { id: 'bond', label: reviewDoc('bond').label, issued: '2025-07-15', expires: reviewDoc('bond').validThrough, key: true, renewal: null, note: 'Travelers · $3M single / $15M aggregate' },
    { id: 'license', label: reviewDoc('license').label, issued: '2025-11-30', expires: reviewDoc('license').validThrough, key: true, renewal: null, note: reviewDoc('license').note },
    { id: 'w9', label: reviewDoc('w9').label, issued: '2026-10-06', expires: null, key: false, renewal: null, note: 'No expiry' },
  ],
  audit: [
    { at: '2026-10-08T11:52:00', actor: 'Linarc', kind: 'renewal', action: 'Sent the umbrella condition to Maria Chen: corrected certificate needed before mobilisation.' },
    { at: '2026-10-08T11:50:00', actor: 'Jordan Lee', kind: 'decision', action: 'Approved with conditions: Electrical $2M / $5M, valid until 1 Jan 2027. Recommendation was Review (72, confidence 64%, provisional).' },
    { at: '2026-10-08T11:40:00', actor: 'Jordan Lee', kind: 'override', action: 'Overrode “Remaining bonding capacity below the requested single limit”: accepted with a project-specific bond condition.' },
    ...review.history.map((h) => ({ at: h.at, actor: h.actor, kind: 'decision', action: `${h.action}.`.replace(/\.\.$/, '.') })),
  ],
};

const DETAILED = { 'req-021': SUMMIT, 'req-001': APEX };

/** A plausible record for any other approved request, from its row in ./index.js. */
function genericRecord(r) {
  const company = companyById[r.company];
  const approvedOn = r.activity[0];
  const lapsed = r.lifecycle === 'expired';
  const coiExpires = r.validUntil;
  const documents = [
    { id: 'coi', label: 'Certificate of insurance (ACORD 25)', issued: addDays(coiExpires, -365), expires: coiExpires, key: true, renewal: lapsed || r.lifecycle === 'expiring' ? { status: 'requested', on: addDays(coiExpires, -30) } : null, note: lapsed ? 'GL policy lapsed; no renewal received' : 'Earliest policy expiry' },
    { id: 'emr', label: 'EMR ratesheet', issued: '2026-01-01', expires: '2027-01-01', key: true, renewal: null, note: 'Effective 1 Jan 2026' },
    { id: 'license', label: 'Contractor license certificate', issued: '2025-06-30', expires: '2027-06-30', key: true, renewal: null, note: `${company.state} license` },
    { id: 'w9', label: 'W-9', issued: addDays(approvedOn, -10), expires: null, key: false, renewal: null, note: 'No expiry' },
  ];
  const conditions = r.outcome === 'qualified-with-conditions'
    ? [{ id: 'bond', label: 'Project-specific performance and payment bond on contracts above $1M', status: 'in-force', note: '' }]
    : [];
  const audit = [
    { at: `${r.activity[0]}T09:00:00`, actor: r.lifecycle === 'current' ? reviewerById[r.reviewer].name : 'Linarc', kind: r.lifecycle === 'current' ? 'decision' : 'monitoring', action: `${r.activity[1]}.` },
    { at: `${r.submittedOn}T12:00:00`, actor: company.contact, kind: 'submission', action: `Submitted the prequalification (${templates[r.template]}).` },
  ];
  return {
    id: r.id,
    requestId: r.id,
    approvedBy: r.reviewer,
    approvedOn: r.lifecycle === 'current' ? approvedOn : addDays(r.submittedOn, 8),
    validUntilDriver: 'Certificate of insurance',
    trades: [{ trade: company.trade, csi: company.csi, scope: 'All projects', single: r.single, aggregate: r.aggregate }],
    conditions,
    overrides: [],
    documents,
    audit,
  };
}

/** The record for a request id, joined with its request and company; null when the request isn't approved. */
export function recordFor(requestId) {
  const r = requestById[requestId];
  if (!r) return null;
  if (!DETAILED[requestId] && (!r.outcome || r.outcome === 'not-qualified')) return null;
  const base = DETAILED[requestId] || genericRecord(r);
  const reviewer = reviewerById[base.approvedBy];
  return {
    outcome: r.outcome,
    lifecycle: r.lifecycle,
    validUntil: r.validUntil,
    ...base,
    displayId: displayId(requestId),
    company: companyById[r.company],
    project: r.project,
    templateName: templates[r.template],
    approvedByName: reviewer ? reviewer.name : '—',
    recommendation: { stamp: r.recommendation, score: r.score, confidence: r.confidence },
  };
}

export const DEFAULT_RECORD = 'req-021';

/** The earliest dated document still to renew: { date, label }, or null. "Next required renewal" on the list. */
export function nextRenewal(record) {
  const dated = record.documents.filter((d) => d.expires && !(d.renewal && d.renewal.status === 'received'));
  dated.sort((a, b) => a.expires.localeCompare(b.expires));
  return dated.length ? { date: dated[0].expires, label: dated[0].label } : null;
}

/**
 * Qualified Subs rows (screen 7): one per company that has a decision, from its latest closed request (the PRD keys
 * the qualification record by GC and sub, not by project; assumption A2 in docs/prequal/spec.md: a later approval
 * updates the one record). Companies whose latest decision was Not approved are included with `record: null`
 * (assumption A1). Apex (req-001) is still under review in the shared data, so it is not listed; its record is the
 * outcome the review prototype's approval would create.
 */
export function recordRows() {
  const latest = {};
  requests.filter((r) => r.workflow === 'closed' && r.outcome).forEach((r) => {
    const prev = latest[r.company];
    if (!prev || r.activity[0] > prev.activity[0]) latest[r.company] = r;
  });
  return Object.values(latest).map((r) => {
    const company = companyById[r.company];
    const record = recordFor(r.id);
    const trades = record ? record.trades : [];
    const reviewer = reviewerById[r.reviewer];
    return {
      id: company.id,
      requestId: r.id,
      record,
      companyName: company.name,
      trade: trades.length ? trades.map((t) => t.trade).join(' · ') : company.trade,
      csi: company.csi,
      state: company.state,
      outcome: OUTCOME[r.outcome],
      lifecycle: record && r.lifecycle ? LIFECYCLE[r.lifecycle] : null,
      status: requestStatus(r),
      single: trades.length ? Math.max(...trades.map((t) => t.single)) : null,
      aggregate: trades.length ? Math.max(...trades.map((t) => t.aggregate)) : null,
      conditions: record ? record.conditions : [],
      validUntil: record ? record.validUntil || r.validUntil : null,
      nextRenewal: record ? nextRenewal(record) : null,
      decidedByName: reviewer ? reviewer.name : '—',
      decidedOn: record ? record.approvedOn : r.activity[0],
      project: r.project,
      templateName: templates[r.template],
    };
  });
}

/** Request ids that have a record (for the picker notice and tests). */
export const RECORD_IDS = ['req-001', ...Object.keys(requestById).filter((id) => {
  const r = requestById[id];
  return r.outcome && r.outcome !== 'not-qualified';
})];
