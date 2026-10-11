// PLACEHOLDER DATA — the review (screen 5) of every request that has a submission, apart from Apex (req-001, written
// out in ./review.js). Each dossier matches its row in ./index.js: score, confidence, recommendation, knockouts,
// open findings (unresolved, not informational, not counting knockouts) and checks n of m. Section scores use the
// spec's weights (Safety 25, Financial 20, Capability 20, Capacity 15, Insurance & bonding 10, Legal 10) and add up
// to the overall score. Decided requests keep their findings as they stood at the decision (resolved / overridden),
// so a closed review reads as the record of how the decision was reached.
// Shapes are the ones in ./review.js; checks, documents and the Submission tab are built from ./profiles.js and
// overridden per request. "Today" for the mock is 2026-10-08. Fictional companies, people and numbers.
import { companyById, requestById, templates } from './index';
import { profiles, submissionFor } from './profiles';
import { projects } from './wizard';

// ——— Builders ———————————————————————————————————————————————————————————————————————————————————————————————

// Every project is in California, so the license and debarment checks run against California sources; a company based
// elsewhere is also checked against its home state's debarment list.
const DEBARMENT = { CA: 'CA DIR', NV: 'CA DIR and NV Labor Commissioner', OR: 'CA DIR and OR BOLI', AZ: 'CA DIR and AZ Industrial Commission' };

/** The template's independent checks, all passed, then the request's overrides by check id. */
function checksFor(r, p, over = {}) {
  const { state } = companyById[r.company];
  const list = [
    ['cslb', 'Contractor license', 'CSLB', `Active · ${p.license}`],
    ['sos', 'Entity standing', `${state} Secretary of State`, 'Active, good standing'],
    ['sam', 'Federal exclusions', 'SAM.gov', 'No exclusions'],
    ['ofac', 'Sanctions', 'OFAC SDN', 'No match'],
    ['dir', 'State debarment', DEBARMENT[state], 'Not listed'],
    ...(r.template === 'pw-md' ? [['dirpw', 'Public works registration', 'CA DIR', 'Registered for the current fiscal year']] : []),
    ['osha', 'OSHA establishment search', 'OSHA', p.osha],
    ['emr', 'EMR confirmation', state === 'CA' ? 'WCIRB' : 'NCCI', `${p.emr[2]} (2026)`],
    ['tin', 'TIN matching', 'IRS', 'Match'],
    ['credit', 'Business credit report', 'Dun & Bradstreet', p.credit],
    ['litigation', 'Litigation and lien search', 'Court records', 'No open matters'],
    ['ref1', `Reference: ${p.refs[0]}`, 'Outreach', 'Would hire again (5 / 5)'],
    ...(r.template === 'conc-md' ? [] : [['ref2', `Reference: ${p.refs[1]}`, 'Outreach', 'Would hire again (4 / 5)']]),
    ['broker', 'Insurance broker confirmation', p.broker, 'Limits confirmed'],
    ['surety', 'Bonding capacity confirmation', p.surety, 'Capacity confirmed'],
  ];
  return list.map(([id, label, source, result]) => ({ id, label, source, status: 'complete', passed: true, result, ...(over[id] || {}) }));
}

/** Documents on file, all accepted, then the request's overrides by document id (`null` drops one). */
function documentsFor(p, dates, over = {}) {
  const list = [
    { id: 'coi', label: 'Certificate of insurance (ACORD 25)', status: 'passed', note: `GL ${p.gl.split(' (')[0]} · umbrella ${p.umbrella.split(' (')[0]}`, validThrough: dates.coi },
    { id: 'ai', label: 'Additional insured endorsement', status: 'passed', note: 'CG 20 10 and CG 20 37', validThrough: dates.coi },
    { id: 'wos', label: 'Waiver of subrogation', status: 'passed', note: 'CG 24 04', validThrough: dates.coi },
    { id: 'emr', label: 'EMR ratesheet', status: 'passed', note: `Mod ${p.emr[2]}, effective 1 Jan ${dates.emrYear || 2026}`, validThrough: dates.emr || '2027-01-01' },
    { id: 'osha300a', label: 'OSHA 300A, last 3 years', status: 'passed', note: dates.oshaYears || '2023, 2024, 2025', validThrough: dates.osha || '2027-02-01' },
    { id: 'fin', label: `Financial statements (reviewed), ${dates.finYears || '2024–2025'}`, status: 'passed', note: 'Restricted: reviewers only', validThrough: dates.fin || '2027-03-31', restricted: true },
    { id: 'bond', label: 'Surety bonding letter', status: 'passed', note: `${p.surety} · ${p.bonding.split(', ')[1]}`, validThrough: dates.bond },
    { id: 'w9', label: 'W-9', status: 'passed', note: 'Name and TIN match', validThrough: null },
    { id: 'license', label: 'Contractor license certificate', status: 'passed', note: p.license, validThrough: dates.license },
  ];
  return list.map((d) => (d.id in over ? over[d.id] && { ...d, ...over[d.id] } : d)).filter(Boolean)
    .concat(over.extra || []);
}

const WEIGHTS = [['safety', 'Safety', 25], ['financial', 'Financial', 20], ['capability', 'Capability & experience', 20], ['capacity', 'Capacity', 15], ['insurance', 'Insurance & bonding', 10], ['legal', 'Legal & compliance', 10]];

/** Section scores in the spec's order; `findings` counts the open findings in each section. */
function sectionsFor(scores, findings) {
  return WEIGHTS.map(([id, label, weight], i) => ({
    id, label, weight, score: scores[i],
    findings: findings.filter((f) => f.section === id && f.resolution === 'unresolved' && f.severity !== 'info').length,
  }));
}

const lvl = ([value, state, source, at, confidence]) => ({ value, state, source, at, ...(confidence ? { confidence } : {}) });
/** A finding: severity, resolution, section, title, criterion, impact, then [declared, evidenced, verified]. */
const F = (id, severity, resolution, section, title, criterion, impact, [d, e, v]) => ({
  id, severity, resolution, section, title, criterion, impact, proof: { declared: lvl(d), evidenced: lvl(e), verified: lvl(v) },
});
const NONE = ['—', 'none', 'No document requested for this item', null];

const REQUESTER = {
  'Harbor Point Clinic': 'Alex Morgan (Estimator)',
  'Eastgate Data Center': 'Sofia Ramirez (Project Manager)',
  'Northern Heights': 'Marcus Hill (Estimator)',
  'Riverside Commons': 'Alex Morgan (Estimator)',
};
const PROJECT = Object.fromEntries(projects.map((x) => [x.name, x]));

/** Standing conditions any approval can carry, after the request's own. */
const STANDARD_CONDITIONS = [
  { id: 'bond', label: 'Project-specific performance and payment bond required' },
  { id: 'retainage', label: 'Increased retainage (10%)' },
  { id: 'sdi', label: 'Subcontractor default insurance (SDI) enrolment' },
  { id: 'joint', label: 'Joint check agreement for major suppliers' },
];

