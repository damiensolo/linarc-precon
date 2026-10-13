// PLACEHOLDER DATA — what Linarc ships for requirement templates (Configure › Templates, 2026-10-12): the sections
// and default fields the subcontractor portal renders (ids match ./portal.js so what an admin configures is what the
// portal shows), the MVP document types (PRD §6), the thresholds (PRD UX l. 909–932), the scoring sections and
// knockout rules (PRD §8.2–8.3), the Linarc baselines an admin starts from (PRD UX l. 858–861) and the custom field
// types (plan T2). docs/prequal/templates-plan.md.

/** Scoring sections (PRD §8.2) with the default weights. `id` is the "score impact" a field or threshold names. */
export const WEIGHT_SECTIONS = [
  { id: 'safety', label: 'Safety', default: 25 },
  { id: 'financial', label: 'Financial strength', default: 20 },
  { id: 'experience', label: 'Capability and experience', default: 20 },
  { id: 'capacity', label: 'Capacity', default: 15 },
  { id: 'insurance', label: 'Insurance and bonding', default: 10 },
  { id: 'legal', label: 'Legal and compliance', default: 10 },
];
export const weightLabel = (id) => (id === 'review' ? 'Review only' : (WEIGHT_SECTIONS.find((w) => w.id === id) || { label: '—' }).label);

/** Knockout rules (PRD §8.3). `default`: on in every Linarc baseline. */
export const KNOCKOUT_RULES = [
  { id: 'ofac', label: 'Confirmed OFAC sanctions match', default: true },
  { id: 'debarment', label: 'Active federal or state debarment', default: true },
  { id: 'license', label: 'Inactive, suspended or wrong-class contractor license', default: true },
  { id: 'standing', label: 'Entity not in good standing', default: true },
  { id: 'insurance', label: 'Required insurance below minimum', default: true },
  { id: 'bonding', label: 'Required bond capacity below minimum', default: true },
  { id: 'fatality', label: 'Fatality in the prior 3 years with a willful citation', default: false },
];

/** Recommendation bands (PRD §8.4). */
export const DEFAULT_BANDS = { accept: 80, review: 60 };

/** Custom field types an admin can add (plan T2): the portal's field types plus long text and file. */
export const FIELD_TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'percent', label: 'Percent' },
  { value: 'date', label: 'Date' },
  { value: 'yesno', label: 'Yes / no' },
  { value: 'select', label: 'Single select' },
  { value: 'multiselect', label: 'Multiple select' },
  { value: 'file', label: 'File' },
];
const DEFAULT_TYPE_LABELS = { address: 'Address', repeat: 'Table', matrix: 'Grid', computed: 'Computed' };
export const fieldTypeLabel = (type) => (FIELD_TYPES.find((t) => t.value === type) || { label: DEFAULT_TYPE_LABELS[type] || type }).label;

export const PROJECT_TYPES = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
  { value: 'federal', label: 'Federal' },
  { value: 'prevailing-wage', label: 'Prevailing wage' },
  { value: 'site-security', label: 'Site security required' },
];
export const projectTypeLabel = (v) => (PROJECT_TYPES.find((p) => p.value === v) || { label: v }).label;

export const SECTION_MODES = [
  { value: 'required', label: 'Required' },
  { value: 'optional', label: 'Optional' },
  { value: 'off', label: 'Not requested' },
];
export const FIELD_MODES = [
  { value: 'required', label: 'Required' },
  { value: 'optional', label: 'Optional' },
  { value: 'off', label: 'Not requested' },
];

/** Threshold rule types (PRD UX l. 911–916) and what failing one does. */
export const RULE_TYPES = [
  { value: 'minimum', label: 'Minimum', outcome: 'Requirement failure' },
  { value: 'scoring', label: 'Scoring', outcome: 'Reduced score' },
  { value: 'capacity', label: 'Capacity warning', outcome: 'Finding' },
  { value: 'informational', label: 'Informational', outcome: 'Visible only' },
  { value: 'knockout', label: 'Knockout', outcome: 'Not recommended' },
];
export const ruleOutcome = (rule, section) => {
  const r = RULE_TYPES.find((x) => x.value === rule);
  if (!r) return '—';
  return rule === 'scoring' ? `Reduced ${weightLabel(section)} score` : r.outcome;
};

