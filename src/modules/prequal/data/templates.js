// PLACEHOLDER DATA — requirement templates (Configure › Templates, screens 9 and 10, 2026-10-12). A template is the
// GC's reusable rule set for a trade group and project-size band (PRD §12 `prequal_template`): sections and fields,
// documents, thresholds, checks, weights, bands and knockouts. docs/prequal/templates-plan.md.
//
// Record shape (what the list shows and the session stores):
//   { id, status: 'draft' | 'active' | 'archived', version, published: def | null, draft: def | null,
//     updatedOn, updatedBy, publishedOn, archivedOn, archivedNote, versions: [{ version, on, by, note }] }
// Editing an Active template works on `draft` (the next version); Publish moves it to `published` and bumps the
// version; requests keep the version they were created with (PRD UX l. 1007). A never-published template is a Draft
// whose definition is `draft`.
//
// Definition shape (`def`, built from a Linarc baseline, ./templateCatalog.js):
//   { name, baseline, trades, csi, sizeBands, projectTypes, validityMonths,
//     sections: [{ id, label, score, mode, fields: [{ id, label, type, custom, mode, evidence, score, threshold, minimum, unit, options, help }] }],
//     documents: [{ id, label, group, custom, mode, requirements, expiry, count }],
//     thresholds: [{ id, label, section, rule, comparator, value, unit }],
//     checks: [id], checkRuns: { id: when }, checkVisibility: { id: who },
//     weights: { safety: 25, … }, bands: { accept, review }, knockouts: [id], billingAcknowledged }
//
// The shared `templates` name map (./index.js) is kept in step with the records here (`syncNames`), so every other
// screen keeps reading `templates[id]` unchanged.
import Vue from 'vue';
import { TODAY, requests, templates } from './index';
import { session, persistSession } from './session';
import { TEMPLATE } from '../status';
import {
  SECTION_CATALOG, DOCUMENT_CATALOG, THRESHOLD_CATALOG, WEIGHT_SECTIONS, DEFAULT_BANDS, BASELINES, baselineById, CHECK_DEFAULTS, thresholdText,
} from './templateCatalog';
import { pillars } from './portal';

/** The GC Prequal Admin persona (PRD §3): the person who edits templates. The top nav's Alex Morgan is an estimator. */
export const ADMIN = 'Sam Whitaker';

const clone = (o) => JSON.parse(JSON.stringify(o));

/** The portal's navigation groups a section can sit under (./portal.js pillars), for custom sections. */
export const PILLAR_OPTIONS = pillars.map((pl) => ({ label: pl.label, value: pl.id }));

/** A section of the admin's own (user request 2026-10-12): title, the nav group it sits under, its fields and groups. */
export function newCustomSection() {
  return { id: `custom-${Date.now().toString(36)}`, label: 'New section', custom: true, pillar: 'closing', mode: 'required', score: 'review', fields: [], groups: [] };
}

/**
 * The portal's pillars for a template: the standard ones with the template's custom sections inserted under the nav
 * group each names (before Documents in the closing group). Sections switched off are left out.
 */
export function pillarsFor(def) {
  const base = pillars.map((pl) => ({ ...pl, sections: [...pl.sections] }));
  if (!def) return base;
  for (const sec of def.sections) {
    if (!sec.custom || sec.mode === 'off') continue;
    const pl = base.find((x) => x.id === (sec.pillar || 'closing')) || base[base.length - 1];
    const at = pl.sections.indexOf('documents');
    if (at >= 0) pl.sections.splice(at, 0, sec.id); else pl.sections.push(sec.id);
  }
  return base;
}
const OPTIONAL_DOCS = ['bank-letter', 'diversity-cert', 'loc-letter', 'resumes'];