// ——— Dossiers ———————————————————————————————————————————————————————————————————————————————————————————————

const D = {};

// Ready for review, unassigned. A strong sub on a large job; their existing record (req-021) is up for renewal, and
// the bonding letter that renewal is waiting on is the only open item here too.
D['req-002'] = {
  rev: '2026-05-04',
  reviewStartedOn: null,
  scores: [94, 90, 95, 84, 86, 96],
  lintelSummary:
    'Summit is a strong fit for large mechanical work: EMR 0.97 confirmed by WCIRB, four data-centre projects, every ' +
    'check complete. One item to settle before award: the surety bonding letter on file expires 20 Oct 2026, before ' +
    'Eastgate mobilises. A renewal is already requested on their current qualification.',
  findings: [
    F('f-bond-expiry', 'finding', 'unresolved', 'insurance', 'Bonding letter expires before the project starts', 'Surety letter valid through the planned start (Jan 2027)', 'Valid until would be 20 Oct 2026 unless renewed: −3 points', [
      ['Travelers, $5M single / $12M aggregate', 'declared', 'Financial section', '2026-10-05'],
      ['Letter dated 20 Oct 2025, valid 12 months', 'evidenced', 'Surety bonding letter, Travelers', '2026-10-05', 96],
      ['Capacity confirmed; renewal letter not yet issued', 'verified', 'Surety confirmation, Travelers', '2026-10-06'],
    ]),
    F('f-qr', 'info', 'unresolved', 'legal', 'Already qualified for HVAC up to $3M / $6M (QR-021)', 'Existing qualification for the requested trade', 'Informational: this request asks for higher limits', [
      ['—', 'none', 'Not asked', null], NONE, ['QR-021 · Renewal needed soon', 'verified', 'Linarc qualification records', '2026-10-06'],
    ]),
  ],
  checks: {},
  dates: { coi: '2027-04-01', bond: '2026-10-20', license: '2026-11-30' },
  documents: { bond: { status: 'expiring', note: 'Travelers · expires 20 Oct 2026; renewal requested 28 Sep' } },
  history: [
    ['2026-10-06T15:10:00', 'Linarc', 'Scored: Accept · 91 · confidence 88%'],
    ['2026-10-06T15:02:00', 'Linarc', 'All 14 checks complete'],
    ['2026-10-06T10:48:00', 'Dev Patel', 'Submitted the application'],
    ['2026-09-24T09:30:00', 'Sofia Ramirez', 'Sent the invitation (Mechanical — Large Projects v2)'],
  ],
  decision: {
    primary: 'conditions',
    trades: ['HVAC', 'Plumbing (process piping)', 'Building controls'],
    validUntil: '2026-10-20',
    validUntilHelp: 'Earliest key-document expiry (surety letter, 20 Oct 2026)',
    conditions: ['bond-renewal'],
    options: [{ id: 'bond-renewal', label: 'Renewed surety bonding letter before contract award' }],
    infoMessage: 'Please upload your renewed Travelers bonding letter when it is issued; the current one expires 20 Oct 2026.',
  },
};

// Ready for review, unassigned. A confirmed knockout: listed on the Nevada debarment list. Not recommended.
D['req-003'] = {
  rev: '2026-02-20',
  reviewStartedOn: null,
  scores: [22, 24, 30, 26, 34, 0],
  lintelSummary:
    'Not recommended. Granite Ridge is on the Nevada Labor Commissioner’s debarment list through 30 Apr 2027 (matched on ' +
    'name, address and license number), which is a knockout for this template. Separately, EMR 1.21 is above the 1.00 ' +
    'limit and working capital is $240K against a $3M aggregate request.',
  findings: [
    F('f-debar', 'knockout', 'unresolved', 'legal', 'Listed on the Nevada debarment list', 'Not debarred or suspended by any state or federal agency', 'Knockout: cannot be approved unless the match is dismissed', [
      ['No debarment', 'contradicted', 'Legal section, entered by Tom Alvarez', '2026-10-03'],
      NONE,
      ['Granite Ridge Concrete, Inc. · NSCB #0071442 · debarred to 30 Apr 2027 (prevailing wage)', 'contradicted', 'NV Labor Commissioner debarment list', '2026-10-04'],
    ]),
    F('f-emr', 'missing', 'unresolved', 'safety', 'EMR above the threshold', 'EMR ≤ 1.00 (current rating year)', 'Required item failed: −8 points', [
      ['1.21', 'declared', 'Safety section', '2026-10-03'],
      ['1.21', 'evidenced', 'NCCI ratesheet 2026, page 1', '2026-10-03', 99],
      ['1.21', 'verified', 'NCCI lookup', '2026-10-04'],
    ]),
    F('f-wc', 'finding', 'unresolved', 'financial', 'Working capital is low for the requested aggregate', 'Working capital ≥ 10% of the requested aggregate ($300,000)', 'Financial concern: −5 points', [
      ['$240,000', 'declared', 'Financial section', '2026-10-03'],
      ['$240,000 (31 Dec 2025)', 'evidenced', 'Financial statements (compiled), 2025', '2026-10-03', 94],
      ['—', 'none', 'No independent source', null],
    ]),
    F('f-osha', 'finding', 'unresolved', 'safety', 'Two serious OSHA citations in 2024, one still open', 'No serious or willful citations in 3 years', 'Safety concern: −6 points', [
      ['2 citations, 2024', 'declared', 'Safety section', '2026-10-03'],
      NONE,
      ['Inspection 1712044: 2 serious, 1 abatement not certified', 'verified', 'OSHA establishment search', '2026-10-04'],
    ]),
  ],
  checks: {
    dir: { passed: false, result: 'Listed: debarred to 30 Apr 2027' },
    osha: { passed: false, result: '2 serious citations (2024), 1 abatement not certified' },
    emr: { passed: false, result: '1.21 (2026)' },
    credit: { passed: false, result: 'PAYDEX 52, 1 open lien ($38,400)' },
  },
  dates: { coi: '2027-02-28', bond: '2027-06-30', license: '2027-09-30', finYears: '2025 (compiled)' },
  documents: {
    emr: { status: 'failed', note: 'Mod 1.21, effective 1 Jan 2026; 1.00 required' },
    fin: { status: 'needs-review', note: 'Compiled, not reviewed; restricted: reviewers only' },
  },
  history: [
    ['2026-10-04T09:15:00', 'Linarc', 'Scored: Not recommended · 23 · confidence 91%'],
    ['2026-10-04T09:12:00', 'Linarc', 'Debarment check matched: NV Labor Commissioner list'],
    ['2026-10-03T16:40:00', 'Tom Alvarez', 'Submitted the application'],
    ['2026-09-22T11:05:00', 'Marcus Hill', 'Sent the invitation (Concrete — Medium Projects v1)'],
  ],
  decision: {
    primary: 'reject',
    trades: ['Concrete', 'Concrete pumping'],
    validUntil: '2027-01-01',
    validUntilHelp: 'Earliest key-document expiry (EMR ratesheet, 1 Jan 2027)',
    conditions: [],
    infoMessage: 'Our check found a listing on the Nevada Labor Commissioner’s debarment list. If this is resolved or relates to another entity, please send the order or correspondence that shows it.',
    rejectReason: 'Debarment (knockout)',
  },
};