/** Threshold units: how a value is typed and shown. */
export const UNITS = {
  currency: { label: '$', format: (v) => `$${Number(v).toLocaleString('en-US')}` },
  factor: { label: '×', format: (v) => `${Number(v).toFixed(2)}` },
  rate: { label: 'per 200k hours', format: (v) => `${v}` },
  percent: { label: '%', format: (v) => `${v}%` },
  months: { label: 'months', format: (v) => `${v} months` },
  days: { label: 'days', format: (v) => `${v} days` },
  status: { label: '', format: (v) => String(v) },
};

/** Thresholds Linarc ships (PRD UX l. 919–932; limits from docs/prequal/spec.md). `comparator`: how the rule reads. */
export const THRESHOLD_CATALOG = [
  { id: 'glOccurrence', label: 'GL each occurrence', section: 'insurance', rule: 'minimum', comparator: '≥', value: 1000000, unit: 'currency', field: 'insurance.glOccurrence' },
  { id: 'glAggregate', label: 'GL aggregate', section: 'insurance', rule: 'minimum', comparator: '≥', value: 2000000, unit: 'currency', field: 'insurance.glAggregate' },
  { id: 'autoCsl', label: 'Auto combined single limit', section: 'insurance', rule: 'minimum', comparator: '≥', value: 1000000, unit: 'currency', field: 'insurance.autoCsl' },
  { id: 'umbrella', label: 'Umbrella / excess', section: 'insurance', rule: 'minimum', comparator: '≥', value: 2000000, unit: 'currency', field: 'insurance.umbrella' },
  { id: 'emrMax', label: 'EMR, maximum', section: 'safety', rule: 'minimum', comparator: '≤', value: 1.0, unit: 'factor', field: 'safety.emr' },
  { id: 'emrTarget', label: 'EMR, scoring target', section: 'safety', rule: 'scoring', comparator: '≤', value: 0.85, unit: 'factor', field: 'safety.emr' },
  { id: 'trirTarget', label: 'TRIR, scoring target', section: 'safety', rule: 'scoring', comparator: '≤', value: 3.0, unit: 'rate', field: 'safety.injury' },
  { id: 'bondingSingle', label: 'Bonding capacity, single project', section: 'insurance', rule: 'minimum', comparator: '≥', value: 1000000, unit: 'currency', field: 'financial.bondingSingle' },
  { id: 'bondingAggregate', label: 'Bonding capacity, aggregate', section: 'insurance', rule: 'minimum', comparator: '≥', value: 2000000, unit: 'currency', field: 'financial.bondingAggregate' },
  { id: 'workingCapital', label: 'Working capital', section: 'financial', rule: 'scoring', comparator: '≥', value: 250000, unit: 'currency', field: 'financial.workingCapital' },
  { id: 'revenueRatio', label: 'Expected contract ÷ annual revenue', section: 'capacity', rule: 'capacity', comparator: '≤', value: 30, unit: 'percent', field: 'capacity.activeValue' },
  { id: 'statementAge', label: 'Financial statement period end', section: 'financial', rule: 'minimum', comparator: 'within', value: 15, unit: 'months', field: 'financial.currentAssets' },
  { id: 'bankLetterAge', label: 'Bank reference letter date', section: 'financial', rule: 'informational', comparator: 'within', value: 90, unit: 'days', field: 'financial.loc' },
  { id: 'licenseStatus', label: 'Contractor license status', section: 'legal', rule: 'knockout', comparator: '', value: 'Active and trade-aligned', unit: 'status', field: 'licensing.licenses' },
];

/** A threshold rule in words: "≥ $2,000,000", "≤ 1.00", "within 15 months". */
export function thresholdText(t) {
  if (!t) return '';
  const u = UNITS[t.unit] || UNITS.status;
  const v = u.format(t.value);
  return t.comparator ? `${t.comparator} ${v}` : v;
}

