// PLACEHOLDER DATA — the subcontractor portal (screens 3 and 4) for one request: Northstar Fire Protection,
// invited for Harbor Point Clinic on the Healthcare Specialty v1 template (req-008, 60% complete).
// Spec: docs/prequal/sub-portal-data.md. Section and document states use ../status.js (SECTION, DOCUMENT).
// Fictional company data; dollar values and rules follow docs/prequal/spec.md.

export const portalRequest = {
  requestId: 'req-008',
  gc: { name: 'Harborview Construction Group', logoText: 'HCG' },
  project: 'Harbor Point Clinic',
  projectLocation: 'Oakland, CA',
  template: 'Healthcare Specialty v1',
  trade: 'Fire Suppression (CSI 21)',
  requestedSingle: 1300000,
  requestedAggregate: 2600000,
  flags: { healthcare: true, siteSecurity: true, publicWorks: false, federal: false },
  invitedOn: '2026-10-01',
  contact: { name: 'Chris Baker', email: 'cbaker@northstarfire.example' },
  disclosure:
    'Harborview Construction Group uses Linarc to verify the information you provide. Linarc will check public records (licensing, debarment, sanctions, OSHA) and, with your authorisation below, contact the insurance broker and references you list.',
};

/** Field types the portal renders: text, number, currency, select, yesno, date, address, repeat (rows of fields), matrix */
const F = (id, label, type, value, extra = {}) => ({ id, label, type, value, required: true, ...extra });

export const pillars = [
  { id: 'identity', label: 'Company identity & compliance', sections: ['company', 'licensing', 'legal', 'certifications'] },
  { id: 'safety', label: 'Safety & insurance', sections: ['safety', 'insurance'] },
  { id: 'financial', label: 'Financial capacity', sections: ['financial', 'capacity'] },
  { id: 'experience', label: 'Experience & performance', sections: ['scope', 'experience', 'references'] },
  { id: 'closing', label: 'Submit', sections: ['site-security', 'documents', 'review'] },
];

