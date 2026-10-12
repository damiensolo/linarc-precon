// PLACEHOLDER DATA — the subcontractor portal for every request a subcontractor can see (all but the draft, REQ-016).
// Northstar (REQ-008) is written out in ./portal.js and served as is; every other request is built here from the
// company's answers (./profiles.js + ./portalProfiles.js) and the request's stage:
//   open      Waiting for subcontractor / completing requirements: sections in the state the GC's tracking view shows
//             (./tracking.js); answered sections filled, the one in progress half filled, the rest empty.
//   submitted Ready for review / GC is reviewing: everything read-only; documents with the validation states the
//             subcontractor can see (from the review, ./review.js + ./dossiers.js), never check results.
//   info      More information needed: read-only except what the reviewer asked for; Send response.
//   decided   The decision and, for an approved record, renewals requested (./records.js).
// Shapes match ./portal.js so the portal screen and its components are unchanged. "Today" is 2026-10-08.
import { TODAY, companyById, requestById, templates } from './index';
import { portalRequest as NORTHSTAR, pillars, sections as NORTHSTAR_SECTIONS, documents as NORTHSTAR_DOCUMENTS } from './portal';
import { profiles } from './profiles';
import { portalProfiles, builderContacts } from './portalProfiles';
import { projects } from './wizard';
import { trackingFor } from './tracking';
import { reviewFor } from './review';
import { recordFor } from './records';
import { currency } from '~/candidates/FormTableFields/format';
import { uploadStore } from './uploads';
import { session } from './session';

const GC = { name: 'Harborview Construction Group', logoText: 'HCG' };
const DISCLOSURE =
  'Harborview Construction Group uses Linarc to verify the information you provide. Linarc will check public records (licensing, debarment, sanctions, OSHA) and, with your authorisation below, contact the insurance broker and references you list.';
const PROJECT = Object.fromEntries(projects.map((x) => [x.name, x]));
const STAGE = { invited: 'open', 'in-progress': 'open', submitted: 'submitted', 'under-review': 'submitted', 'info-requested': 'info', closed: 'decided' };

// Workers' compensation carriers (not elsewhere in the data).
const WC = {
  apex: 'Zenith Insurance', summit: 'Travelers', granite: 'Employers Insurance Company of Nevada', bluewater: 'State Compensation Insurance Fund',
  ironline: 'Zurich', cascade: 'SAIF Corporation', pioneer: 'Pie Insurance (from 15 Jun 2026; previously State Fund)', delta: 'Travelers',
  oakmont: 'ICW Group', prairie: 'State Compensation Insurance Fund', tidewater: 'ICW Group', harbor: 'Republic Indemnity', redwood: 'Zenith Insurance', keystone: 'CopperPoint',
};
// Umbrella required by each template.
const UMBRELLA = { 'elec-md': 5000000, 'mech-lg': 5000000, 'hc-sp': 5000000, 'pw-md': 5000000, 'std-sp': 2000000, 'conc-md': 2000000 };

// Values the subcontractor entered that disagree with their own document (shown under the field, as on Northstar's).
const MISMATCH = {
  'req-001': {
    'safety.emr': 'Your entered EMR (0.82) does not match the uploaded ratesheet (0.94).',
    'insurance.umbrella': 'Your entered umbrella limit ($5,000,000) does not match the uploaded certificate ($3,000,000).',
  },
  'req-004': { 'financial.statementLevel': 'You selected reviewed statements; the uploaded statements are a compilation.' },
  'req-006': { 'insurance.glAggregate': 'The uploaded certificate shows policy GL-44817, which expired on 15 Sep 2026.' },
};

const n = (s) => {
  if (s === null || s === undefined) return null;
  const neg = /^[−-]/.test(String(s).trim());
  const v = Number(String(s).replace(/[^0-9.]/g, ''));
  return neg ? -v : v;
};
const money = (s) => {
  const m = String(s).match(/[−-]?\$[\d,]+/);
  return m ? n(m[0]) : null;
};
const round = (v, to) => Math.round(v / to) * to;
const unit = (v, u) => Number(v) * (u === 'M' ? 1e6 : 1e3);
function bonding(p) {
  const m = p.bonding.match(/\$([\d.]+)(M|K) single \/ \$([\d.]+)(M|K) aggregate/);
  return m ? { single: unit(m[1], m[2]), aggregate: unit(m[3], m[4]) } : { single: null, aggregate: null };
}
const addMonths = (ym, k) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + k, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const F = (id, label, type, value, extra = {}) => ({ id, label, type, value, required: true, ...extra });

