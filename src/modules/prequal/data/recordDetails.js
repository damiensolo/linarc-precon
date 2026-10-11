// PLACEHOLDER DATA — the qualification records (screen 6) of the approved requests other than Summit (req-021) and
// Apex (req-001), which are in ./records.js. One per lifecycle story; dates follow their request rows in ./index.js
// and their reviews in ./dossiers.js. Shape: see the comment on `SUMMIT` in ./records.js. "Today" is 2026-10-08.

const doc = (id, label, issued, expires, key, note, extra = {}) => ({ id, label, issued, expires, key, renewal: null, note, ...extra });

// Current. Approved without conditions; nothing due for renewal until next summer.
const DELTA = {
  id: 'req-017', requestId: 'req-017', approvedBy: 'jordan', approvedOn: '2026-08-20', validUntilDriver: 'Certificate of insurance',
  trades: [
    { trade: 'Paving', csi: '32', scope: 'All projects', single: 2800000, aggregate: 6000000 },
    { trade: 'Earthwork (site grading)', csi: '31', scope: 'Under $1M per contract', single: 1000000, aggregate: 2000000 },
  ],
  conditions: [],
  overrides: [],
  documents: [
    doc('coi', 'Certificate of insurance (ACORD 25)', '2026-08-20', '2027-08-20', true, 'GL $2M / $4M · umbrella $5M'),
    doc('ai', 'Additional insured endorsement', '2026-08-20', '2027-08-20', false, 'CG 20 10 and CG 20 37'),
    doc('bond', 'Surety bonding letter', '2026-08-31', '2027-08-31', true, 'Travelers · $4M single / $15M aggregate'),
    doc('license', 'Contractor license (A)', '2026-02-28', '2028-02-28', true, 'CSLB #977120'),
    doc('dirpw', 'DIR public works registration', '2026-07-01', '2027-06-30', false, 'Registration 1000019455 · renewed each fiscal year'),
    doc('emr', 'EMR ratesheet', '2026-01-01', '2027-01-01', false, 'Mod 0.81, WCIRB · renewed each rating year'),
    doc('fin', 'Financial statements (reviewed), 2025', '2026-03-31', '2027-06-30', false, 'Restricted: reviewers only', { restricted: true }),
    doc('w9', 'W-9', '2026-08-05', null, false, 'No expiry'),
  ],
  audit: [
    { at: '2026-09-02T06:00:00', actor: 'Linarc', kind: 'monitoring', action: 'Re-ran OSHA, SAM.gov and debarment checks: no changes.' },
    { at: '2026-08-20T15:30:00', actor: 'Jordan Lee', kind: 'decision', action: 'Approved: paving $2.8M / $6M, site grading $1M / $2M, valid until 20 Aug 2027. Recommendation was Accept (88, confidence 83%).' },
    { at: '2026-08-18T10:00:00', actor: 'Linarc', kind: 'monitoring', action: 'Confirmed DIR public works registration through 30 Jun 2027.' },
    { at: '2026-08-14T09:00:00', actor: 'Jordan Lee', kind: 'decision', action: 'Started review.' },
    { at: '2026-08-12T14:20:00', actor: 'Rosa Jimenez', kind: 'submission', action: 'Submitted the prequalification (Public Works — Medium Projects v2).' },
  ],
};

