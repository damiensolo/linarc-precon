// PLACEHOLDER BEHAVIOUR — document uploads in the subcontractor portal (screens 3 and 4, PRD UX l. 89: "Each upload is
// processed immediately… Accepted, Rejected: this is a Certificate of Insurance, this slot needs a surety bonding
// letter, or Needs attention: GL aggregate is 1M, 2M required").
//
// `validateUpload` stands in for Linarc's intake check (document type) and extraction (dates, limits, mod). The file's
// contents aren't read: the type comes from the file name, the values from what the subcontractor entered in the
// portal, so a demo gets the realistic outcomes:
//   - a file whose name says it is another document (`Northstar-COI-2026.pdf` in the bonding slot)  → Rejected
//   - a photo or scan (JPG / PNG)                                                                    → Needs review
//   - a PDF                                                                       → Accepted, with what was read
//   - OSHA 300A (three forms): Action needed until all three years are there
// Per-request results (`RESULTS`) give the requested renewals their real policy numbers and dates.
//
// Upload results go to the demo session (./session.js, sessionStorage), so the portal shows them again after switching
// requests or a reload, and the GC review shows the new documents and the history line.
import { TODAY } from './index';
import { session, recordUploadResult } from './session';

/** The demo session (./session.js) holds uploads[requestId][slotId] and responses[requestId]. */
export const uploadStore = session;

export function recordUpload(requestId, slotId, result) {
  recordUploadResult(requestId, slotId, result);
}

// What a file name says the document is. Order matters: the first match wins.
const TYPES = [
  { id: 'loss-run', label: 'a loss run', words: [/loss[-_ ]?run/i] },
  { id: 'osha300a', label: 'an OSHA 300A form', words: [/300a/i] },
  { id: 'ai-endorsement', label: 'an additional insured endorsement', words: [/cg[-_ ]?20[-_ ]?(10|37)/i, /additional[-_ ]?insured/i] },
  { id: 'waiver', label: 'a waiver of subrogation', words: [/waiver/i, /subrogation/i, /cg[-_ ]?24[-_ ]?04/i] },
  { id: 'pnc', label: 'a primary and noncontributory endorsement', words: [/primary[-_ ]?(and[-_ ]?)?non[-_ ]?contrib/i, /cg[-_ ]?20[-_ ]?01/i] },
  { id: 'umbrella', label: 'an umbrella policy', words: [/umbrella/i, /excess/i] },
  { id: 'bonding', label: 'a surety bonding letter', words: [/bond/i, /surety/i] },
  { id: 'emr', label: 'an EMR ratesheet', words: [/\bemr\b|emr[-_]/i, /rate[-_ ]?sheet/i, /wcirb/i, /ncci/i] },
  { id: 'coi', label: 'a certificate of insurance', words: [/\bcoi\b|coi[-_]|[-_]coi/i, /acord/i, /certificate[-_ ]?of[-_ ]?insurance/i] },
  { id: 'financials', label: 'financial statements', words: [/financial/i, /[-_ ]fs[-_ ]|^fs[-_]/i, /balance[-_ ]?sheet/i] },
  { id: 'w9', label: 'a W-9', words: [/\bw-?9\b|w-?9[-_]/i] },
  { id: 'license', label: 'a contractor license', words: [/licen[cs]e/i, /cslb/i] },
];
const IMAGE = /\.(jpe?g|png|heic)$/i;

function detect(name) {
  const t = TYPES.find((x) => x.words.some((w) => w.test(name)));
  return t || null;
}

const iso = (d) => d.toISOString().slice(0, 10);
const addMonths = (isoDate, k) => {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setMonth(d.getMonth() + k);
  return iso(d);
};
const fmt = (isoDate) => new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const money = (n) => `$${Number(n).toLocaleString('en-US')}`;
const num = (v) => (typeof v === 'number' ? v : Number(String(v || '').replace(/[^0-9.]/g, '')) || null);

// Per-request results for the documents a reviewer or a renewal asked for.
const RESULTS = {
  'req-006': {
    coi: { message: 'Read: renewed policy GL-51203 · GL $1,000,000 / $2,000,000 · umbrella $2,000,000 · valid through 15 Sep 2027.', validThrough: '2027-09-15' },
    'ai-endorsement': { message: 'Read: CG 20 10 and CG 20 37 on policy GL-51203.', validThrough: '2027-09-15' },
  },
  'req-007': {
    emr: { message: 'Read: mod 0.91, effective 1 Jan 2026 (WCIRB). Matches your entry.', validThrough: '2027-01-01', extracted: { 'Experience modification': '0.91', 'Rating effective date': '2026-01-01', Bureau: 'WCIRB' } },
  },
  'req-020': {
    'ai-endorsement': { message: 'Read: CG 20 10 and CG 20 37 on the renewed policy, valid through 31 Oct 2027.', validThrough: '2027-10-31' },
  },
  'req-022': {
    coi: { message: 'Read: renewed policy GL-51203 · GL $1,000,000 / $2,000,000 · valid through 15 Sep 2027.', validThrough: '2027-09-15' },
    'ai-endorsement': { message: 'Read: CG 20 10 and CG 20 37 on policy GL-51203.', validThrough: '2027-09-15' },
    bonding: { message: 'Read: CNA Surety · $1,500,000 single / $3,000,000 aggregate · dated 6 Oct 2026.', validThrough: '2027-10-06' },
  },
  'req-021': {
    bonding: { message: 'Read: Travelers · $5,000,000 single / $12,000,000 aggregate · dated 7 Oct 2026.', validThrough: '2027-10-07' },
  },
};