/** Every portal field for a company, answered, in the same ids and order as Northstar's (./portal.js). */
function answers(companyId, request) {
  const c = companyById[companyId];
  // A company that hasn't started (invited) has no answers yet: a neutral profile gives the fields their shape; every
  // value except the prefilled legal name is cleared by sectionsFor().
  const p = profiles[companyId] || {
    legal: c.name, entity: 'California corporation, 2010', principals: `${c.contact} (Principal)`, emr: ['1', '1', '1'], trir: '0 / 0', fatalities: '0',
    gl: '$0 / $0', umbrella: '$0', revenue: '$1', workingCapital: '$0', bonding: '', backlog: '$0', largest: '$0', broker: '', surety: '',
  };
  const pp = portalProfiles[companyId] || {
    hq: '', tin: '', union: 'Open shop', licenses: [[c.state, '', '', '']], biz: ['', '', ''], ownForces: [], subcontracted: [], regions: [], sectors: [],
    safetyStaff: 0, citations: [0, ''], bank: '', loc: '', statement: 'Reviewed', apprenticeship: null, diversity: [], projects: [], key: [],
  };
  const project = PROJECT[request.project] || {};
  const [stateWord, ...rest] = p.entity.split(' ');
  const entityWord = rest.join(' ').split(',')[0];
  const STATE = { California: 'CA', Nevada: 'NV', Oregon: 'OR', Arizona: 'AZ' };
  const year = Number((p.entity.match(/\b(19|20)\d{2}\b/) || [2010])[0]);
  const principals = p.principals.split('), ').map((x) => x.replace(')', '').split(' ('));
  const share = Math.round(100 / principals.length);
  const emr = p.emr.map((v) => parseFloat(v));
  const [trir, dart] = p.trir.split(' / ').map(Number);
  const revenue = money(p.revenue);
  const wc = money(p.workingCapital);
  const assets = round(Math.abs(wc) * 2 + revenue * 0.08, 10000);
  const bond = bonding(p);
  const backlog = money(p.backlog);
  const scale = Math.max(0.4, revenue / 14200000);
  const crew = (base) => Math.max(1, Math.round(base * scale));
  const workforce = [
    ['Project Manager', 2, 11], ['Superintendent', 2, 14], ['Foreman', 4, 9], ['Journeyman', 14, 7], ['Apprentice', 6, 2], ['Safety Manager', pp.safetyStaff, 8],
  ].map(([role, base, avgYears]) => {
    const count = role === 'Safety Manager' ? base : crew(base);
    const lead = ['Project Manager', 'Superintendent', 'Foreman', 'Safety Manager'].includes(role);
    return { role, count, avgYears, osha30: lead ? count : Math.round(count * 0.25), osha10: lead ? 0 : count - Math.round(count * 0.25), firstAid: Math.ceil(count * 0.6), tradeCert: role === 'Apprentice' || role === 'Safety Manager' ? 0 : count };
  });
  const field = workforce.filter((w) => ['Foreman', 'Journeyman', 'Apprentice'].includes(w.role)).reduce((a, w) => a + w.count, 0);
  const past = pp.projects.map(([name, city, owner, gc, sector, value, finish, scope]) => {
    const [ref, email, phone] = builderContacts[gc] || ['—', '', ''];
    return { name, city, owner, gc, sector, value, finalValue: round(value * 1.03, 1000), scope, start: addMonths(finish, -10), finish, actualFinish: finish, pw: /public works/i.test(sector), reference: { name: ref, company: gc, email, phone } };
  });
  const special = past.filter((x) => (project.sector === 'Healthcare' && /Healthcare/.test(x.sector)) || (project.publicWorks && x.pw)).slice(0, 2)
    .map((x) => ({ condition: /Healthcare/.test(x.sector) ? 'Healthcare (HCAI / OSHPD)' : 'Public works (prevailing wage)', project: x.name, value: x.value, reference: x.reference.name }));
  const lic = pp.licenses;
  return {
    company: [
      F('legalName', 'Legal business name', 'text', p.legal),
      F('dba', 'DBA', 'text', '', { required: false }),
      F('entityType', 'Entity type', 'select', /LLC/.test(entityWord) ? 'LLC' : 'Corporation', { options: ['LLC', 'Corporation', 'S-Corp', 'Partnership', 'Sole proprietorship'] }),
      F('stateOfFormation', 'State of formation', 'select', STATE[stateWord] || c.state),
      F('yearEstablished', 'Year established', 'number', year),
      F('tin', 'TIN', 'text', pp.tin, { evidence: 'w9' }),
      F('uei', 'UEI (SAM.gov)', 'text', '', { required: false }),
      F('hq', 'Headquarters address', 'address', pp.hq),
      F('branches', 'Branch addresses', 'repeat', [], { required: false }),
      F('principals', 'Ownership and principals', 'repeat', principals.map(([name, title], i) => ({ name, title, ownership: i === 0 ? 100 - share * (principals.length - 1) : share }))),
      F('unionStatus', 'Union or open shop', 'select', pp.union === 'Union' ? 'union' : 'open', { options: ['Union', 'Open shop'] }),
    ],
    licensing: [
      F('licenses', 'Contractor licenses', 'repeat', lic.map(([state, number, classifications, expiry]) => ({ state, number, classifications, expiry })), { evidence: 'license' }),
      F('businessLicenses', 'Business licenses', 'repeat', [{ jurisdiction: pp.biz[0], number: pp.biz[1], expiry: pp.biz[2] }], { evidence: 'business-license' }),
      F('samRegistered', 'Registered in SAM.gov', 'yesno', /public works/i.test(pp.sectors.join(' ')), { required: false }),
    ],
    scope: [
      F('ownForces', 'Trades performed with own forces', 'multiselect', pp.ownForces),
      F('subcontracted', 'Trades typically subcontracted', 'multiselect', pp.subcontracted, { required: false }),
      F('regions', 'Geographic areas served', 'multiselect', pp.regions),
      F('sectors', 'Sectors served', 'multiselect', pp.sectors),
    ],
    safety: [
      F('emr', 'Experience modification rate, last 3 years', 'matrix', [{ year: 2026, value: emr[2] }, { year: 2025, value: emr[1] }, { year: 2024, value: emr[0] }], { evidence: 'emr', threshold: '≤ 1.00' }),
      F('injury', 'TRIR, DART and hours worked, last 3 years', 'matrix', [
        { year: 2025, trir, dart, hours: round(revenue / 95, 1000) },
        { year: 2024, trir: Math.round((trir + 0.2) * 10) / 10, dart: Math.round((dart + 0.1) * 10) / 10, hours: round(revenue / 104, 1000) },
        { year: 2023, trir: Math.round((trir + 0.4) * 10) / 10, dart: Math.round((dart + 0.2) * 10) / 10, hours: round(revenue / 112, 1000) },
      ], { evidence: 'osha300a' }),
      F('fatalities', 'Fatalities, last 5 years', 'number', Number(p.fatalities)),
      F('citations', 'OSHA citations, last 5 years', 'number', pp.citations[0], pp.citations[1] ? { detail: pp.citations[1] } : {}),
      F('safetyProgram', 'Written safety program', 'yesno', true, { evidence: 'safety-program' }),
      F('safetyStaff', 'Full-time safety staff', 'number', pp.safetyStaff),
      F('drugProgram', 'Drug and alcohol program', 'yesno', true, project.siteSecurity ? { evidence: 'drug-policy' } : {}),
    ],
    insurance: [
      F('glOccurrence', 'General liability, each occurrence', 'currency', money(p.gl), { evidence: 'coi', threshold: '≥ $1,000,000' }),
      F('glAggregate', 'General liability, aggregate', 'currency', money(p.gl.split('/')[1]), { evidence: 'coi', threshold: '≥ $2,000,000' }),
      F('autoCsl', 'Auto liability, combined single limit', 'currency', 1000000, { evidence: 'coi', threshold: '≥ $1,000,000' }),
      F('umbrella', 'Umbrella / excess', 'currency', money(p.umbrella), { evidence: 'umbrella', threshold: `≥ ${currency(UMBRELLA[request.template])}` }),
      F('wcCarrier', 'Workers’ compensation carrier', 'text', WC[companyId], { evidence: 'coi' }),
      F('broker', 'Insurance broker (for coverage confirmation)', 'text', p.broker),
    ],
    financial: [
      F('revenue', 'Annual revenue, last 3 years', 'matrix', [{ year: 2025, value: revenue }, { year: 2024, value: round(revenue * 0.91, 100000) }, { year: 2023, value: round(revenue * 0.84, 100000) }]),
      F('backlog', 'Current backlog (remaining contract value)', 'currency', backlog),
      F('currentAssets', 'Current assets', 'currency', assets, { evidence: 'financials' }),
      F('currentLiabilities', 'Current liabilities', 'currency', assets - wc, { evidence: 'financials' }),
      F('workingCapital', 'Working capital', 'computed', wc, { formula: 'current assets − current liabilities' }),
      F('bondingSingle', 'Bonding capacity, single project', 'currency', bond.single, { evidence: 'bonding', threshold: `≥ ${currency(request.single)}` }),
      F('bondingAggregate', 'Bonding capacity, aggregate', 'currency', bond.aggregate, { evidence: 'bonding', threshold: `≥ ${currency(request.aggregate)}` }),
      F('surety', 'Surety and agent', 'text', p.surety),
      F('bank', 'Primary bank', 'text', pp.bank),
      F('loc', 'Line of credit (amount / available)', 'text', pp.loc, { evidence: 'bank-letter' }),
      F('statementLevel', 'Financial statement level available', 'select', pp.statement, { options: ['Compiled', 'Reviewed', 'Audited'] }),
    ],
    experience: [
      F('pastProjects', 'Past projects, last 5 years (minimum 5)', 'repeat', past, { minimum: 5 }),
      F('specialProjects', `Special projects (${project.sector === 'Healthcare' ? 'healthcare and occupied work' : project.publicWorks ? 'public works' : 'comparable work'})`, 'repeat', special, { required: !!(project.sector === 'Healthcare' || project.publicWorks) }),
      F('workforce', 'Employees by role and certification', 'matrix', workforce),
      F('apprenticeship', 'Registered apprenticeship program', 'yesno', !!pp.apprenticeship, pp.apprenticeship ? { detail: pp.apprenticeship } : {}),
      F('keyPersonnel', 'Key personnel proposed for this work', 'repeat', pp.key.map(([name, role, years, certs]) => ({ name, role, years, certs, resume: `${name.split(' ')[1].toLowerCase()}-resume.pdf` })), { evidence: 'cert-cards' }),
    ],
    capacity: [
      F('activeProjects', 'Active projects', 'number', Math.max(2, Math.round(backlog / 900000))),
      F('activeValue', 'Total active contract value', 'currency', round(backlog * 1.7, 100000)),
      F('remainingToBill', 'Remaining to bill', 'currency', backlog),
      F('largestCurrent', 'Largest current project value', 'currency', money(p.largest)),
      F('headcount3', 'Field headcount committed, next 3 months', 'number', Math.round(field * 0.8)),
      F('headcount6', 'Field headcount committed, next 6 months', 'number', Math.round(field * 0.55)),
      F('availableCrew', 'Available crew', 'number', field - Math.round(field * 0.8)),
      F('bondingUsed', 'Bonding currently used against aggregate', 'currency', Math.min(backlog, bond.aggregate || backlog), { computed: 'remaining bonding = aggregate − used' }),
    ],
    references: [
      F('projectRefs', 'Project references (minimum 3)', 'repeat', past.slice(0, 3).map((x) => ({ name: x.reference.name, company: x.gc, project: x.name, email: x.reference.email, phone: x.reference.phone })), { minimum: 3 }),
      F('supplierRefs', 'Supplier references (optional, 2)', 'repeat', [], { required: false }),
      F('bankRef', 'Bank reference (optional)', 'repeat', [], { required: false }),
      F('outreachConsent', 'I authorise Linarc to contact the references and broker listed', 'yesno', true),
    ],
    legal: [
      F('litigation', 'Litigation, arbitration or claims in the last 5 years', 'yesno', false),
      F('defaults', 'Defaults, terminations for cause or bond claims in the last 5 years', 'yesno', false),
      F('bankruptcy', 'Bankruptcy in the last 7 years', 'yesno', false),
      F('debarment', 'Debarment or suspension by any agency', 'yesno', false),
    ],
    certifications: [F('diversity', 'Diversity certifications', 'repeat', pp.diversity.map(([type, agency, number, expiry]) => ({ type, agency, number, expiry })), { required: false, evidence: 'diversity-cert' })],
    'site-security': [
      F('bgCheckProgram', 'We operate a background-check program for site staff', 'yesno', true),
      F('drugTestingProgram', 'We operate a drug-testing program', 'yesno', true, { evidence: 'drug-policy' }),
      F('eVerify', 'We are enrolled in E-Verify', 'yesno', true, { evidence: 'e-verify' }),
      F('citizenship', 'We acknowledge the workforce citizenship requirement for this site', 'yesno', true),
    ],
  };
}

