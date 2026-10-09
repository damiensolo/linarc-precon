// PLACEHOLDER DATA — the Start Prequalification wizard (screen 2). Builds on the shared companies, requests and
// templates in ./index.js so the company picked here is the same one the Overview and the record show.
// Scenario: an estimator starts a request for Summit Mechanical LLC on Riverside Commons. Summit already has an open
// request (Eastgate Data Center) and an expiring qualification with conditions (Northern Heights), so step 1 shows
// both the duplicate warning and the existing-qualification summary.
import { companies, companyById, requests, templates } from './index';
import { requestStatus } from '../status';

export const projects = [
  { id: 'harbor-point', name: 'Harbor Point Clinic', location: 'Oakland, CA', ownership: 'private', sector: 'Healthcare', publicWorks: false, siteSecurity: true },
  { id: 'eastgate', name: 'Eastgate Data Center', location: 'Fremont, CA', ownership: 'private', sector: 'Data centers', publicWorks: false, siteSecurity: true },
  { id: 'northern-heights', name: 'Northern Heights', location: 'Sacramento, CA', ownership: 'public', sector: 'Education', publicWorks: true, siteSecurity: false },
  { id: 'riverside', name: 'Riverside Commons', location: 'San Jose, CA', ownership: 'private', sector: 'Multifamily', publicWorks: false, siteSecurity: false },
];
export const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

export const TRADES = ['02 Demolition', '03 Concrete', '04 Masonry', '05 Metals', '06 Wood and millwork', '07 Thermal and moisture protection', '08 Openings', '09 Finishes', '14 Conveying', '21 Fire Suppression', '22 Plumbing', '23 HVAC', '26 Electrical', '27 Communications', '28 Fire alarm', '31 Earthwork', '32 Exterior improvements'];
export const REGIONS = ['Bay Area', 'Sacramento region', 'Central Valley', 'Central Coast', 'Southern California', 'Northern Nevada', 'Oregon'];
export const SIZE_BANDS = ['Under $1M', '$1M – $5M', '$5M – $20M', 'Over $20M'];

export const steps = [
  { id: 'subcontractor', label: 'Subcontractor' },
  { id: 'work', label: 'Work context' },
  { id: 'requirements', label: 'Requirements & checks' },
  { id: 'invite', label: 'Invite' },
];

/** Company options for the search select (SelectV2 detailed rows). */
export const companyOptions = companies.map((c) => ({
  id: c.id,
  value: c.id,
  label: c.name,
  leftDescription: `${c.trade} · CSI ${c.csi} · ${c.state}`,
}));

/** What Linarc already knows about a company: open requests (duplicates) and qualifications on file. */
export function companyHistory(companyId) {
  const mine = requests.filter((r) => r.company === companyId);
  return {
    open: mine.filter((r) => r.workflow !== 'closed').map((r) => ({ ...r, status: requestStatus(r), templateName: templates[r.template] })),
    qualifications: mine
      .filter((r) => r.outcome && r.outcome !== 'not-qualified')
      .map((r) => ({ ...r, status: requestStatus(r), templateName: templates[r.template] })),
  };
}

/** The wizard's starting values (the scenario above). */
export function initialDraft() {
  const c = companyById.summit;
  return {
    companyId: c.id,
    newCompany: { name: '', trade: '', contact: '', email: '' },
    work: {
      project: 'riverside',
      trades: ['23 HVAC'],
      sizeBand: '$1M – $5M',
      single: 2500000,
      aggregate: 5000000,
      regions: ['Bay Area'],
      ownership: 'private',
      publicWorks: 'no',
      siteSecurity: 'no',
    },
    template: 'mech-lg',
    checks: CHECKS.filter((k) => k.default).map((k) => k.id),
    message:
      `Hi ${c.contact.split(' ')[0]},\n\nHarborview Construction Group would like to prequalify Summit Mechanical LLC for HVAC work on Riverside Commons (San Jose, CA). ` +
      'The link below opens a short application; you can save and come back at any time. Please complete it within 10 business days.\n\nThanks,\nJordan Lee',
  };
}

