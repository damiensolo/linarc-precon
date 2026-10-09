// PLACEHOLDER DATA — copied from the Figma frame (Documentation 1708:58317), not verified domain data.
import {
  BadgeCheck,
  Bolt,
  BookUser,
  Building2,
  FolderKanban,
  Gavel,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  LockKeyhole,
  Package,
  Scale,
  ScrollText,
  Send,
  ShieldCheck,
} from '@development/linarc-icons';

const TITLES = [
  'Painting & Finishing',
  'Exterior Site Landscaping',
  'Final Inspection & Punchlist',
  'Drywall & Interior Framing',
  'Insulation & Vapor Barrier',
  'Flooring Substrate Preparation',
  'HVAC Ductwork Installation',
  'Plumbing System Setup',
  'Electrical Conduit Layout',
  'Mechanical Rough-In',
  'Window & Door Fitting',
  'Exterior Cladding Installation',
  'Roof Framing & Sheathing',
  'Masonry Wall Construction',
  'Structural Steel Erection',
  'Concrete Formwork & Pouring',
  'Utility Trenching & Installation',
  'Foundation Excavation & Grading',
];

// Rows whose source was suggested by AI (AI chip in the Source column), as drawn in Figma.
const AI_SOURCED = [1, 2, 3, 5, 6];

export const packages = TITLES.map((title, i) => {
  const n = i + 1;
  const pad = String(n).padStart(3, '0');
  return {
    id: n,
    title,
    specCode: `SP-${100 + n}`,
    packageNo: `CP-${pad}: Site Preparation & Earthwork`,
    source: AI_SOURCED.includes(n) ? 'Source Name' : '-',
    aiSource: AI_SOURCED.includes(n),
    createdOn: '2026-10-02',
    description: 'Phase 1: Site Preparation & Earthwork',
  };
});

export const projects = [
  { value: 'northern-heights', label: 'Northern Heights' },
  { value: 'riverside-commons', label: 'Riverside Commons' },
];

export const places = [
  { key: 'all', label: 'All locations', value: 'all' },
  { key: 'tower-a', label: 'Tower A', value: 'tower-a' },
];

// Preconstruction module (D-13). Figma: Top Nav Modules / Module=Preconstruction and Side Nav Preconstruction
// (1HxMANBEaYWFqEFtazB20l 40024068:91575, 40024068:92254). Icons are the ☉ Icons / lucide masters those variants use.
//
// Preconstruction
// ├── Bidding           → Bid Projects, Bid Packages, Bid Comparison & Awards
// ├── Prequalification  → Overview, Requests, Review Queue, Qualified Subs
// ├── Directory         → Companies (a subcontractor profile and its Qualification summary are pages inside it)
// └── Configure         → Templates, Qualification Policies, Permissions (prequalification settings)
export const preconTools = [
  { id: 'bidding', label: 'Bidding', icon: Gavel },
  { id: 'prequalification', label: 'Prequalification', icon: ShieldCheck },
  { id: 'directory', label: 'Directory', icon: BookUser },
  { id: 'configure', label: 'Configure', icon: Bolt },
];

const rail = (tool, items) =>
  items.map(([label, icon, extra]) => {
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return { id, label, icon, href: `/preconstruction/${tool}/${id}`, ...extra };
  });

// One side-nav rail per tool. "Qualified Subs" is the rail label for "Qualified subcontractors" (fits the 82px rail).
export const preconRails = {
  bidding: rail('bidding', [
    ['Bid Projects', FolderKanban],
    ['Bid Packages', Package],
    ['Bid Comparison & Awards', Scale],
  ]),
  prequalification: rail('prequalification', [
    ['Overview', LayoutDashboard],
    ['Requests', Send],
    ['Review Queue', ListChecks],
    ['Qualified Subs', BadgeCheck],
  ]),
  directory: rail('directory', [['Companies', Building2]]),
  configure: rail('configure', [
    ['Templates', LayoutTemplate],
    ['Qualification Policies', ScrollText],
    ['Permissions', LockKeyhole],
  ]),
};