// An unanswered field. A matrix keeps its rows (years, roles) with the values cleared, so there is something to fill in.
const empty = (f) => {
  if (f.type === 'matrix' && Array.isArray(f.value)) {
    return { ...f, value: f.value.map((row) => { const [k, ...rest] = Object.keys(row); return { [k]: row[k], ...Object.fromEntries(rest.map((x) => [x, null])) }; }) };
  }
  return { ...f, value: f.type === 'repeat' || f.type === 'multiselect' ? [] : null };
};

// Northstar's labels, notes and conditional lines, by section id.
const SECTION_META = Object.fromEntries(NORTHSTAR_SECTIONS.map((s) => [s.id, { label: s.label, note: s.note }]));
const SLOT_SECTION = {
  coi: 'insurance', 'ai-endorsement': 'insurance', waiver: 'insurance', pnc: 'insurance', umbrella: 'insurance',
  bonding: 'financial', financials: 'financial', 'bank-letter': 'financial', emr: 'safety', osha300a: 'safety', 'safety-program': 'safety', 'gc-questionnaire': 'safety',
  w9: 'company', license: 'licensing', 'business-license': 'licensing', 'drug-policy': 'site-security', 'e-verify': 'site-security', 'cert-cards': 'experience', 'diversity-cert': 'certifications',
};
// Review document id → portal slot id.
const REVIEW_SLOT = { coi: 'coi', ai: 'ai-endorsement', wos: 'waiver', emr: 'emr', osha300a: 'osha300a', fin: 'financials', bond: 'bonding', w9: 'w9', license: 'license' };
// Findings the reviewer asked about → the section and document slot the subcontractor fixes.
const INFO_TARGET = { 'f-gl': ['insurance', 'coi'], 'f-ai': ['insurance', 'ai-endorsement'], 'f-emr': ['safety', 'emr'] };
const REVIEW_SECTION = { safety: 'safety', insurance: 'insurance', financial: 'financial', capacity: 'capacity', capability: 'experience', legal: 'legal' };
/** The portal section and document slot a requested finding points at: [sectionId, slotId | null]. */
function infoTarget(id, review) {
  if (INFO_TARGET[id]) return INFO_TARGET[id];
  if (id.startsWith('f-doc-')) { const slot = id.slice(6); return [SLOT_SECTION[slot] || 'documents', slot]; }
  if (id.startsWith('f-field-')) { const [section] = id.slice(8).split('-'); return [REVIEW_SECTION[section] || section, null]; }
  const f = review && review.findings.find((x) => x.id === id);
  return [f ? REVIEW_SECTION[f.section] || 'legal' : 'legal', null];
}

