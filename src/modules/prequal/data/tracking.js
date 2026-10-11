// PLACEHOLDER DATA — the request tracking view (PRD UX l. 1186: "the request workspace with delivery state, completion
// progress, and check progress as separate indicators") for requests the subcontractor hasn't submitted yet: Not sent,
// Waiting for subcontractor, Subcontractor is completing requirements (req-008 … req-016 in ./index.js). The GC sees
// how far the sub has got, never the answers themselves. Section progress follows the portal's sections
// (./portal.js); req-008 (Northstar) is the portal prototype's own request, so its sections are the portal's states.
// Public-record checks run as soon as the invitation is sent; the rest wait for the submission. Today is 2026-10-08.
import { companyById, requestById } from './index';
import { pillars, sections as portalSections, portalRequest } from './portal';
import { projects } from './wizard';

const addDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const PROJECT = Object.fromEntries(projects.map((x) => [x.name, x]));

// invitedBy, invitedOn, opened (date the sub first opened the portal, or null), reminders, lastSaved, extra history.
const T = {
  'req-008': { invitedBy: 'Alex Morgan', invitedOn: '2026-10-01', opened: '2026-10-01', reminders: [], lastSaved: '2026-10-08T14:12:00', events: [['2026-10-08T14:12:00', 'Chris Baker', 'Saved progress (60%)'], ['2026-10-07T16:30:00', 'Chris Baker', 'Completed the Safety section'], ['2026-10-04T10:15:00', 'Chris Baker', 'Uploaded 9 documents']] },
  'req-009': { invitedBy: 'Sofia Ramirez', invitedOn: '2026-09-29', opened: '2026-09-30', reminders: [], lastSaved: '2026-10-06T11:40:00', events: [['2026-10-06T11:40:00', 'Jo Marsh', 'Completed the Company section (25%)']] },
  'req-010': { invitedBy: 'Marcus Hill', invitedOn: '2026-09-24', opened: '2026-09-24', reminders: ['2026-10-01'], lastSaved: '2026-10-08T09:05:00', events: [['2026-10-08T09:05:00', 'Luis Ortega', 'Uploaded financial statements (80%)'], ['2026-10-03T15:20:00', 'Luis Ortega', 'Completed the Safety and Insurance sections']] },
  'req-011': { invitedBy: 'Jordan Lee', invitedOn: '2026-10-01', opened: '2026-10-03', reminders: [], lastSaved: '2026-10-03T13:00:00', events: [['2026-10-03T13:00:00', 'Kim Dao', 'Opened the portal (10%)']], note: 'Re-application: the last request (REQ-023) was not approved because of a DIR debarment that ended on 30 Sep 2026.' },
  'req-012': { invitedBy: 'Marcus Hill', invitedOn: '2026-10-07', opened: null, reminders: [], lastSaved: null, events: [] },
  'req-013': { invitedBy: 'Sofia Ramirez', invitedOn: '2026-10-06', opened: '2026-10-07', reminders: [], lastSaved: null, events: [] },
  'req-014': { invitedBy: 'Alex Morgan', invitedOn: '2026-10-01', opened: null, reminders: ['2026-10-06'], lastSaved: null, events: [] },
  'req-015': { invitedBy: 'Alex Morgan', invitedOn: '2026-10-08', opened: null, reminders: [], lastSaved: null, events: [] },
  'req-016': { invitedBy: 'Marcus Hill', invitedOn: null, opened: null, reminders: [], lastSaved: null, events: [], draftSaved: '2026-10-08T10:20:00' },
};

const PERCENT = { 'req-008': 60, 'req-009': 25, 'req-010': 80, 'req-011': 10 };

