// PLACEHOLDER BEHAVIOUR — the demo session: everything a person does in the prototypes that changes the module's
// state, so the whole workflow runs end to end (D-29):
//   wizard Send invite → a new request (Waiting for subcontractor)
//   portal answers / uploads → Subcontractor is completing requirements (tracking view follows the sections)
//   portal Submit → Ready for review, with a review built from the submission (data/submissionReview.js)
//   review opened by a reviewer → GC is reviewing
//   Request information → More information needed (portal: only those items) → Send response → GC is reviewing
//   Approve / Approve with conditions → Decided, a qualification record, Qualified Subs · Reject → Not approved
// The static mock data (./index.js and friends) is the starting point; this module patches the shared `requests`
// objects in place and adds new ones, so every screen that reads them (lists, KPIs, review, record, portal) sees the
// change on its next load. Kept in sessionStorage so a reload doesn't lose the demo; the sandbox's Reset demo data
// clears it. Imported by src/main.js before the app mounts.
import Vue from 'vue';
import { TODAY, companies, companyById, requests, requestById, reviewerById, templates } from './index';

const KEY = 'linarc-prototypes:prequal-session:v1';

const empty = () => ({
  created: [], // new requests from the wizard
  newCompanies: [], // companies added in the wizard
  patches: {}, // requestId → fields that changed on the request row
  answers: {}, // requestId → { values: { sectionId: values }, states: { sectionId: state }, savedAt }
  submissions: {}, // requestId → { at, ref, review }   (review = the generated dossier)
  decisions: {}, // requestId → { kind, by, on, trades, single, aggregate, validUntil, conditions, reason, message }
  infoRequests: {}, // requestId → { on, by, dueOn, items: [findingId], labels: [title], message }
  responses: {}, // requestId → { at }
  uploads: {}, // requestId → slotId → upload result (data/uploads.js)
  resolutions: {}, // requestId → findingId → { resolution, note, by, at }
  events: {}, // requestId → [{ at, actor, action }]   (history lines the session added)
  templates: {}, // templateId → the whole template record as saved in the builder (data/templates.js, 2026-10-12)
});

function read() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch (e) {
    return empty();
  }
}

/** The session state (reactive). Read it; change it only through the functions below. */
export const session = Vue.observable(read());

function persist() {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch (e) {
    // Storage full or blocked: the demo still runs, it just won't survive a reload.
  }
}
/** For modules that keep their own slice of the session (data/templates.js): write it after a change. */
export const persistSession = persist;

export function hasChanges() {
  return Object.values(session).some((v) => (Array.isArray(v) ? v.length : Object.keys(v).length));
}

/** Sandbox: back to the static mock data (reloads the page so every module starts clean). */
export function resetSession() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch (e) {
    /* ignore */
  }
  window.location.reload();
}