/** A definition from a Linarc baseline (PRD UX l. 858–861), with the catalog's defaults for everything else. */
export function definitionFromBaseline(baselineId, { name = '', trades = [], sizeBands = [], projectTypes = null } = {}) {
  const b = baselineById[baselineId] || BASELINES[0];
  const on = new Set(b.fieldsOn || []);
  const sections = SECTION_CATALOG.map((s) => ({
    id: s.id,
    label: s.label,
    score: s.score,
    mode: b.sections.includes(s.id) ? 'required' : s.id === 'site-security' ? 'off' : 'optional',
    fields: s.fields.map((f) => ({
      id: f.id, label: f.label, type: f.type, custom: false,
      mode: on.has(`${s.id}.${f.id}`) ? 'required' : f.mode,
      evidence: f.evidence || null, score: f.score || s.score, threshold: f.threshold || null,
      minimum: f.minimum || null, unit: f.unit || null, options: f.options || null, help: '',
    })),
  }));
  const documents = DOCUMENT_CATALOG.map((d) => ({
    id: d.id, label: d.label, group: d.group, custom: false,
    mode: b.documents.includes(d.id) ? 'required' : OPTIONAL_DOCS.includes(d.id) ? 'optional' : 'off',
    requirements: [...d.requirements], expiry: d.expiry, count: d.count || null,
  }));
  const thresholds = THRESHOLD_CATALOG.map((t) => ({ id: t.id, label: t.label, section: t.section, rule: t.rule, comparator: t.comparator, unit: t.unit, value: b.thresholds[t.id] !== undefined ? b.thresholds[t.id] : t.value }));
  return {
    name, baseline: b.id, trades: [...trades], csi: csiOf(trades), sizeBands: [...sizeBands], projectTypes: [...(projectTypes || b.projectTypes || ['private'])], validityMonths: b.validityMonths,
    sections, documents, thresholds,
    checks: [...b.checks],
    checkRuns: Object.fromEntries(Object.entries(CHECK_DEFAULTS).map(([k, v]) => [k, v.runs])),
    checkVisibility: Object.fromEntries(Object.entries(CHECK_DEFAULTS).map(([k, v]) => [k, v.visible])),
    weights: Object.fromEntries(WEIGHT_SECTIONS.map((w) => [w.id, w.default])),
    bands: { ...DEFAULT_BANDS },
    knockouts: [...b.knockouts],
    billingAcknowledged: false,
  };
}

/** CSI divisions from trade labels ("26 Electrical" → "26"). */
export const csiOf = (trades) => [...new Set((trades || []).map((t) => (String(t).match(/^\d+/) || [])[0]).filter(Boolean))];

// ——— Helpers to adjust a definition when defining the mock templates ——————————————————————————————————————
const setThresholds = (def, values) => { def.thresholds.forEach((t) => { if (values[t.id] !== undefined) t.value = values[t.id]; }); return def; };
const addField = (def, sectionId, field) => { def.sections.find((s) => s.id === sectionId).fields.push({ custom: true, mode: 'required', evidence: null, threshold: null, minimum: null, unit: null, options: null, help: '', ...field }); return def; };
const addDocument = (def, doc) => { def.documents.push({ custom: true, mode: 'required', requirements: [], expiry: 'None', count: null, ...doc }); return def; };
const docMode = (def, id, mode) => { const d = def.documents.find((x) => x.id === id); if (d) d.mode = mode; return def; };

const HIGH_RISK_TRADES = { elec: ['26 Electrical', '27 Communications', '28 Fire alarm'], mech: ['23 HVAC', '22 Plumbing'] };
const STANDARD_TRADES = ['02 Demolition', '04 Masonry', '05 Metals', '06 Wood and millwork', '07 Thermal and moisture protection', '08 Openings', '09 Finishes', '14 Conveying', '21 Fire Suppression', '31 Earthwork', '32 Exterior improvements'];
const PW_TRADES = ['02 Demolition', '03 Concrete', '04 Masonry', '05 Metals', '07 Thermal and moisture protection', '09 Finishes', '22 Plumbing', '23 HVAC', '26 Electrical', '31 Earthwork', '32 Exterior improvements'];
const HC_TRADES = ['09 Finishes', '21 Fire Suppression', '22 Plumbing', '23 HVAC', '26 Electrical', '27 Communications'];

