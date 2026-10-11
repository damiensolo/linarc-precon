// Preconstruction module navigation (D-13), shared by every GC-side Prequalification screen.
// Figma: Top Nav Modules / Module=Preconstruction and Side Nav Preconstruction
// (1HxMANBEaYWFqEFtazB20l 40024068:91575, 40024068:92254). Icons are the ☉ Icons / lucide masters those variants use.
//
// Preconstruction
// ├── Bidding           → Bid Projects, Bid Packages, Bid Comparison & Awards
// ├── Prequalification  → Overview, Review Queue, Qualified Subs (D-23: Requests removed, it duplicated the Overview)
// ├── Directory         → Companies (a subcontractor profile and its Qualification summary are pages inside it)
// └── Configure         → Templates, Qualification Policies, Permissions (prequalification settings)
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
  ShieldCheck,
} from '@development/linarc-icons';

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
// `screen` names the prototype screen a rail item opens (src/modules/prequal/router.js); items without one stay put.
export const preconRails = {
  bidding: rail('bidding', [
    ['Bid Projects', FolderKanban],
    ['Bid Packages', Package],
    ['Bid Comparison & Awards', Scale],
  ]),
  prequalification: rail('prequalification', [
    ['Overview', LayoutDashboard, { screen: 'dashboard' }],
    ['Review Queue', ListChecks, { screen: 'queue' }],
    ['Qualified Subs', BadgeCheck, { screen: 'qualified' }],
  ]),
  directory: rail('directory', [['Companies', Building2]]),
  configure: rail('configure', [
    ['Templates', LayoutTemplate],
    ['Qualification Policies', ScrollText],
    ['Permissions', LockKeyhole],
  ]),
};

// PLACEHOLDER DATA — project context shown in the top nav.
export const projects = [
  { value: 'northern-heights', label: 'Northern Heights' },
  { value: 'riverside-commons', label: 'Riverside Commons' },
];

export const places = [
  { key: 'all', label: 'All locations', value: 'all' },
  { key: 'tower-a', label: 'Tower A', value: 'tower-a' },
];