const fmt = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** The document slots for this request, uploaded and validated as far as its stage goes. */
function documentsFor(r, stage, states, review) {
  const c = companyById[r.company];
  const p = profiles[r.company] || { surety: '', bonding: '' };
  const pp = portalProfiles[r.company] || { licenses: [[c.state, '', '', '']], biz: ['', '', ''], diversity: [], key: [], statement: 'Reviewed' };
  const project = PROJECT[r.project] || {};
  const short = c.name.split(/[\s,]/)[0];
  const lic = pp.licenses.find((l) => l[0] === 'CA') || pp.licenses[0];
  const uploaded = r.submittedOn ? r.submittedOn : TODAY;
  const bond = bonding(p);
  const files = {
    coi: `${short}-COI-2026.pdf`, 'ai-endorsement': 'CG2010-CG2037.pdf', waiver: 'waiver-of-subrogation.pdf', pnc: 'primary-noncontributory.pdf', umbrella: 'umbrella-policy-2026.pdf',
    bonding: `${p.surety.split(' ')[0]}-bonding-letter.pdf`, emr: `${c.state === 'CA' ? 'WCIRB' : 'NCCI'}-ratesheet-2026.pdf`, financials: `${short}-FS-2025-${pp.statement.toLowerCase()}.pdf`,
    w9: `W9-${short}.pdf`, license: `CSLB-${lic[1]}.pdf`, 'business-license': `${pp.biz[1]}.pdf`, 'safety-program': 'IIPP-2026.pdf', 'gc-questionnaire': 'HCG-safety-questionnaire.pdf',
    'drug-policy': 'drug-testing-policy.pdf', 'e-verify': 'E-Verify-MOU.pdf', 'diversity-cert': `${pp.diversity[0] ? pp.diversity[0][0] : 'cert'}-certificate.pdf`,
  };
  const validThrough = { coi: '2027-04-01', umbrella: '2027-04-01', emr: '2027-01-01', financials: '2027-03-31', license: lic[3], 'business-license': pp.biz[2] };
  const reviewDocs = review ? Object.fromEntries(review.documents.map((d) => [REVIEW_SLOT[d.id], d]).filter(([k]) => k)) : {};
  const record = stage === 'decided' && r.outcome !== 'not-qualified' ? recordFor(r.id) : null;
  const recordDocs = record ? Object.fromEntries(record.documents.map((d) => [REVIEW_SLOT[d.id], d]).filter(([k]) => k)) : {};
  return NORTHSTAR_DOCUMENTS
    .filter((d) => (d.required === 'site-security' ? project.siteSecurity : true))
    .filter((d) => d.id !== 'diversity-cert' || pp.diversity.length || stage === 'open')
    .map((d) => {
      const slot = { ...d, status: null, message: d.required ? 'Required.' : 'Optional.', file: undefined, files: undefined, extracted: undefined, validThrough: undefined };
      // Request-specific requirement lines.
      if (d.id === 'coi') slot.requirements = ['Insured name matches your legal entity', 'GL $1,000,000 each occurrence / $2,000,000 aggregate', 'Auto CSL $1,000,000', `Umbrella ${currency(UMBRELLA[r.template])}`, `Certificate holder is ${GC.name}`, 'Workers’ compensation shown'];
      if (d.id === 'umbrella') slot.requirements = [`Limit of at least ${currency(UMBRELLA[r.template])}`];
      if (d.id === 'bonding') slot.requirements = ['Addressed to your legal entity', `Single project at least ${currency(r.single)}; aggregate at least ${currency(r.aggregate)}`, 'Dated within the last 90 days'];
      if (d.id === 'license') slot.requirements = ['Active', `Classification covers ${c.trade.toLowerCase()} (${lic[2].split(';')[0]})`];
      if (d.id === 'gc-questionnaire') slot.label = 'Harborview safety questionnaire';
      if (d.id === 'drug-policy' || d.id === 'e-verify') slot.message = `Required for ${r.project}.`;
      const answered = stage !== 'open' || states[SLOT_SECTION[d.id]] === 'complete';
      if (!answered || (!d.required && d.id !== 'diversity-cert') || (d.id === 'diversity-cert' && !pp.diversity.length)) return slot;
      slot.status = 'passed';
      slot.message = 'Document meets the configured requirements.';
      if (d.count) slot.files = [2025, 2024, 2023].map((y) => ({ name: `OSHA300A-${y}.pdf`, uploadedOn: uploaded }));
      else if (d.id === 'cert-cards') slot.files = pp.key.map(([name]) => ({ name: `${name.split(' ')[1].toLowerCase()}-osha30.pdf`, uploadedOn: uploaded }));
      else slot.file = { name: files[d.id] || `${d.id}.pdf`, uploadedOn: uploaded };
      if (validThrough[d.id]) {
        slot.validThrough = validThrough[d.id];
        slot.message = `Valid through ${fmt(validThrough[d.id])}.`;
      }
      if (d.id === 'bonding' && bond.single) slot.message = `Letter reads ${currency(bond.single)} single / ${currency(bond.aggregate)} aggregate.`;
      // What the reviewer's document checks found, in the words the subcontractor sees.
      const rd = reviewDocs[d.id];
      if (rd && rd.status !== 'passed' && rd.status !== 'superseded') {
        slot.status = rd.status;
        slot.validThrough = rd.validThrough || slot.validThrough;
        slot.message = {
          failed: `${rd.note}.`,
          'needs-review': 'We couldn’t confidently read part of this document. A reviewer will check it.',
          expiring: `Expires ${rd.validThrough ? fmt(rd.validThrough) : 'soon'}. Upload the renewal when you have it.`,
          expired: `${rd.note}. Upload the current one.`,
          rejected: rd.note,
          processing: 'We’re checking this document.',
        }[rd.status] || rd.note;
        if (rd.status === 'failed' && /Not uploaded/.test(rd.note)) {
          slot.status = null;
          slot.file = undefined;
          slot.message = 'Not uploaded.';
        }
        if (rd.status === 'rejected') slot.file = { name: d.id === 'emr' ? 'StateFund-loss-run-2026.pdf' : slot.file.name, uploadedOn: uploaded };
      }
      // Once approved, the slot shows the record's document as it is today: renewed, expiring or expired.
      const recDoc = recordDocs[d.id];
      if (recDoc) {
        slot.status = 'passed';
        slot.validThrough = recDoc.expires || undefined;
        slot.message = recDoc.expires ? `Valid through ${fmt(recDoc.expires)}.` : 'Document meets the configured requirements.';
        if (recDoc.renewal && recDoc.renewal.status === 'received') {
          slot.status = 'processing';
          slot.message = `Renewal received ${fmt(recDoc.renewal.on)}; we’re checking it.`;
          slot.file = { name: `${files[d.id] || d.id}`.replace(/(\d{4})?\.pdf$/, '2027.pdf'), uploadedOn: recDoc.renewal.on };
        } else if (recDoc.renewal || (recDoc.expires && recDoc.expires < TODAY)) {
          const lapsed = recDoc.expires < TODAY;
          slot.status = lapsed ? 'expired' : 'expiring';
          slot.message = `${lapsed ? 'Expired' : 'Expires'} ${fmt(recDoc.expires)}.${recDoc.renewal ? ` Renewal requested ${fmt(recDoc.renewal.on)}: upload the renewed document.` : ''}`;
        }
      }
      return slot;
    });
}