const rec = (id, status, version, def, { updatedOn, updatedBy = ADMIN, versions = [], archivedOn = null, archivedNote = null }) => {
  // A published template acknowledged its paid checks when it was published.
  if (status !== 'draft') def.billingAcknowledged = true;
  return {
    id, status, version,
    published: status === 'draft' ? null : def,
    draft: status === 'draft' ? def : null,
    updatedOn, updatedBy, publishedOn: versions.length ? versions[versions.length - 1].on : null, archivedOn, archivedNote, versions,
  };
};

/** The GC's templates at the start of the demo: the six every request names, plus a draft and an archived one. */
const STATIC = [
  rec('elec-md', 'active', 3,
    addField(setThresholds(definitionFromBaseline('high-risk', { name: 'Electrical — Medium Projects', trades: HIGH_RISK_TRADES.elec, sizeBands: ['$1M – $5M', '$5M – $20M'], projectTypes: ['private', 'public'] }), { glAggregate: 4000000, umbrella: 5000000, bondingSingle: 2000000, bondingAggregate: 5000000 }),
      'safety', { id: 'arcFlash', label: 'Arc-flash safety program (NFPA 70E)', type: 'yesno', score: 'safety', help: 'Required for energised work on our sites.' }),
    { updatedOn: '2026-08-12', versions: [{ version: 1, on: '2025-03-04', by: ADMIN, note: 'First version' }, { version: 2, on: '2025-11-18', by: ADMIN, note: 'Umbrella raised to $5M' }, { version: 3, on: '2026-08-12', by: ADMIN, note: 'Arc-flash program added; EMR target 0.80' }] }),
  rec('mech-lg', 'active', 2,
    addField(setThresholds(definitionFromBaseline('high-risk', { name: 'Mechanical — Large Projects', trades: HIGH_RISK_TRADES.mech, sizeBands: ['$5M – $20M', 'Over $20M'], projectTypes: ['private', 'public'] }), { glAggregate: 4000000, umbrella: 5000000, bondingSingle: 3000000, bondingAggregate: 8000000, workingCapital: 1000000 }),
      'financial', { id: 'designBuild', label: 'Design-build capability in house', type: 'yesno', mode: 'optional', score: 'review' }),
    { updatedOn: '2026-06-30', versions: [{ version: 1, on: '2025-05-02', by: ADMIN, note: 'First version' }, { version: 2, on: '2026-06-30', by: ADMIN, note: 'Bonding $3M / $8M; design-build question' }] }),
  rec('conc-md', 'active', 1,
    setThresholds(definitionFromBaseline('high-risk', { name: 'Concrete — Medium Projects', trades: ['03 Concrete'], sizeBands: ['$1M – $5M', '$5M – $20M'], projectTypes: ['private', 'public'] }), { umbrella: 2000000, bondingSingle: 1500000, bondingAggregate: 3000000 }),
    { updatedOn: '2026-02-10', versions: [{ version: 1, on: '2026-02-10', by: ADMIN, note: 'First version' }] }),
  rec('std-sp', 'active', 4,
    addDocument(definitionFromBaseline('standard', { name: 'Standard Specialty Trade', trades: STANDARD_TRADES, sizeBands: ['Under $1M', '$1M – $5M'], projectTypes: ['private'] }),
      { id: 'gc-questionnaire', label: 'Harborview subcontractor questionnaire', group: 'Custom', requirements: ['All questions answered', 'Signed by an officer'], expiry: 'Annual' }),
    { updatedOn: '2026-09-02', versions: [{ version: 1, on: '2025-02-11', by: ADMIN, note: 'First version' }, { version: 2, on: '2025-07-30', by: ADMIN, note: 'OSHA 300A, 3 years' }, { version: 3, on: '2026-01-15', by: ADMIN, note: 'Business credit report added' }, { version: 4, on: '2026-09-02', by: ADMIN, note: 'Harborview questionnaire added' }] }),
  rec('pw-md', 'active', 2,
    addField(setThresholds(definitionFromBaseline('public-works', { name: 'Public Works — Medium Projects', trades: PW_TRADES, sizeBands: ['$1M – $5M', '$5M – $20M'] }), { umbrella: 5000000 }),
      'licensing', { id: 'payrollSoftware', label: 'Certified payroll software', type: 'select', options: ['LCPtracker', 'eMars', 'Elation', 'Other'], score: 'review', help: 'The system you submit certified payroll through.' }),
    { updatedOn: '2026-05-20', versions: [{ version: 1, on: '2025-04-08', by: ADMIN, note: 'First version' }, { version: 2, on: '2026-05-20', by: ADMIN, note: 'Certified payroll software question' }] }),
  rec('hc-sp', 'active', 1,
    addField(addDocument(docMode(setThresholds(definitionFromBaseline('healthcare', { name: 'Healthcare Specialty', trades: HC_TRADES, sizeBands: ['Under $1M', '$1M – $5M'] }), { umbrella: 5000000, bondingSingle: 1300000, bondingAggregate: 2600000 }), 'diversity-cert', 'optional'),
      { id: 'gc-questionnaire', label: 'Harborview safety questionnaire', group: 'Custom', requirements: ['All questions answered'], expiry: 'None' }),
      'experience', { id: 'icraStaff', label: 'ICRA-trained staff', type: 'number', mode: 'optional', score: 'experience', help: 'People holding a current infection-control (ICRA) certificate.' }),
    { updatedOn: '2026-03-18', versions: [{ version: 1, on: '2026-03-18', by: ADMIN, note: 'First version' }] }),
  rec('fed-secure', 'draft', 1,
    (() => { const d = definitionFromBaseline('federal', { name: 'Federal / Secure Facility', trades: HIGH_RISK_TRADES.elec, sizeBands: ['$1M – $5M'] }); d.weights = { safety: 25, financial: 20, experience: 20, capacity: 10, insurance: 10, legal: 10 }; return d; })(),
    { updatedOn: '2026-10-06' }),
  rec('conc-sm', 'archived', 1,
    definitionFromBaseline('standard', { name: 'Concrete — Small Projects', trades: ['03 Concrete'], sizeBands: ['Under $1M'], projectTypes: ['private'] }),
    { updatedOn: '2026-06-01', versions: [{ version: 1, on: '2025-02-11', by: ADMIN, note: 'First version' }], archivedOn: '2026-06-01', archivedNote: 'Merged into Standard Specialty Trade v4' }),
];
const staticById = Object.fromEntries(STATIC.map((r) => [r.id, r]));

