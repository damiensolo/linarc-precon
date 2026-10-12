// PLACEHOLDER DATA — shared by every Prequalification screen so a row on the dashboard leads to the same company on
// the review screen and the record. Fictional companies; values follow the ranges in docs/prequal/spec.md.
// Status keys are the ones in ../status.js (D-16). "Today" for the mock is 2026-10-08.
// Every row has its detail elsewhere: a review (./review.js, ./dossiers.js) once submitted, a tracking view
// (./tracking.js) before that, and a qualification record (./records.js, ./recordDetails.js) once approved.
import { requestStatus } from '../status';

export const TODAY = '2026-10-08';

export const reviewers = [
  { id: 'jordan', name: 'Jordan Lee', role: 'reviewer' },
  { id: 'priya', name: 'Priya Natarajan', role: 'reviewer' },
];

export const templates = {
  'elec-md': 'Electrical — Medium Projects v3',
  'mech-lg': 'Mechanical — Large Projects v2',
  'conc-md': 'Concrete — Medium Projects v1',
  'std-sp': 'Standard Specialty Trade v4',
  'pw-md': 'Public Works — Medium Projects v2',
  'hc-sp': 'Healthcare Specialty v1',
};

export const companies = [
  { id: 'apex', name: 'Apex Electrical, Inc.', trade: 'Electrical', csi: '26', state: 'CA', contact: 'Maria Chen', email: 'mchen@apexelectrical.example' },
  { id: 'summit', name: 'Summit Mechanical LLC', trade: 'HVAC', csi: '23', state: 'CA', contact: 'Dev Patel', email: 'dpatel@summitmech.example' },
  { id: 'granite', name: 'Granite Ridge Concrete', trade: 'Concrete', csi: '03', state: 'NV', contact: 'Tom Alvarez', email: 'talvarez@graniteridge.example' },
  { id: 'bluewater', name: 'Bluewater Plumbing Co.', trade: 'Plumbing', csi: '22', state: 'CA', contact: 'Sam Okafor', email: 'sokafor@bluewaterplumbing.example' },
  { id: 'ironline', name: 'Ironline Steel Erectors', trade: 'Structural Steel', csi: '05', state: 'CA', contact: 'Lena Kowalski', email: 'lkowalski@ironline.example' },
  { id: 'cascade', name: 'Cascade Roofing & Sheet Metal', trade: 'Roofing', csi: '07', state: 'OR', contact: 'Ray Nguyen', email: 'rnguyen@cascaderoofing.example' },
  { id: 'pioneer', name: 'Pioneer Drywall Systems', trade: 'Drywall', csi: '09', state: 'CA', contact: 'Ana Reyes', email: 'areyes@pioneerdrywall.example' },
  { id: 'northstar', name: 'Northstar Fire Protection', trade: 'Fire Suppression', csi: '21', state: 'CA', contact: 'Chris Baker', email: 'cbaker@northstarfire.example' },
  { id: 'redwood', name: 'Redwood Glazing', trade: 'Glazing', csi: '08', state: 'CA', contact: 'Jo Marsh', email: 'jmarsh@redwoodglazing.example' },
  { id: 'keystone', name: 'Keystone Masonry', trade: 'Masonry', csi: '04', state: 'AZ', contact: 'Luis Ortega', email: 'lortega@keystonemasonry.example' },
  { id: 'harbor', name: 'Harbor Site Works', trade: 'Earthwork', csi: '31', state: 'CA', contact: 'Kim Dao', email: 'kdao@harborsiteworks.example' },
  { id: 'meridian', name: 'Meridian Painting', trade: 'Painting', csi: '09', state: 'CA', contact: 'Pat Sullivan', email: 'psullivan@meridianpainting.example' },
  { id: 'valley', name: 'Valley Low-Voltage', trade: 'Low Voltage', csi: '27', state: 'CA', contact: 'Nina Rossi', email: 'nrossi@valleylv.example' },
  { id: 'atlas', name: 'Atlas Elevator Service', trade: 'Conveying', csi: '14', state: 'CA', contact: 'Omar Haddad', email: 'ohaddad@atlaselevator.example' },
  { id: 'silverline', name: 'Silverline Landscaping', trade: 'Landscaping', csi: '32', state: 'CA', contact: 'Grace Park', email: 'gpark@silverline.example' },
  { id: 'crestview', name: 'Crestview Insulation', trade: 'Insulation', csi: '07', state: 'CA', contact: 'Ben Carter', email: 'bcarter@crestview.example' },
  { id: 'delta', name: 'Delta Paving', trade: 'Paving', csi: '32', state: 'NV', contact: 'Rosa Jimenez', email: 'rjimenez@deltapaving.example' },
  { id: 'oakmont', name: 'Oakmont Millwork', trade: 'Millwork', csi: '06', state: 'CA', contact: 'Eli Brooks', email: 'ebrooks@oakmontmillwork.example' },
  { id: 'prairie', name: 'Prairie Demolition', trade: 'Demolition', csi: '02', state: 'CA', contact: 'Hana Sato', email: 'hsato@prairiedemo.example' },
  { id: 'tidewater', name: 'Tidewater Waterproofing', trade: 'Waterproofing', csi: '07', state: 'CA', contact: 'Will Grant', email: 'wgrant@tidewater.example' },
];