// Ready for review, unassigned. Middling: a new serious OSHA citation (the same one that suspended their Harbor Point
// qualification, req-024), aggregate above their bonding, and four checks still out (one failed to run).
D['req-004'] = {
  rev: '2026-06-01',
  reviewStartedOn: null,
  scores: [52, 60, 80, 78, 66, 88],
  lintelSummary:
    'Bluewater has good plumbing experience, but this one needs judgement. A serious OSHA citation from August 2026 is ' +
    'open and contested; it also suspended their Harbor Point Clinic qualification. The requested $2.5M aggregate is ' +
    'above their $2M bonding aggregate. Four checks are still out, including the credit report, which failed to run, ' +
    'so this recommendation is provisional.',
  findings: [
    F('f-osha', 'missing', 'unresolved', 'safety', 'Serious OSHA citation, August 2026 (contested)', 'No serious or willful citations in 3 years', 'Required item failed: −9 points', [
      ['1 citation, under appeal', 'declared', 'Safety section, entered by Sam Okafor', '2026-10-07'],
      ['Notice of contest filed 2 Sep 2026', 'evidenced', 'Uploaded contest letter', '2026-10-07', 92],
      ['Inspection 1789310: 1 serious (trench protection), contested', 'verified', 'OSHA establishment search', '2026-10-07'],
    ]),
    F('f-agg', 'finding', 'unresolved', 'capacity', 'Requested aggregate is above the bonding aggregate', 'Bonding aggregate ≥ requested aggregate ($2,500,000)', 'Capacity concern: −4 points', [
      ['$2,000,000 aggregate', 'declared', 'Financial section', '2026-10-07'],
      ['$1.5M single / $2M aggregate', 'evidenced', 'Surety letter, Liberty Mutual, dated 2026-06-12', '2026-10-07', 95],
      [null, 'pending', 'Surety confirmation sent to Liberty Mutual', '2026-10-07'],
    ]),
    F('f-ai', 'finding', 'unresolved', 'insurance', 'Additional insured endorsement covers ongoing operations only', 'CG 20 10 and CG 20 37 (completed operations)', 'Coverage gap: −3 points', [
      ['Both endorsements', 'contradicted', 'Insurance section', '2026-10-07'],
      ['CG 20 10 only', 'contradicted', 'Endorsement upload, page 2', '2026-10-07', 93],
      [null, 'pending', 'Broker confirmation sent to Alliant', '2026-10-07'],
    ]),
    F('f-fin', 'finding', 'unresolved', 'financial', 'Financial statements are compiled, not reviewed', 'CPA-reviewed or audited statements', 'Lower confidence in financial data', [
      ['Reviewed statements', 'contradicted', 'Financial section', '2026-10-07'],
      ['Compilation report, 2025', 'contradicted', 'Financial statements upload, cover page', '2026-10-07', 97],
      ['—', 'none', 'No independent source', null],
    ]),
    F('f-rev', 'finding', 'unresolved', 'financial', 'Entered revenue differs from the statements by 14%', 'Declared values within 10% of the documents', 'The statement value is used: −2 points', [
      ['$18,900,000', 'contradicted', 'Financial section', '2026-10-07'],
      ['$16,250,000 (2025)', 'evidenced', 'Financial statements, income statement', '2026-10-07', 98],
      ['—', 'none', 'No independent source', null],
    ]),
    F('f-name', 'info', 'unresolved', 'legal', 'Existing qualification suspended (QR-024)', 'Existing qualifications in good standing', 'Informational: same OSHA citation', [
      ['—', 'none', 'Not asked', null], NONE, ['QR-024 · Suspended 30 Sep 2026', 'verified', 'Linarc qualification records', '2026-10-07'],
    ]),
  ],
  checks: {
    osha: { passed: false, result: '1 serious citation (Aug 2026), contested' },
    credit: { status: 'failed-to-run', passed: null, result: 'No report returned; retry scheduled 9 Oct' },
    ref1: { status: 'running', passed: null, result: 'Request sent 7 Oct' },
    broker: { status: 'running', passed: null, result: 'Request sent 7 Oct' },
    surety: { status: 'running', passed: null, result: 'Request sent 7 Oct' },
  },
  dates: { coi: '2027-03-01', bond: '2027-06-12', license: '2027-08-31', finYears: '2025 (compiled)' },
  documents: {
    ai: { status: 'failed', note: 'CG 20 10 only; CG 20 37 (completed operations) required' },
    fin: { status: 'needs-review', note: 'Compiled, not reviewed; restricted: reviewers only' },
  },
  history: [
    ['2026-10-07T17:30:00', 'Linarc', 'Credit report failed to run; retry scheduled 9 Oct'],
    ['2026-10-07T17:20:00', 'Linarc', 'Scored: Review · 68 · confidence 55% (provisional)'],
    ['2026-10-07T17:12:00', 'Linarc', '10 of 14 checks complete; references, broker and surety pending'],
    ['2026-10-07T16:02:00', 'Sam Okafor', 'Submitted the application'],
    ['2026-09-25T08:45:00', 'Alex Morgan', 'Sent the invitation (Standard Specialty Trade v4)'],
  ],
  decision: {
    primary: 'request',
    trades: ['Plumbing', 'Medical gas'],
    validUntil: '2027-03-01',
    validUntilHelp: 'Earliest key-document expiry (COI, 1 Mar 2027)',
    conditions: ['bond'],
    options: [{ id: 'osha-outcome', label: 'Written outcome of the OSHA contest before mobilisation' }],
    infoMessage: 'Please upload the CG 20 37 completed-operations endorsement and reviewed (not compiled) financial statements for 2025.',
  },
};

