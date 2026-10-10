// PLACEHOLDER DATA — GC Review Dashboard (screen 5) for req-001: Apex Electrical, Inc. on Harbor Point Clinic,
// Electrical — Medium Projects v3, under review by Jordan Lee. Matches the request row in ./index.js (score 72,
// confidence 64%, recommendation Review, 0 knockouts, 4 findings, checks 12 of 14). Section scores are weighted with
// the spec's default weights so they add up to the overall score (≈ 72). "Today" is 2026-10-08.
// Proof levels (status.js PROOF): declared / evidenced / verified / contradicted. Severity (SEVERITY): knockout /
// missing / finding / info. Resolution: unresolved / resolved / dismissed / overridden.

export const REVIEW_ID = 'req-001';

export const context = {
  requestId: 'req-001',
  displayId: 'REQ-001',
  submittedOn: '2026-10-05',
  reviewStartedOn: '2026-10-07',
  requestedBy: 'Alex Morgan (Estimator)',
  templateVersion: 'Electrical — Medium Projects v3 (rev. 2026-08-12)',
  publicWorks: false,
  states: 'CA',
};

export const lintelSummary =
  'Apex meets most requirements for medium electrical work. Two items need your judgement: the certificate shows ' +
  '$3M umbrella coverage against the $5M required, and remaining bonding capacity ($0.8M) is below the requested ' +
  '$2M single limit. Safety is good: EMR 0.94, confirmed by WCIRB. Broker and surety confirmations are still ' +
  'running, so this recommendation is provisional.';

// Overall section weights from docs/prequal/spec.md (Safety 25, Financial 20, Capability 20, Capacity 15,
// Insurance & bonding 10, Legal & compliance 10).
export const sectionScores = [
  { id: 'safety', label: 'Safety', weight: 25, score: 82, findings: 1 },
  { id: 'financial', label: 'Financial', weight: 20, score: 64, findings: 0 },
  { id: 'capability', label: 'Capability & experience', weight: 20, score: 78, findings: 0 },
  { id: 'capacity', label: 'Capacity', weight: 15, score: 55, findings: 1 },
  { id: 'insurance', label: 'Insurance & bonding', weight: 10, score: 58, findings: 1 },
  { id: 'legal', label: 'Legal & compliance', weight: 10, score: 90, findings: 1 },
];

/**
 * Findings, in reviewer-hierarchy order. Each carries the three proof levels for the value it's about:
 * { level, value, source, at, confidence? } — `value: null` means that level has no data yet (e.g. a pending check).
 */