/** The MVP document types (PRD §6, ./portal.js documents). `expiry`: the expiry driver shown in the slot. */
export const DOCUMENT_CATALOG = [
  { id: 'coi', group: 'Insurance', label: 'Certificate of insurance (ACORD 25)', expiry: 'Earliest policy expiry', requirements: ['Insured name matches the legal entity', 'Limits meet the template', 'Certificate holder is the GC', 'Workers’ compensation shown'] },
  { id: 'ai-endorsement', group: 'Insurance', label: 'Additional Insured endorsement (ongoing and completed operations)', expiry: 'Linked GL policy', requirements: ['CG 20 10 and CG 20 37, or blanket wording'] },
  { id: 'waiver', group: 'Insurance', label: 'Waiver of Subrogation endorsement', expiry: 'Linked policy', requirements: ['CG 24 04 or WC 00 03 13'] },
  { id: 'pnc', group: 'Insurance', label: 'Primary and Noncontributory endorsement', expiry: 'Linked policy', requirements: ['CG 20 01 or manuscript wording'] },
  { id: 'umbrella', group: 'Insurance', label: 'Umbrella / Excess liability', expiry: 'Policy expiry', requirements: ['Limit meets the template'] },
  { id: 'pollution', group: 'Insurance', label: 'Professional or pollution liability', expiry: 'Policy expiry', requirements: ['Limit meets the template'] },
  { id: 'bonding', group: 'Bonding', label: 'Surety bonding capacity letter', expiry: 'Letter date + 12 months', requirements: ['Addressed to the legal entity', 'Single and aggregate meet the template', 'Dated within the last 90 days'] },
  { id: 'emr', group: 'Safety', label: 'EMR ratesheet (current rating year)', expiry: 'Rating date + 12 months', requirements: ['Employer name matches the legal entity', 'Current rating year', 'Mod at or below the template maximum'] },
  { id: 'osha300a', group: 'Safety', label: 'OSHA 300A, last 3 years', expiry: 'Annual', count: 3, requirements: ['One form per year', 'Signed by a company executive'] },
  { id: 'osha300', group: 'Safety', label: 'OSHA 300 log', expiry: 'Annual', requirements: ['Current year'] },
  { id: 'safety-program', group: 'Safety', label: 'Written safety program', expiry: 'None', requirements: ['Current manual'] },
  { id: 'drug-policy', group: 'Security', label: 'Drug-testing policy', expiry: 'None', requirements: ['Current policy'] },
  { id: 'financials', group: 'Financial', label: 'Financial statements', expiry: 'Period end + 15 months', requirements: ['Statement level per the template', 'Period end within 15 months'], restricted: true },
  { id: 'bank-letter', group: 'Financial', label: 'Bank reference letter', expiry: 'Letter date + 6 months', requirements: ['Dated within the last 90 days'] },
  { id: 'loc-letter', group: 'Financial', label: 'Line of credit letter', expiry: 'Letter date + 12 months', requirements: ['Amount and available balance'] },
  { id: 'w9', group: 'Identity', label: 'W-9', expiry: 'None', requirements: ['Name and TIN match the entity'] },
  { id: 'license', group: 'Identity', label: 'Contractor license certificate', expiry: 'License expiry', requirements: ['Active', 'Classification covers the trade'] },
  { id: 'business-license', group: 'Identity', label: 'Business license', expiry: 'Expiry', requirements: ['Valid'] },
  { id: 'cert-cards', group: 'Workforce', label: 'Certification cards for key personnel', expiry: 'Card expiry', requirements: ['Holder matches a listed key person', 'Not expired'] },
  { id: 'resumes', group: 'Workforce', label: 'Resumes for key personnel', expiry: 'None', requirements: ['One per listed key person'] },
  { id: 'apprenticeship', group: 'Workforce', label: 'Apprenticeship program registration', expiry: 'Registration expiry', requirements: ['Registered with the state'] },
  { id: 'diversity-cert', group: 'Certifications', label: 'Diversity certificate', expiry: 'Expiry', requirements: ['Valid'] },
  { id: 'e-verify', group: 'Security', label: 'E-Verify memorandum of understanding', expiry: 'None', requirements: ['Company name matches the entity'] },
  { id: 'bg-policy', group: 'Security', label: 'Background-check policy', expiry: 'None', requirements: ['Current policy'] },
];
export const documentById = Object.fromEntries(DOCUMENT_CATALOG.map((d) => [d.id, d]));
export const EXPIRY_OPTIONS = ['None', 'Date on the document', '6 months after issue', '12 months after issue', 'Annual'];