export const sections = [
  {
    id: 'company', label: 'Company', state: 'complete',
    fields: [
      F('legalName', 'Legal business name', 'text', 'Northstar Fire Protection, Inc.'),
      F('dba', 'DBA', 'text', 'Northstar Fire', { required: false }),
      F('entityType', 'Entity type', 'select', 's-corp', { options: ['LLC', 'Corporation', 'S-Corp', 'Partnership', 'Sole proprietorship'] }),
      F('stateOfFormation', 'State of formation', 'select', 'CA'),
      F('yearEstablished', 'Year established', 'number', 2009),
      F('tin', 'TIN', 'text', '81-4402917', { evidence: 'w9' }),
      F('uei', 'UEI (SAM.gov)', 'text', '', { required: false }),
      F('hq', 'Headquarters address', 'address', '4120 Power Inn Rd, Sacramento, CA 95826'),
      F('branches', 'Branch addresses', 'repeat', [], { required: false }),
      F('principals', 'Ownership and principals', 'repeat', [{ name: 'Chris Baker', title: 'President', ownership: 100 }]),
      F('unionStatus', 'Union or open shop', 'select', 'open', { options: ['Union', 'Open shop'] }),
    ],
  },
  {
    id: 'licensing', label: 'Licensing & registration', state: 'complete',
    fields: [
      F('licenses', 'Contractor licenses', 'repeat', [{ state: 'CA', number: '1034567', classifications: 'C-16 Fire Protection', expiry: '2027-06-30' }], { evidence: 'license' }),
      F('businessLicenses', 'Business licenses', 'repeat', [{ jurisdiction: 'City of Sacramento', number: 'BL-77812', expiry: '2027-03-31' }], { evidence: 'business-license' }),
      F('samRegistered', 'Registered in SAM.gov', 'yesno', false, { required: false }),
    ],
  },
  {
    id: 'scope', label: 'Scope', state: 'complete',
    fields: [
      F('ownForces', 'Trades performed with own forces', 'multiselect', ['21 Fire Suppression', '22 Plumbing (fire service mains)']),
      F('subcontracted', 'Trades typically subcontracted', 'multiselect', ['Fire alarm (28)'], { required: false }),
      F('regions', 'Geographic areas served', 'multiselect', ['Northern California', 'Central Valley']),
      F('sectors', 'Sectors served', 'multiselect', ['Healthcare', 'Education', 'Multifamily', 'Industrial']),
    ],
  },
  {
    id: 'safety', label: 'Safety', state: 'needs-attention',
    fields: [
      F('emr', 'Experience modification rate, last 3 years', 'matrix', [{ year: 2024, value: 0.85 }, { year: 2023, value: 0.92 }, { year: 2022, value: 0.97 }], {
        evidence: 'emr', threshold: '≤ 1.00',
        mismatch: 'Your entered EMR (0.85) does not match the uploaded ratesheet (1.12). Correct your entry or upload the current ratesheet.',
      }),
      F('injury', 'TRIR, DART and hours worked, last 3 years', 'matrix', [{ year: 2024, trir: 2.1, dart: 0.9, hours: 184000 }, { year: 2023, trir: 1.8, dart: 0.8, hours: 171000 }, { year: 2022, trir: 2.4, dart: 1.1, hours: 160000 }], { evidence: 'osha300a' }),
      F('fatalities', 'Fatalities, last 5 years', 'number', 0),
      F('citations', 'OSHA citations, last 5 years', 'number', 1, { detail: '2022, other-than-serious, abated' }),
      F('safetyProgram', 'Written safety program', 'yesno', true, { evidence: 'safety-program' }),
      F('safetyStaff', 'Full-time safety staff', 'number', 1),
      F('drugProgram', 'Drug and alcohol program', 'yesno', true, { evidence: 'drug-policy' }),
    ],
  },
  {
    id: 'insurance', label: 'Insurance', state: 'needs-attention',
    note: 'Enter the limits on your current policies; the certificate and endorsements you upload under Documents are checked against them.',
    fields: [
      F('glOccurrence', 'General liability, each occurrence', 'currency', 1000000, { evidence: 'coi', threshold: '≥ $1,000,000' }),
      F('glAggregate', 'General liability, aggregate', 'currency', 2000000, { evidence: 'coi', threshold: '≥ $2,000,000', mismatch: 'Your entered aggregate ($2,000,000) does not match the uploaded certificate ($1,000,000).' }),
      F('autoCsl', 'Auto liability, combined single limit', 'currency', 1000000, { evidence: 'coi', threshold: '≥ $1,000,000' }),
      F('umbrella', 'Umbrella / excess', 'currency', 5000000, { evidence: 'umbrella', threshold: '≥ $5,000,000' }),
      F('wcCarrier', 'Workers’ compensation carrier', 'text', 'State Compensation Insurance Fund', { evidence: 'coi' }),
      F('broker', 'Insurance broker (for coverage confirmation)', 'text', 'Pacific Crest Insurance Services · jmoreno@pacificcrest.example'),
    ],
  },
  {
    id: 'financial', label: 'Financial', state: 'complete',
    fields: [
      F('revenue', 'Annual revenue, last 3 years', 'matrix', [{ year: 2025, value: 14200000 }, { year: 2024, value: 12800000 }, { year: 2023, value: 11100000 }]),
      F('backlog', 'Current backlog (remaining contract value)', 'currency', 6400000),
      F('currentAssets', 'Current assets', 'currency', 3900000, { evidence: 'financials' }),
      F('currentLiabilities', 'Current liabilities', 'currency', 2100000, { evidence: 'financials' }),
      F('workingCapital', 'Working capital', 'computed', 1800000, { formula: 'current assets − current liabilities' }),
      F('bondingSingle', 'Bonding capacity, single project', 'currency', 1500000, { evidence: 'bonding', threshold: '≥ $1,300,000' }),
      F('bondingAggregate', 'Bonding capacity, aggregate', 'currency', 4000000, { evidence: 'bonding', threshold: '≥ $2,600,000' }),
      F('surety', 'Surety and agent', 'text', 'Liberty Mutual Surety · Sierra Bonding Agency'),
      F('bank', 'Primary bank', 'text', 'River City Bank'),
      F('loc', 'Line of credit (amount / available)', 'text', '$750,000 / $600,000', { evidence: 'bank-letter' }),
      F('statementLevel', 'Financial statement level available', 'select', 'reviewed', { options: ['Compiled', 'Reviewed', 'Audited'] }),
    ],
  },
  {
    id: 'experience', label: 'Experience & workforce', state: 'in-progress', progress: '3 of 5 past projects',
    fields: [
      F('pastProjects', 'Past projects, last 5 years (minimum 5)', 'repeat', [
        { name: 'Mercy General Tower 3 fit-out', city: 'Sacramento, CA', owner: 'Dignity Health', gc: 'Harborview Construction Group', sector: 'Healthcare (HCAI)', value: 1850000, finalValue: 1910000, scope: 'Wet-pipe and pre-action systems, 6 floors', start: '2024-02', finish: '2025-01', actualFinish: '2025-02', pw: false, reference: { name: 'Dana Whitfield', company: 'Harborview Construction Group', email: 'dwhitfield@harborview.example', phone: '916-555-0142' } },
        { name: 'Folsom Logistics Center', city: 'Folsom, CA', owner: 'Prologis', gc: 'Summit Pacific Builders', sector: 'Industrial', value: 1220000, finalValue: 1220000, scope: 'ESFR system, 410,000 sf', start: '2023-06', finish: '2024-03', actualFinish: '2024-03', pw: false, reference: { name: 'Marcus Lee', company: 'Summit Pacific Builders', email: 'mlee@summitpacific.example', phone: '916-555-0188' } },
        { name: 'Roseville High School gym', city: 'Roseville, CA', owner: 'Roseville JUSD', gc: 'Capitol West Construction', sector: 'Education (public works)', value: 640000, finalValue: 672000, scope: 'Sprinkler retrofit, occupied campus', start: '2023-01', finish: '2023-08', actualFinish: '2023-09', pw: true, reference: { name: 'Elaine Ruiz', company: 'Capitol West Construction', email: 'eruiz@capitolwest.example', phone: '916-555-0121' } },
      ], { minimum: 5 }),
      F('specialProjects', 'Special projects (healthcare and occupied work)', 'repeat', [
        { condition: 'Healthcare (HCAI / OSHPD)', project: 'Mercy General Tower 3 fit-out', value: 1850000, reference: 'Dana Whitfield' },
        { condition: 'Occupied renovation, ICRA', project: 'Roseville High School gym', value: 640000, reference: 'Elaine Ruiz' },
      ], { required: true }),
      F('workforce', 'Employees by role and certification', 'matrix', [
        { role: 'Project Manager', count: 2, avgYears: 11, osha30: 2, osha10: 0, firstAid: 2, tradeCert: 1 },
        { role: 'Superintendent', count: 2, avgYears: 14, osha30: 2, osha10: 0, firstAid: 2, tradeCert: 2 },
        { role: 'Foreman', count: 4, avgYears: 9, osha30: 4, osha10: 0, firstAid: 4, tradeCert: 4 },
        { role: 'Journeyman', count: 14, avgYears: 7, osha30: 3, osha10: 11, firstAid: 9, tradeCert: 14 },
        { role: 'Apprentice', count: 6, avgYears: 2, osha30: 0, osha10: 6, firstAid: 3, tradeCert: 0 },
        { role: 'Safety Manager', count: 1, avgYears: 8, osha30: 1, osha10: 0, firstAid: 1, tradeCert: 0 },
      ]),
      F('apprenticeship', 'Registered apprenticeship program', 'yesno', true, { detail: 'Sprinkler Fitters UA Local 669 (JATC)' }),
      F('keyPersonnel', 'Key personnel proposed for this work', 'repeat', [
        { name: 'Luis Herrera', role: 'Superintendent', years: 16, certs: 'OSHA 30, NICET III Water-Based Systems', resume: 'herrera-resume.pdf' },
        { name: 'Amy Tran', role: 'Project Manager', years: 9, certs: 'OSHA 30, PMP', resume: null },
      ], { evidence: 'cert-cards' }),
    ],
  },
  {
    id: 'capacity', label: 'Capacity', state: 'not-started',
    fields: [
      F('activeProjects', 'Active projects', 'number', null),
      F('activeValue', 'Total active contract value', 'currency', null),
      F('remainingToBill', 'Remaining to bill', 'currency', null),
      F('largestCurrent', 'Largest current project value', 'currency', null),
      F('headcount3', 'Field headcount committed, next 3 months', 'number', null),
      F('headcount6', 'Field headcount committed, next 6 months', 'number', null),
      F('availableCrew', 'Available crew', 'number', null),
      F('bondingUsed', 'Bonding currently used against aggregate', 'currency', null, { computed: 'remaining bonding = aggregate − used' }),
    ],
  },
  {
    id: 'references', label: 'References', state: 'in-progress', progress: '2 of 3 project references',
    fields: [
      F('projectRefs', 'Project references (minimum 3)', 'repeat', [
        { name: 'Dana Whitfield', company: 'Harborview Construction Group', project: 'Mercy General Tower 3 fit-out', email: 'dwhitfield@harborview.example', phone: '916-555-0142' },
        { name: 'Marcus Lee', company: 'Summit Pacific Builders', project: 'Folsom Logistics Center', email: 'mlee@summitpacific.example', phone: '916-555-0188' },
      ], { minimum: 3 }),
      F('supplierRefs', 'Supplier references (optional, 2)', 'repeat', [{ name: 'Ferguson Fire & Fabrication', contact: 'Kevin Oduya', email: 'koduya@ferguson.example' }], { required: false }),
      F('bankRef', 'Bank reference (optional)', 'repeat', [], { required: false }),
      F('outreachConsent', 'I authorise Linarc to contact the references and broker listed', 'yesno', true),
    ],
  },
  {
    id: 'legal', label: 'Legal', state: 'complete',
    fields: [
      F('litigation', 'Litigation, arbitration or claims in the last 5 years', 'yesno', false),
      F('defaults', 'Defaults, terminations for cause or bond claims in the last 5 years', 'yesno', false),
      F('bankruptcy', 'Bankruptcy in the last 7 years', 'yesno', false),
      F('debarment', 'Debarment or suspension by any agency', 'yesno', false),
    ],
  },
  {
    id: 'certifications', label: 'Certifications', state: 'complete',
    fields: [F('diversity', 'Diversity certifications', 'repeat', [], { required: false, evidence: 'diversity-cert' })],
  },
  {
    id: 'site-security', label: 'Site security', state: 'not-started', conditional: 'Required by Harbor Point Clinic (healthcare, occupied facility)',
    fields: [
      F('bgCheckProgram', 'We operate a background-check program for site staff', 'yesno', null),
      F('drugTestingProgram', 'We operate a drug-testing program', 'yesno', null, { evidence: 'drug-policy' }),
      F('eVerify', 'We are enrolled in E-Verify', 'yesno', null, { evidence: 'e-verify' }),
      F('citizenship', 'We acknowledge the workforce citizenship requirement for this site', 'yesno', null),
    ],
  },
  { id: 'documents', label: 'Documents', state: 'needs-attention', fields: [] },
  { id: 'review', label: 'Review & submit', state: 'not-started', fields: [] },
];