export const findings = [
  {
    id: 'f-umbrella',
    severity: 'missing',
    resolution: 'unresolved',
    section: 'insurance',
    title: 'Umbrella coverage below the requirement',
    criterion: 'Umbrella / excess liability ≥ $5,000,000',
    impact: 'Required item failed: −6 points; approval needs a condition or a corrected certificate',
    proof: {
      declared: { value: '$5,000,000', state: 'contradicted', source: 'Insurance section, entered by Maria Chen', at: '2026-10-04' },
      evidenced: { value: '$3,000,000', state: 'contradicted', source: 'COI (ACORD 25), page 1, Umbrella row', at: '2026-10-04', confidence: 97 },
      verified: { value: null, state: 'pending', source: 'Broker confirmation sent to Lockton (Sacramento)', at: '2026-10-05' },
    },
  },
  {
    id: 'f-bonding',
    severity: 'finding',
    resolution: 'unresolved',
    section: 'capacity',
    title: 'Remaining bonding capacity is below the requested single limit',
    criterion: 'Remaining single-project bonding ≥ requested single ($2,000,000)',
    impact: 'Capacity concern: −4 points',
    proof: {
      declared: { value: 'Backlog $14.2M of $15M aggregate', state: 'declared', source: 'Capacity section', at: '2026-10-04' },
      evidenced: { value: '$0.8M remaining (letter: $3M single / $15M aggregate)', state: 'evidenced', source: 'Surety letter, Travelers, dated 2026-07-15', at: '2026-10-04', confidence: 91 },
      verified: { value: null, state: 'pending', source: 'Surety confirmation sent to Travelers', at: '2026-10-05' },
    },
  },
  {
    id: 'f-emr',
    severity: 'finding',
    resolution: 'unresolved',
    section: 'safety',
    title: 'Entered EMR differs from the ratesheet',
    criterion: 'EMR ≤ 1.00 (current rating year)',
    impact: 'Meets the threshold either way; the declared value is not used',
    proof: {
      declared: { value: '0.82', state: 'contradicted', source: 'Safety section', at: '2026-10-04' },
      evidenced: { value: '0.94', state: 'evidenced', source: 'WCIRB ratesheet 2026, page 1', at: '2026-10-04', confidence: 99 },
      verified: { value: '0.94', state: 'verified', source: 'WCIRB lookup', at: '2026-10-05' },
    },
  },
  {
    id: 'f-license',
    severity: 'finding',
    resolution: 'unresolved',
    section: 'legal',
    title: 'License name doesn’t exactly match the legal entity',
    criterion: 'Contractor license active, C-10, in the legal entity’s name',
    impact: 'Possible name variant; never an automatic knockout. Confirm it is the same entity',
    proof: {
      declared: { value: 'Apex Electrical, Inc. · C-10 #998877', state: 'declared', source: 'Licensing section', at: '2026-10-03' },
      evidenced: { value: 'Apex Electrical, Inc. · C-10 #998877', state: 'evidenced', source: 'License certificate upload', at: '2026-10-03', confidence: 95 },
      verified: { value: 'Apex Electric Inc · C-10 #998877 · Active', state: 'contradicted', source: 'CSLB license lookup', at: '2026-10-05' },
    },
  },
  {
    id: 'f-w9',
    severity: 'finding',
    resolution: 'resolved',
    section: 'legal',
    title: 'W-9 TIN didn’t match the IRS record',
    criterion: 'TIN matches the legal name',
    impact: 'Resolved: corrected W-9 uploaded 2026-10-06',
    proof: {
      declared: { value: '94-3318821', state: 'verified', source: 'Company section', at: '2026-10-06' },
      evidenced: { value: '94-3318821', state: 'verified', source: 'W-9 (rev. 2026-10-06)', at: '2026-10-06', confidence: 99 },
      verified: { value: 'Match', state: 'verified', source: 'IRS TIN matching', at: '2026-10-06' },
    },
  },
  {
    id: 'f-osha',
    severity: 'info',
    resolution: 'unresolved',
    section: 'safety',
    title: 'One OSHA citation in 2023 (other-than-serious, abated)',
    criterion: 'No serious or willful citations in 3 years',
    impact: 'Informational: no score impact',
    proof: {
      declared: { value: '1 citation, 2023', state: 'verified', source: 'Safety section', at: '2026-10-04' },
      evidenced: { value: '—', state: 'none', source: 'No document requested for this item', at: null },
      verified: { value: 'Inspection 1658432, other-than-serious, abated', state: 'verified', source: 'OSHA establishment search', at: '2026-10-05' },
    },
  },
];

// Independent checks (CHECK vocabulary). `result` is the plain outcome; passed checks are hidden by default.
export const checks = [
  { id: 'cslb', label: 'Contractor license', source: 'CSLB', status: 'complete', passed: false, result: 'Active C-10; name listed as “Apex Electric Inc”' },
  { id: 'sos', label: 'Entity standing', source: 'CA Secretary of State', status: 'complete', passed: true, result: 'Active, good standing' },
  { id: 'sam', label: 'Federal exclusions', source: 'SAM.gov', status: 'complete', passed: true, result: 'No exclusions' },
  { id: 'ofac', label: 'Sanctions', source: 'OFAC SDN', status: 'complete', passed: true, result: 'No match' },
  { id: 'dir', label: 'State debarment', source: 'CA DIR', status: 'complete', passed: true, result: 'Not listed' },
  { id: 'osha', label: 'OSHA establishment search', source: 'OSHA', status: 'complete', passed: true, result: '1 other-than-serious citation (2023), abated' },
  { id: 'emr', label: 'EMR confirmation', source: 'WCIRB', status: 'complete', passed: true, result: '0.94 (2026)' },
  { id: 'tin', label: 'TIN matching', source: 'IRS', status: 'complete', passed: true, result: 'Match (after correction)' },
  { id: 'credit', label: 'Business credit report', source: 'Dun & Bradstreet', status: 'complete', passed: true, result: 'PAYDEX 78, no liens' },
  { id: 'litigation', label: 'Litigation and lien search', source: 'Court records', status: 'complete', passed: true, result: 'No open matters' },
  { id: 'ref1', label: 'Reference: Harborview Construction Group', source: 'Outreach', status: 'complete', passed: true, result: 'Would hire again (5 / 5)' },
  { id: 'ref2', label: 'Reference: Summit Pacific Builders', source: 'Outreach', status: 'complete', passed: true, result: 'Would hire again (4 / 5)' },
  { id: 'broker', label: 'Insurance broker confirmation', source: 'Lockton (Sacramento)', status: 'running', passed: null, result: 'Request sent 5 Oct; reminder sent 7 Oct' },
  { id: 'surety', label: 'Bonding capacity confirmation', source: 'Travelers', status: 'running', passed: null, result: 'Request sent 5 Oct' },
];