// ——— Records (static + session overlay) ——————————————————————————————————————————————————————————————————————

/** Every template record, the session's version of a record winning; templates created in the session last. */
export function templateRecords() {
  const fromSession = session.templates || {};
  const base = STATIC.map((r) => fromSession[r.id] || r);
  const added = Object.values(fromSession).filter((r) => !staticById[r.id]).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  return [...base, ...added];
}
export const templateById = (id) => templateRecords().find((r) => r.id === id) || null;

/** The definition the module uses: the published one, or the draft of a never-published template. */
export const currentDefinition = (r) => r.published || r.draft;
/** "Electrical — Medium Projects v3" */
export const displayName = (r) => `${currentDefinition(r).name || 'Untitled template'} v${r.version}`;
/** Version of the draft being edited (the next one for an active template). */
export const draftVersion = (r) => (r.published ? r.version + 1 : r.version);

/** Keep ./index.js's `templates` name map in step (active and archived; drafts aren't offered to requests). */
function syncNames() {
  for (const r of templateRecords()) {
    if (r.status !== 'draft' || requests.some((q) => q.template === r.id)) Vue.set(templates, r.id, displayName(r));
  }
}
syncNames();

/** Requests on a template: active (not decided) and all. */
export function usageOf(id) {
  const mine = requests.filter((r) => r.template === id);
  return { active: mine.filter((r) => r.workflow !== 'closed').length, total: mine.length };
}