/** Document slots for this template. `status` keys are DOCUMENT in ../status.js; `required: 'site-security'` means required because of the site-security flag. */
export const documents = [
  { id: 'coi', group: 'Insurance', label: 'Certificate of insurance (ACORD 25)', required: true, requirements: ['Insured name matches your legal entity', 'GL $1,000,000 each occurrence / $2,000,000 aggregate', 'Auto CSL $1,000,000', 'Umbrella $5,000,000', 'Certificate holder is Harborview Construction Group', 'Workers’ compensation shown'], expiryDriver: 'Earliest policy expiry', status: 'failed', message: 'GL aggregate is $1,000,000; $2,000,000 is required.', file: { name: 'Northstar-COI-2026.pdf', uploadedOn: '2026-10-04' }, validThrough: '2027-04-01' },
  { id: 'ai-endorsement', group: 'Insurance', label: 'Additional Insured endorsement (ongoing and completed operations)', required: true, requirements: ['CG 20 10 and CG 20 37, or blanket wording', 'Policy number matches the certificate'], expiryDriver: 'Linked GL policy', status: 'passed', message: 'Document meets the configured requirements.', file: { name: 'CG2010-CG2037.pdf', uploadedOn: '2026-10-04' } },
  { id: 'waiver', group: 'Insurance', label: 'Waiver of Subrogation endorsement', required: true, requirements: ['CG 24 04 or WC 00 03 13'], expiryDriver: 'Linked policy', status: 'processing', message: 'We’re checking this document.', file: { name: 'waiver-subrogation.pdf', uploadedOn: '2026-10-08' } },
  { id: 'pnc', group: 'Insurance', label: 'Primary and Noncontributory endorsement', required: true, requirements: ['CG 20 01 or manuscript wording'], expiryDriver: 'Linked policy', status: 'needs-review', message: 'We couldn’t confidently read the form number. A reviewer will check it; you can also upload a clearer copy.', file: { name: 'endorsements-scan.pdf', uploadedOn: '2026-10-04' } },
  { id: 'umbrella', group: 'Insurance', label: 'Umbrella / Excess liability', required: true, requirements: ['Limit of at least $5,000,000'], expiryDriver: 'Policy expiry', status: 'passed', message: 'Valid through 1 Apr 2027.', file: { name: 'umbrella-2026.pdf', uploadedOn: '2026-10-04' }, validThrough: '2027-04-01' },
  { id: 'bonding', group: 'Bonding', label: 'Surety bonding capacity letter', required: true, requirements: ['Addressed to your legal entity', 'Single project at least $1,300,000; aggregate at least $2,600,000', 'Dated within the last 90 days'], expiryDriver: 'Letter date + 12 months', status: 'rejected', message: 'This is a certificate of insurance. Upload a surety bonding letter.', file: { name: 'Northstar-COI-2026.pdf', uploadedOn: '2026-10-05' } },
  { id: 'emr', group: 'Safety', label: 'EMR ratesheet (current rating year)', required: true, requirements: ['Employer name matches your legal entity', 'Current rating year', 'Mod at or below 1.00'], expiryDriver: 'Rating date + 12 months', status: 'passed', message: 'Document read: mod 1.12, effective 1 Jan 2026. This differs from your entry (0.85).', file: { name: 'WCIRB-ratesheet-2026.pdf', uploadedOn: '2026-10-03' }, validThrough: '2027-01-01', extracted: { 'Experience modification': '1.12', 'Rating effective date': '2026-01-01', 'Bureau': 'WCIRB' } },
  { id: 'osha300a', group: 'Safety', label: 'OSHA 300A, last 3 years', required: true, count: 3, requirements: ['2025, 2024 and 2023 forms', 'Signed by a company executive'], expiryDriver: 'Annual', status: 'failed', message: '2 of 3 uploaded. The 2023 form is missing.', files: [{ name: 'OSHA300A-2025.pdf', uploadedOn: '2026-10-03' }, { name: 'OSHA300A-2024.pdf', uploadedOn: '2026-10-03' }] },
  { id: 'financials', group: 'Financial', label: 'Financial statements (reviewed, last 2 years)', required: true, requirements: ['CPA review or audit', 'Period end within the last 15 months', 'Working capital within 10% of your entry'], expiryDriver: 'Period end + 15 months', status: 'passed', message: 'Document meets the configured requirements.', file: { name: 'Northstar-FS-2025-reviewed.pdf', uploadedOn: '2026-10-03' }, validThrough: '2027-03-31', restricted: true },
  { id: 'bank-letter', group: 'Financial', label: 'Bank reference letter', required: false, requirements: ['Dated within the last 90 days'], expiryDriver: 'Letter date + 6 months', status: null, message: 'Optional.' },
  { id: 'w9', group: 'Identity', label: 'W-9', required: true, requirements: ['Name and TIN match your entity'], expiryDriver: 'None', status: 'passed', message: 'Document meets the configured requirements.', file: { name: 'W9-Northstar.pdf', uploadedOn: '2026-10-02' } },
  { id: 'license', group: 'Identity', label: 'Contractor license certificate', required: true, requirements: ['Active', 'Classification covers fire protection (C-16)'], expiryDriver: 'License expiry', status: 'passed', message: 'Active through 30 Jun 2027.', file: { name: 'CSLB-1034567.pdf', uploadedOn: '2026-10-02' }, validThrough: '2027-06-30' },
  { id: 'business-license', group: 'Identity', label: 'Business license', required: true, requirements: ['Valid'], expiryDriver: 'Expiry', status: 'passed', message: 'Valid through 31 Mar 2027.', file: { name: 'Sacramento-BL-77812.pdf', uploadedOn: '2026-10-02' }, validThrough: '2027-03-31' },
  { id: 'safety-program', group: 'Safety', label: 'Written safety program', required: true, requirements: ['Current manual'], expiryDriver: 'None', status: 'passed', message: 'Document meets the configured requirements.', file: { name: 'IIPP-2026.pdf', uploadedOn: '2026-10-03' } },
  { id: 'drug-policy', group: 'Security', label: 'Drug-testing policy', required: 'site-security', requirements: ['Current policy'], expiryDriver: 'None', status: null, message: 'Required for this site.' },
  { id: 'e-verify', group: 'Security', label: 'E-Verify memorandum of understanding', required: 'site-security', requirements: ['Company name matches your entity'], expiryDriver: 'None', status: null, message: 'Required for this site.' },
  { id: 'cert-cards', group: 'Workforce', label: 'Certification cards for key personnel', required: true, requirements: ['Holder matches a listed key person', 'Not expired'], expiryDriver: 'Card expiry', status: 'processing', message: 'We’re checking 3 cards.', files: [{ name: 'herrera-osha30.pdf', uploadedOn: '2026-10-08' }, { name: 'herrera-nicet3.pdf', uploadedOn: '2026-10-08' }, { name: 'tran-osha30.pdf', uploadedOn: '2026-10-08' }] },
  { id: 'diversity-cert', group: 'Certifications', label: 'Diversity certificate', required: false, requirements: ['Valid'], expiryDriver: 'Expiry', status: null, message: 'Optional.' },
  { id: 'gc-questionnaire', group: 'Custom', label: 'Harborview safety questionnaire', required: true, requirements: ['All questions answered'], expiryDriver: 'None', status: 'passed', message: 'Complete.', file: { name: 'HCG-safety-questionnaire.pdf', uploadedOn: '2026-10-03' } },
];