/** Now, on the mock's calendar: today's date (TODAY) with the real time of day. */
export const nowStamp = () => `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
const addDays = (iso, d) => {
  const x = new Date(`${iso}T00:00:00`);
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
};

function apply(id, patch) {
  const r = requestById[id];
  if (r) Object.assign(r, patch);
}

function patch(id, fields) {
  Vue.set(session.patches, id, { ...(session.patches[id] || {}), ...fields });
  apply(id, fields);
}

function addEvent(id, actor, action, at = nowStamp()) {
  Vue.set(session.events, id, [{ at, actor, action }, ...(session.events[id] || [])]);
}

// ——— Apply what the session holds to the shared mock data (once, at start) ——————————————————————————————————
for (const c of session.newCompanies) {
  if (!companyById[c.id]) {
    companies.push(c);
    companyById[c.id] = c;
  }
}
for (const r of session.created) {
  if (!requestById[r.id]) {
    requests.push({ ...r });
    requestById[r.id] = requests[requests.length - 1];
  }
}
for (const [id, p] of Object.entries(session.patches)) apply(id, p);

// ——— Actions ——————————————————————————————————————————————————————————————————————————————————————————————

/** A template preview's portal (`preview-<template id>`, data/portalRequests.js): never written to the session. */
export const isPreview = (id) => String(id).startsWith('preview-');

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Wizard › Send invite. Returns the new request id. */
export function createRequest({ companyId, newCompany, project, template, single, aggregate, totalChecks, invitedBy = 'Jordan Lee' }) {
  let company = companyById[companyId];
  if (!company) {
    const id = `${slug(newCompany.name)}-${Date.now().toString(36).slice(-4)}`;
    const trade = (newCompany.trade || 'Specialty').replace(/^\d+\s*/, '');
    company = { id, name: newCompany.name, trade, csi: (newCompany.trade || '').match(/^\d+/) ? newCompany.trade.match(/^\d+/)[0] : '00', state: 'CA', contact: newCompany.contact, email: newCompany.email };
    session.newCompanies.push(company);
    companies.push(company);
    companyById[company.id] = company;
  }
  const n = Math.max(...requests.map((r) => Number(r.id.split('-')[1]))) + 1;
  const id = `req-${String(n).padStart(3, '0')}`;
  const row = {
    id, company: company.id, project, template, workflow: 'invited', outcome: null, lifecycle: null,
    score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [0, totalChecks || 14],
    submittedOn: null, activity: [TODAY, 'Invitation sent'], reviewer: null, single, aggregate, validUntil: null,
    invitedOn: TODAY, invitedBy,
  };
  session.created.push(row);
  requests.push({ ...row });
  requestById[id] = requests[requests.length - 1];
  addEvent(id, invitedBy, `Sent the invitation to ${company.contact} (${templates[template]})`);
  persist();
  return id;
}

/** Portal › Save / Save and continue: the subcontractor's answers and section states. */
export function saveAnswers(id, { values, states, percent, lastSection }) {
  if (isPreview(id)) return; // Preview as subcontractor (Configure › Templates): nothing is saved or sent.
  const first = !session.answers[id];
  Vue.set(session.answers, id, { values, states, savedAt: nowStamp(), percent });
  const r = requestById[id];
  if (r && r.workflow === 'invited') {
    patch(id, { workflow: 'in-progress' });
    if (first) addEvent(id, companyById[r.company].contact, 'Opened the invitation and started the application');
  }
  if (r && ['invited', 'in-progress'].includes(r.workflow)) {
    patch(id, { activity: [TODAY, lastSection ? `${lastSection} section completed (${percent}%)` : `Saved progress (${percent}%)`] });
  }
  persist();
}

/** Portal › Submit application. `review` is the dossier built from the submission (data/submissionReview.js). */
export function submitApplication(id, { review, summary }) {
  const at = nowStamp();
  const ref = `PQ-${id.split('-')[1]}-${at.slice(11, 13)}${at.slice(14, 16)}`;
  Vue.set(session.submissions, id, { at, ref, review });
  const r = requestById[id];
  patch(id, { workflow: 'submitted', submittedOn: TODAY, activity: [TODAY, 'Submission received'], ...summary });
  addEvent(id, companyById[r.company].contact, 'Submitted the application', at);
  persist();
  return ref;
}

/** Review screen opened on a submitted request by a reviewer: GC is reviewing. */
export function startReview(id, reviewer = 'jordan') {
  const r = requestById[id];
  if (!r || r.workflow !== 'submitted') return false;
  patch(id, { workflow: 'under-review', reviewer: r.reviewer || reviewer, activity: [TODAY, 'Review started'] });
  addEvent(id, reviewerById[reviewer].name, 'Started review');
  persist();
  return true;
}

/** Evidence view › Override / Dismiss. */
export function resolveFinding(id, findingId, { resolution, note, title, by = 'Jordan Lee' }) {
  Vue.set(session.resolutions, id, { ...(session.resolutions[id] || {}), [findingId]: { resolution, note, title, by, at: nowStamp() } });
  addEvent(id, by, `${resolution === 'overridden' ? 'Overrode' : 'Dismissed'} a finding: ${note}`);
  persist();
}

/**
 * Decision panel › Confirm / Send request / Reject request.
 * kind: 'approve' | 'conditions' | 'request' | 'reject'
 */
export function decide(id, kind, payload) {
  const by = 'Jordan Lee';
  const at = nowStamp();
  const r = requestById[id];
  const company = companyById[r.company];
  if (kind === 'request') {
    const info = { at, on: TODAY, by, dueOn: addDays(TODAY, 7), items: payload.items, labels: payload.labels, message: payload.message };
    Vue.set(session.infoRequests, id, info);
    Vue.delete(session.responses, id);
    patch(id, { workflow: 'info-requested', activity: [TODAY, `Information requested: ${payload.labels.join(', ').toLowerCase()}`] });
    addEvent(id, by, `Requested information: ${payload.labels.join(', ')}`, at);
  } else if (kind === 'reject') {
    Vue.set(session.decisions, id, { kind, by, on: TODAY, reason: payload.reason, message: payload.message || `${company.name} has not been approved for this request.` });
    patch(id, { workflow: 'closed', outcome: 'not-qualified', lifecycle: null, validUntil: null, activity: [TODAY, `Not approved: ${payload.reason.toLowerCase()}`] });
    addEvent(id, by, `Not approved: ${payload.reason}. ${company.contact} was told the reason`, at);
  } else {
    const outcome = kind === 'conditions' ? 'qualified-with-conditions' : 'qualified';
    Vue.set(session.decisions, id, { kind, by, on: TODAY, trades: payload.trades, single: payload.single, aggregate: payload.aggregate, validUntil: payload.validUntil, conditions: payload.conditions || [] });
    patch(id, { workflow: 'closed', outcome, lifecycle: 'current', validUntil: payload.validUntil, single: payload.single, aggregate: payload.aggregate, activity: [TODAY, `${kind === 'conditions' ? 'Approved with conditions' : 'Approved'} by ${by}`] });
    addEvent(id, by, `${kind === 'conditions' ? 'Approved with conditions' : 'Approved'}: ${payload.trades.join(', ')} ${'$'}${(payload.single / 1e6).toFixed(1)}M / ${'$'}${(payload.aggregate / 1e6).toFixed(1)}M, valid until ${payload.validUntil}`, at);
  }
  persist();
}

/** Portal › Send response (to an information request): back with the reviewer. */
export function respond(id) {
  const at = nowStamp();
  Vue.set(session.responses, id, { at });
  const r = requestById[id];
  patch(id, { workflow: 'under-review', activity: [TODAY, 'Response received'] });
  addEvent(id, companyById[r.company].contact, 'Sent a response to the information request', at);
  persist();
  return at;
}

/** Portal upload results (data/uploads.js). */
export function recordUploadResult(id, slotId, result) {
  if (isPreview(id)) return;
  Vue.set(session.uploads, id, { ...(session.uploads[id] || {}), [slotId]: result });
  persist();
}

/** Session history lines for a request, newest first. */
export const eventsFor = (id) => session.events[id] || [];