// GC is reviewing (Priya). Clean apart from two capability / capacity findings; the broker confirmation came back and
// resolved the umbrella read. Surety and one reference still running.
D['req-005'] = {
  rev: '2026-06-01',
  reviewStartedOn: '2026-10-02',
  scores: [90, 82, 80, 74, 88, 92],
  lintelSummary:
    'Ironline is recommended for structural steel at these limits. Safety is excellent (EMR 0.76, no OSHA inspections). ' +
    'Two items to look at: welding certifications for two of the six listed welders have expired, and backlog is 82% ' +
    'of their bonding aggregate. The surety confirmation and one reference are still running.',
  findings: [
    F('f-aws', 'finding', 'unresolved', 'capability', 'Welding certifications expired for 2 of 6 listed welders', 'Key personnel certifications current', 'Capability concern: −3 points', [
      ['6 AWS D1.1 certified welders', 'declared', 'Experience & workforce section', '2026-09-30'],
      ['4 current; 2 expired Jul and Aug 2026', 'contradicted', 'Certification cards upload (6 cards)', '2026-09-30', 94],
      ['—', 'none', 'No independent source', null],
    ]),
    F('f-backlog', 'finding', 'unresolved', 'capacity', 'Backlog is 82% of the bonding aggregate', 'Backlog ≤ 75% of bonding aggregate', 'Capacity concern: −3 points', [
      ['Backlog $12.3M of $15M aggregate', 'declared', 'Capacity section', '2026-09-30'],
      ['$5M single / $15M aggregate', 'evidenced', 'Surety letter, Zurich, dated 2026-08-01', '2026-09-30', 93],
      [null, 'pending', 'Surety confirmation sent to Zurich', '2026-10-01'],
    ]),
    F('f-umbrella', 'finding', 'resolved', 'insurance', 'Umbrella read as $4M on the certificate', 'Umbrella / excess liability ≥ $5,000,000', 'Resolved: broker confirmed $5,000,000 on 6 Oct', [
      ['$5,000,000', 'verified', 'Insurance section', '2026-09-30'],
      ['$4,000,000 (low-quality scan)', 'contradicted', 'COI (ACORD 25), page 1', '2026-09-30', 61],
      ['$5,000,000', 'verified', 'Broker confirmation, Lockton', '2026-10-06'],
    ]),
    F('f-rename', 'info', 'unresolved', 'legal', 'Renamed in 2022 (formerly Ironline Erectors Inc.)', 'Name history disclosed', 'Informational: same entity number', [
      ['Renamed 2022', 'declared', 'Company section', '2026-09-30'], NONE, ['Entity C3109921, name change filed 14 Mar 2022', 'verified', 'CA Secretary of State', '2026-10-01'],
    ]),
  ],
  checks: {
    ref2: { status: 'running', passed: null, result: 'Request sent 1 Oct; reminder sent 6 Oct' },
    surety: { status: 'running', passed: null, result: 'Request sent 1 Oct' },
    broker: { result: 'Umbrella $5,000,000 confirmed (6 Oct)' },
  },
  dates: { coi: '2027-05-01', bond: '2027-08-01', license: '2027-04-30' },
  documents: {
    coi: { status: 'passed', note: 'Umbrella confirmed by the broker as $5,000,000' },
    extra: [{ id: 'certs', label: 'Certification cards for key personnel', status: 'failed', note: '2 of 6 AWS D1.1 cards expired', validThrough: null }],
  },
  history: [
    ['2026-10-06T14:22:00', 'Linarc', 'Broker confirmation received; umbrella finding resolved'],
    ['2026-10-02T10:05:00', 'Priya Natarajan', 'Started review'],
    ['2026-10-01T18:00:00', 'Linarc', 'Scored: Accept · 84 · confidence 71% (provisional)'],
    ['2026-10-01T16:30:00', 'Lena Kowalski', 'Submitted the application'],
    ['2026-09-21T13:15:00', 'Sofia Ramirez', 'Sent the invitation (Standard Specialty Trade v4)'],
  ],
  decision: {
    primary: 'approve',
    trades: ['Structural steel', 'Miscellaneous metals'],
    validUntil: '2027-01-01',
    validUntilHelp: 'Earliest key-document expiry (EMR ratesheet, 1 Jan 2027)',
    conditions: [],
    options: [{ id: 'welders', label: 'Current AWS D1.1 cards for every welder on site' }],
    infoMessage: 'Please upload current AWS D1.1 certification cards for the two welders whose cards expired this summer.',
  },
};

