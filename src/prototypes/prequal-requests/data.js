// PLACEHOLDER DATA — copied from the Figma frame (Documentation 1708:58317), not verified domain data.
// Navigation and project context come from src/modules/prequal/nav.js.

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