/** Why a template was suggested, in the words shown under it. */
export function matchReasons(work) {
  const p = projectById[work.project];
  return [work.trades.join(', '), `$${(work.single / 1e6).toFixed(1)}M single`, p ? (p.ownership === 'private' ? 'Private owner' : p.ownership === 'public' ? 'Public owner' : 'Federal') : null, p && p.publicWorks ? 'Public works' : null].filter(Boolean);
}

// What each template asks for, grouped by the portal's four pillars (docs/prequal/sub-portal-data.md).
export const TEMPLATE_REQUIREMENTS = {
  'mech-lg': [
    { pillar: 'Company identity & compliance', items: [
      { label: 'Company, ownership and contacts', detail: 'Legal entity, principals, years in business' },
      { label: 'Licensing', detail: 'C-20 (HVAC) or C-10 license, active, matching legal name' },
      { label: 'Legal history', detail: 'Litigation, defaults, debarment, last 5 years' },
    ] },
    { pillar: 'Safety & insurance', items: [
      { label: 'Safety record', detail: 'EMR ≤ 1.00 for 3 years · TRIR and DART · OSHA 300A, 3 years' },
      { label: 'Insurance', detail: 'GL $2M / $4M · Auto $1M · Umbrella $4M · Workers’ compensation' },
    ] },
    { pillar: 'Financial capacity', items: [
      { label: 'Financial statements', detail: 'Reviewed statements, 2 most recent years' },
      { label: 'Bonding capacity', detail: 'Surety letter: $3M single / $8M aggregate' },
    ] },
    { pillar: 'Experience & performance', items: [
      { label: 'Past projects', detail: '5 projects over $1M in the last 5 years' },
      { label: 'References', detail: '3 project references' },
    ] },
  ],
};
TEMPLATE_REQUIREMENTS.default = TEMPLATE_REQUIREMENTS['mech-lg'];

export const templateOptions = Object.entries(templates).map(([value, label]) => ({ value, label }));

/** Request-specific changes to the template, derived from the work context. */
export function requestChanges(work) {
  const out = [];
  if (work.aggregate > 4000000) out.push({ id: 'umbrella', label: 'Umbrella raised to $5,000,000', reason: 'Expected aggregate ($5,000,000) is above the template’s $4,000,000.' });
  if (work.single > 3000000) out.push({ id: 'bond', label: 'Bonding capacity raised', reason: 'Expected single contract is above the template’s $3,000,000.' });
  if (work.siteSecurity === 'yes') out.push({ id: 'site', label: 'Site security section added', reason: 'Badging and background checks for the site.' });
  return out;
}

// Independent checks Linarc can run. Cost is per request; 0 = included in the plan.
export const CHECKS = [
  { id: 'license', label: 'Contractor license verification', source: 'CSLB', availability: 'Instant', cost: 0, default: true },
  { id: 'osha', label: 'OSHA establishment search', source: 'OSHA', availability: 'Instant', cost: 0, default: true },
  { id: 'sam', label: 'Federal exclusions', source: 'SAM.gov', availability: 'Instant', cost: 0, default: true },
  { id: 'dir', label: 'State debarment', source: 'CA DIR', availability: 'Instant', cost: 0, default: true },
  { id: 'emr', label: 'EMR confirmation', source: 'WCIRB', availability: '1 business day', cost: 0, default: true },
  { id: 'coi', label: 'Insurance broker confirmation', source: 'Broker on the COI', availability: '1–2 business days', cost: 0, default: true },
  { id: 'surety', label: 'Bonding capacity confirmation', source: 'Surety on the letter', availability: '3–5 business days', cost: 0, default: true },
  { id: 'credit', label: 'Business credit report', source: 'Dun & Bradstreet', availability: '1 business day', cost: 35, default: true },
  { id: 'litigation', label: 'Litigation and lien search', source: 'Court records', availability: '2–3 business days', cost: 25, default: false },
];