// More information needed (Jordan asked on 2 Oct). Re-applying after their last qualification lapsed (req-022): the
// GL policy expired and the certificate on file is the old one.
D['req-006'] = {
  rev: '2026-06-01',
  reviewStartedOn: '2026-10-01',
  scores: [58, 62, 66, 70, 30, 74],
  lintelSummary:
    'Cascade is re-applying after their qualification lapsed on 15 Sep 2026 when their GL policy expired. The ' +
    'certificate submitted is still the expired policy and the additional insured endorsement is missing; both were ' +
    'requested on 2 Oct. Beyond insurance: EMR 1.04, their California license has been inactive since July, and their largest past project is ' +
    'about half the requested single limit.',
  findings: [
    F('f-gl', 'missing', 'unresolved', 'insurance', 'Certificate shows the expired GL policy', 'Active GL policy, $1M / $2M', 'Required item failed: −10 points', [
      ['$1,000,000 / $2,000,000', 'declared', 'Insurance section', '2026-09-28'],
      ['Policy GL-44817 expired 15 Sep 2026', 'contradicted', 'COI (ACORD 25), page 1', '2026-09-28', 98],
      [null, 'pending', 'Broker confirmation sent to USI (Portland)', '2026-09-29'],
    ]),
    F('f-ai', 'missing', 'unresolved', 'insurance', 'Additional insured endorsement missing', 'CG 20 10 and CG 20 37 on file', 'Required item failed: −4 points', [
      ['Will provide', 'declared', 'Insurance section', '2026-09-28'], ['—', 'none', 'Not uploaded', null], ['—', 'none', 'No independent source', null],
    ]),
    F('f-emr', 'finding', 'unresolved', 'safety', 'EMR slightly above the threshold', 'EMR ≤ 1.00 (current rating year)', 'Safety concern: −3 points', [
      ['1.04', 'declared', 'Safety section', '2026-09-28'], ['1.04', 'evidenced', 'NCCI ratesheet 2026', '2026-09-28', 99], ['1.04', 'verified', 'NCCI lookup', '2026-09-29'],
    ]),
    F('f-license', 'finding', 'unresolved', 'legal', 'California license inactive since July', 'License active in the project’s state (CA, C-39)', 'Must be reactivated before work starts', [
      ['C-39 #1012877, CA', 'declared', 'Licensing section', '2026-09-28'],
      ['C-39 #1012877 (2025 pocket card)', 'evidenced', 'License upload', '2026-09-28', 97],
      ['Inactive since 22 Jul 2026 (bond cancelled)', 'contradicted', 'CSLB license lookup', '2026-09-29'],
    ]),
    F('f-fall', 'finding', 'unresolved', 'safety', 'Fall-protection plan not provided', 'Written fall-protection program (roofing)', 'Safety concern: −2 points', [
      ['Included in safety manual', 'declared', 'Safety section', '2026-09-28'], ['Safety manual has no fall-protection chapter', 'contradicted', 'Safety program upload', '2026-09-28', 88], ['—', 'none', 'No independent source', null],
    ]),
    F('f-size', 'finding', 'unresolved', 'capability', 'Largest past project is half the requested single limit', 'A completed project ≥ 75% of the requested single limit', 'Capability concern: −3 points', [
      ['$620,000 (Pacific Crest, 2025)', 'declared', 'Experience section', '2026-09-28'], ['$620,000', 'evidenced', 'Project list upload', '2026-09-28', 90], [null, 'pending', 'Reference outreach to Pacific Crest Builders', '2026-09-29'],
    ]),
  ],
  checks: {
    cslb: { passed: false, result: 'C-39 #1012877 inactive since 22 Jul 2026' },
    emr: { passed: false, result: '1.04 (2026)' },
    ref1: { status: 'running', passed: null, result: 'Request sent 29 Sep; reminder sent 5 Oct' },
    ref2: { status: 'running', passed: null, result: 'Request sent 29 Sep' },
    broker: { status: 'running', passed: null, result: 'Waiting for the renewed policy' },
  },
  dates: { coi: '2026-09-15', bond: '2027-05-31', license: '2027-03-31' },
  documents: {
    coi: { status: 'expired', note: 'GL policy GL-44817 expired 15 Sep 2026' },
    ai: { status: 'failed', note: 'Not uploaded', validThrough: null },
    wos: { status: 'passed', note: 'CG 24 04', validThrough: '2026-09-15' },
    license: { status: 'needs-review', note: 'C-39 #1012877; CSLB shows it inactive' },
  },
  history: [
    ['2026-10-05T08:00:00', 'Linarc', 'Reminder sent to Ray Nguyen (information requested 2 Oct)'],
    ['2026-10-02T11:20:00', 'Jordan Lee', 'Requested information: updated certificate of insurance, additional insured endorsement'],
    ['2026-10-01T09:40:00', 'Jordan Lee', 'Started review'],
    ['2026-09-29T07:30:00', 'Linarc', 'Scored: Review · 61 · confidence 48% (provisional)'],
    ['2026-09-28T15:05:00', 'Ray Nguyen', 'Submitted the application'],
    ['2026-09-22T10:00:00', 'Jordan Lee', 'Sent the invitation (Standard Specialty Trade v4): requalification after expiry'],
  ],
  infoRequest: {
    on: '2026-10-02', by: 'Jordan Lee', dueOn: '2026-10-09', items: ['f-gl', 'f-ai'],
    message: 'Your GL policy expired on 15 Sep. Please upload a certificate for the renewed policy and the additional insured endorsement (CG 20 10 and CG 20 37).',
  },
  decision: {
    primary: 'request',
    trades: ['Roofing', 'Sheet metal'],
    validUntil: '2026-09-15',
    validUntilHelp: 'Earliest key-document expiry (COI, expired 15 Sep 2026)',
    conditions: ['ca-license', 'bond'],
    options: [{ id: 'ca-license', label: 'Active California C-39 license before work starts' }],
    infoMessage: 'Please also send proof that your California C-39 license is active again, and your written fall-protection plan.',
  },
};

// More information needed (Priya asked on 5 Oct): they uploaded a loss run instead of the EMR ratesheet, so the EMR
// check is queued until the ratesheet arrives.
D['req-007'] = {
  rev: '2026-06-01',
  reviewStartedOn: '2026-10-03',
  scores: [64, 80, 84, 82, 76, 90],
  lintelSummary:
    'Pioneer looks sound for drywall at these limits: four healthcare projects, reviewed financials, solid references. ' +
    'The EMR can’t be confirmed yet: the upload in the ratesheet slot is a carrier loss run, so the EMR check is queued. ' +
    'Their workers’ compensation carrier also changed mid-year. The ratesheet was requested on 5 Oct.',
  findings: [
    F('f-emr', 'missing', 'unresolved', 'safety', 'EMR ratesheet not provided', 'EMR ratesheet for the current rating year', 'Required item missing: −6 points', [
      ['0.91', 'declared', 'Safety section', '2026-09-30'],
      ['Uploaded file is a loss run (State Fund), not a ratesheet', 'contradicted', 'EMR slot upload', '2026-09-30', 95],
      [null, 'pending', 'WCIRB lookup queued until the ratesheet arrives', '2026-10-01'],
    ]),
    F('f-wc', 'finding', 'unresolved', 'insurance', 'Workers’ compensation carrier changed in June', 'Continuous WC coverage for 3 years', 'Confirm there was no gap: −2 points', [
      ['Continuous', 'declared', 'Insurance section', '2026-09-30'],
      ['New policy from 15 Jun 2026 (Pie Insurance); prior carrier not shown', 'evidenced', 'COI (ACORD 25), WC row', '2026-09-30', 91],
      ['Continuous through the change', 'verified', 'Broker confirmation, Hub International', '2026-10-02'],
    ]),
  ],
  checks: {
    emr: { status: 'queued', passed: null, result: 'Waiting for the ratesheet' },
    broker: { result: 'Limits confirmed; WC continuous through carrier change' },
  },
  dates: { coi: '2027-06-15', bond: '2027-04-30', license: '2028-01-31' },
  documents: {
    emr: { status: 'rejected', note: 'This is a loss run. Upload the WCIRB ratesheet.', validThrough: null },
  },
  history: [
    ['2026-10-05T13:10:00', 'Priya Natarajan', 'Requested information: EMR ratesheet'],
    ['2026-10-03T09:00:00', 'Priya Natarajan', 'Started review'],
    ['2026-10-02T12:30:00', 'Linarc', 'Broker confirmation received'],
    ['2026-10-01T08:10:00', 'Linarc', 'Scored: Review · 77 · confidence 59% (provisional)'],
    ['2026-09-30T17:45:00', 'Ana Reyes', 'Submitted the application'],
    ['2026-09-19T09:20:00', 'Alex Morgan', 'Sent the invitation (Standard Specialty Trade v4)'],
  ],
  infoRequest: {
    on: '2026-10-05', by: 'Priya Natarajan', dueOn: '2026-10-12', items: ['f-emr'],
    message: 'The file in the EMR slot is a loss run. Please upload your 2026 WCIRB experience rating ratesheet.',
  },
  decision: {
    primary: 'request',
    trades: ['Drywall', 'Acoustical ceilings'],
    validUntil: '2027-04-30',
    validUntilHelp: 'Earliest key-document expiry (surety letter, 30 Apr 2027)',
    conditions: [],
    infoMessage: 'Please upload your 2026 WCIRB experience rating ratesheet.',
  },
};

// ——— Decided ————————————————————————————————————————————————————————————————————————————————————————————————

