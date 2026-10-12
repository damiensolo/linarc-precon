// PLACEHOLDER BEHAVIOUR — the review a portal submission produces (screen 5 for a request submitted in the demo).
// Built from what the subcontractor actually entered and uploaded, in the same shape as ./review.js / ./dossiers.js:
//   findings  documents still Action needed / Needs review, values that disagree with their document, EMR above 1.00,
//             a declared debarment (knockout), litigation or defaults, negative working capital, bonding below the
//             requested single limit; informational: OSHA citations
//   checks    the template's checks: public-record checks complete, references, broker and surety still running
//   scores    section scores from a base per section minus the findings in it; overall = the spec's weights
// Returns { review, summary } where summary is the request-row fields (score, confidence, recommendation, …).
import { TODAY, companyById, templates } from './index';

const WEIGHTS = [['safety', 'Safety', 25], ['financial', 'Financial', 20], ['capability', 'Capability & experience', 20], ['capacity', 'Capacity', 15], ['insurance', 'Insurance & bonding', 10], ['legal', 'Legal & compliance', 10]];
const SLOT_TO_DOC = { coi: 'coi', 'ai-endorsement': 'ai', waiver: 'wos', emr: 'emr', osha300a: 'osha300a', financials: 'fin', bonding: 'bond', w9: 'w9', license: 'license' };
const SLOT_SECTION = { coi: 'insurance', 'ai-endorsement': 'insurance', waiver: 'insurance', pnc: 'insurance', umbrella: 'insurance', bonding: 'capacity', financials: 'financial', emr: 'safety', osha300a: 'safety', 'safety-program': 'safety', w9: 'legal', license: 'legal', 'business-license': 'legal', 'cert-cards': 'capability', 'gc-questionnaire': 'safety', 'drug-policy': 'legal', 'e-verify': 'legal' };
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(String(v).replace(/[^0-9.-]/g, '')));
const money = (n) => `$${Number(n).toLocaleString('en-US')}`;
const yes = (v) => v === 'yes' || v === true;
const lvl = (value, state, source, at, confidence) => ({ value, state, source, at, ...(confidence ? { confidence } : {}) });

/**
 * @param {{ request, portal, values, tracking, invitedBy, at }} args
 *   request: the request row · portal: portalFor(id) (documents, request header) · values: the portal's answers by
 *   section · tracking: trackingFor(id) (the check list) · at: submission time stamp
 */