/**
 * The sections the portal renders, in its order, with the default fields (./portal.js). Per field: `type`, `mode`
 * (required | optional | off by default), `evidence` (a document id), `score` (a WEIGHT_SECTIONS id or 'review'),
 * `threshold` (a THRESHOLD_CATALOG id shown next to it), `minimum` (tables and grids), `when` (a project type that
 * switches it on). `score` on the section is the default for its fields.
 */
const f = (id, label, type, extra = {}) => ({ id, label, type, mode: 'required', ...extra });
export const SECTION_CATALOG = [
  { id: 'company', label: 'Company', score: 'legal', fields: [
    f('legalName', 'Legal business name', 'text'),
    f('dba', 'DBA', 'text', { mode: 'optional' }),
    f('entityType', 'Entity type', 'select', { options: ['LLC', 'Corporation', 'S-Corp', 'Partnership', 'Sole proprietorship'] }),
    f('stateOfFormation', 'State of formation', 'select'),
    f('yearEstablished', 'Year established', 'number'),
    f('tin', 'TIN', 'text', { evidence: 'w9' }),
    f('uei', 'UEI (SAM.gov)', 'text', { mode: 'optional' }),
    f('hq', 'Headquarters address', 'address'),
    f('branches', 'Branch addresses', 'repeat', { mode: 'optional' }),
    f('principals', 'Ownership and principals', 'repeat'),
    f('unionStatus', 'Union or open shop', 'select', { options: ['Union', 'Open shop'], score: 'review' }),
  ] },
  { id: 'licensing', label: 'Licensing & registration', score: 'legal', fields: [
    f('licenses', 'Contractor licenses', 'repeat', { evidence: 'license', threshold: 'licenseStatus' }),
    f('businessLicenses', 'Business licenses', 'repeat', { evidence: 'business-license' }),
    f('samRegistered', 'Registered in SAM.gov', 'yesno', { mode: 'optional', score: 'review' }),
    f('dirRegistration', 'DIR / public-works registration', 'text', { mode: 'off', when: 'prevailing-wage' }),
  ] },
  { id: 'scope', label: 'Scope', score: 'experience', fields: [
    f('ownForces', 'Trades performed with own forces', 'multiselect'),
    f('subcontracted', 'Trades typically subcontracted', 'multiselect', { mode: 'optional', score: 'review' }),
    f('regions', 'Geographic areas served', 'multiselect', { score: 'review' }),
    f('sectors', 'Sectors served', 'multiselect'),
  ] },
  { id: 'safety', label: 'Safety', score: 'safety', fields: [
    f('emr', 'Experience modification rate', 'matrix', { evidence: 'emr', threshold: 'emrMax', minimum: 3, unit: 'years' }),
    f('injury', 'TRIR, DART and hours worked', 'matrix', { evidence: 'osha300a', threshold: 'trirTarget', minimum: 3, unit: 'years' }),
    f('fatalities', 'Fatalities, last 5 years', 'number'),
    f('citations', 'OSHA citations, last 5 years', 'number'),
    f('safetyProgram', 'Written safety program', 'yesno', { evidence: 'safety-program' }),
    f('safetyStaff', 'Full-time safety staff', 'number'),
    f('drugProgram', 'Drug and alcohol program', 'yesno', { evidence: 'drug-policy' }),
  ] },
  { id: 'insurance', label: 'Insurance', score: 'insurance', fields: [
    f('glOccurrence', 'General liability, each occurrence', 'currency', { evidence: 'coi', threshold: 'glOccurrence' }),
    f('glAggregate', 'General liability, aggregate', 'currency', { evidence: 'coi', threshold: 'glAggregate' }),
    f('autoCsl', 'Auto liability, combined single limit', 'currency', { evidence: 'coi', threshold: 'autoCsl' }),
    f('umbrella', 'Umbrella / excess', 'currency', { evidence: 'umbrella', threshold: 'umbrella' }),
    f('wcCarrier', 'Workers’ compensation carrier', 'text', { evidence: 'coi', score: 'review' }),
    f('broker', 'Insurance broker (for coverage confirmation)', 'text', { score: 'review' }),
  ] },
  { id: 'financial', label: 'Financial', score: 'financial', fields: [
    f('revenue', 'Annual revenue', 'matrix', { minimum: 3, unit: 'years' }),
    f('backlog', 'Current backlog (remaining contract value)', 'currency'),
    f('currentAssets', 'Current assets', 'currency', { evidence: 'financials', threshold: 'statementAge' }),
    f('currentLiabilities', 'Current liabilities', 'currency', { evidence: 'financials' }),
    f('workingCapital', 'Working capital', 'computed', { threshold: 'workingCapital' }),
    f('bondingSingle', 'Bonding capacity, single project', 'currency', { evidence: 'bonding', threshold: 'bondingSingle', score: 'insurance' }),
    f('bondingAggregate', 'Bonding capacity, aggregate', 'currency', { evidence: 'bonding', threshold: 'bondingAggregate', score: 'insurance' }),
    f('surety', 'Surety and agent', 'text', { score: 'review' }),
    f('bank', 'Primary bank', 'text', { score: 'review' }),
    f('loc', 'Line of credit (amount / available)', 'text', { mode: 'optional', evidence: 'bank-letter', threshold: 'bankLetterAge' }),
    f('statementLevel', 'Financial statement level available', 'select', { options: ['Compiled', 'Reviewed', 'Audited'] }),
  ] },
  { id: 'experience', label: 'Experience & workforce', score: 'experience', fields: [
    f('pastProjects', 'Past projects, last 5 years', 'repeat', { minimum: 5, unit: 'projects' }),
    f('specialProjects', 'Special projects (healthcare, occupied, secure)', 'repeat', { mode: 'optional' }),
    f('workforce', 'Employees by role and certification', 'matrix'),
    f('apprenticeship', 'Registered apprenticeship program', 'yesno', { score: 'review' }),
    f('keyPersonnel', 'Key personnel proposed for this work', 'repeat', { evidence: 'cert-cards' }),
  ] },
  { id: 'capacity', label: 'Capacity', score: 'capacity', fields: [
    f('activeProjects', 'Active projects', 'number'),
    f('activeValue', 'Total active contract value', 'currency', { threshold: 'revenueRatio' }),
    f('remainingToBill', 'Remaining to bill', 'currency'),
    f('largestCurrent', 'Largest current project value', 'currency'),
    f('headcount3', 'Field headcount committed, next 3 months', 'number'),
    f('headcount6', 'Field headcount committed, next 6 months', 'number'),
    f('availableCrew', 'Available crew', 'number'),
    f('bondingUsed', 'Bonding currently used against aggregate', 'currency'),
  ] },
  { id: 'references', label: 'References', score: 'experience', fields: [
    f('projectRefs', 'Project references', 'repeat', { minimum: 3, unit: 'references' }),
    f('supplierRefs', 'Supplier references', 'repeat', { mode: 'optional', minimum: 2, unit: 'references', score: 'review' }),
    f('bankRef', 'Bank reference', 'repeat', { mode: 'optional', score: 'review' }),
    f('outreachConsent', 'Authorisation to contact references and broker', 'yesno', { score: 'review' }),
  ] },
  { id: 'legal', label: 'Legal', score: 'legal', fields: [
    f('litigation', 'Litigation, arbitration or claims in the last 5 years', 'yesno'),
    f('defaults', 'Defaults, terminations for cause or bond claims in the last 5 years', 'yesno'),
    f('bankruptcy', 'Bankruptcy in the last 7 years', 'yesno'),
    f('debarment', 'Debarment or suspension by any agency', 'yesno'),
  ] },
  { id: 'certifications', label: 'Certifications', score: 'legal', fields: [
    f('diversity', 'Diversity certifications', 'repeat', { mode: 'optional', evidence: 'diversity-cert', score: 'review' }),
  ] },
  { id: 'site-security', label: 'Site security', score: 'legal', fields: [
    f('bgCheckProgram', 'Background-check program for site staff', 'yesno', { evidence: 'bg-policy' }),
    f('drugTestingProgram', 'Drug-testing program', 'yesno', { evidence: 'drug-policy' }),
    f('eVerify', 'Enrolled in E-Verify', 'yesno', { evidence: 'e-verify' }),
    f('citizenship', 'Workforce citizenship requirement acknowledged', 'yesno', { score: 'review' }),
    f('facilityClearance', 'Facility clearance level and sponsoring agency', 'text', { mode: 'off', when: 'federal', score: 'review' }),
  ] },
];
export const sectionCatalogById = Object.fromEntries(SECTION_CATALOG.map((s) => [s.id, s]));