// Current. The strongest record on file.
const OAKMONT = {
  id: 'req-018', requestId: 'req-018', approvedBy: 'priya', approvedOn: '2026-07-09', validUntilDriver: 'Certificate of insurance',
  trades: [{ trade: 'Architectural millwork', csi: '06', scope: 'All projects', single: 750000, aggregate: 1500000 }],
  conditions: [],
  overrides: [],
  documents: [
    doc('coi', 'Certificate of insurance (ACORD 25)', '2026-06-30', '2027-06-30', true, 'GL $2M / $4M · umbrella $5M'),
    doc('ai', 'Additional insured endorsement', '2026-06-30', '2027-06-30', false, 'Blanket AI, ongoing and completed operations'),
    doc('bond', 'Surety bonding letter', '2026-07-31', '2027-07-31', true, 'Hartford · $1.5M single / $5M aggregate'),
    doc('license', 'Contractor license (C-6)', '2025-12-31', '2027-12-31', true, 'CSLB #702233'),
    doc('emr', 'EMR ratesheet', '2026-01-01', '2027-01-01', false, 'Mod 0.74, WCIRB · renewed each rating year'),
    doc('fsc', 'FSC chain-of-custody certificate', '2023-05-12', '2028-05-11', false, 'FSC-C118204'),
    doc('fin', 'Financial statements (reviewed), 2025', '2026-03-31', '2027-06-30', false, 'Restricted: reviewers only', { restricted: true }),
    doc('w9', 'W-9', '2026-06-25', null, false, 'No expiry'),
  ],
  audit: [
    { at: '2026-09-15T06:00:00', actor: 'Linarc', kind: 'monitoring', action: 'Re-ran OSHA, SAM.gov and debarment checks: no changes.' },
    { at: '2026-07-09T11:15:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Approved: architectural millwork $750K / $1.5M, valid until 30 Jun 2027. Recommendation was Accept (93, confidence 90%).' },
    { at: '2026-07-06T09:30:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Started review.' },
    { at: '2026-07-02T15:40:00', actor: 'Eli Brooks', kind: 'submission', action: 'Submitted the prequalification (Healthcare Specialty v1).' },
  ],
};

// Current, approved with conditions: one condition in force (the bond), one still open (ASB registration before the
// abatement scope), and a renewal received and being checked.
const PRAIRIE = {
  id: 'req-019', requestId: 'req-019', approvedBy: 'jordan', approvedOn: '2026-06-24', validUntilDriver: 'Certificate of insurance',
  trades: [
    { trade: 'Demolition', csi: '02', scope: 'All projects', single: 1200000, aggregate: 2500000 },
    { trade: 'Asbestos abatement', csi: '02', scope: 'With a current ASB registration', single: 500000, aggregate: 1000000 },
  ],
  conditions: [
    { id: 'bond', label: 'Project-specific performance and payment bond on contracts above $1M', status: 'in-force', note: 'Applied to Northern Heights: bond #ORS-22817 (Old Republic) on the $1.2M demolition contract' },
    { id: 'asb', label: 'Current Cal/OSHA asbestos (ASB) registration before abatement starts', status: 'open', note: 'Registration expired 30 Sep; renewal received 2 Oct and being checked. Abatement on Northern Heights starts 3 Nov.' },
  ],
  overrides: [
    { finding: 'Bonding single limit below the request', reason: 'Approved with a project-specific bond on contracts above $1M.', actor: 'Jordan Lee', at: '2026-06-24T16:00:00' },
    { finding: 'Asbestos registration renews before the abatement scope', reason: 'A current registration is a condition before abatement starts.', actor: 'Jordan Lee', at: '2026-06-24T15:58:00' },
  ],
  documents: [
    doc('coi', 'Certificate of insurance (ACORD 25)', '2026-05-31', '2027-05-31', true, 'GL $2M / $4M · umbrella $5M'),
    doc('pollution', 'Contractor’s pollution liability', '2026-05-31', '2027-05-31', false, '$2M each claim'),
    doc('asb', 'Cal/OSHA asbestos registration', '2025-10-01', '2026-09-30', false, 'ASB #1311 · renewal received, being checked', { renewal: { status: 'received', on: '2026-10-02' } }),
    doc('bond', 'Surety bonding letter', '2026-06-30', '2027-06-30', true, 'Old Republic · $1M single / $3M aggregate'),
    doc('license', 'Contractor license (C-21)', '2025-10-31', '2027-10-31', true, 'CSLB #951870'),
    doc('emr', 'EMR ratesheet', '2026-01-01', '2027-01-01', false, 'Mod 0.93, WCIRB · renewed each rating year'),
    doc('w9', 'W-9', '2026-06-10', null, false, 'No expiry'),
  ],
  audit: [
    { at: '2026-10-02T09:40:00', actor: 'Hana Sato', kind: 'renewal', action: 'Uploaded the renewed asbestos registration; Linarc is checking it.' },
    { at: '2026-09-01T06:00:00', actor: 'Linarc', kind: 'renewal', action: 'Sent a renewal request to Hana Sato: asbestos registration expires 30 Sep 2026.' },
    { at: '2026-07-21T11:00:00', actor: 'Jordan Lee', kind: 'decision', action: 'Marked the project-specific bond as in force on Northern Heights (#ORS-22817).' },
    { at: '2026-06-24T16:05:00', actor: 'Jordan Lee', kind: 'decision', action: 'Approved with conditions: demolition $1.2M / $2.5M, abatement $500K / $1M, valid until 31 May 2027.' },
    { at: '2026-06-24T16:00:00', actor: 'Jordan Lee', kind: 'override', action: 'Overrode “Bonding single limit below the request”: project-specific bond above $1M.' },
    { at: '2026-06-24T15:58:00', actor: 'Jordan Lee', kind: 'override', action: 'Overrode “Asbestos registration renews before the abatement scope”: current registration is a condition.' },
    { at: '2026-06-17T09:20:00', actor: 'Jordan Lee', kind: 'decision', action: 'Started review.' },
    { at: '2026-06-15T11:30:00', actor: 'Hana Sato', kind: 'submission', action: 'Submitted the prequalification (Standard Specialty Trade v4).' },
  ],
};