export function buildSubmissionReview({ request, portal, values, tracking, invitedBy, at }) {
  const company = companyById[request.company];
  const v = Object.assign({}, ...Object.values(values));
  const findings = [];
  const add = (f) => findings.push({ resolution: 'unresolved', ...f });

  // Documents
  for (const d of portal.documents) {
    if (!d.status || !d.required) continue;
    const section = SLOT_SECTION[d.id] || 'legal';
    if (d.status === 'failed') {
      add({ id: `f-doc-${d.id}`, fix: `a corrected ${d.label.replace(/ \(.*\)$/, '').toLowerCase()}`, why: d.message, severity: 'missing', section, title: `${d.label}: action needed`, criterion: (d.requirements || []).join(' · '), impact: 'Required item failed: −8 points', proof: { declared: lvl('As entered in the portal', 'declared', `${d.label} section`, TODAY), evidenced: lvl(d.message, 'contradicted', `${d.label} upload`, TODAY, 92), verified: lvl(null, 'pending', 'Broker or issuer confirmation', TODAY) } });
    } else if (d.status === 'needs-review') {
      add({ id: `f-doc-${d.id}`, fix: `a clearer copy of the ${d.label.replace(/ \(.*\)$/, '').toLowerCase()}`, why: d.message, severity: 'finding', section, title: `${d.label} needs a reviewer`, criterion: (d.requirements || []).join(' · '), impact: 'Read with low confidence: −3 points', proof: { declared: lvl('Uploaded', 'declared', 'Documents', TODAY), evidenced: lvl(d.message, 'evidenced', `${d.label} upload`, TODAY, 61), verified: lvl('—', 'none', 'No independent source', null) } });
    }
  }
  // Values against thresholds and the documents
  const emr = Array.isArray(v.emr) && v.emr[0] ? num(v.emr[0].value) : null;
  if (emr && emr > 1) add({ id: 'f-field-safety-emr', fix: 'your current EMR ratesheet and a safety improvement plan', why: `EMR ${emr} is above 1.00.`, severity: 'missing', section: 'safety', title: 'EMR above the threshold', criterion: 'EMR ≤ 1.00 (current rating year)', impact: 'Required item failed: −8 points', proof: { declared: lvl(String(emr), 'declared', 'Safety section', TODAY), evidenced: lvl(String(emr), 'evidenced', 'EMR ratesheet', TODAY, 97), verified: lvl(null, 'pending', 'EMR confirmation (WCIRB)', TODAY) } });
  for (const s of portal.sections) for (const f of s.fields || []) {
    if (f.mismatch) add({ id: `f-field-${s.id}-${f.id}`, severity: 'finding', section: s.id === 'insurance' ? 'insurance' : s.id === 'financial' ? 'financial' : 'safety', title: `${f.label}: entry differs from the document`, criterion: 'Declared values match their documents', impact: 'The document value is used: −3 points', proof: { declared: lvl('As entered', 'contradicted', `${s.label} section`, TODAY), evidenced: lvl(f.mismatch, 'contradicted', 'Uploaded document', TODAY, 95), verified: lvl(null, 'pending', 'Independent check', TODAY) } });
  }
  if (yes(v.debarment)) add({ id: 'f-field-legal-debarment', severity: 'knockout', section: 'legal', title: 'Debarment or suspension declared', criterion: 'Not debarred or suspended by any agency', impact: 'Knockout: cannot be approved unless resolved', proof: { declared: lvl('Yes', 'contradicted', 'Legal section', TODAY), evidenced: lvl('—', 'none', 'No document', null), verified: lvl(null, 'pending', 'State debarment check', TODAY) } });
  if (yes(v.litigation) || yes(v.defaults)) add({ id: 'f-field-legal-claims', severity: 'finding', section: 'legal', title: 'Litigation, claims or defaults in the last 5 years', criterion: 'No unresolved claims or terminations for cause', impact: 'Needs the reviewer’s judgement: −4 points', proof: { declared: lvl('Yes', 'declared', 'Legal section', TODAY), evidenced: lvl('—', 'none', 'No document', null), verified: lvl(null, 'pending', 'Litigation and lien search', TODAY) } });
  const wc = num(v.currentAssets) !== null && num(v.currentLiabilities) !== null ? num(v.currentAssets) - num(v.currentLiabilities) : null;
  if (wc !== null && wc < request.aggregate * 0.1) add({ id: 'f-field-financial-wc', severity: 'finding', section: 'financial', title: 'Working capital is low for the requested aggregate', criterion: `Working capital ≥ 10% of the requested aggregate (${money(request.aggregate * 0.1)})`, impact: 'Financial concern: −5 points', proof: { declared: lvl(money(wc), 'declared', 'Financial section', TODAY), evidenced: lvl('Financial statements', 'evidenced', 'Financial statements upload', TODAY, 90), verified: lvl('—', 'none', 'No independent source', null) } });
  const single = num(v.bondingSingle);
  if (single !== null && single < request.single) add({ id: 'f-field-capacity-bonding', fix: 'a surety letter covering the requested single limit', why: `Bonding single limit ${money(single)} is below ${money(request.single)}.`, severity: 'missing', section: 'capacity', title: 'Bonding single limit below the request', criterion: `Bonding single ≥ requested single (${money(request.single)})`, impact: 'Required item failed: −8 points', proof: { declared: lvl(money(single), 'declared', 'Financial section', TODAY), evidenced: lvl('Surety bonding letter', 'evidenced', 'Bonding letter upload', TODAY, 93), verified: lvl(null, 'pending', 'Surety confirmation', TODAY) } });
  if (num(v.citations) > 0) add({ id: 'f-field-safety-osha', severity: 'info', section: 'safety', title: `${num(v.citations)} OSHA citation${num(v.citations) > 1 ? 's' : ''} in the last 5 years`, criterion: 'No serious or willful citations in 3 years', impact: 'Informational until the OSHA search confirms the type', proof: { declared: lvl(String(num(v.citations)), 'declared', 'Safety section', TODAY), evidenced: lvl('—', 'none', 'No document requested', null), verified: lvl(null, 'pending', 'OSHA establishment search', TODAY) } });

  // Checks: everything the template runs; outreach still out.
  const RUNNING = new Set(['ref1', 'ref2', 'broker', 'surety']);
  const checks = tracking.checks.map((k) => (RUNNING.has(k.id)
    ? { ...k, status: 'running', passed: null, result: 'Request sent today' }
    : { ...k, status: 'complete', passed: !(k.id === 'emr' && emr > 1), result: k.id === 'emr' && emr ? `${emr} (2026)` : k.result && !/Runs when|Started when/.test(k.result) ? k.result : 'No issues found' }));
  const complete = checks.filter((k) => k.status === 'complete').length;

  // Scores
  const sectionScores = WEIGHTS.map(([id, label, weight]) => {
    const mine = findings.filter((f) => f.section === id && f.severity !== 'info');
    const base = 90;
    const score = mine.some((f) => f.severity === 'knockout') ? 0 : Math.max(20, base - mine.reduce((a, f) => a + (f.severity === 'missing' ? 18 : 8), 0));
    return { id, label, weight, score, findings: mine.length };
  });
  const score = Math.round(sectionScores.reduce((a, s) => a + (s.score * s.weight) / 100, 0));
  const knockouts = findings.filter((f) => f.severity === 'knockout').length;
  const missing = findings.filter((f) => f.severity === 'missing').length;
  const open = findings.filter((f) => ['missing', 'finding'].includes(f.severity)).length;
  const recommendation = knockouts ? 'not-recommended' : score >= 80 && !missing ? 'accept' : 'review';
  const confidence = Math.min(85, 45 + complete * 3);

  const submissionRows = [
    { section: 'Company', rows: [['Legal name', v.legalName || company.name], ['Entity', [v.entityType, v.stateOfFormation, v.yearEstablished].filter(Boolean).join(', ')], ['Principals', (v.principals || []).map((p) => `${p.name} (${p.title})`).join(', ') || '—']] },
    { section: 'Licensing', rows: [['Contractor licenses', (v.licenses || []).map((l) => `${l.classifications} #${l.number}, ${l.state}`).join(' · ') || '—']] },
    { section: 'Safety', rows: [['EMR (last 3 years)', (v.emr || []).map((r) => r.value).join(' / ') || '—'], ['OSHA citations, last 5 years', String(v.citations ?? '—')], ['Fatalities, last 5 years', String(v.fatalities ?? '—')]] },
    { section: 'Insurance', rows: [['GL each occurrence / aggregate', `${v.glOccurrence || '—'} / ${v.glAggregate || '—'}`], ['Umbrella', v.umbrella || '—'], ['Broker', v.broker || '—']] },
    { section: 'Financial', rows: [['Revenue (latest year)', v.revenue && v.revenue[0] && v.revenue[0].value ? money(v.revenue[0].value) : '—'], ['Working capital', wc !== null ? money(wc) : '—'], ['Bonding', `${v.bondingSingle || '—'} single / ${v.bondingAggregate || '—'} aggregate · ${v.surety || ''}`]] },
    { section: 'Capacity', rows: [['Current backlog', v.backlog || '—'], ['Largest current project', v.largestCurrent || '—']] },
    { section: 'Experience', rows: [['Past projects, last 5 years', String((v.pastProjects || []).length)], ['References', (v.projectRefs || []).map((r) => r.company).join(', ') || '—']] },
  ];

  const documents = portal.documents.filter((d) => d.status).map((d) => ({ id: SLOT_TO_DOC[d.id] || d.id, label: d.label, status: d.status, note: d.message, validThrough: d.validThrough || null, restricted: !!d.restricted }));
  const dated = portal.documents.filter((d) => d.required && d.validThrough).map((d) => d.validThrough).sort();
  const validUntil = dated[0] || `${Number(TODAY.slice(0, 4)) + 1}${TODAY.slice(4)}`;
  const firstMissing = findings.find((f) => f.severity === 'missing');

  const lintelSummary =
    `${company.name} submitted all ${portal.sections.filter((s) => !['documents', 'review'].includes(s.id)).length} sections and ${documents.length} documents today. ` +
    (knockouts ? 'A knockout is declared, so this is not recommended. ' : '') +
    (open ? `${open} item${open > 1 ? 's need' : ' needs'} your judgement${firstMissing ? `, including ${firstMissing.title.toLowerCase()}` : ''}. ` : 'Nothing required is open. ') +
    `${checks.length - complete} checks (references, broker and surety) are still running, so this recommendation is provisional.`;

  const review = {
    context: { requestId: request.id, displayId: request.id.toUpperCase(), submittedOn: TODAY, reviewStartedOn: null, requestedBy: invitedBy || 'Jordan Lee', templateVersion: templates[request.template], publicWorks: !!portal.request.flags.publicWorks, states: company.state },
    lintelSummary,
    sectionScores,
    findings,
    checks,
    documents,
    submission: submissionRows,
    history: [
      { at, actor: 'Linarc', action: `Scored: ${recommendation === 'accept' ? 'Accept' : recommendation === 'review' ? 'Review' : 'Not recommended'} · ${score} · confidence ${confidence}% (provisional)` },
      { at: `${at.slice(0, 11)}${at.slice(11, 13)}:00:00`, actor: company.contact, action: 'Submitted the application' },
    ],
    conditions: [
      ...(firstMissing ? [{ id: 'fix-first', label: firstMissing.fix ? `Provide ${firstMissing.fix} before mobilisation` : `Resolve before mobilisation: ${firstMissing.title}` }] : []),
      { id: 'bond', label: 'Project-specific performance and payment bond required' },
      { id: 'retainage', label: 'Increased retainage (10%)' },
      { id: 'sdi', label: 'Subcontractor default insurance (SDI) enrolment' },
    ],
    defaults: {
      primary: knockouts ? 'reject' : recommendation === 'accept' ? 'approve' : missing ? 'conditions' : 'approve',
      trades: [company.trade],
      validUntil,
      validUntilHelp: `Earliest key-document expiry (${validUntil})`,
      conditions: firstMissing ? ['fix-first'] : [],
      infoMessage: firstMissing ? `Please upload ${firstMissing.fix || 'a corrected document'}. ${firstMissing.why || ''}`.trim() : 'Please confirm the details below.',
      rejectReason: knockouts ? 'Debarment (knockout)' : '',
    },
    infoRequest: null,
    decided: null,
  };
  const summary = { score, confidence, recommendation, knockouts, findings: findings.filter((f) => ['missing', 'finding'].includes(f.severity)).length, checks: [complete, checks.length] };
  return { review, summary };
}