/** Independent checks (the wizard's list, ./wizard.js CHECKS) with when they run and who sees the result (PRD UX l. 947–952). */
export const CHECK_RUNS = [
  { value: 'invite', label: 'At invite' },
  { value: 'company', label: 'After the Company section' },
  { value: 'submission', label: 'After submission' },
];
export const CHECK_VISIBILITY = [
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'all', label: 'Reviewer and estimator' },
];
export const CHECK_DEFAULTS = {
  license: { runs: 'company', visible: 'all' },
  osha: { runs: 'company', visible: 'reviewer' },
  sam: { runs: 'invite', visible: 'all' },
  dir: { runs: 'invite', visible: 'all' },
  emr: { runs: 'submission', visible: 'reviewer' },
  coi: { runs: 'submission', visible: 'reviewer' },
  surety: { runs: 'submission', visible: 'reviewer' },
  credit: { runs: 'submission', visible: 'reviewer' },
  litigation: { runs: 'submission', visible: 'reviewer' },
};

/**
 * Linarc baselines (PRD UX l. 858–861): what an admin starts from. Each names the sections that are required (the
 * rest optional, Site security off unless listed), the documents that are required, threshold and knockout changes,
 * and the checks, over the catalog defaults.
 */
export const BASELINES = [
  {
    id: 'standard', label: 'Standard specialty trade',
    why: 'For most trades on private work under $5M: the core sections, insurance and bonding at the usual limits, and the free public-record checks. Add paid checks or site security per template.',
    sections: ['company', 'licensing', 'scope', 'safety', 'insurance', 'financial', 'experience', 'capacity', 'references', 'legal'],
    documents: ['coi', 'ai-endorsement', 'waiver', 'pnc', 'umbrella', 'bonding', 'emr', 'osha300a', 'safety-program', 'financials', 'w9', 'license', 'business-license', 'cert-cards'],
    thresholds: {}, knockouts: KNOCKOUT_RULES.filter((k) => k.default).map((k) => k.id),
    checks: ['license', 'osha', 'sam', 'dir', 'emr', 'coi', 'surety', 'credit'],
    validityMonths: 12,
  },
  {
    id: 'high-risk', label: 'High-risk specialty trade',
    why: 'Electrical, mechanical, steel, concrete and other trades where a failure is costly: higher insurance and bonding, tighter EMR, reviewed financial statements and the litigation search.',
    sections: ['company', 'licensing', 'scope', 'safety', 'insurance', 'financial', 'experience', 'capacity', 'references', 'legal'],
    documents: ['coi', 'ai-endorsement', 'waiver', 'pnc', 'umbrella', 'bonding', 'emr', 'osha300a', 'safety-program', 'drug-policy', 'financials', 'bank-letter', 'w9', 'license', 'business-license', 'cert-cards'],
    thresholds: { glAggregate: 4000000, umbrella: 5000000, emrMax: 1.0, emrTarget: 0.8, bondingSingle: 2000000, bondingAggregate: 5000000, workingCapital: 500000 },
    knockouts: KNOCKOUT_RULES.map((k) => k.id),
    checks: ['license', 'osha', 'sam', 'dir', 'emr', 'coi', 'surety', 'credit', 'litigation'],
    validityMonths: 12,
  },
  {
    id: 'public-works', label: 'Public works',
    why: 'Prevailing-wage work for a public owner: DIR registration, the state debarment list, certified-payroll capability and public-works references on top of the standard set.',
    sections: ['company', 'licensing', 'scope', 'safety', 'insurance', 'financial', 'experience', 'capacity', 'references', 'legal', 'certifications'],
    documents: ['coi', 'ai-endorsement', 'waiver', 'pnc', 'umbrella', 'bonding', 'emr', 'osha300a', 'safety-program', 'financials', 'w9', 'license', 'business-license', 'cert-cards', 'apprenticeship'],
    thresholds: { umbrella: 5000000, bondingSingle: 2000000, bondingAggregate: 4000000 },
    knockouts: KNOCKOUT_RULES.filter((k) => k.default).map((k) => k.id),
    checks: ['license', 'osha', 'sam', 'dir', 'emr', 'coi', 'surety', 'credit'],
    validityMonths: 12, projectTypes: ['public', 'prevailing-wage'], fieldsOn: ['licensing.dirRegistration'],
  },
  {
    id: 'federal', label: 'Federal / secure facility',
    why: 'Federal owners and secure sites: SAM.gov registration, E-Verify, background checks and facility clearance, with the site-security section always on.',
    sections: ['company', 'licensing', 'scope', 'safety', 'insurance', 'financial', 'experience', 'capacity', 'references', 'legal', 'site-security'],
    documents: ['coi', 'ai-endorsement', 'waiver', 'pnc', 'umbrella', 'bonding', 'emr', 'osha300a', 'safety-program', 'drug-policy', 'financials', 'w9', 'license', 'business-license', 'cert-cards', 'e-verify', 'bg-policy'],
    thresholds: { umbrella: 5000000, bondingSingle: 2000000, bondingAggregate: 5000000 },
    knockouts: KNOCKOUT_RULES.map((k) => k.id),
    checks: ['license', 'osha', 'sam', 'dir', 'emr', 'coi', 'surety', 'credit', 'litigation'],
    validityMonths: 12, projectTypes: ['federal', 'site-security'], fieldsOn: ['licensing.samRegistered', 'site-security.facilityClearance'],
  },
  {
    id: 'healthcare', label: 'Healthcare',
    why: 'Occupied healthcare facilities: HCAI / OSHPD experience, infection-control (ICRA) projects, background checks and drug testing for site staff.',
    sections: ['company', 'licensing', 'scope', 'safety', 'insurance', 'financial', 'experience', 'capacity', 'references', 'legal', 'site-security'],
    documents: ['coi', 'ai-endorsement', 'waiver', 'pnc', 'umbrella', 'bonding', 'emr', 'osha300a', 'safety-program', 'drug-policy', 'financials', 'w9', 'license', 'business-license', 'cert-cards', 'e-verify'],
    thresholds: { umbrella: 5000000 },
    knockouts: KNOCKOUT_RULES.filter((k) => k.default).map((k) => k.id),
    checks: ['license', 'osha', 'sam', 'dir', 'emr', 'coi', 'surety', 'credit'],
    validityMonths: 12, projectTypes: ['private', 'site-security'], fieldsOn: ['experience.specialProjects'],
  },
];
export const baselineById = Object.fromEntries(BASELINES.map((b) => [b.id, b]));