// Renewal needed soon: the certificate expires 31 Oct. The renewed certificate arrived on 7 Oct and is being checked;
// the additional insured endorsement is still outstanding.
const TIDEWATER = {
  id: 'req-020', requestId: 'req-020', approvedBy: 'priya', approvedOn: '2025-10-09', validUntilDriver: 'Certificate of insurance',
  trades: [{ trade: 'Waterproofing', csi: '07', scope: 'Under $1M per contract', single: 500000, aggregate: 1000000 }],
  conditions: [],
  overrides: [],
  documents: [
    doc('coi', 'Certificate of insurance (ACORD 25)', '2025-10-31', '2026-10-31', true, 'GL $1M / $2M · umbrella $2M · renewed certificate received 7 Oct', { renewal: { status: 'received', on: '2026-10-07' } }),
    doc('ai', 'Additional insured endorsement', '2025-10-31', '2026-10-31', false, 'CG 20 10 and CG 20 37', { renewal: { status: 'requested', on: '2026-10-01' } }),
    doc('bond', 'Surety bonding letter', '2025-12-31', '2026-12-31', true, 'Merchants Bonding · $750K single / $2M aggregate'),
    doc('license', 'Contractor license (C-33, C-61/D-38)', '2025-01-31', '2027-01-31', true, 'CSLB #888014'),
    doc('emr', 'EMR ratesheet', '2026-01-01', '2027-01-01', false, 'Mod 0.85, WCIRB · replaced the 2025 ratesheet'),
    doc('fin', 'Financial statements (reviewed), 2025', '2026-03-31', '2027-03-31', false, 'Restricted: reviewers only', { restricted: true }),
    doc('w9', 'W-9', '2025-09-25', null, false, 'No expiry'),
  ],
  audit: [
    { at: '2026-10-07T15:12:00', actor: 'Will Grant', kind: 'renewal', action: 'Uploaded a renewed certificate of insurance (to 31 Oct 2027); Linarc is checking it.' },
    { at: '2026-10-01T06:00:00', actor: 'Linarc', kind: 'renewal', action: 'Sent a renewal request to Will Grant: certificate of insurance and additional insured endorsement expire 31 Oct 2026. Status changed to Renewal needed soon.' },
    { at: '2026-03-20T08:30:00', actor: 'Linarc', kind: 'monitoring', action: 'Accepted 2025 financial statements (valid through 31 Mar 2027).' },
    { at: '2026-01-15T08:30:00', actor: 'Linarc', kind: 'monitoring', action: 'Accepted the 2026 EMR ratesheet (mod 0.85); the 2025 ratesheet is superseded.' },
    { at: '2025-10-09T10:45:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Approved: waterproofing $500K / $1M, valid until 31 Oct 2026. Recommendation was Accept (86, confidence 81%).' },
    { at: '2025-10-06T09:00:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Started review.' },
    { at: '2025-10-01T13:50:00', actor: 'Will Grant', kind: 'submission', action: 'Submitted the prequalification (Standard Specialty Trade v3).' },
  ],
};