/** Section list in Northstar's shape, with states and values for this request's stage. */
function sectionsFor(r, stage, info) {
  const all = answers(r.company, r);
  const project = PROJECT[r.project] || {};
  const tracking = stage === 'open' ? trackingFor(r.id) : null;
  const trackState = tracking ? Object.fromEntries(tracking.sections.map((s) => [s.id, s.state])) : {};
  const infoSections = new Set(info ? info.items.map((id) => infoTarget(id)[0]).filter(Boolean) : []);
  const mismatch = MISMATCH[r.id] || {};
  const ids = pillars.flatMap((pl) => pl.sections).filter((id) => id !== 'site-security' || project.siteSecurity);
  return ids.map((id) => {
    const meta = SECTION_META[id];
    const base = { id, label: meta.label, ...(meta.note ? { note: meta.note } : {}) };
    if (id === 'site-security') base.conditional = `Required by ${r.project} (${project.sector === 'Healthcare' ? 'healthcare, occupied facility' : 'secure site'})`;
    let state;
    if (stage === 'open') state = id === 'review' ? 'not-started' : trackState[id] || 'not-started';
    else if (stage === 'info') state = infoSections.has(id) || id === 'documents' ? 'needs-attention' : 'submitted';
    else state = 'submitted';
    let fields = (all[id] || []).map((f) => (mismatch[`${id}.${f.id}`] ? { ...f, mismatch: mismatch[`${id}.${f.id}`] } : f));
    if (state === 'not-started') fields = fields.map((f) => (id === 'company' && f.id === 'legalName' ? f : empty(f)));
    if (state === 'in-progress') {
      const keep = Math.ceil(fields.length / 2);
      fields = fields.map((f, i) => (i < keep ? f : empty(f)));
      base.progress = `${keep} of ${fields.length} answered`;
    }
    return { ...base, state, fields };
  });
}