D['req-017'] = {
  rev: '2026-03-15',
  reviewStartedOn: '2026-08-14',
  scores: [90, 86, 88, 84, 90, 92],
  lintelSummary: 'Delta Paving is recommended for public-works paving: EMR 0.81, 8 Caltrans-spec projects, bonding well above the request and every check complete.',
  findings: [
    F('f-dirpw', 'finding', 'resolved', 'legal', 'DIR public works registration due for renewal', 'Registered for the current fiscal year', 'Resolved: renewal confirmed 18 Aug 2026', [
      ['Registered', 'declared', 'Licensing section', '2026-08-12'], ['Registration 1000019455, FY 2025–26', 'evidenced', 'DIR certificate upload', '2026-08-12', 97], ['Registered through 30 Jun 2027', 'verified', 'CA DIR lookup', '2026-08-18'],
    ]),
    F('f-nv', 'info', 'unresolved', 'legal', 'Nevada LLC with California foreign registration', 'Entity in good standing where the work is', 'Informational', [
      ['Nevada LLC, CA registration 2015', 'declared', 'Company section', '2026-08-12'], NONE, ['Active in both states', 'verified', 'CA and NV Secretary of State', '2026-08-13'],
    ]),
  ],
  checks: { dirpw: { result: 'Registered through 30 Jun 2027' } },
  dates: { coi: '2027-08-20', bond: '2027-08-31', license: '2028-02-28' },
  documents: {},
  history: [
    ['2026-08-20T15:30:00', 'Jordan Lee', 'Approved: Paving $2.8M / $6M, valid until 20 Aug 2027'],
    ['2026-08-18T10:00:00', 'Linarc', 'DIR registration confirmed; finding resolved'],
    ['2026-08-14T09:00:00', 'Jordan Lee', 'Started review'],
    ['2026-08-13T08:00:00', 'Linarc', 'Scored: Accept · 88 · confidence 83%'],
    ['2026-08-12T14:20:00', 'Rosa Jimenez', 'Submitted the application'],
    ['2026-07-30T09:10:00', 'Alex Morgan', 'Sent the invitation (Public Works — Medium Projects v2)'],
  ],
};

D['req-018'] = {
  rev: '2026-01-30',
  reviewStartedOn: '2026-07-06',
  scores: [95, 92, 94, 90, 92, 96],
  lintelSummary: 'Oakmont is a strong fit for healthcare millwork: EMR 0.74, AWI Premium grade, five healthcare projects and every check complete.',
  findings: [
    F('f-fsc', 'info', 'unresolved', 'capability', 'FSC chain-of-custody certificate on file', 'Sustainability certifications (optional)', 'Informational: useful for LEED credits', [
      ['FSC-C118204', 'declared', 'Certifications section', '2026-07-02'], ['FSC-C118204, valid to 2028', 'evidenced', 'Certificate upload', '2026-07-02', 98], ['Valid', 'verified', 'FSC public search', '2026-07-03'],
    ]),
  ],
  checks: {},
  dates: { coi: '2027-06-30', bond: '2027-07-31', license: '2027-12-31' },
  documents: {},
  history: [
    ['2026-07-09T11:15:00', 'Priya Natarajan', 'Approved: Millwork $750K / $1.5M, valid until 30 Jun 2027'],
    ['2026-07-06T09:30:00', 'Priya Natarajan', 'Started review'],
    ['2026-07-03T08:00:00', 'Linarc', 'Scored: Accept · 93 · confidence 90%'],
    ['2026-07-02T15:40:00', 'Eli Brooks', 'Submitted the application'],
    ['2026-06-22T10:25:00', 'Alex Morgan', 'Sent the invitation (Healthcare Specialty v1)'],
  ],
};

D['req-019'] = {
  rev: '2026-01-12',
  reviewStartedOn: '2026-06-17',
  scores: [76, 70, 78, 64, 72, 84],
  lintelSummary:
    'Prairie can do the demolition and abatement scope, with two gaps: their bonding single limit ($1M) is below the ' +
    '$1.2M requested, and their asbestos (ASB) registration renews in September. Review.',
  findings: [
    F('f-bond', 'finding', 'overridden', 'capacity', 'Bonding single limit below the request', 'Bonding single ≥ requested single ($1,200,000)', 'Overridden by Jordan Lee: approved with a project-specific bond above $1M', [
      ['$1M single / $3M aggregate', 'declared', 'Financial section', '2026-06-15'], ['$1M single / $3M aggregate', 'evidenced', 'Surety letter, Old Republic', '2026-06-15', 96], ['Confirmed', 'verified', 'Surety confirmation, Old Republic', '2026-06-18'],
    ]),
    F('f-asb', 'finding', 'overridden', 'legal', 'Asbestos registration renews before the abatement scope', 'Cal/OSHA asbestos (ASB) registration current for the work', 'Overridden by Jordan Lee: current registration is a condition before abatement starts', [
      ['ASB #1311, renewing', 'declared', 'Licensing section', '2026-06-15'], ['Valid to 30 Sep 2026', 'evidenced', 'Registration upload', '2026-06-15', 97], ['Active to 30 Sep 2026', 'verified', 'Cal/OSHA registration lookup', '2026-06-16'],
    ]),
  ],
  checks: { osha: { result: '1 other-than-serious citation (2024), abated' } },
  dates: { coi: '2027-05-31', bond: '2027-06-30', license: '2027-10-31', oshaYears: '2023, 2024, 2025' },
  documents: { extra: [{ id: 'asb', label: 'Cal/OSHA asbestos registration', status: 'passed', note: 'ASB #1311', validThrough: '2026-09-30' }] },
  history: [
    ['2026-06-24T16:05:00', 'Jordan Lee', 'Approved with conditions: Demolition $1.2M / $2.5M, valid until 31 May 2027'],
    ['2026-06-24T16:00:00', 'Jordan Lee', 'Overrode “Bonding single limit below the request”: project-specific bond above $1M'],
    ['2026-06-24T15:58:00', 'Jordan Lee', 'Overrode “Asbestos registration renews before the abatement scope”: current registration is a condition'],
    ['2026-06-17T09:20:00', 'Jordan Lee', 'Started review'],
    ['2026-06-16T08:00:00', 'Linarc', 'Scored: Review · 74 · confidence 79%'],
    ['2026-06-15T11:30:00', 'Hana Sato', 'Submitted the application'],
    ['2026-06-03T14:00:00', 'Marcus Hill', 'Sent the invitation (Standard Specialty Trade v4)'],
  ],
};