// No longer active: the GL policy lapsed on 15 Sep with no renewal received. Cascade is re-applying (req-006).
const CASCADE = {
  id: 'req-022', requestId: 'req-022', approvedBy: 'priya', approvedOn: '2025-08-13', validUntilDriver: 'Certificate of insurance',
  trades: [{ trade: 'Roofing', csi: '07', scope: 'Under $1M per contract', single: 1000000, aggregate: 2000000 }],
  conditions: [],
  overrides: [],
  documents: [
    doc('coi', 'Certificate of insurance (ACORD 25)', '2025-09-15', '2026-09-15', true, 'GL policy GL-44817 lapsed 15 Sep 2026; no renewal received', { renewal: { status: 'requested', on: '2026-08-16' } }),
    doc('ai', 'Additional insured endorsement', '2025-09-15', '2026-09-15', false, 'Linked to the lapsed GL policy', { renewal: { status: 'requested', on: '2026-08-16' } }),
    doc('bond', 'Surety bonding letter', '2025-09-30', '2026-09-30', true, 'CNA Surety · $1.5M single / $3M aggregate'),
    doc('license', 'Contractor license (C-39)', '2025-07-31', '2027-07-31', true, 'CSLB #1012877 · shown inactive since 22 Jul 2026 (license bond cancelled)'),
    doc('emr', 'EMR ratesheet', '2026-01-01', '2027-01-01', false, 'Mod 1.04, NCCI'),
    doc('w9', 'W-9', '2025-07-28', null, false, 'No expiry'),
  ],
  audit: [
    { at: '2026-09-22T10:00:00', actor: 'Jordan Lee', kind: 'submission', action: 'Started a new request for Northern Heights (REQ-006).' },
    { at: '2026-09-15T06:00:00', actor: 'Linarc', kind: 'monitoring', action: 'GL policy lapsed with no renewal received. Status changed to No longer active.' },
    { at: '2026-09-08T06:00:00', actor: 'Linarc', kind: 'renewal', action: 'Sent a second reminder to Ray Nguyen: certificate of insurance expires 15 Sep 2026.' },
    { at: '2026-08-16T06:00:00', actor: 'Linarc', kind: 'renewal', action: 'Sent a renewal request to Ray Nguyen: certificate of insurance and additional insured endorsement expire 15 Sep 2026. Status changed to Renewal needed soon.' },
    { at: '2026-07-23T06:00:00', actor: 'Linarc', kind: 'monitoring', action: 'CSLB shows license #1012877 inactive (license bond cancelled). Sent to Priya Natarajan.' },
    { at: '2026-01-20T08:30:00', actor: 'Linarc', kind: 'monitoring', action: 'Accepted the 2026 EMR ratesheet (mod 1.04, above the 1.00 threshold). Sent to Priya Natarajan.' },
    { at: '2025-08-13T14:10:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Approved: roofing $1M / $2M, valid until 15 Sep 2026. Recommendation was Accept (82, confidence 77%).' },
    { at: '2025-08-07T10:00:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Started review.' },
    { at: '2025-08-05T16:25:00', actor: 'Ray Nguyen', kind: 'submission', action: 'Submitted the prequalification (Standard Specialty Trade v3).' },
  ],
};