/** Header details for the request, in ./portal.js `portalRequest` shape. */
function requestFor(r, invitedOn) {
  const c = companyById[r.company];
  const project = PROJECT[r.project] || {};
  return {
    requestId: r.id,
    gc: GC,
    project: r.project,
    projectLocation: project.location || '',
    template: templates[r.template],
    trade: `${c.trade} (CSI ${c.csi})`,
    requestedSingle: r.single,
    requestedAggregate: r.aggregate,
    flags: { healthcare: project.sector === 'Healthcare', siteSecurity: !!project.siteSecurity, publicWorks: !!project.publicWorks || r.template === 'pw-md', federal: false },
    invitedOn,
    contact: { name: c.contact, email: c.email },
    disclosure: DISCLOSURE,
  };
}

/** What the subcontractor is told once a decision exists: { tone, title, message, items }. */
function decisionFor(r, review) {
  if (r.outcome === 'not-qualified') {
    return { tone: 'error', title: 'Not approved', message: review.decided.message, items: [] };
  }
  const rec = recordFor(r.id);
  const scope = rec.trades.map((t) => `${t.trade} up to ${currency(t.single)} single / ${currency(t.aggregate)} aggregate`).join('; ');
  const until = fmt(rec.validUntil);
  const renewals = rec.documents.filter((d) => d.renewal).map((d) => ({
    kind: 'document',
    id: { coi: 'coi', ai: 'ai-endorsement', bond: 'bonding', license: 'license', emr: 'emr', fin: 'financials' }[d.id] || d.id,
    label: d.label,
    reason: d.renewal.status === 'received' ? `Renewal received ${fmt(d.renewal.on)}; we’re checking it.` : `Renewal requested ${fmt(d.renewal.on)}; ${d.expires < TODAY ? 'expired' : 'expires'} ${fmt(d.expires)}.`,
  }));
  const conditions = rec.conditions.length ? ` Conditions: ${rec.conditions.map((x) => x.label).join('; ')}.` : '';
  const what = rec.outcome === 'qualified-with-conditions' ? 'Approved with conditions' : 'Approved';
  switch (r.lifecycle) {
    case 'expiring':
      return { tone: 'warning', title: 'Renewal needed soon', message: `${what} for ${scope}, valid until ${until}. Upload the renewed documents below to stay qualified.${conditions}`, items: renewals };
    case 'expired':
      return { tone: 'error', title: 'No longer active', message: `Your qualification lapsed on ${until} because a required document expired and no renewal was received. ${GC.name} has invited you to requalify.`, items: renewals };
    case 'suspended':
      return { tone: 'error', title: 'Suspended', message: `${GC.name} has suspended your qualification while it reviews a new OSHA citation (inspection 1789310). You can’t be added to new bids or commitments until it is reinstated.`, items: [] };
    default:
      return { tone: 'success', title: what, message: `You’re qualified for ${scope}, valid until ${until}.${conditions}`, items: renewals };
  }
}