// ——— Derived facts for the list, the builder and the publish step ————————————————————————————————————————————

export function summaryOf(def) {
  const docs = def.documents.filter((d) => d.mode !== 'off');
  return {
    sectionsRequired: def.sections.filter((s) => s.mode === 'required').length,
    sectionsOn: def.sections.filter((s) => s.mode !== 'off').length,
    fieldsOn: def.sections.filter((s) => s.mode !== 'off').reduce((n, s) => n + s.fields.filter((x) => x.mode !== 'off').length, 0),
    customFields: def.sections.reduce((n, s) => n + s.fields.filter((x) => x.custom && x.mode !== 'off').length, 0),
    customSections: def.sections.filter((s) => s.custom && s.mode !== 'off').length,
    documentsRequired: docs.filter((d) => d.mode === 'required').length,
    documentsOptional: docs.filter((d) => d.mode === 'optional').length,
    customDocuments: docs.filter((d) => d.custom).length,
    checks: def.checks.length,
    paidChecks: def.checks.filter((c) => ['credit', 'litigation'].includes(c)).length,
    knockouts: def.knockouts.length,
    weightTotal: Object.values(def.weights).reduce((a, b) => a + (Number(b) || 0), 0),
  };
}

/** What stops a template from being published, or should be looked at first (PRD UX l. 999–1003). `blocking` or not. */
export function warningsFor(def) {
  const out = [];
  const s = summaryOf(def);
  if (!def.name || !def.name.trim()) out.push({ id: 'name', step: 'basics', blocking: true, text: 'The template has no name.' });
  if (!def.trades.length) out.push({ id: 'trades', step: 'basics', blocking: true, text: 'No trade group is selected, so no request can match this template.' });
  if (!def.sizeBands.length) out.push({ id: 'size', step: 'basics', blocking: false, text: 'No project size is selected; the template will match any size.' });
  if (s.weightTotal !== 100) out.push({ id: 'weights', step: 'scoring', blocking: true, text: `Scoring weights add up to ${s.weightTotal}%, not 100%.` });
  if (def.bands.review >= def.bands.accept) out.push({ id: 'bands', step: 'scoring', blocking: true, text: 'The Review band must start below the Accept band.' });
  for (const sec of def.sections) {
    if (sec.mode === 'off') continue;
    if (sec.custom && !(sec.label || '').trim()) out.push({ id: `title-${sec.id}`, step: 'requirements', blocking: true, text: 'A custom section has no title.' });
    if (!sec.fields.some((x) => x.mode !== 'off')) out.push({ id: `empty-${sec.id}`, step: 'requirements', blocking: true, text: `${sec.label || 'A custom section'} is ${sec.mode} but has no fields.` });
    for (const g of sec.groups || []) if (!(g.label || '').trim()) out.push({ id: `group-${sec.id}-${g.id}`, step: 'requirements', blocking: false, text: `A group in ${sec.label} has no title.` });
    for (const x of sec.fields) {
      if (x.custom && x.mode !== 'off' && ['select', 'multiselect'].includes(x.type) && !(x.options && x.options.length)) out.push({ id: `opts-${sec.id}-${x.id}`, step: 'requirements', blocking: true, text: `“${x.label}” (${sec.label}) is a select with no options.` });
      if (x.mode !== 'off' && x.evidence && !def.documents.some((d) => d.id === x.evidence && d.mode !== 'off')) out.push({ id: `ev-${sec.id}-${x.id}`, step: 'requirements', blocking: false, text: `“${x.label}” (${sec.label}) asks for a document that is not requested: ${(def.documents.find((d) => d.id === x.evidence) || { label: x.evidence }).label}.` });
    }
  }
  if (!s.documentsRequired) out.push({ id: 'docs', step: 'requirements', blocking: false, text: 'No document is required.' });
  if (!def.checks.length) out.push({ id: 'checks', step: 'checks', blocking: false, text: 'No independent check runs; every value will stay Declared.' });
  if (s.paidChecks && !def.billingAcknowledged) out.push({ id: 'billing', step: 'publish', blocking: true, text: 'Paid checks are selected; acknowledge the billing policy below before publishing.' });
  // What blocks publishing first.
  return out.sort((a, b) => Number(b.blocking) - Number(a.blocking));
}

