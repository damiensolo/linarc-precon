// PLACEHOLDER DATA — what each subcontractor declared about itself (the Submission tab) and the sources Linarc checks
// it against (licensing board, broker, surety, references). One profile per company that has submitted at least once;
// a company with two requests (Summit, Bluewater, Cascade, Harbor) declared the same profile both times, updated where
// the story says so. Fictional companies, people and numbers; ranges follow docs/prequal/spec.md.
// Apex Electrical's profile is written out in ./review.js (the first review built) and isn't repeated here.

export const profiles = {
  summit: {
    legal: 'Summit Mechanical LLC', entity: 'California LLC, 2004', principals: 'Dev Patel (Managing Member), Karen Liu (CFO)',
    license: 'C-20 #845120, CA', dirReg: '1000012288', emr: ['1.08', '1.01', '0.97'], trir: '2.1 / 0.9', fatalities: '0',
    gl: '$2,000,000 / $4,000,000', umbrella: '$5,000,000', revenue: '$64,200,000', workingCapital: '$9,800,000',
    bonding: 'Travelers, $5M single / $12M aggregate', backlog: '$7,400,000', largest: '$6,100,000', projects: '11',
    specialty: ['Mission-critical (data centres)', '4 projects'], refs: ['Turner Pacific', 'Bayline Builders'],
    broker: 'Marsh (San Francisco)', surety: 'Travelers', osha: 'No inspections in 3 years', credit: 'PAYDEX 80, no liens',
  },
  granite: {
    legal: 'Granite Ridge Concrete, Inc.', entity: 'Nevada corporation, 2011', principals: 'Tom Alvarez (President)',
    license: 'C-8 #1004417, CA · C-5 #0071442, NV', dirReg: 'n/a (Nevada)', emr: ['1.12', '1.18', '1.21'], trir: '5.8 / 3.1', fatalities: '0',
    gl: '$1,000,000 / $2,000,000', umbrella: '$2,000,000', revenue: '$11,600,000', workingCapital: '$240,000',
    bonding: 'Merchants Bonding, $1.5M single / $4M aggregate', backlog: '$3,100,000', largest: '$2,200,000', projects: '4',
    specialty: ['Post-tensioned slabs', '2 projects'], refs: ['Silver State Builders', 'Truckee Meadows Construction'],
    broker: 'Brown & Brown (Reno)', surety: 'Merchants Bonding', osha: '2 serious citations (2024), 1 open', credit: 'PAYDEX 52, 1 open lien',
  },
  bluewater: {
    legal: 'Bluewater Plumbing Co.', entity: 'California corporation, 1998', principals: 'Sam Okafor (President), Leah Okafor (Secretary)',
    license: 'C-36 #612904, CA', dirReg: '1000033120', emr: ['0.84', '0.88', '0.93'], trir: '2.9 / 1.4', fatalities: '0',
    gl: '$2,000,000 / $4,000,000', umbrella: '$3,000,000', revenue: '$18,900,000', workingCapital: '$2,050,000',
    bonding: 'Liberty Mutual Surety, $1.5M single / $2M aggregate', backlog: '$1,450,000', largest: '$1,900,000', projects: '6',
    specialty: ['Medical gas (NFPA 99)', '3 projects'], refs: ['Riverside Health Builders', 'Coastline General'],
    broker: 'Alliant (Walnut Creek)', surety: 'Liberty Mutual Surety', osha: '1 serious citation (Aug 2026), contested', credit: 'Report unavailable',
  },
  ironline: {
    legal: 'Ironline Steel Erectors, Inc.', entity: 'California corporation, 2007 (renamed from Ironline Erectors Inc., 2022)', principals: 'Lena Kowalski (CEO), Marco Ruiz (Field Operations)',
    license: 'C-51 #880213, CA', dirReg: '1000021904', emr: ['0.81', '0.79', '0.76'], trir: '1.6 / 0.7', fatalities: '0',
    gl: '$2,000,000 / $4,000,000', umbrella: '$5,000,000', revenue: '$41,300,000', workingCapital: '$6,200,000',
    bonding: 'Zurich, $5M single / $15M aggregate', backlog: '$12,300,000', largest: '$5,400,000', projects: '9',
    specialty: ['AWS D1.1 certified shop and field welders', '6 listed'], refs: ['Hensel Pacific', 'Turner Pacific'],
    broker: 'Lockton (San Francisco)', surety: 'Zurich', osha: 'No inspections in 3 years', credit: 'PAYDEX 79, no liens',
  },
  cascade: {
    legal: 'Cascade Roofing & Sheet Metal, Inc.', entity: 'Oregon corporation, 2003', principals: 'Ray Nguyen (President)',
    license: 'C-39 #1012877, CA · CCB #187733, OR', dirReg: '1000058816', emr: ['0.96', '1.01', '1.04'], trir: '4.2 / 2.2', fatalities: '0',
    gl: '$1,000,000 / $2,000,000 (policy expired 15 Sep 2026)', umbrella: '$2,000,000', revenue: '$9,700,000', workingCapital: '$1,150,000',
    bonding: 'CNA Surety, $1.5M single / $3M aggregate', backlog: '$1,900,000', largest: '$620,000', projects: '3',
    specialty: ['TPO and standing-seam metal roofing', '9 projects'], refs: ['Northern Heights Partners', 'Pacific Crest Builders'],
    broker: 'USI (Portland)', surety: 'CNA Surety', osha: 'No inspections in 3 years', credit: 'PAYDEX 71, no liens',
  },
  pioneer: {
    legal: 'Pioneer Drywall Systems, Inc.', entity: 'California corporation, 2012', principals: 'Ana Reyes (President), Victor Reyes (Estimating)',
    license: 'C-9 #934455, CA', dirReg: '1000040412', emr: ['0.95', '0.92', '0.91 (not evidenced)'], trir: '3.0 / 1.2', fatalities: '0',
    gl: '$2,000,000 / $4,000,000', umbrella: '$3,000,000', revenue: '$14,200,000', workingCapital: '$1,900,000',
    bonding: 'Old Republic Surety, $1.5M single / $4M aggregate', backlog: '$2,300,000', largest: '$1,350,000', projects: '7',
    specialty: ['Level 5 finishes, healthcare partitions', '4 projects'], refs: ['Coastline General', 'Riverside Health Builders'],
    broker: 'Hub International (Sacramento)', surety: 'Old Republic Surety', osha: 'No inspections in 3 years', credit: 'PAYDEX 76, no liens',
  },
  delta: {
    legal: 'Delta Paving, LLC', entity: 'Nevada LLC, 2009 (CA foreign registration 2015)', principals: 'Rosa Jimenez (Managing Member)',
    license: 'A General Engineering #977120, CA', dirReg: '1000019455', emr: ['0.86', '0.83', '0.81'], trir: '1.8 / 0.6', fatalities: '0',
    gl: '$2,000,000 / $4,000,000', umbrella: '$5,000,000', revenue: '$36,800,000', workingCapital: '$5,600,000',
    bonding: 'Travelers, $4M single / $15M aggregate', backlog: '$6,900,000', largest: '$4,200,000', projects: '14',
    specialty: ['Public works paving (Caltrans spec)', '8 projects'], refs: ['City of Sacramento Public Works', 'Granite Bay Builders'],
    broker: 'Marsh (Sacramento)', surety: 'Travelers', osha: 'No inspections in 3 years', credit: 'PAYDEX 82, no liens',
  },
  oakmont: {
    legal: 'Oakmont Millwork Corp.', entity: 'California corporation, 2001', principals: 'Eli Brooks (President)',
    license: 'C-6 #702233, CA', dirReg: '1000027715', emr: ['0.78', '0.77', '0.74'], trir: '1.2 / 0.4', fatalities: '0',
    gl: '$2,000,000 / $4,000,000', umbrella: '$5,000,000', revenue: '$12,400,000', workingCapital: '$2,700,000',
    bonding: 'Hartford, $1.5M single / $5M aggregate', backlog: '$1,100,000', largest: '$980,000', projects: '8',
    specialty: ['AWI Premium grade, FSC chain of custody', '5 healthcare projects'], refs: ['Harbor Health Builders', 'Turner Pacific'],
    broker: 'Lockton (San Francisco)', surety: 'Hartford', osha: 'No inspections in 3 years', credit: 'PAYDEX 84, no liens',
  },
  prairie: {
    legal: 'Prairie Demolition, Inc.', entity: 'California corporation, 2014', principals: 'Hana Sato (President), Dale Ames (Safety Director)',
    license: 'C-21 #951870 + ASB certification, CA', dirReg: '1000044390', emr: ['0.98', '0.95', '0.93'], trir: '3.4 / 1.6', fatalities: '0',
    gl: '$2,000,000 / $4,000,000', umbrella: '$5,000,000 (pollution $2,000,000)', revenue: '$15,100,000', workingCapital: '$1,700,000',
    bonding: 'Old Republic Surety, $1M single / $3M aggregate', backlog: '$1,600,000', largest: '$1,400,000', projects: '6',
    specialty: ['Selective interior demolition and abatement', '12 projects'], refs: ['Northern Heights Partners', 'Bayline Builders'],
    broker: 'Alliant (Sacramento)', surety: 'Old Republic Surety', osha: '1 other-than-serious citation (2024), abated', credit: 'PAYDEX 74, no liens',
  },
  tidewater: {
    legal: 'Tidewater Waterproofing, Inc.', entity: 'California corporation, 2010', principals: 'Will Grant (President)',
    license: 'C-33 / C-61 (D-38) #888014, CA', dirReg: '1000036601', emr: ['0.89', '0.87', '0.85'], trir: '2.2 / 0.8', fatalities: '0',
    gl: '$1,000,000 / $2,000,000', umbrella: '$2,000,000', revenue: '$6,800,000', workingCapital: '$1,050,000',
    bonding: 'Merchants Bonding, $750K single / $2M aggregate', backlog: '$880,000', largest: '$540,000', projects: '5',
    specialty: ['Below-grade and podium waterproofing', '7 projects'], refs: ['Bayline Builders', 'Eastgate Partners'],
    broker: 'Hub International (Oakland)', surety: 'Merchants Bonding', osha: 'No inspections in 3 years', credit: 'PAYDEX 77, no liens',
  },
  harbor: {
    legal: 'Harbor Site Works, Inc.', entity: 'California corporation, 2006', principals: 'Kim Dao (President)',
    license: 'A General Engineering #799031, CA', dirReg: '1000008830 (lapsed 2025)', emr: ['1.09', '1.12', '1.15'], trir: '4.9 / 2.7', fatalities: '0',
    gl: '$2,000,000 / $4,000,000', umbrella: '$5,000,000', revenue: '$22,500,000', workingCapital: '−$310,000',
    bonding: 'Merchants Bonding, $2M single / $5M aggregate', backlog: '$4,600,000', largest: '$3,800,000', projects: '10',
    specialty: ['Mass grading and utilities', '10 projects'], refs: ['City of Stockton', 'Bayline Builders'],
    broker: 'Brown & Brown (Stockton)', surety: 'Merchants Bonding', osha: '1 serious citation (2025), abated', credit: 'PAYDEX 58, 2 open liens',
  },
};

/** The Submission tab: what the sub declared, by section (values only; documents are on their own tab). */
export function submissionFor(p) {
  return [
    { section: 'Company', rows: [['Legal name', p.legal], ['Entity', p.entity], ['Principals', p.principals]] },
    { section: 'Licensing', rows: [['Contractor license', p.license], ['DIR registration', p.dirReg]] },
    { section: 'Safety', rows: [['EMR (2024 / 2025 / 2026)', p.emr.join(' / ')], ['TRIR / DART (2025)', p.trir], ['Fatalities, last 5 years', p.fatalities]] },
    { section: 'Insurance', rows: [['GL each occurrence / aggregate', p.gl], ['Umbrella', p.umbrella], ['Workers’ compensation', 'Statutory']] },
    { section: 'Financial', rows: [['Revenue 2025', p.revenue], ['Working capital', p.workingCapital], ['Bonding', p.bonding]] },
    { section: 'Capacity', rows: [['Current backlog', p.backlog], ['Largest current project', p.largest]] },
    { section: 'Experience', rows: [['Projects over $1M, last 5 years', p.projects], [p.specialty[0], p.specialty[1]], ['References', `${p.refs.join(', ')}`]] },
  ];
}