const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
export const companyById = byId(companies);
export const reviewerById = byId(reviewers);

// One row per request. `workflow` / `outcome` / `lifecycle` are the status dimensions; `score`, `confidence` and
// `recommendation` exist only once submitted; `validUntil` only once approved. `checks` is [complete, total].
// Activity: [date, text]. Reviewer-only fields (score, confidence, findings, knockouts) are gated in the view by role.
const R = (id, company, o) => ({ id, company, ...o });
export const requests = [
  R('req-001', 'apex', { project: 'Harbor Point Clinic', template: 'elec-md', workflow: 'under-review', outcome: null, lifecycle: null, score: 72, confidence: 64, recommendation: 'review', knockouts: 0, findings: 4, checks: [12, 14], submittedOn: '2026-10-05', activity: ['2026-10-07', 'Review started'], reviewer: 'jordan', single: 2000000, aggregate: 5000000, validUntil: null }),
  R('req-002', 'summit', { project: 'Eastgate Data Center', template: 'mech-lg', workflow: 'submitted', outcome: null, lifecycle: null, score: 91, confidence: 88, recommendation: 'accept', knockouts: 0, findings: 1, checks: [14, 14], submittedOn: '2026-10-06', activity: ['2026-10-06', 'Submission received'], reviewer: null, single: 4500000, aggregate: 9000000, validUntil: null }),
  R('req-003', 'granite', { project: 'Northern Heights', template: 'conc-md', workflow: 'submitted', outcome: null, lifecycle: null, score: 23, confidence: 91, recommendation: 'not-recommended', knockouts: 1, findings: 3, checks: [13, 13], submittedOn: '2026-10-03', activity: ['2026-10-04', 'Debarment check matched'], reviewer: null, single: 1500000, aggregate: 3000000, validUntil: null }),
  R('req-004', 'bluewater', { project: 'Riverside Commons', template: 'std-sp', workflow: 'submitted', outcome: null, lifecycle: null, score: 68, confidence: 55, recommendation: 'review', knockouts: 0, findings: 5, checks: [10, 14], submittedOn: '2026-10-07', activity: ['2026-10-07', 'Submission received'], reviewer: null, single: 900000, aggregate: 2500000, validUntil: null }),
  R('req-005', 'ironline', { project: 'Eastgate Data Center', template: 'std-sp', workflow: 'under-review', outcome: null, lifecycle: null, score: 84, confidence: 71, recommendation: 'accept', knockouts: 0, findings: 2, checks: [12, 14], submittedOn: '2026-10-01', activity: ['2026-10-06', 'Broker confirmation received'], reviewer: 'priya', single: 3200000, aggregate: 6000000, validUntil: null }),
  R('req-006', 'cascade', { project: 'Northern Heights', template: 'std-sp', workflow: 'info-requested', outcome: null, lifecycle: null, score: 61, confidence: 48, recommendation: 'review', knockouts: 0, findings: 6, checks: [11, 14], submittedOn: '2026-09-28', activity: ['2026-10-02', 'Information requested: updated COI'], reviewer: 'jordan', single: 1100000, aggregate: 2000000, validUntil: null }),
  R('req-007', 'pioneer', { project: 'Riverside Commons', template: 'std-sp', workflow: 'info-requested', outcome: null, lifecycle: null, score: 77, confidence: 59, recommendation: 'review', knockouts: 0, findings: 2, checks: [13, 14], submittedOn: '2026-09-30', activity: ['2026-10-05', 'Information requested: EMR ratesheet'], reviewer: 'priya', single: 800000, aggregate: 1800000, validUntil: null }),
  R('req-008', 'northstar', { project: 'Harbor Point Clinic', template: 'hc-sp', workflow: 'in-progress', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [4, 14], submittedOn: null, activity: ['2026-10-07', 'Safety section completed (67%)'], reviewer: null, single: 1300000, aggregate: 2600000, validUntil: null }),
  R('req-009', 'redwood', { project: 'Eastgate Data Center', template: 'std-sp', workflow: 'in-progress', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [2, 14], submittedOn: null, activity: ['2026-10-06', 'Company section completed (25%)'], reviewer: null, single: 2100000, aggregate: 4000000, validUntil: null }),
  R('req-010', 'keystone', { project: 'Northern Heights', template: 'pw-md', workflow: 'in-progress', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [6, 15], submittedOn: null, activity: ['2026-10-08', 'Financial statements uploaded (80%)'], reviewer: null, single: 1700000, aggregate: 3500000, validUntil: null }),
  R('req-011', 'harbor', { project: 'Riverside Commons', template: 'pw-md', workflow: 'in-progress', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [3, 15], submittedOn: null, activity: ['2026-10-03', 'Portal opened (10%)'], reviewer: null, single: 2400000, aggregate: 5000000, validUntil: null }),
  R('req-012', 'meridian', { project: 'Northern Heights', template: 'std-sp', workflow: 'invited', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [0, 14], submittedOn: null, activity: ['2026-10-07', 'Invitation sent'], reviewer: null, single: 400000, aggregate: 900000, validUntil: null }),
  R('req-013', 'valley', { project: 'Eastgate Data Center', template: 'elec-md', workflow: 'invited', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [0, 14], submittedOn: null, activity: ['2026-10-06', 'Invitation sent'], reviewer: null, single: 950000, aggregate: 2000000, validUntil: null }),
  R('req-014', 'atlas', { project: 'Harbor Point Clinic', template: 'hc-sp', workflow: 'invited', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [1, 14], submittedOn: null, activity: ['2026-10-01', 'Invitation sent · reminder 2026-10-06'], reviewer: null, single: 1600000, aggregate: 3000000, validUntil: null }),
  R('req-015', 'silverline', { project: 'Riverside Commons', template: 'std-sp', workflow: 'invited', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [0, 14], submittedOn: null, activity: ['2026-10-08', 'Invitation sent'], reviewer: null, single: 350000, aggregate: 700000, validUntil: null }),
  R('req-016', 'crestview', { project: 'Northern Heights', template: 'std-sp', workflow: 'draft', outcome: null, lifecycle: null, score: null, confidence: null, recommendation: null, knockouts: 0, findings: 0, checks: [0, 14], submittedOn: null, activity: ['2026-10-08', 'Draft saved'], reviewer: null, single: 600000, aggregate: 1200000, validUntil: null }),
  R('req-017', 'delta', { project: 'Riverside Commons', template: 'pw-md', workflow: 'closed', outcome: 'qualified', lifecycle: 'current', score: 88, confidence: 83, recommendation: 'accept', knockouts: 0, findings: 0, checks: [15, 15], submittedOn: '2026-08-12', activity: ['2026-08-20', 'Approved by Jordan Lee'], reviewer: 'jordan', single: 2800000, aggregate: 6000000, validUntil: '2027-08-20' }),
  R('req-018', 'oakmont', { project: 'Harbor Point Clinic', template: 'hc-sp', workflow: 'closed', outcome: 'qualified', lifecycle: 'current', score: 93, confidence: 90, recommendation: 'accept', knockouts: 0, findings: 0, checks: [14, 14], submittedOn: '2026-07-02', activity: ['2026-07-09', 'Approved by Priya Natarajan'], reviewer: 'priya', single: 750000, aggregate: 1500000, validUntil: '2027-06-30' }),
  R('req-019', 'prairie', { project: 'Northern Heights', template: 'std-sp', workflow: 'closed', outcome: 'qualified-with-conditions', lifecycle: 'current', score: 74, confidence: 79, recommendation: 'review', knockouts: 0, findings: 2, checks: [14, 14], submittedOn: '2026-06-15', activity: ['2026-10-02', 'Renewed asbestos registration received'], reviewer: 'jordan', single: 1200000, aggregate: 2500000, validUntil: '2027-05-31' }),
  R('req-020', 'tidewater', { project: 'Eastgate Data Center', template: 'std-sp', workflow: 'closed', outcome: 'qualified', lifecycle: 'expiring', score: 86, confidence: 81, recommendation: 'accept', knockouts: 0, findings: 0, checks: [14, 14], submittedOn: '2025-10-01', activity: ['2026-10-07', 'Renewed COI received; being checked'], reviewer: 'priya', single: 500000, aggregate: 1000000, validUntil: '2026-10-31' }),
  R('req-021', 'summit', { project: 'Northern Heights', template: 'mech-lg', workflow: 'closed', outcome: 'qualified-with-conditions', lifecycle: 'expiring', score: 79, confidence: 70, recommendation: 'review', knockouts: 0, findings: 1, checks: [14, 14], submittedOn: '2025-09-20', activity: ['2026-09-28', 'Renewal request sent: bonding letter expires 2026-10-20'], reviewer: 'jordan', single: 3000000, aggregate: 6000000, validUntil: '2026-10-20' }),
  R('req-022', 'cascade', { project: 'Riverside Commons', template: 'std-sp', workflow: 'closed', outcome: 'qualified', lifecycle: 'expired', score: 82, confidence: 77, recommendation: 'accept', knockouts: 0, findings: 0, checks: [14, 14], submittedOn: '2025-08-05', activity: ['2026-09-15', 'Expired: GL policy lapsed'], reviewer: 'priya', single: 1000000, aggregate: 2000000, validUntil: '2026-09-15' }),
  R('req-023', 'harbor', { project: 'Northern Heights', template: 'pw-md', workflow: 'closed', outcome: 'not-qualified', lifecycle: null, score: 41, confidence: 86, recommendation: 'not-recommended', knockouts: 1, findings: 4, checks: [15, 15], submittedOn: '2026-05-10', activity: ['2026-05-18', 'Not approved: state debarment (DIR list)'], reviewer: 'jordan', single: 2000000, aggregate: 4000000, validUntil: null }),
  R('req-024', 'bluewater', { project: 'Harbor Point Clinic', template: 'hc-sp', workflow: 'closed', outcome: 'qualified', lifecycle: 'suspended', score: 80, confidence: 75, recommendation: 'accept', knockouts: 0, findings: 1, checks: [14, 14], submittedOn: '2026-03-02', activity: ['2026-09-30', 'Suspended: new OSHA citation under review'], reviewer: 'priya', single: 700000, aggregate: 1500000, validUntil: '2027-03-01' }),
];

/** Request rows joined with company, template and reviewer, plus the status entry to show in a list. */
export function requestRows() {
  return requests.map((r) => {
    const company = companyById[r.company];
    return {
      ...r,
      companyName: company.name,
      trade: company.trade,
      csi: company.csi,
      state: company.state,
      templateName: templates[r.template],
      reviewerName: r.reviewer ? reviewerById[r.reviewer].name : null,
      status: requestStatus(r),
    };
  });
}

export const requestById = byId(requests);

/** Sandbox record picker options (App.vue): `REQ-004 · Bluewater Plumbing Co. · Ready for review`. */
export function requestOptions(ids = requests.map((r) => r.id)) {
  return ids.map((id) => {
    const r = requestById[id];
    return { value: id, label: `${id.toUpperCase()} · ${companyById[r.company].name} · ${requestStatus(r).label}` };
  });
}