const fmt = (moment, iso) => (iso ? moment(iso).format('D MMM YYYY') : '—');

/** Rows for the Templates list (screen 9), with the display fields the grid sorts and filters on. */
export function templateRows(moment) {
  return templateRecords().map((r) => {
    const def = currentDefinition(r);
    const s = summaryOf(def);
    const use = usageOf(r.id);
    const status = TEMPLATE[r.status];
    return {
      id: r.id,
      name: def.name || 'Untitled template',
      // The published version, and the next one when a draft of it is in progress.
      versionText: r.published && r.draft ? `v${r.version} · v${r.version + 1} draft` : `v${r.version}`,
      status,
      statusLabel: status.label,
      trades: def.trades,
      tradesText: def.trades.length > 3 ? `${def.trades.slice(0, 2).map(short).join(', ')} +${def.trades.length - 2}` : def.trades.map(short).join(', ') || '—',
      sizeText: def.sizeBands.join(' · ') || 'Any',
      projectTypes: def.projectTypes,
      projectTypesText: def.projectTypes.map((p) => ({ private: 'Private', public: 'Public', federal: 'Federal', 'prevailing-wage': 'Prevailing wage', 'site-security': 'Site security' }[p] || p)).join(' · '),
      documentsRequired: s.documentsRequired,
      documentsText: `${s.documentsRequired} required${s.documentsOptional ? ` · ${s.documentsOptional} optional` : ''}`,
      checksText: `${s.checks}${s.paidChecks ? ` · ${s.paidChecks} paid` : ''}`,
      knockouts: s.knockouts,
      usedBy: use.active,
      usedByText: use.active ? `${use.active} active${use.total > use.active ? ` · ${use.total} all time` : ''}` : use.total ? `${use.total} all time` : 'None',
      updatedOn: r.updatedOn,
      updatedText: `${fmt(moment, r.updatedOn)} · ${r.updatedBy}`,
      archivedNote: r.archivedNote,
    };
  });
}
const short = (t) => String(t).replace(/^\d+\s*/, '');

/** Sandbox record picker options (App.vue): `elec-md · Electrical — Medium Projects v3 · Active`. */
export function templateOptions() {
  return templateRecords().map((r) => ({ value: r.id, label: `${displayName(r)} · ${TEMPLATE[r.status].label}` }));
}

// ——— Actions (the demo session, D-29) ——————————————————————————————————————————————————————————————————————————

function store(record) {
  Vue.set(session.templates, record.id, clone(record));
  syncNames();
  persistSession();
  return session.templates[record.id];
}

/** Templates list › New template. Returns the new id; the builder opens it on Basics. */
export function createTemplate(baselineId = 'standard') {
  const id = `tpl-${Date.now().toString(36)}`;
  const def = definitionFromBaseline(baselineId);
  store({ id, status: 'draft', version: 1, published: null, draft: def, updatedOn: TODAY, updatedBy: ADMIN, publishedOn: null, archivedOn: null, archivedNote: null, versions: [], createdAt: new Date().toISOString() });
  return id;
}

/** The definition the builder edits: the draft, or a copy of the published definition (not stored until saved). */
export function draftOf(id) {
  const r = templateById(id);
  if (!r) return null;
  return clone(r.draft || r.published);
}