const PUBLIC_CHECKS = [
  ['cslb', 'Contractor license', 'CSLB', 'Active'],
  ['sos', 'Entity standing', 'Secretary of State', 'Active, good standing'],
  ['sam', 'Federal exclusions', 'SAM.gov', 'No exclusions'],
  ['ofac', 'Sanctions', 'OFAC SDN', 'No match'],
  ['dir', 'State debarment', 'CA DIR', 'Not listed'],
];
const LATER_CHECKS = [
  ['osha', 'OSHA establishment search', 'OSHA'],
  ['emr', 'EMR confirmation', 'WCIRB'],
  ['tin', 'TIN matching', 'IRS'],
  ['credit', 'Business credit report', 'Dun & Bradstreet'],
  ['litigation', 'Litigation and lien search', 'Court records'],
  ['ref1', 'Reference 1', 'Outreach'],
  ['ref2', 'Reference 2', 'Outreach'],
  ['broker', 'Insurance broker confirmation', 'Broker'],
  ['surety', 'Bonding capacity confirmation', 'Surety'],
];

/** Checks n of m for the request: the first n public-record checks complete, the rest queued. */
function checksFor(r) {
  const pub = [...PUBLIC_CHECKS];
  if (r.template === 'pw-md') pub.push(['dirpw', 'Public works registration', 'CA DIR', 'Registered for the current fiscal year']);
  const [done, total] = r.checks;
  const all = [...pub.map(([id, label, source, result]) => ({ id, label, source, result })), ...LATER_CHECKS.map(([id, label, source]) => ({ id, label, source }))].slice(0, total);
  const sent = r.workflow !== 'draft';
  return all.map((k, i) => {
    if (i < done) return { ...k, status: 'complete', passed: true };
    if (i >= pub.length) return { ...k, status: 'queued', passed: null, result: 'Runs when the application is submitted' };
    return sent
      ? { ...k, status: 'running', passed: null, result: 'Started when the invitation was sent' }
      : { ...k, status: 'queued', passed: null, result: 'Runs when the invitation is sent' };
  });
}

/** The portal's sections (without Review & submit), with the sub's progress through them. */
function sectionsFor(r) {
  const project = PROJECT[r.project];
  const byId = Object.fromEntries(portalSections.map((s) => [s.id, s]));
  const order = pillars.flatMap((p) => p.sections.filter((id) => id !== 'review').map((id) => ({ id, pillar: p.label, label: byId[id].label })))
    .filter((s) => s.id !== 'site-security' || (project && project.siteSecurity));
  if (r.id === portalRequest.requestId) return order.map((s) => ({ ...s, state: byId[s.id].state }));
  const pct = PERCENT[r.id] || 0;
  const done = Math.round((pct / 100) * order.length);
  return order.map((s, i) => ({ ...s, state: i < done ? 'complete' : i === done && pct > 0 ? 'in-progress' : 'not-started' }));
}

/**
 * The tracking view for a request not yet submitted: { stage, recipient, invitedBy, invitedOn, dueOn, opened,
 * reminders, lastSaved, percent, sections, checks, history, note }. Null for any other request.
 */
export function trackingFor(requestId) {
  const r = requestById[requestId];
  const t = T[requestId];
  if (!r || !t) return null;
  const company = companyById[r.company];
  const history = [
    ...t.events,
    ...t.reminders.map((d) => [`${d}T08:00:00`, 'Linarc', `Sent a reminder to ${company.contact}`]),
    ...(t.opened ? [[`${t.opened}T12:00:00`, company.contact, 'Opened the invitation']] : []),
    ...(t.invitedOn ? [[`${t.invitedOn}T09:00:00`, t.invitedBy, `Sent the invitation to ${company.contact} (${company.email})`]] : []),
    ...(t.draftSaved ? [[t.draftSaved, t.invitedBy, 'Saved the request as a draft']] : []),
  ].sort((a, b) => b[0].localeCompare(a[0])).map(([at, actor, action]) => ({ at, actor, action }));
  return {
    stage: r.workflow,
    publicWorks: r.template === 'pw-md' || !!(PROJECT[r.project] && PROJECT[r.project].publicWorks),
    recipient: { name: company.contact, email: company.email },
    invitedBy: t.invitedBy,
    invitedOn: t.invitedOn,
    dueOn: t.invitedOn ? addDays(t.invitedOn, 14) : null,
    opened: t.opened,
    reminders: t.reminders,
    lastSaved: t.lastSaved,
    percent: r.id === portalRequest.requestId ? 60 : PERCENT[r.id] || 0,
    sections: sectionsFor(r),
    checks: checksFor(r),
    history,
    note: t.note || null,
  };
}