D['req-020'] = {
  rev: '2025-07-01',
  reviewStartedOn: '2025-10-06',
  scores: [88, 84, 86, 82, 88, 90],
  lintelSummary: 'Tidewater is recommended for waterproofing at these limits: EMR 0.85, seven podium projects, every check complete.',
  findings: [
    F('f-cert', 'finding', 'resolved', 'insurance', 'Certificate holder named the wrong entity', 'Certificate holder is Harborview Construction Group', 'Resolved: corrected certificate uploaded 7 Oct 2025', [
      ['Harborview Construction Group', 'verified', 'Insurance section', '2025-10-01'], ['Harborview Construction, Inc. → corrected', 'verified', 'COI (ACORD 25), revised', '2025-10-07', 99], ['—', 'none', 'No independent source', null],
    ]),
  ],
  checks: {},
  dates: { coi: '2026-10-31', bond: '2026-12-31', license: '2027-01-31', emr: '2026-01-01', emrYear: 2025, osha: '2026-02-01', oshaYears: '2022, 2023, 2024', fin: '2026-03-31', finYears: '2023–2024' },
  documents: {},
  history: [
    ['2025-10-09T10:45:00', 'Priya Natarajan', 'Approved: Waterproofing $500K / $1M'],
    ['2025-10-07T15:00:00', 'Will Grant', 'Uploaded a corrected certificate; finding resolved'],
    ['2025-10-06T09:00:00', 'Priya Natarajan', 'Started review'],
    ['2025-10-02T08:00:00', 'Linarc', 'Scored: Accept · 86 · confidence 81%'],
    ['2025-10-01T13:50:00', 'Will Grant', 'Submitted the application'],
    ['2025-09-18T11:00:00', 'Sofia Ramirez', 'Sent the invitation (Standard Specialty Trade v3)'],
  ],
};

D['req-021'] = {
  rev: '2025-06-10',
  reviewStartedOn: '2025-09-24',
  scores: [72, 82, 86, 74, 78, 84],
  lintelSummary:
    'Summit is a capable mechanical contractor; the one concern is an EMR of 1.08 for 2023 after a single incident, ' +
    'since improved to 0.97. Bonding is adequate for HVAC; process piping is newer work for them. Review.',
  findings: [
    F('f-emr', 'finding', 'overridden', 'safety', 'EMR 1.08 for 2023, above the 1.00 threshold', 'EMR ≤ 1.00 in each of the last 3 years', 'Overridden by Jordan Lee: single 2023 incident with corrective actions; 0.97 for 2025', [
      ['1.08 / 1.01 / 0.97', 'declared', 'Safety section', '2025-09-20'], ['1.08 (2023)', 'evidenced', 'WCIRB ratesheet 2023', '2025-09-20', 99], ['0.97 (2025)', 'verified', 'WCIRB lookup', '2025-09-22'],
    ]),
  ],
  checks: { emr: { result: '0.97 (2025)' } },
  dates: { coi: '2026-04-01', bond: '2026-10-20', license: '2026-11-30', emr: '2026-01-01', emrYear: 2025, osha: '2026-02-01', oshaYears: '2022, 2023, 2024', fin: '2026-03-31', finYears: '2023–2024' },
  documents: { coi: { status: 'superseded', note: 'Replaced 1 Apr 2026 by a renewed certificate' } },
  history: [
    ['2025-10-02T16:40:00', 'Jordan Lee', 'Approved with conditions: HVAC $3M / $6M, process piping $1M / $2M'],
    ['2025-09-30T15:20:00', 'Jordan Lee', 'Overrode “EMR 1.08 for 2023”: single incident, corrective actions documented'],
    ['2025-09-24T09:00:00', 'Jordan Lee', 'Started review'],
    ['2025-09-21T08:00:00', 'Linarc', 'Scored: Review · 79 · confidence 70%'],
    ['2025-09-20T17:12:00', 'Dev Patel', 'Submitted the application'],
    ['2025-09-08T10:30:00', 'Marcus Hill', 'Sent the invitation (Mechanical — Large Projects v2)'],
  ],
};

D['req-022'] = {
  rev: '2025-06-10',
  reviewStartedOn: '2025-08-07',
  scores: [84, 78, 82, 80, 84, 86],
  lintelSummary: 'Cascade is recommended for roofing at these limits: EMR 0.96, nine comparable projects, every check complete.',
  findings: [
    F('f-oregon', 'info', 'unresolved', 'legal', 'Oregon company licensed in California', 'License active in the project’s state (CA, C-39)', 'Informational', [
      ['C-39 #1012877, CA · CCB #187733, OR', 'declared', 'Licensing section', '2025-08-05'], ['C-39 #1012877', 'evidenced', 'License upload', '2025-08-05', 97], ['Active', 'verified', 'CSLB license lookup', '2025-08-06'],
    ]),
  ],
  checks: { cslb: { result: 'Active · C-39 #1012877, CA' }, emr: { result: '0.96 (2025)' } },
  dates: { coi: '2026-09-15', bond: '2026-08-31', license: '2027-03-31', emr: '2026-01-01', emrYear: 2025, osha: '2026-02-01', oshaYears: '2022, 2023, 2024', fin: '2026-03-31', finYears: '2023–2024' },
  documents: { coi: { note: 'GL $1,000,000 / $2,000,000 · umbrella $2,000,000' } },
  history: [
    ['2025-08-13T14:10:00', 'Priya Natarajan', 'Approved: Roofing $1M / $2M'],
    ['2025-08-07T10:00:00', 'Priya Natarajan', 'Started review'],
    ['2025-08-06T08:00:00', 'Linarc', 'Scored: Accept · 82 · confidence 77%'],
    ['2025-08-05T16:25:00', 'Ray Nguyen', 'Submitted the application'],
    ['2025-07-22T09:00:00', 'Alex Morgan', 'Sent the invitation (Standard Specialty Trade v3)'],
  ],
};