/**
 * The portal for a request: { request, companyName, stage, workflow, sections, documents, infoRequest, decision,
 * submittedOn, lastSaved }. Null for a request the subcontractor can't see (a draft) or an unknown id.
 */
export function portalFor(requestId) {
  const p = buildPortal(requestId);
  if (!p) return null;
  // This session's uploads (data/uploads.js) replace what the slot showed; a sent response closes the request.
  const uploads = uploadStore.uploads[requestId] || {};
  p.documents = p.documents.map((d) => {
    const up = uploads[d.id];
    if (!up) return { ...d };
    const many = up.files.length > 1 || d.count;
    return { ...d, status: up.status, message: up.message, validThrough: up.validThrough, extracted: up.extracted, file: many ? undefined : up.files[0], files: many ? up.files : undefined };
  });
  p.sections = p.sections.map((s) => ({ ...s }));
  // The sub's saved progress (data/session.js) sets the section states while the application is open.
  const saved = session.answers[requestId];
  if (saved && p.stage === 'open') p.sections = p.sections.map((s) => ({ ...s, state: saved.states[s.id] || s.state }));
  if (saved) p.savedValues = saved.values;
  // Once submitted, every request (Northstar included) is read-only except what a reviewer asked for.
  if (p.stage !== 'open') {
    const info = p.infoRequest;
    const sections = new Set(info ? info.items.map((id) => infoTarget(id)[0]) : []);
    p.sections = p.sections.map((s) => ({ ...s, state: p.stage === 'info' && (sections.has(s.id) || s.id === 'documents') ? 'needs-attention' : 'submitted' }));
    p.documents = p.documents.map((d) => ({ ...d, locked: !d.requested && !['expiring', 'expired'].includes(d.status) }));
  }
  const response = uploadStore.responses[requestId];
  if (response && p.stage === 'info') p.respondedAt = response.at;
  if (response) p.sections = p.sections.map((s) => (s.state === 'needs-attention' ? { ...s, state: 'submitted' } : s));
  const sub = session.submissions[requestId];
  if (sub) { p.submittedAt = sub.at; p.submissionRef = sub.ref; }
  return p;
}