/** Builder › Save draft (and before Publish). */
export function saveDraft(id, def) {
  const r = clone(templateById(id));
  r.draft = clone(def);
  r.updatedOn = TODAY;
  r.updatedBy = ADMIN;
  store(r);
}

/** Builder › Discard the draft of an active template (back to the published version). */
export function discardDraft(id) {
  const r = clone(templateById(id));
  if (!r.published) return;
  r.draft = null;
  store(r);
}

/** Builder › Publish: the draft becomes the current version. Returns the new version number. */
export function publishTemplate(id, def, note = '') {
  const r = clone(templateById(id));
  const version = r.published ? r.version + 1 : r.version;
  r.published = clone(def);
  r.draft = null;
  r.version = version;
  r.status = 'active';
  r.updatedOn = TODAY;
  r.updatedBy = ADMIN;
  r.publishedOn = TODAY;
  r.archivedOn = null;
  r.archivedNote = null;
  r.versions = [...(r.versions || []), { version, on: TODAY, by: ADMIN, note: note || (version === 1 ? 'First version' : 'Published') }];
  store(r);
  return version;
}

/** Templates list / builder › Archive: kept for the requests that used it; not offered to new ones (plan T5). */
export function archiveTemplate(id, note = '') {
  const r = clone(templateById(id));
  r.status = 'archived';
  r.archivedOn = TODAY;
  r.archivedNote = note || null;
  r.updatedOn = TODAY;
  r.updatedBy = ADMIN;
  store(r);
}

/** Templates list › Restore an archived template (Active again at the same version). */
export function restoreTemplate(id) {
  const r = clone(templateById(id));
  r.status = r.published ? 'active' : 'draft';
  r.archivedOn = null;
  r.archivedNote = null;
  r.updatedOn = TODAY;
  r.updatedBy = ADMIN;
  store(r);
}

/** Templates list / builder › Duplicate: a new draft from the current definition. Returns the new id. */
export function duplicateTemplate(id) {
  const src = templateById(id);
  const def = clone(currentDefinition(src));
  def.name = `${def.name} (copy)`;
  const newId = `tpl-${Date.now().toString(36)}`;
  store({ id: newId, status: 'draft', version: 1, published: null, draft: def, updatedOn: TODAY, updatedBy: ADMIN, publishedOn: null, archivedOn: null, archivedNote: null, versions: [], createdAt: new Date().toISOString(), copiedFrom: id });
  return newId;
}

// ——— Wiring the module to the definitions (2026-10-12, plan order step 5) ————————————————————————————————————————

/** The definition a request on this template follows: the published one (a draft's own for a never-published one). */
export function definitionFor(templateId) {
  const r = templateById(templateId);
  return r ? currentDefinition(r) : null;
}
/** The definition the builder is editing (the draft, if any): what Preview as subcontractor shows. */
export function editingDefinitionFor(templateId) {
  const r = templateById(templateId);
  return r ? r.draft || r.published : null;
}

/** Templates a new request can pick: Active ones, as select options. */
export function activeTemplateOptions() {
  return templateRecords().filter((r) => r.status === 'active').map((r) => ({ value: r.id, label: displayName(r) }));
}

/** A threshold's value on a template (e.g. the umbrella limit), or undefined. */
export function thresholdValueFor(templateId, thresholdId) {
  const def = definitionFor(templateId);
  const t = def && def.thresholds.find((x) => x.id === thresholdId);
  return t ? t.value : undefined;
}

/**
 * Wizard › the template for a work context (PRD UX l. 1118–1135): active templates whose trades overlap the work's;
 * a template for secure sites, federal or prevailing-wage work only when the work says so; size band and project
 * types add to the score. Returns { id, reasons } or null ("No matching template", never a silent default).
 * `work`: { trades, sizeBand, ownership, publicWorks ('yes' | 'no'), siteSecurity ('yes' | 'no') }.
 */