// Documents on file (DOCUMENT vocabulary). Financial statements are reviewer-only.
export const documents = [
  { id: 'coi', label: 'Certificate of insurance (ACORD 25)', status: 'failed', note: 'Umbrella $3,000,000; $5,000,000 required', validThrough: '2027-03-31' },
  { id: 'ai', label: 'Additional insured endorsement', status: 'passed', note: 'CG 20 10 and CG 20 37', validThrough: '2027-03-31' },
  { id: 'wos', label: 'Waiver of subrogation', status: 'passed', note: 'CG 24 04', validThrough: '2027-03-31' },
  { id: 'emr', label: 'EMR ratesheet', status: 'passed', note: 'Mod 0.94, effective 1 Jan 2026', validThrough: '2027-01-01' },
  { id: 'osha300a', label: 'OSHA 300A, last 3 years', status: 'passed', note: '2023, 2024, 2025', validThrough: '2027-02-01' },
  { id: 'fin', label: 'Financial statements (reviewed), 2024–2025', status: 'passed', note: 'Restricted: reviewers only', validThrough: '2027-03-31', restricted: true },
  { id: 'bond', label: 'Surety bonding letter', status: 'needs-review', note: 'Aggregate read with 82% confidence', validThrough: '2027-07-15' },
  { id: 'w9', label: 'W-9', status: 'passed', note: 'Revised 6 Oct 2026', validThrough: null },
  { id: 'w9-old', label: 'W-9 (original)', status: 'superseded', note: 'Replaced 6 Oct 2026', validThrough: null },
  { id: 'license', label: 'Contractor license certificate', status: 'passed', note: 'C-10 #998877', validThrough: '2027-11-30' },
];

// What the sub declared, by section (Submission tab). Values only; documents are on their own tab.
export const submission = [
  { section: 'Company', rows: [['Legal name', 'Apex Electrical, Inc.'], ['Entity', 'California corporation, 2009'], ['Principals', 'Maria Chen (President), Raj Iyer (VP Operations)']] },
  { section: 'Licensing', rows: [['Contractor license', 'C-10 #998877, CA'], ['DIR registration', '1000045671']] },
  { section: 'Safety', rows: [['EMR (2024 / 2025 / 2026)', '0.88 / 0.90 / 0.82'], ['TRIR / DART (2025)', '1.9 / 0.8'], ['Fatalities, last 5 years', '0']] },
  { section: 'Insurance', rows: [['GL each occurrence / aggregate', '$2,000,000 / $4,000,000'], ['Umbrella', '$5,000,000'], ['Workers’ compensation', 'Statutory']] },
  { section: 'Financial', rows: [['Revenue 2025', '$38,400,000'], ['Working capital', '$4,100,000'], ['Bonding', 'Travelers, $3M single / $15M aggregate']] },
  { section: 'Capacity', rows: [['Current backlog', '$14,200,000'], ['Largest current project', '$4,600,000']] },
  { section: 'Experience', rows: [['Projects over $1M, last 5 years', '7'], ['Healthcare (HCAI / OSHPD)', '3 projects'], ['References', '3 provided, 2 answered']] },
];

export const history = [
  { at: '2026-10-07T09:12:00', actor: 'Jordan Lee', action: 'Started review' },
  { at: '2026-10-07T08:00:00', actor: 'Linarc', action: 'Reminder sent to Lockton (broker confirmation)' },
  { at: '2026-10-06T16:40:00', actor: 'Maria Chen', action: 'Uploaded a corrected W-9; TIN finding resolved' },
  { at: '2026-10-05T14:05:00', actor: 'Linarc', action: 'Scored: Review · 72 · confidence 64% (provisional)' },
  { at: '2026-10-05T13:58:00', actor: 'Linarc', action: '12 of 14 checks complete; broker and surety pending' },
  { at: '2026-10-05T11:20:00', actor: 'Maria Chen', action: 'Submitted the application' },
  { at: '2026-09-29T10:02:00', actor: 'Alex Morgan', action: 'Sent the invitation (Electrical — Medium Projects v3)' },
];

export const CONDITIONS = [
  { id: 'bond', label: 'Project-specific performance and payment bond required' },
  { id: 'umbrella', label: 'Corrected certificate showing $5M umbrella before mobilisation' },
  { id: 'sdi', label: 'Subcontractor default insurance (SDI) enrolment' },
  { id: 'retainage', label: 'Increased retainage (10%)' },
  { id: 'joint', label: 'Joint check agreement for major suppliers' },
];