// Suspended: monitoring found a new serious OSHA citation; Priya suspended the record pending its outcome.
const BLUEWATER = {
  id: 'req-024', requestId: 'req-024', approvedBy: 'priya', approvedOn: '2026-03-10', validUntilDriver: 'Certificate of insurance',
  trades: [
    { trade: 'Plumbing', csi: '22', scope: 'Healthcare projects', single: 700000, aggregate: 1500000 },
    { trade: 'Medical gas', csi: '22', scope: 'With NFPA 99 certified installers', single: 300000, aggregate: 600000 },
  ],
  conditions: [],
  overrides: [
    { finding: 'Umbrella coverage below the healthcare requirement', reason: 'Project-specific $2M excess policy bound for Harbor Point Clinic (XS-90311); certificate on file.', actor: 'Priya Natarajan', at: '2026-03-10T13:55:00' },
  ],
  documents: [
    doc('coi', 'Certificate of insurance (ACORD 25)', '2026-03-01', '2027-03-01', true, 'GL $2M / $4M · umbrella $3M'),
    doc('excess', 'Project excess liability policy (Harbor Point)', '2026-03-08', '2027-03-08', false, 'XS-90311 · $2M excess of umbrella'),
    doc('bond', 'Surety bonding letter', '2026-06-12', '2027-06-12', true, 'Liberty Mutual · $1.5M single / $2M aggregate · replaced 12 Jun 2026'),
    doc('license', 'Contractor license (C-36)', '2025-08-31', '2027-08-31', true, 'CSLB #612904'),
    doc('medgas', 'Medical gas installer certifications (ASSE 6010)', '2025-05-01', '2027-05-01', false, '4 installers'),
    doc('emr', 'EMR ratesheet', '2026-01-01', '2027-01-01', false, 'Mod 0.93, WCIRB'),
    doc('fin', 'Financial statements (compiled), 2025', '2026-03-31', '2027-03-31', false, 'Restricted: reviewers only', { restricted: true }),
    doc('w9', 'W-9', '2026-02-20', null, false, 'No expiry'),
  ],
  audit: [
    { at: '2026-09-30T10:20:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Suspended the qualification pending the outcome of a contested serious OSHA citation (inspection 1789310).' },
    { at: '2026-09-29T06:00:00', actor: 'Linarc', kind: 'monitoring', action: 'OSHA establishment search found a new serious citation (inspection 1789310, 18 Aug 2026; trench protection). Sent to Priya Natarajan.' },
    { at: '2026-06-12T08:30:00', actor: 'Linarc', kind: 'monitoring', action: 'Accepted a new surety bonding letter (valid through 12 Jun 2027); the previous letter is superseded.' },
    { at: '2026-03-10T14:00:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Approved: plumbing $700K / $1.5M, medical gas $300K / $600K, valid until 1 Mar 2027.' },
    { at: '2026-03-10T13:55:00', actor: 'Priya Natarajan', kind: 'override', action: 'Overrode “Umbrella coverage below the healthcare requirement”: project-specific excess policy bound.' },
    { at: '2026-03-05T09:15:00', actor: 'Priya Natarajan', kind: 'decision', action: 'Started review.' },
    { at: '2026-03-02T10:40:00', actor: 'Sam Okafor', kind: 'submission', action: 'Submitted the prequalification (Healthcare Specialty v1).' },
  ],
};

export const RECORDS = { 'req-017': DELTA, 'req-018': OAKMONT, 'req-019': PRAIRIE, 'req-020': TIDEWATER, 'req-022': CASCADE, 'req-024': BLUEWATER };