function buildPortal(requestId) {
  const r = requestById[requestId];
  if (!r || !STAGE[r.workflow]) return null;
  const stage = STAGE[r.workflow];
  const company = companyById[r.company];
  const tracking = stage === 'open' ? trackingFor(requestId) : null;
  const review = stage === 'open' ? null : reviewFor(requestId);
  const invitedLine = review && review.history.find((h) => /Sent the invitation/.test(h.action));
  const invitedOn = tracking ? tracking.invitedOn : invitedLine ? invitedLine.at.slice(0, 10) : r.submittedOn;
  if (requestId === NORTHSTAR.requestId) {
    const nsInfo = stage === 'info' && review ? review.infoRequest : null;
    let nsDocs = NORTHSTAR_DOCUMENTS;
    if (nsInfo) { const asked = new Set(nsInfo.items.map((id) => infoTarget(id, review)[1]).filter(Boolean)); nsDocs = nsDocs.map((d) => (asked.has(d.id) ? { ...d, requested: true } : d)); }
    return {
      request: NORTHSTAR, companyName: company.name, stage, workflow: r.workflow, sections: NORTHSTAR_SECTIONS, documents: nsDocs,
      infoRequest: nsInfo ? { ...nsInfo, docIds: nsDocs.filter((d) => d.requested).map((d) => d.id) } : null,
      decision: stage === 'decided' ? decisionFor(r, review) : null,
      submittedOn: r.submittedOn, lastSaved: tracking ? tracking.lastSaved : null,
      ...(tracking ? { percent: tracking.percent } : {}),
    };
  }
  const info = stage === 'info' ? review.infoRequest : null;
  const sections = sectionsFor(r, stage, info);
  const states = Object.fromEntries(sections.map((s) => [s.id, s.state]));
  let documents = documentsFor(r, stage, states, review);
  if (info) {
    const asked = new Set(info.items.map((id) => infoTarget(id, review)[1]).filter(Boolean));
    documents = documents.map((d) => (asked.has(d.id) ? { ...d, requested: true } : d));
  }
  // After submission a slot can only change when the reviewer asked for it or a renewal was requested.
  if (stage !== 'open') documents = documents.map((d) => ({ ...d, locked: !d.requested && !['expiring', 'expired'].includes(d.status) }));
  return {
    request: requestFor(r, invitedOn),
    companyName: company.name,
    stage,
    workflow: r.workflow,
    sections,
    documents,
    infoRequest: info ? { ...info, docIds: documents.filter((d) => d.requested).map((d) => d.id) } : null,
    decision: stage === 'decided' ? decisionFor(r, review) : null,
    submittedOn: r.submittedOn,
    lastSaved: tracking ? tracking.lastSaved : null,
    ...(tracking ? { percent: tracking.percent } : {}),
  };
}

/** Requests with a portal, for the sandbox's record picker: { value, label }. */
export function portalOptions() {
  return Object.keys(requestById).filter((id) => STAGE[requestById[id].workflow])
    .map((id) => ({ value: id, label: `${id.toUpperCase()} · ${companyById[requestById[id].company].name}` }));
}

/**
 * Submission readiness for any portal (decision 2026-10-09: substantive failures are flagged, not blocking).
 * Open: as ./portal.js `readiness`. Info: only what the reviewer asked for blocks Send response. Submitted / decided:
 * nothing to submit.
 */
export function readinessFor(portal) {
  const blocking = [];
  const flagged = [];
  const pending = [];
  if (portal.stage === 'info') {
    for (const d of portal.documents.filter((x) => x.requested)) {
      if (!d.status || ['rejected', 'expired', 'failed'].includes(d.status)) blocking.push({ kind: 'document', id: d.id, label: d.label, reason: d.status ? d.message : 'Requested; not uploaded yet' });
    }
    return { blocking, flagged, pending, canSubmit: blocking.length === 0 };
  }
  if (portal.stage !== 'open') return { blocking, flagged, pending, canSubmit: false };
  for (const d of portal.documents) {
    if (!d.required) continue;
    const uploaded = d.files ? d.files.length : d.file ? 1 : 0;
    if (d.status === null) blocking.push({ kind: 'document', id: d.id, label: d.label, reason: 'Not uploaded' });
    else if (d.status === 'rejected') blocking.push({ kind: 'document', id: d.id, label: d.label, reason: d.message });
    else if (d.count && uploaded < d.count) blocking.push({ kind: 'document', id: d.id, label: d.label, reason: `${d.count - uploaded} of ${d.count} missing` });
    else if (d.status === 'failed') flagged.push({ kind: 'document', id: d.id, label: d.label, reason: d.message });
    else if (d.status === 'processing' || d.status === 'needs-review') pending.push({ kind: 'document', id: d.id, label: d.label, reason: d.message });
  }
  for (const s of portal.sections) {
    if (s.id === 'documents' || s.id === 'review') continue;
    if (s.state === 'not-started') blocking.push({ kind: 'section', id: s.id, label: s.label, reason: 'Not started' });
    if (s.state === 'in-progress') blocking.push({ kind: 'section', id: s.id, label: s.label, reason: s.progress || 'Incomplete' });
    for (const f of s.fields) if (f.mismatch) flagged.push({ kind: 'field', id: `${s.id}.${f.id}`, label: `${s.label} › ${f.label}`, reason: f.mismatch });
  }
  return { blocking, flagged, pending, canSubmit: blocking.length === 0 };
}

/** Completion: sections entered over sections that count (100 once submitted). */
export function completionFor(portal) {
  if (portal.stage !== 'open') return 100;
  if (portal.percent !== undefined) return portal.percent;
  const counted = portal.sections.filter((s) => s.id !== 'documents' && s.id !== 'review');
  const done = counted.filter((s) => s.state === 'complete' || s.state === 'needs-attention').length;
  return Math.round((done / counted.length) * 100);
}