/** How long the upload of this file takes (ms): about 1.5 MB/s, at least 0.6 s, at most 4 s. */
export function uploadDuration(file) {
  return Math.max(600, Math.min(4000, Math.round(((file && file.size) || 400000) / 1500)));
}

/**
 * The intake result for files dropped on a slot.
 * @param {{ requestId, doc, files: File[], previous: Array<{name, uploadedOn}>, answers: object }} args
 *   `answers` = the portal's entered values by field id (glOccurrence, emr, bondingSingle, …)
 * @returns {{ status, message, validThrough?, extracted?, files: Array<{name, uploadedOn}> }}
 */
export function validateUpload({ requestId, doc, files, previous = [], answers = {} }) {
  const uploaded = files.map((f) => ({ name: f.name, uploadedOn: TODAY }));
  const name = files[0].name;
  const type = detect(name);
  const own = doc.id === 'emr' ? 'emr' : doc.id;
  const article = /^[aeiou]/i.test(doc.label) ? 'an' : 'a';

  // Wrong document for the slot (checked on the first file).
  if (type && type.id !== own && !own.includes(type.id) && !(own === 'umbrella' && type.id === 'coi')) {
    const message = type.id === 'loss-run' && own === 'emr'
      ? 'This is a loss run, not an EMR ratesheet. Upload the experience rating ratesheet from WCIRB or NCCI.'
      : `This is ${type.label}. Upload ${article} ${doc.label.charAt(0).toLowerCase()}${doc.label.slice(1)}.`;
    return { status: 'rejected', message, files: uploaded };
  }

  // Multi-form slots (OSHA 300A: one per year).
  if (doc.count) {
    const all = [...previous, ...uploaded].filter((f, i, a) => a.findIndex((x) => x.name === f.name) === i);
    const years = ['2025', '2024', '2023'];
    const missing = years.filter((y) => !all.some((f) => f.name.includes(y)));
    const counted = Math.min(doc.count, all.length);
    if (missing.length && counted < doc.count) {
      return { status: 'failed', message: `${counted} of ${doc.count} uploaded. ${missing.length === 1 ? `The ${missing[0]} form is` : `The ${missing.join(' and ')} forms are`} missing.`, files: all };
    }
    return { status: 'passed', message: `${doc.count} of ${doc.count} uploaded; signed by a company executive.`, files: all.slice(0, Math.max(doc.count, all.length)) };
  }

  // A photo or scan: read with low confidence.
  if (IMAGE.test(name)) {
    return { status: 'needs-review', message: 'We couldn’t confidently read part of this document. A reviewer will check it; you can also upload a clearer PDF.', files: uploaded };
  }

  const preset = RESULTS[requestId] && RESULTS[requestId][doc.id];
  if (preset) return { status: 'passed', ...preset, files: uploaded };

  const year = addMonths(TODAY, 12);
  switch (doc.id) {
    case 'coi': {
      const occ = num(answers.glOccurrence);
      const agg = num(answers.glAggregate);
      const parts = [occ && agg ? `GL ${money(occ)} / ${money(agg)}` : null, answers.umbrella ? `umbrella ${money(num(answers.umbrella))}` : null].filter(Boolean);
      return { status: 'passed', message: `Read: ${parts.join(' · ') || 'limits as entered'} · valid through ${fmt(year)}.`, validThrough: year, files: uploaded };
    }
    case 'emr': {
      const mod = answers.emr && answers.emr[0] ? answers.emr[0].value : null;
      return {
        status: 'passed',
        message: `Read: mod ${mod || '—'}, effective 1 Jan 2026. ${mod && Number(mod) > 1 ? 'Above the 1.00 threshold; the reviewer will see it.' : 'Matches your entry.'}`,
        validThrough: '2027-01-01',
        extracted: { 'Experience modification': String(mod || '—'), 'Rating effective date': '2026-01-01' },
        files: uploaded,
      };
    }
    case 'bonding': {
      const single = num(answers.bondingSingle);
      const aggregate = num(answers.bondingAggregate);
      const req = (doc.requirements || []).join(' ').match(/\$[\d,]+/g) || [];
      const needSingle = num(req[0]);
      if (single && needSingle && single < needSingle) {
        return { status: 'failed', message: `Single project limit is ${money(single)}; ${money(needSingle)} is required.`, validThrough: year, files: uploaded };
      }
      return { status: 'passed', message: `Read: ${single ? `${money(single)} single / ${money(aggregate)} aggregate` : 'capacity as entered'} · dated ${fmt(TODAY)}.`, validThrough: year, files: uploaded };
    }
    case 'financials':
      return { status: 'passed', message: 'Read: reviewed statements, period end 31 Dec 2025. Working capital within 10% of your entry.', validThrough: '2027-03-31', files: uploaded };
    default: {
      const dated = /expiry|policy|months/i.test(doc.expiryDriver || '') && doc.expiryDriver !== 'None';
      return dated
        ? { status: 'passed', message: `Valid through ${fmt(year)}.`, validThrough: year, files: uploaded }
        : { status: 'passed', message: 'Document meets the configured requirements.', files: uploaded };
    }
  }
}