export function matchTemplate(work) {
  const trades = new Set(work.trades || []);
  let best = null;
  for (const r of templateRecords()) {
    if (r.status !== 'active') continue;
    const def = r.published;
    const overlap = def.trades.filter((t) => trades.has(t));
    if (!overlap.length) continue;
    const types = def.projectTypes;
    if (types.includes('site-security') && work.siteSecurity !== 'yes') continue;
    if (types.includes('federal') && work.ownership !== 'federal') continue;
    if (types.includes('prevailing-wage') && work.publicWorks !== 'yes') continue;
    let score = overlap.length;
    const reasons = [overlap.join(', ')];
    if (work.sizeBand && def.sizeBands.includes(work.sizeBand)) { score += 2; reasons.push(work.sizeBand); } else if (!def.sizeBands.length) score += 1;
    if (work.publicWorks === 'yes' && types.includes('prevailing-wage')) { score += 3; reasons.push('Public works'); }
    if (work.ownership === 'federal' && types.includes('federal')) { score += 3; reasons.push('Federal owner'); }
    if (work.siteSecurity === 'yes' && types.includes('site-security')) { score += 2; reasons.push('Site security'); }
    if (work.ownership && types.includes(work.ownership)) { score += 1; if (work.ownership !== 'federal') reasons.push(work.ownership === 'private' ? 'Private owner' : 'Public owner'); }
    if (!best || score > best.score) best = { id: r.id, score, reasons };
  }
  return best ? { id: best.id, reasons: best.reasons } : null;
}

/**
 * What a subcontractor is asked for on a template, by portal pillar: [{ pillar, items: [{ label, optional, detail }] }].
 * Shared by the builder's Review & publish and the wizard's Requirements & checks.
 */
export function checklistOf(def) {
  const byId = Object.fromEntries(def.sections.map((s) => [s.id, s]));
  const thresholds = Object.fromEntries(def.thresholds.map((t) => [t.id, t]));
  const docs = Object.fromEntries(def.documents.map((d) => [d.id, d]));
  const groups = pillars
    .filter((p) => p.id !== 'closing')
    .map((p) => ({
      pillar: p.label,
      items: p.sections
        .map((id) => byId[id])
        .filter((s) => s && s.mode !== 'off')
        .map((s) => {
          const on = s.fields.filter((f) => f.mode !== 'off');
          const parts = [`${on.length} ${on.length === 1 ? 'field' : 'fields'}`];
          const mins = on.filter((f) => f.minimum).map((f) => `${f.minimum} ${f.unit || ''}`.trim());
          if (mins.length) parts.push(`minimum ${mins.join(', ')}`);
          const th = on.filter((f) => f.threshold && thresholds[f.threshold]).map((f) => `${thresholds[f.threshold].label} ${thresholdText(thresholds[f.threshold])}`);
          if (th.length) parts.push(th.slice(0, 2).join(' · '));
          const ev = [...new Set(on.map((f) => f.evidence).filter((e) => e && docs[e] && docs[e].mode !== 'off'))];
          if (ev.length) parts.push(`${ev.length} ${ev.length === 1 ? 'document' : 'documents'}`);
          const custom = on.filter((f) => f.custom);
          if (custom.length) parts.push(`custom: ${custom.map((f) => f.label).join(', ')}`);
          return { label: s.label, optional: s.mode === 'optional', detail: parts.join(' · ') };
        }),
    }))
    .filter((g) => g.items.length);
  const site = byId['site-security'];
  const extra = { pillar: 'Also', items: [] };
  if (site && site.mode !== 'off') extra.items.push({ label: 'Site security', optional: site.mode === 'optional', detail: `${site.fields.filter((f) => f.mode !== 'off').length} attestations` });
  const req = def.documents.filter((d) => d.mode === 'required');
  extra.items.push({ label: 'Documents', optional: false, detail: `${req.length} required: ${req.slice(0, 4).map((d) => d.label.replace(/\s*\(.*\)$/, '')).join(', ')}${req.length > 4 ? ` and ${req.length - 4} more` : ''}` });
  groups.push(extra);
  return groups;
}