/**
 * Submission readiness (decision 2026-10-09: substantive failures are flagged, not blocking).
 *   blocking: required document missing or rejected at intake; required section not started.
 *   flagged:  a document failed a rule or a declared value disagrees with its document; submission allowed.
 *   pending:  processing or needs review; submission allowed.
 */
export function readiness() {
  const blocking = [];
  const flagged = [];
  const pending = [];
  for (const d of documents) {
    if (!d.required) continue;
    const uploaded = d.files ? d.files.length : d.file ? 1 : 0;
    if (d.status === null) blocking.push({ kind: 'document', id: d.id, label: d.label, reason: 'Not uploaded' });
    else if (d.status === 'rejected') blocking.push({ kind: 'document', id: d.id, label: d.label, reason: d.message });
    else if (d.count && uploaded < d.count) blocking.push({ kind: 'document', id: d.id, label: d.label, reason: `${d.count - uploaded} of ${d.count} missing` });
    else if (d.status === 'failed') flagged.push({ kind: 'document', id: d.id, label: d.label, reason: d.message });
    else if (d.status === 'processing' || d.status === 'needs-review') pending.push({ kind: 'document', id: d.id, label: d.label, reason: d.message });
  }
  for (const s of sections) {
    if (s.id === 'documents' || s.id === 'review') continue;
    if (s.state === 'not-started') blocking.push({ kind: 'section', id: s.id, label: s.label, reason: 'Not started' });
    if (s.state === 'in-progress') blocking.push({ kind: 'section', id: s.id, label: s.label, reason: s.progress || 'Incomplete' });
    for (const f of s.fields) if (f.mismatch) flagged.push({ kind: 'field', id: `${s.id}.${f.id}`, label: `${s.label} › ${f.label}`, reason: f.mismatch });
  }
  return { blocking, flagged, pending, canSubmit: blocking.length === 0 };
}

/** Overall completion: sections complete or needs-attention (entered) over sections that count. */
export function completion() {
  const counted = sections.filter((s) => s.id !== 'documents' && s.id !== 'review');
  const done = counted.filter((s) => s.state === 'complete' || s.state === 'needs-attention').length;
  return Math.round((done / counted.length) * 100);
}