// Not approved (Jordan, 18 May): a state debarment (knockout) plus four open findings. The debarment ended on 30 Sep,
// and Harbor has re-applied (req-011, in progress).
D['req-023'] = {
  rev: '2026-03-15',
  reviewStartedOn: '2026-05-12',
  scores: [40, 44, 50, 50, 52, 0],
  lintelSummary:
    'Not recommended. Harbor Site Works is on the California DIR debarment list until 30 Sep 2026 (prevailing-wage ' +
    'violations, 2024), a knockout for public works. Their DIR public works registration has also lapsed, EMR is 1.15 ' +
    'and working capital is negative.',
  findings: [
    F('f-debar', 'knockout', 'unresolved', 'legal', 'Debarred by the California DIR until 30 Sep 2026', 'Not debarred or suspended by any state or federal agency', 'Knockout: cannot be approved', [
      ['No debarment', 'contradicted', 'Legal section, entered by Kim Dao', '2026-05-10'], NONE, ['Harbor Site Works, Inc. · debarred 1 Oct 2024 – 30 Sep 2026', 'contradicted', 'CA DIR debarment list', '2026-05-11'],
    ]),
    F('f-dirpw', 'missing', 'unresolved', 'legal', 'DIR public works registration lapsed', 'Registered for the current fiscal year', 'Required item failed: −6 points', [
      ['1000008830', 'contradicted', 'Licensing section', '2026-05-10'], ['FY 2024–25 certificate', 'contradicted', 'DIR certificate upload', '2026-05-10', 96], ['Lapsed 30 Jun 2025', 'contradicted', 'CA DIR lookup', '2026-05-11'],
    ]),
    F('f-pw', 'missing', 'unresolved', 'legal', 'Prevailing-wage violations, 2024', 'No wage-and-hour violations in 3 years', 'Required item failed: −5 points', [
      ['None', 'contradicted', 'Legal section', '2026-05-10'], NONE, ['Labor Commissioner citation PW-2024-0418', 'verified', 'CA Labor Commissioner records', '2026-05-11'],
    ]),
    F('f-emr', 'finding', 'unresolved', 'safety', 'EMR above the threshold', 'EMR ≤ 1.00 (current rating year)', 'Safety concern: −5 points', [
      ['1.15', 'declared', 'Safety section', '2026-05-10'], ['1.15', 'evidenced', 'WCIRB ratesheet 2026', '2026-05-10', 99], ['1.15', 'verified', 'WCIRB lookup', '2026-05-11'],
    ]),
    F('f-wc', 'finding', 'unresolved', 'financial', 'Negative working capital', 'Working capital ≥ 10% of the requested aggregate', 'Financial concern: −6 points', [
      ['−$310,000', 'declared', 'Financial section', '2026-05-10'], ['−$310,000 (31 Dec 2025)', 'evidenced', 'Financial statements (reviewed), 2025', '2026-05-10', 96], ['2 open liens', 'verified', 'Dun & Bradstreet', '2026-05-11'],
    ]),
  ],
  checks: {
    dir: { passed: false, result: 'Listed: debarred to 30 Sep 2026' },
    dirpw: { passed: false, result: 'Registration lapsed 30 Jun 2025' },
    emr: { passed: false, result: '1.15 (2026)' },
    credit: { passed: false, result: 'PAYDEX 58, 2 open liens' },
    osha: { result: '1 serious citation (2025), abated' },
  },
  dates: { coi: '2027-01-31', bond: '2026-12-31', license: '2027-05-31', emr: '2027-01-01' },
  documents: { emr: { status: 'failed', note: 'Mod 1.15; 1.00 required' } },
  history: [
    ['2026-05-18T10:30:00', 'Jordan Lee', 'Not approved: debarment (knockout). Kim Dao was told the reason'],
    ['2026-05-12T09:00:00', 'Jordan Lee', 'Started review'],
    ['2026-05-11T08:00:00', 'Linarc', 'Debarment check matched: CA DIR list'],
    ['2026-05-11T07:55:00', 'Linarc', 'Scored: Not recommended · 41 · confidence 86%'],
    ['2026-05-10T12:15:00', 'Kim Dao', 'Submitted the application'],
    ['2026-04-28T10:00:00', 'Marcus Hill', 'Sent the invitation (Public Works — Medium Projects v2)'],
  ],
  decided: {
    outcome: 'not-qualified', by: 'Jordan Lee', on: '2026-05-18',
    reason: 'Debarment (knockout)',
    message: 'Harbor Site Works is on the California DIR debarment list until 30 Sep 2026, so we can’t approve this request. You’re welcome to apply again once the debarment ends.',
  },
};

D['req-024'] = {
  rev: '2026-01-30',
  reviewStartedOn: '2026-03-05',
  scores: [82, 78, 80, 76, 82, 86],
  lintelSummary: 'Bluewater is recommended for healthcare plumbing: three medical-gas projects, EMR 0.88, clean checks. Umbrella is $3M against the $5M healthcare requirement.',
  findings: [
    F('f-umbrella', 'finding', 'overridden', 'insurance', 'Umbrella coverage below the healthcare requirement', 'Umbrella / excess liability ≥ $5,000,000', 'Overridden by Priya Natarajan: project-specific excess policy added for Harbor Point', [
      ['$3,000,000', 'declared', 'Insurance section', '2026-03-02'], ['$3,000,000', 'evidenced', 'COI (ACORD 25)', '2026-03-02', 98], ['$3,000,000', 'verified', 'Broker confirmation, Alliant', '2026-03-04'],
    ]),
  ],
  checks: { osha: { result: 'No inspections in 3 years' }, credit: { result: 'PAYDEX 75, no liens' }, emr: { result: '0.88 (2025)' } },
  dates: { coi: '2027-03-01', bond: '2027-03-31', license: '2027-08-31', emr: '2026-01-01', emrYear: 2025 },
  documents: {},
  history: [
    ['2026-03-10T14:00:00', 'Priya Natarajan', 'Approved: Plumbing $700K / $1.5M, valid until 1 Mar 2027'],
    ['2026-03-10T13:55:00', 'Priya Natarajan', 'Overrode “Umbrella coverage below the healthcare requirement”: project-specific excess policy'],
    ['2026-03-05T09:15:00', 'Priya Natarajan', 'Started review'],
    ['2026-03-03T08:00:00', 'Linarc', 'Scored: Accept · 80 · confidence 75%'],
    ['2026-03-02T10:40:00', 'Sam Okafor', 'Submitted the application'],
    ['2026-02-18T09:00:00', 'Alex Morgan', 'Sent the invitation (Healthcare Specialty v1)'],
  ],
};

/** The review for a request id, in the shape the review screen loads (see ./review.js); null when there's none. */
export function dossierFor(requestId) {
  const d = D[requestId];
  const r = requestById[requestId];
  if (!d || !r) return null;
  const p = profiles[r.company];
  const findings = d.findings.map((f) => ({ ...f }));
  const decision = d.decision || {};
  return {
    context: {
      requestId,
      displayId: requestId.toUpperCase(),
      submittedOn: r.submittedOn,
      reviewStartedOn: d.reviewStartedOn,
      requestedBy: REQUESTER[r.project],
      templateVersion: `${templates[r.template]} (rev. ${d.rev})`,
      publicWorks: r.template === 'pw-md' || !!(PROJECT[r.project] && PROJECT[r.project].publicWorks),
      states: companyById[r.company].state,
    },
    lintelSummary: d.lintelSummary,
    sectionScores: sectionsFor(d.scores, findings),
    findings,
    checks: checksFor(r, p, d.checks),
    documents: documentsFor(p, d.dates, d.documents),
    submission: submissionFor(p),
    history: d.history.map(([at, actor, action]) => ({ at, actor, action })),
    conditions: [...(decision.options || []), ...STANDARD_CONDITIONS],
    defaults: decision,
    infoRequest: d.infoRequest || null,
    decided: d.decided || null,
  };
}

export const DOSSIER_IDS = Object.keys(D);
