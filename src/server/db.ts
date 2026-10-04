import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { MongoClient, Db, Collection } from 'mongodb';

// Load environment variables with priority: .env.local overrides .env
export function reloadEnvironmentVariables(): { username: string; password: string } {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');

  if (fs.existsSync(envPath)) {
    try {
      const parsedEnv = dotenv.parse(fs.readFileSync(envPath, 'utf-8'));
      for (const k in parsedEnv) {
        process.env[k] = parsedEnv[k];
      }
    } catch (e) {
      console.error('Error reading .env:', e);
    }
  }

  // .env.local has higher precedence and overrides .env
  if (fs.existsSync(envLocalPath)) {
    try {
      const parsedLocal = dotenv.parse(fs.readFileSync(envLocalPath, 'utf-8'));
      for (const k in parsedLocal) {
        process.env[k] = parsedLocal[k];
      }
    } catch (e) {
      console.error('Error reading .env.local:', e);
    }
  }

  const username = (process.env.ADMIN_USERNAME || 'admin').trim();
  const password = (process.env.ADMIN_PASSWORD || 'adminpassword123').trim();

  return { username, password };
}

// Initial load on import
reloadEnvironmentVariables();

import { 
  PortfolioData, Award, 
  Publication, 
  Project, 
  Experience, 
  Education, 
  SkillGroup, 
  Training, 
  Certification,
  Achievement,
  Affiliation,
  VolunteerEngagement,
  Reference,
  Message,
  SectionConfig,
  DEFAULT_SECTIONS,
  ResearchPillar,
  CvSettings
} from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'portfolio_db.json');

const INITIAL_PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    title: 'Techno-Economic and Environmental Optimization of Advanced Hybrid Renewable Energy Systems with Green Hydrogen Production for Off-Grid Coastal Community Electrification in Bangladesh',
    authors: 'R. Islam, M. R. Ahmed, and S. I. Sayem',
    venue: 'Energy Conversion and Management: X, p. 102179',
    year: 2026,
    category: 'Journal',
    doi: '10.1016/j.ecmx.2026.102179',
    link: 'https://doi.org/10.1016/j.ecmx.2026.102179',
    abstract: 'Techno-economic and environmental optimization of an advanced hybrid renewable energy system with green hydrogen production designed for off-grid coastal community electrification in Bangladesh.',
    featured: true,
    tags: ['Hybrid Renewable Energy', 'Green Hydrogen', 'HOMER Pro', 'Off-Grid Electrification', 'Coastal Bangladesh'],
    bibtex: `@article{islam2026techno,\n  title={Techno-Economic and Environmental Optimization of Advanced Hybrid Renewable Energy Systems with Green Hydrogen Production for Off-Grid Coastal Community Electrification in Bangladesh},\n  author={Islam, R. and Ahmed, M. R. and Sayem, S. I.},\n  journal={Energy Conversion and Management: X},\n  pages={102179},\n  year={2026},\n  publisher={Elsevier},\n  doi={10.1016/j.ecmx.2026.102179}\n}`
  },
  {
    id: 'pub-2',
    title: 'Techno-economic investigation of a solar Photovoltaic (PV) energy model using PVsyst, Homer, RETscreen: a case study in Bangladesh',
    authors: 'S. M. S. M. Saumik, N. Rahman, M. A. Al Noman, R. Islam, and M. R. Ahmed',
    venue: 'Discover Electronics, vol. 2, no. 1, p. 81',
    year: 2025,
    category: 'Journal',
    doi: '10.1007/s44291-025-00119-1',
    link: 'https://doi.org/10.1007/s44291-025-00119-1',
    abstract: 'Comparative techno-economic investigation and energy yield assessment of a solar Photovoltaic (PV) system utilizing PVsyst, HOMER, and RETscreen software models for Bangladesh climate conditions.',
    featured: true,
    tags: ['Solar PV', 'PVsyst', 'HOMER', 'RETScreen', 'Techno-Economic Analysis'],
    bibtex: `@article{saumik2025techno,\n  title={Techno-economic investigation of a solar Photovoltaic (PV) energy model using PVsyst, Homer, RETscreen: a case study in Bangladesh},\n  author={Saumik, S. M. S. M. and Rahman, N. and Al Noman, M. A. and Islam, R. and Ahmed, M. R.},\n  journal={Discover Electronics},\n  volume={2},\n  number={1},\n  pages={81},\n  year={2025},\n  publisher={Springer Nature},\n  doi={10.1007/s44291-025-00119-1}\n}`
  },
  {
    id: 'pub-3',
    title: 'Performance and Emission Analysis of Hydrogen and Conventional Fuels in PFI SI Engines Using CONVERGE 3.0',
    authors: 'R. Islam, S. M. Asiqur Rahman, M. Rajin Islam, M. Rakibul Islam, M. R. Ahmed, and M. R. I. Sarker',
    venue: 'Next Energy, vol. 9, p. 100404',
    year: 2025,
    category: 'Journal',
    doi: '10.1016/j.nxener.2025.100404',
    link: 'https://doi.org/10.1016/j.nxener.2025.100404',
    abstract: 'Comprehensive 3D CFD combustion simulation, thermal efficiency assessment, and emission characterization comparing pure hydrogen against conventional fuels in port fuel injection spark ignition engines using CONVERGE 3.0.',
    featured: true,
    tags: ['Hydrogen Fuel', 'CONVERGE 3.0', 'PFI SI Engine', 'Combustion Modeling', 'Emissions Reduction'],
    bibtex: `@article{islam2025performance,\n  title={Performance and Emission Analysis of Hydrogen and Conventional Fuels in PFI SI Engines Using CONVERGE 3.0},\n  author={Islam, R. and Rahman, S. M. Asiqur and Islam, M. Rajin and Islam, M. Rakibul and Ahmed, M. R. and Sarker, M. R. I.},\n  journal={Next Energy},\n  volume={9},\n  pages={100404},\n  year={2025},\n  publisher={Elsevier},\n  doi={10.1016/j.nxener.2025.100404}\n}`
  },
  {
    id: 'pub-4',
    title: 'Computational Thermo-Hydraulic Performance Evaluation of a Shell and Tube Heat Exchanger Using Concave Triangular Ribs',
    authors: 'Rashedul Islam et al.',
    venue: 'Under Review',
    year: 2025,
    category: 'Under Review',
    abstract: 'Numerical investigation of fluid flow dynamics, heat transfer enhancement, and friction factor penalties in a shell and tube heat exchanger equipped with concave triangular turbulator ribs.',
    featured: false,
    tags: ['Heat Exchanger', 'Thermo-Hydraulic', 'ANSYS Fluent', 'CFD Simulation', 'Heat Transfer Enhancement'],
    statusNote: 'Under Review'
  },
  {
    id: 'pub-5',
    title: 'Exact Perron-Frobenius Orbits and Quantitative Convergence to Equilibrium for the Fully Chaotic Logistic Map',
    authors: 'Rashedul Islam et al.',
    venue: 'Under Review',
    year: 2025,
    category: 'Under Review',
    abstract: 'Analytical and numerical study establishing exact Perron-Frobenius transfer operator orbits and quantitative convergence rates towards invariant equilibrium measures in fully chaotic logistic map dynamics.',
    featured: false,
    tags: ['Dynamical Systems', 'Perron-Frobenius', 'Chaotic Logistic Map', 'Equilibrium Convergence', 'Mathematical Modeling'],
    statusNote: 'Under Review'
  },
  {
    id: 'pub-6',
    title: 'Comparative Molecular Dynamics Study of Mechanical, Thermal, and Fracture Behavior in Ti, Si, and Ti-Si-Doped Monolayer Graphene',
    authors: 'Rashedul Islam et al.',
    venue: 'Submitted',
    year: 2025,
    category: 'Submitted',
    abstract: 'Atomistic molecular dynamics simulation investigating stress-strain relationships, thermal conductivity variations, and crack propagation fracture mechanics in pristine and doped monolayer graphene.',
    featured: false,
    tags: ['Molecular Dynamics', 'Monolayer Graphene', 'Material Science', 'Fracture Mechanics', 'Thermal Behavior'],
    statusNote: 'Submitted'
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Electro-Mechanical Wheel Chair',
    category: 'Undergraduate Project',
    description: 'The goal of this project is to design and build an affordable solution to the mobility issues faced by those with physical limitations.',
    fullDescription: 'Utilized SolidWorks for designing CAD models Pro to render images and animations.',
    technologies: ['SolidWorks', 'CAD Modeling', 'Kinematic Analysis', 'Rendering & Animation'],
    featured: true,
    date: '2022'
  },
  {
    id: 'proj-2',
    title: 'Five speed Gear Box Mechanism with High rpm, high gear ratio and Fuel efficiency',
    category: 'Undergraduate Project',
    description: 'Used in coaxial input and output, more accuracy, high torque and high gear (6:1) ratio.',
    fullDescription: 'Designed for improved power transmission efficiency, optimized gear mesh ratios, and fuel economy.',
    technologies: ['Mechanical Design', 'Gear Ratio Optimization (6:1)', 'Coaxial Transmission', 'CAD'],
    featured: true,
    date: '2020'
  }
];

const INITIAL_EXPERIENCE: Experience[] = [
  {
    id: 'exp-1',
    role: 'Mechanical Engineering Intern',
    organization: 'Placid Bangladesh (Intern)',
    location: 'Dhaka, Bangladesh',
    period: 'Jan 2025 – May 2025',
    description: 'Mechanical systems assessment, product optimization, and maintenance operations.',
    highlights: [
      'Assessed mechanical systems and completed product optimization resulting in reduced material waste and improved operational efficiency.',
      'Participated in structured training sessions on technical operations, maintenance procedures, and quality standards.',
      'Gained practical exposure to maintenance scheduling, equipment inspection, and corrective action follow-up in a field environment.'
    ],
    current: false
  },
  {
    id: 'exp-2',
    role: 'Assistant Teacher',
    organization: 'Advance Coaching Center',
    location: 'Dinajpur, Bangladesh',
    period: 'Oct 2022 – Dec 2023',
    description: 'Delivered technical instruction and coaching for diverse student groups.',
    highlights: [
      'Delivered technical instruction and adapted training approaches to diverse learner needs- building foundational capacity-building and coaching skills applicable to field technician training.'
    ],
    current: false
  }
];

const INITIAL_EDUCATION: Education[] = [
  {
    id: 'edu-1',
    degree: 'B.Sc. in Mechanical Engineering',
    institution: 'Hajee Mohammad Danesh Science & Technology University (HSTU)',
    location: 'Dinajpur, Bangladesh',
    year: 'Jan 2019 – Dec 2022',
    result: 'CGPA: 3.363 / 4.00',
    thesis: 'Investigate the Performance of Hydrogen Fuel and Compare with Conventional Fuels in Port Fuel Injection SI Engine using CONVERGE CFD. (One Q1 Journal was Published- Next Energy, 2025)',
    coursework: 'Power Plant Engineering, Thermodynamics, Fluid Mechanics, Electrical Machines, Engineering Design, Heat Transfer, Renewable Energy Systems.'
  }
];

const INITIAL_SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'sg-1',
    category: 'Energy Modelling & Analysis',
    description: 'Hybrid system optimization, LCOE/NPC/LCOH analysis, load assessment, LCA',
    skills: [
      { name: 'HOMER Pro', highlight: true },
      { name: 'PVsyst', highlight: true },
      { name: 'RETscreen', highlight: true },
      { name: 'Hybrid System Optimization', highlight: true },
      { name: 'LCOE / NPC / LCOH Analysis', highlight: true },
      { name: 'Load Assessment & LCA', highlight: false }
    ]
  },
  {
    id: 'sg-2',
    category: 'Energy Systems',
    description: 'Solar PV, wind, biogas generator, electrolyzer, backup power, off-grid system design',
    skills: [
      { name: 'Solar PV', highlight: true },
      { name: 'Wind Energy', highlight: true },
      { name: 'Biogas Generator', highlight: true },
      { name: 'Electrolyzer & Green H2', highlight: true },
      { name: 'Backup Power', highlight: false },
      { name: 'Off-Grid System Design', highlight: true }
    ]
  },
  {
    id: 'sg-3',
    category: 'Electrical & Maintenance',
    description: 'Electrical installation assessment, preventive & corrective maintenance, generator performance monitoring, safety compliance',
    skills: [
      { name: 'Electrical Installation Assessment', highlight: true },
      { name: 'Preventive & Corrective Maintenance', highlight: true },
      { name: 'Generator Performance Monitoring', highlight: true },
      { name: 'Safety Compliance', highlight: false }
    ]
  },
  {
    id: 'sg-4',
    category: 'Technical Documentation & Capacity Building',
    description: 'Energy performance reports, system diagrams, maintenance records, feasibility studies, power assessments & coaching',
    skills: [
      { name: 'Energy Performance Reports', highlight: true },
      { name: 'System Diagrams', highlight: true },
      { name: 'Maintenance Records & Feasibility Studies', highlight: false },
      { name: 'Power Assessments', highlight: true },
      { name: 'Staff Training & Technician Coaching', highlight: true },
      { name: 'Hands-on Field Instruction', highlight: true }
    ]
  },
  {
    id: 'sg-5',
    category: 'CFD, Simulation & CAD Tools',
    description: 'CONVERGE CFD, ANSYS Fluent, COMSOL Multiphysics, SolidWorks (CSWE), AutoCAD, Solid Edge',
    skills: [
      { name: 'CONVERGE CFD', highlight: true },
      { name: 'ANSYS Fluent', highlight: true },
      { name: 'COMSOL Multiphysics', highlight: false },
      { name: 'SolidWorks (CSWE)', highlight: true },
      { name: 'AutoCAD', highlight: false },
      { name: 'Solid Edge', highlight: false }
    ]
  },
  {
    id: 'sg-6',
    category: 'Programming & Soft Skills',
    description: 'Python, MATLAB, Field logistics coordination, stakeholder communication, team leadership, project management',
    skills: [
      { name: 'Python', highlight: true },
      { name: 'MATLAB', highlight: true },
      { name: 'Field Logistics Coordination', highlight: true },
      { name: 'Stakeholder Communication', highlight: false },
      { name: 'Team Leadership & Project Management', highlight: true }
    ]
  }
];

const INITIAL_TRAININGS: Training[] = [
  {
    id: 'tr-1',
    title: '28 days of Mechanical Workshop',
    issuer: 'Technical Institute of Chemical Industries, Bangladesh (TICI)',
    year: '2023',
    description: 'Participated in scheduled training sessions on numerous methods of mechanical workshop, working procedure, and visited power plants including the Ashulia Gas Powerplant, Narsingdi; Bangladesh.'
  },
  {
    id: 'tr-2',
    title: '2 days training and workshop visit on Production Process of Machineries in Saidpur Railway Workshop',
    issuer: 'Saidpur Railway Workshop / Ansys Experts',
    year: '2019',
    description: 'Participated in all scheduled training sessions and lab works conducted by Ansys experts, gaining hands-on experience with workshop projects focused on turbulence and combustion in Ansys Fluent and CFX.'
  },
  {
    id: 'tr-3',
    title: "Field visit: Wind Turbine Power Plant, Cox's Bazar",
    issuer: "Cox's Bazar Wind Power Project",
    year: '2024',
    description: 'Operational energy data collection for off-grid hybrid energy research.'
  }
];

const INITIAL_CERTIFICATIONS: Certification[] = [];


const INITIAL_AWARDS: Award[] = [
  {
    id: 'award-1',
    date: 'Dec 2018',
    title: 'CZM Junior Scholarship Award',
    issuer: 'CZM Genius Scholarship Foundation',
    description: 'Awarded for satisfactory academic performance and participation in capacity building activities at CZM Organization in 2018.',
    showInFrontend: true
  },
  {
    id: 'award-2',
    date: 'Apr 2016',
    title: 'One Bank Scholarship',
    issuer: 'One Bank Ltd.',
    description: 'Awarded for an excellent result in the Secondary School Certificate Examination.',
    showInFrontend: true
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Hackathon Winner',
    icon: 'trophy',
    year: 'Global 2024',
    showInFrontend: true,
    showInCv: true
  },
  {
    id: 'ach-2',
    title: 'Published Researcher',
    icon: 'file-text',
    year: '2 papers',
    showInFrontend: true,
    showInCv: true
  },
  {
    id: 'ach-3',
    title: 'Open Source Contributor',
    icon: 'git-branch',
    year: '40+ merged PRs',
    showInFrontend: true,
    showInCv: true
  },
  {
    id: 'ach-4',
    title: 'Employee of the Month',
    icon: 'star',
    year: '3 times',
    showInFrontend: true,
    showInCv: true
  }
];

const INITIAL_AFFILIATIONS: Affiliation[] = [
  {
    id: 'aff-1',
    organization: "Cox’s Bazar Youth Development Society (CYDS)",
    role: 'Executive Member',
    period: '2024 - 2025'
  },
  {
    id: 'aff-2',
    organization: 'Institution of Mechanical Engineers (IMechE)',
    role: 'Affiliated Member',
    membershipId: '80778687',
    period: '2019 - 2024'
  },
  {
    id: 'aff-3',
    organization: 'American Society of Mechanical Engineers (ASME)',
    role: 'Student Member',
    membershipId: '103515864',
    period: '2019 - 2024'
  }
];

const INITIAL_VOLUNTEER: VolunteerEngagement[] = [
  {
    id: 'vol-1',
    title: 'Robo-riot Contest Event Organizer, Deceleration - A National Mechanical Festival',
    description: 'Organized and conducted two segments of the national inter-university mechanical festival at HSTU',
    period: '2022 – 2023'
  },
  {
    id: 'vol-2',
    title: 'Autodesk Ambassador Hub',
    description: 'Shared news about Autodesk products, events, and completed challenges on social media platforms',
    period: '2019 – 2021'
  },
  {
    id: 'vol-3',
    title: "Adjunct Teacher, Cox's Bazar Govt. High School",
    description: 'Conducted weekly classes for junior categories',
    period: '2017 – 2018'
  }
];

const INITIAL_REFERENCES: Reference[] = [
  {
    id: 'ref-1',
    name: 'Md. Rasel Ahmed',
    role: 'Lecturer',
    department: 'Department of Mechanical Engineering',
    organization: 'Rajshahi University of Engineering & Technology (RUET)',
    email: 'rasel@me.ruet.ac.bd',
    phone: '+880 1776 976 345'
  },
  {
    id: 'ref-2',
    name: 'KH. Nazmul Ahshan',
    role: 'Chairman and Assistant Professor',
    department: 'Department of Mechanical Engineering',
    organization: 'Hajee Mohammad Danesh Science & Technology University (HSTU)',
    email: 'nazmul.me@hstu.ac.bd',
    phone: '+880 1884 598 886'
  }
];

const INITIAL_RESEARCH_PILLARS: ResearchPillar[] = [
  {
    id: 'pillar-1',
    title: 'Biomedical Signal Processing',
    category: 'Core Foundation',
    icon: 'Activity',
    description: 'Feature extraction and predictive modeling on physiological signals (EEG/ECG) — including correlation-based feature selection for major depressive disorder detection.',
    color: 'brand',
    tags: ['EEG/ECG', 'Feature Selection', 'Biomedical Signals'],
    showInFrontend: true,
    order: 1
  },
  {
    id: 'pillar-2',
    title: 'Applied Machine Learning for Diagnostics',
    category: 'Healthcare ML',
    icon: 'Brain',
    description: 'Predictive modeling for multi-class disease classification, including diabetes mellitus prediction using filtered clinical datasets and optimized ML pipelines.',
    color: 'purple',
    tags: ['Supervised Learning', 'Clinical Data', 'Predictive Modeling'],
    showInFrontend: true,
    order: 2
  },
  {
    id: 'pillar-3',
    title: 'NLP & Data Mining (Target Focus)',
    category: 'Doctoral Target Focus',
    icon: 'MessageSquareText',
    description: 'Extending a background in structured feature engineering and pattern discovery toward language understanding, text mining, and large-scale unstructured data — the focus of my doctoral research.',
    color: 'emerald',
    tags: ['NLP', 'Data Mining', 'PhD 2027 Objective'],
    showInFrontend: true,
    order: 3
  },
  {
    id: 'pillar-4',
    title: 'Applied Systems & Software Engineering',
    category: 'Production Systems',
    icon: 'Cpu',
    description: 'Full-stack engineering experience (React, Node, Express) that translates research prototypes into deployable, data-driven systems and tools.',
    color: 'blue',
    tags: ['Next.js', 'Node.js', 'Express', 'Full-Stack'],
    showInFrontend: true,
    order: 4
  }
];

const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: 'RASHEDUL ISLAM',
    title: 'Mechanical Engineer & Energy Researcher',
    headline: 'Renewable Energy Systems • Hybrid Energy Modelling • Off-Grid Infrastructure',
    bio: 'Mechanical engineer and energy researcher with expertise in renewable energy systems, hybrid energy modelling (HOMER Pro, PVsyst, RETscreen), and field-based energy analysis. Experienced in electrical system assessment, solar PV integration, generator performance monitoring, and energy efficiency optimization. Proven ability to design, validate, and document energy systems for off-grid and resource-constrained environments. Published researcher with hands-on fieldwork in remote energy infrastructure in coastal Bangladesh. Seeking to apply technical energy expertise in support of MSF humanitarian operations in Bangladesh.',
    aboutText: [
      'Mechanical engineer and energy researcher with expertise in renewable energy systems, hybrid energy modelling (HOMER Pro, PVsyst, RETscreen), and field-based energy analysis.',
      'Experienced in electrical system assessment, solar PV integration, generator performance monitoring, and energy efficiency optimization. Proven ability to design, validate, and document energy systems for off-grid and resource-constrained environments.',
      'Published researcher with hands-on fieldwork in remote energy infrastructure in coastal Bangladesh. Seeking to apply technical energy expertise in support of MSF humanitarian operations in Bangladesh.'
    ],
    affiliation: 'Hajee Mohammad Danesh Science & Technology University (HSTU)',
    department: 'Department of Mechanical Engineering',
    email: 'rashed.me.82@gmail.com',
    phone: '(+880) 1855 362 882',
    location: "Cox's Bazar Sadar, 4700, Bangladesh",
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    cvUrl: '#',
    statusTag: 'Seeking to apply technical energy expertise in support of MSF humanitarian operations in Bangladesh',
    stats: {
      citations: 15,
      hIndex: 2,
      publicationsCount: 6,
      researchProjects: 2
    },
    social: {
      linkedin: 'https://linkedin.com/in/rashedown'
    },
    contactFields: [
      { id: 'contact-1', title: 'EMAIL', value: 'babar.mozaddid@gmail.com', icon: 'Mail', showInFrontend: true, showInCv: true },
      { id: 'contact-2', title: 'LOCATION', value: 'Modhya Badda, Dhaka 1212', icon: 'MapPin', showInFrontend: true, showInCv: true },
      { id: 'contact-3', title: 'INSTITUTION & LAB', value: 'Codemen Solutions Inc.', icon: 'Smartphone', showInFrontend: true, showInCv: true }
    ],
    cvSettings: {
      downloadMode: 'auto',
      manualCvUrl: '',
      manualCvFileName: '',
      manualCvFileSize: 0,
      manualCvUploadedAt: ''
    },
    socialLinks: [
      { id: 'social-1', platform: 'GitHub', url: 'https://github.com/mozaddid-babar', showInFrontend: true, showInCv: true },
      { id: 'social-2', platform: 'LinkedIn', url: 'https://www.linkedin.com/in/mozaddid-babar/', showInFrontend: true, showInCv: true },
      { id: 'social-3', platform: 'Google Scholar', url: 'https://scholar.google.com/citations?user=8kBaWtoAAAAJ&hl=en&oi=ao', showInFrontend: true, showInCv: true },
      { id: 'social-4', platform: 'ORCID', url: 'https://orcid.org/0009-0009-4746-0040', showInFrontend: true, showInCv: true }
    ]
  },
  publications: INITIAL_PUBLICATIONS,
  projects: INITIAL_PROJECTS,
  experience: INITIAL_EXPERIENCE,
  education: INITIAL_EDUCATION,
  skillGroups: INITIAL_SKILL_GROUPS,
  researchPillars: INITIAL_RESEARCH_PILLARS,
  trainings: INITIAL_TRAININGS,
  certifications: INITIAL_CERTIFICATIONS,
  awards: INITIAL_AWARDS,
  achievements: INITIAL_ACHIEVEMENTS,
  affiliations: INITIAL_AFFILIATIONS,
  volunteerWork: INITIAL_VOLUNTEER,
  references: INITIAL_REFERENCES,
  messages: [],
  adminConfig: {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHashOrPlain: process.env.ADMIN_PASSWORD || 'adminpassword123',
    lastUpdated: new Date().toISOString()
  },
  sections: DEFAULT_SECTIONS
};

export class PortfolioDatabase {
  private data: PortfolioData;
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private mongoCollection: Collection | null = null;
  private isConnectedToMongo: boolean = false;
  private mongoError: string | null = null;
  private lastMongoSync: string | null = null;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
    // Initialize MongoDB Atlas connection asynchronously in background
    this.initMongo().catch(err => {
      console.warn('[PortfolioDB] Mongo initial connection deferred:', err.message);
    });
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        // Ignored in read-only environments
      }
    }
  }

  private normalizeData(parsed: any): PortfolioData {
    if (!parsed || typeof parsed !== 'object') {
      return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    }

    // Process sections: keep saved ordering & toggles, merge with any new defaults
    const rawSections = Array.isArray(parsed.sections) ? parsed.sections : [];
    const existingMap = new Map(rawSections.map((s: SectionConfig) => [s.id, s]));
    const mergedSections: SectionConfig[] = [];
    for (const raw of rawSections) {
      const def = DEFAULT_SECTIONS.find(d => d.id === raw.id);
      if (def) {
        mergedSections.push({
          ...def,
          ...raw,
          cvTitle: raw.cvTitle !== undefined ? raw.cvTitle : (def.cvTitle || ''),
          cvEducationTitle: raw.cvEducationTitle !== undefined ? raw.cvEducationTitle : (def.cvEducationTitle || ''),
          experienceColumnTitle: raw.experienceColumnTitle !== undefined ? raw.experienceColumnTitle : (def.experienceColumnTitle || ''),
          educationColumnTitle: raw.educationColumnTitle !== undefined ? raw.educationColumnTitle : (def.educationColumnTitle || ''),
          educationHiddenText: raw.educationHiddenText !== undefined ? raw.educationHiddenText : (def.educationHiddenText || ''),
          showInFrontend: raw.showInFrontend ?? true,
          showInCv: raw.showInCv ?? true
        });
      }
    }
    for (const def of DEFAULT_SECTIONS) {
      if (!existingMap.has(def.id)) {
        mergedSections.push({ ...def });
      }
    }

    return {
      ...DEFAULT_PORTFOLIO_DATA,
      ...parsed,
      profile: {
        ...DEFAULT_PORTFOLIO_DATA.profile,
        ...(parsed.profile || {}),
        stats: {
          ...DEFAULT_PORTFOLIO_DATA.profile.stats,
          ...(parsed.profile?.stats || {})
        },
        social: {
          ...DEFAULT_PORTFOLIO_DATA.profile.social,
          ...(parsed.profile?.social || {})
        },
        contactFields: parsed.profile?.contactFields || DEFAULT_PORTFOLIO_DATA.profile.contactFields,
        socialLinks: parsed.profile?.socialLinks || DEFAULT_PORTFOLIO_DATA.profile.socialLinks,
        cvSettings: parsed.profile?.cvSettings || DEFAULT_PORTFOLIO_DATA.profile.cvSettings
      },
      publications: Array.isArray(parsed.publications) ? parsed.publications : DEFAULT_PORTFOLIO_DATA.publications,
      projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_PORTFOLIO_DATA.projects,
      experience: Array.isArray(parsed.experience) ? parsed.experience : DEFAULT_PORTFOLIO_DATA.experience,
      education: Array.isArray(parsed.education) ? parsed.education : DEFAULT_PORTFOLIO_DATA.education,
      skillGroups: Array.isArray(parsed.skillGroups) ? parsed.skillGroups : DEFAULT_PORTFOLIO_DATA.skillGroups,
      researchPillars: Array.isArray(parsed.researchPillars) ? parsed.researchPillars : INITIAL_RESEARCH_PILLARS,
      trainings: Array.isArray(parsed.trainings) ? parsed.trainings : DEFAULT_PORTFOLIO_DATA.trainings,
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : DEFAULT_PORTFOLIO_DATA.certifications,
      awards: Array.isArray(parsed.awards) ? parsed.awards : DEFAULT_PORTFOLIO_DATA.awards,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : DEFAULT_PORTFOLIO_DATA.achievements,
      affiliations: Array.isArray(parsed.affiliations) ? parsed.affiliations : DEFAULT_PORTFOLIO_DATA.affiliations,
      volunteerWork: Array.isArray(parsed.volunteerWork) ? parsed.volunteerWork : DEFAULT_PORTFOLIO_DATA.volunteerWork,
      references: Array.isArray(parsed.references) ? parsed.references : DEFAULT_PORTFOLIO_DATA.references,
      messages: Array.isArray(parsed.messages) ? parsed.messages : DEFAULT_PORTFOLIO_DATA.messages,
      adminConfig: parsed.adminConfig || DEFAULT_PORTFOLIO_DATA.adminConfig,
      sections: mergedSections.length > 0 ? mergedSections : DEFAULT_SECTIONS
    };
  }

  private loadData(): PortfolioData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return this.normalizeData(parsed);
      }
    } catch (err) {
      console.error('Error loading portfolio database from JSON:', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
  }

  public async initMongo(): Promise<boolean> {
    reloadEnvironmentVariables();
    const uri = process.env.MONGODB_URI?.trim();

    if (!uri) {
      this.isConnectedToMongo = false;
      this.mongoError = null;
      console.log('[PortfolioDB] No MONGODB_URI set. Portfolio is operating using local file cache.');
      return false;
    }

    try {
      if (this.mongoClient) {
        try {
          await this.mongoClient.close();
        } catch {}
      }

      this.mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000
      });

      await this.mongoClient.connect();
      const dbName = (process.env.MONGODB_DB_NAME || 'portfolio').trim();
      this.mongoDb = this.mongoClient.db(dbName);
      this.mongoCollection = this.mongoDb.collection('portfolio_data');

      // Check if data already exists in cloud cluster
      const cloudDoc = await this.mongoCollection.findOne({ _id: 'main_portfolio' as any });

      if (!cloudDoc) {
        // Brand new database in Atlas: auto-seed from our rich current dataset
        console.log('[PortfolioDB] Empty MongoDB Atlas database detected. Auto-seeding with complete portfolio data...');
        const payload = {
          _id: 'main_portfolio',
          ...this.data,
          updatedAt: new Date().toISOString()
        };
        await this.mongoCollection.replaceOne({ _id: 'main_portfolio' as any }, payload as any, { upsert: true });
        console.log('[PortfolioDB] MongoDB Atlas auto-seeding completed successfully!');
      } else {
        // Cloud data exists: load latest into in-memory cache
        console.log('[PortfolioDB] Successfully retrieved latest portfolio dataset from MongoDB Atlas.');
        const { _id, updatedAt, ...rest } = cloudDoc as any;
        this.data = this.normalizeData(rest);
        this.saveLocalBackup();
      }

      this.isConnectedToMongo = true;
      this.mongoError = null;
      this.lastMongoSync = new Date().toISOString();
      console.log(`[PortfolioDB] Connected to MongoDB Atlas cluster (Database: ${dbName}, Collection: portfolio_data)`);
      return true;
    } catch (err: any) {
      console.error('[PortfolioDB] Failed to connect to MongoDB Atlas:', err.message);
      this.isConnectedToMongo = false;
      this.mongoError = err.message || 'Failed to connect to MongoDB Atlas';
      return false;
    }
  }

  public async reconnectMongo(): Promise<boolean> {
    return await this.initMongo();
  }

  public getDatabaseStatus() {
    reloadEnvironmentVariables();
    const uri = process.env.MONGODB_URI?.trim();
    return {
      connected: this.isConnectedToMongo,
      hasUri: Boolean(uri && uri.length > 0),
      dbName: process.env.MONGODB_DB_NAME || 'portfolio',
      collection: 'portfolio_data',
      lastSync: this.lastMongoSync,
      error: this.mongoError,
      mode: this.isConnectedToMongo 
        ? 'mongodb_atlas' 
        : (uri ? 'connection_error' : 'local_file_cache'),
      stats: {
        publications: this.data.publications?.length || 0,
        projects: this.data.projects?.length || 0,
        experience: this.data.experience?.length || 0,
        education: this.data.education?.length || 0,
        messages: this.data.messages?.length || 0
      }
    };
  }

  private saveLocalBackup() {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      // In read-only serverless cloud environments (like Netlify Functions / Vercel), local FS write fails safely
      console.warn('[PortfolioDB] Local file cache write note (expected in read-only serverless):', (err as any)?.message || err);
    }
  }

  private sync() {
    // 1. Synchronously save local backup file
    this.saveLocalBackup();

    // 2. Asynchronously persist to MongoDB Atlas (zero latency for the caller)
    if (this.isConnectedToMongo && this.mongoCollection) {
      const payload = {
        _id: 'main_portfolio',
        ...this.data,
        updatedAt: new Date().toISOString()
      };
      this.mongoCollection.replaceOne({ _id: 'main_portfolio' as any }, payload as any, { upsert: true })
        .then(() => {
          this.lastMongoSync = new Date().toISOString();
          this.mongoError = null;
        })
        .catch((err: any) => {
          console.error('[PortfolioDB] Asynchronous sync to MongoDB Atlas failed:', err.message);
          this.mongoError = err.message;
        });
    }
  }

  public getFullData(): PortfolioData {
    return this.data;
  }

  public getPublicData(): Omit<PortfolioData, 'messages' | 'adminConfig'> {
    const { messages, adminConfig, ...publicData } = this.data;
    return publicData;
  }

  public updateProfile(updatedProfile: Partial<PortfolioData['profile']>): PortfolioData['profile'] {
    this.data.profile = {
      ...this.data.profile,
      ...updatedProfile,
      cvSettings: updatedProfile.cvSettings !== undefined ? updatedProfile.cvSettings : (this.data.profile.cvSettings || DEFAULT_PORTFOLIO_DATA.profile.cvSettings),
      stats: {
        ...this.data.profile.stats,
        ...(updatedProfile.stats || {})
      },
      social: {
        ...this.data.profile.social,
        ...(updatedProfile.social || {})
      }
    };
    this.sync();
    return this.data.profile;
  }

  public getCvSettings(): CvSettings {
    return this.data.profile.cvSettings || {
      downloadMode: 'auto',
      manualCvUrl: '',
      manualCvFileName: '',
      manualCvFileSize: 0,
      manualCvUploadedAt: ''
    };
  }

  public updateCvSettings(settings: Partial<CvSettings>): CvSettings {
    const defaultSettings: CvSettings = {
      downloadMode: 'auto',
      manualCvUrl: '',
      manualCvFileName: '',
      manualCvFileSize: 0,
      manualCvUploadedAt: ''
    };
    const current = this.data.profile.cvSettings || defaultSettings;
    this.data.profile.cvSettings = {
      ...current,
      ...settings
    };
    this.sync();
    return this.data.profile.cvSettings;
  }

  public getAdminConfig() {
    return this.data.adminConfig || DEFAULT_PORTFOLIO_DATA.adminConfig!;
  }

  public verifyAdmin(username: string, passwordAttempt: string): boolean {
    // Reload environment variables so edits to .env.local take effect immediately without needing server restart
    const { username: envUsername, password: envPassword } = reloadEnvironmentVariables();

    const fallbackUsername = this.getAdminConfig().username || 'admin';
    const fallbackPassword = this.getAdminConfig().passwordHashOrPlain || 'adminpassword123';

    const expectedUsername = (envUsername || fallbackUsername).trim();
    const expectedPassword = (envPassword || fallbackPassword).trim();

    return username.trim() === expectedUsername && passwordAttempt.trim() === expectedPassword;
  }

  public updateAdminCredentials(username: string, passwordHashOrPlain: string) {
    this.data.adminConfig = {
      username,
      passwordHashOrPlain,
      lastUpdated: new Date().toISOString()
    };
    this.sync();
    return true;
  }

  // --- Publications Operations ---
  public getPublications(): Publication[] {
    return this.data.publications;
  }

  public addPublication(pub: Omit<Publication, 'id'>): Publication {
    const newPub: Publication = {
      ...pub,
      id: `pub-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.publications.unshift(newPub);
    this.sync();
    return newPub;
  }

  public updatePublication(id: string, updatedPub: Partial<Publication>): Publication | null {
    const idx = this.data.publications.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.publications[idx] = {
      ...this.data.publications[idx],
      ...updatedPub,
      id
    };
    this.sync();
    return this.data.publications[idx];
  }

  public deletePublication(id: string): boolean {
    const beforeLen = this.data.publications.length;
    this.data.publications = this.data.publications.filter(p => p.id !== id);
    const deleted = this.data.publications.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  public bulkImportPublications(
    newPubs: Array<Omit<Publication, 'id'> & { id?: string }>,
    options: { updateExisting?: boolean } = { updateExisting: true }
  ): { addedCount: number; updatedCount: number; publications: Publication[] } {
    let addedCount = 0;
    let updatedCount = 0;

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

    for (const item of newPubs) {
      if (!item.title || !item.title.trim()) continue;

      const normTitle = normalize(item.title);
      const cleanDoi = (item.doi || '').trim().toLowerCase();

      // Find existing match
      const existingIdx = this.data.publications.findIndex(p => {
        if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) {
          return true;
        }
        if (normalize(p.title) === normTitle) {
          return true;
        }
        return false;
      });

      if (existingIdx !== -1) {
        if (options.updateExisting) {
          const existing = this.data.publications[existingIdx];
          this.data.publications[existingIdx] = {
            ...existing,
            ...item,
            id: existing.id,
            // Keep existing tags / featured status if not specified
            featured: item.featured ?? existing.featured,
            tags: (item.tags && item.tags.length > 0) ? item.tags : existing.tags,
            citations: item.citations !== undefined ? item.citations : existing.citations,
            doi: item.doi || existing.doi,
            link: item.link || existing.link,
            pdfUrl: item.pdfUrl || existing.pdfUrl,
            abstract: item.abstract || existing.abstract,
            bibtex: item.bibtex || existing.bibtex
          };
          updatedCount++;
        }
      } else {
        // Insert new publication
        const newPub: Publication = {
          title: item.title,
          authors: item.authors || 'Unknown Authors',
          venue: item.venue || 'Academic Publication',
          year: item.year || new Date().getFullYear(),
          category: item.category || 'Journal',
          doi: item.doi || '',
          link: item.link || '',
          pdfUrl: item.pdfUrl || '',
          abstract: item.abstract || '',
          citations: item.citations || 0,
          featured: !!item.featured,
          tags: item.tags || [],
          bibtex: item.bibtex || '',
          statusNote: item.statusNote || '',
          id: item.id || `pub-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        };
        this.data.publications.unshift(newPub);
        addedCount++;
      }
    }

    this.sync();
    return {
      addedCount,
      updatedCount,
      publications: this.data.publications
    };
  }

  // --- Projects Operations ---
  public addProject(proj: Omit<Project, 'id'>): Project {
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.projects.unshift(newProj);
    this.sync();
    return newProj;
  }

  public updateProject(id: string, updatedProj: Partial<Project>): Project | null {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updatedProj,
      id
    };
    this.sync();
    return this.data.projects[idx];
  }

  public deleteProject(id: string): boolean {
    const beforeLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    const deleted = this.data.projects.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Experience Operations ---
  public addExperience(exp: Omit<Experience, 'id'>): Experience {
    const newExp: Experience = {
      ...exp,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.experience.unshift(newExp);
    this.sync();
    return newExp;
  }

  public updateExperience(id: string, updatedExp: Partial<Experience>): Experience | null {
    const idx = this.data.experience.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.experience[idx] = {
      ...this.data.experience[idx],
      ...updatedExp,
      id
    };
    this.sync();
    return this.data.experience[idx];
  }

  public deleteExperience(id: string): boolean {
    const beforeLen = this.data.experience.length;
    this.data.experience = this.data.experience.filter(e => e.id !== id);
    const deleted = this.data.experience.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Education Operations ---
  public addEducation(edu: Omit<Education, 'id'>): Education {
    const newEdu: Education = {
      ...edu,
      id: `edu-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.data.education.unshift(newEdu);
    this.sync();
    return newEdu;
  }

  public updateEducation(id: string, updatedEdu: Partial<Education>): Education | null {
    const idx = this.data.education.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.education[idx] = {
      ...this.data.education[idx],
      ...updatedEdu,
      id
    };
    this.sync();
    return this.data.education[idx];
  }

  public deleteEducation(id: string): boolean {
    const beforeLen = this.data.education.length;
    this.data.education = this.data.education.filter(e => e.id !== id);
    const deleted = this.data.education.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Trainings Operations ---
  public getTrainings(): Training[] {
    return this.data.trainings || [];
  }

  public addTraining(training: Omit<Training, 'id'>): Training {
    const newTr: Training = {
      ...training,
      id: `tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    if (!this.data.trainings) this.data.trainings = [];
    this.data.trainings.unshift(newTr);
    this.sync();
    return newTr;
  }

  public updateTraining(id: string, updatedTr: Partial<Training>): Training | null {
    if (!this.data.trainings) this.data.trainings = [];
    const idx = this.data.trainings.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.trainings[idx] = {
      ...this.data.trainings[idx],
      ...updatedTr,
      id
    };
    this.sync();
    return this.data.trainings[idx];
  }

  public deleteTraining(id: string): boolean {
    if (!this.data.trainings) return false;
    const beforeLen = this.data.trainings.length;
    this.data.trainings = this.data.trainings.filter(t => t.id !== id);
    const deleted = this.data.trainings.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Certifications Operations ---
  public getCertifications(): Certification[] {
    return this.data.certifications || [];
  }

  public addCertification(cert: Omit<Certification, 'id'>): Certification {
    const newCert: Certification = {
      ...cert,
      id: `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    if (!this.data.certifications) this.data.certifications = [];
    this.data.certifications.unshift(newCert);
    this.sync();
    return newCert;
  }

  public updateCertification(id: string, updated: Partial<Certification>): Certification | null {
    if (!this.data.certifications) this.data.certifications = [];
    const idx = this.data.certifications.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.certifications[idx] = { ...this.data.certifications[idx], ...updated, id };
    this.sync();
    return this.data.certifications[idx];
  }

  
  public reorderCertifications(orderedIds: string[]): Certification[] {
    if (!this.data.certifications) return [];
    const certMap = new Map(this.data.certifications.map(c => [c.id, c]));
    const newOrdered: Certification[] = [];
    for (const id of orderedIds) {
      if (certMap.has(id)) {
        newOrdered.push(certMap.get(id)!);
        certMap.delete(id);
      }
    }
    // Add any remaining items that were not in the list at the end
    newOrdered.push(...Array.from(certMap.values()));
    this.data.certifications = newOrdered;
    this.sync();
    return this.data.certifications;
  }

  public deleteCertification(id: string): boolean {
    if (!this.data.certifications) return false;
    const beforeLen = this.data.certifications.length;
    this.data.certifications = this.data.certifications.filter(c => c.id !== id);
    const deleted = this.data.certifications.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Achievements Operations ---

  // --- Awards ---
  public getAwards(): Award[] {
    return this.data.awards || [];
  }

  public addAward(item: Omit<Award, 'id'>): Award {
    const newItem: Award = { ...item, id: 'awd-' + Date.now().toString() };
    if (!this.data.awards) this.data.awards = [];
    this.data.awards.push(newItem); // keep order or unshift? unshift for newer first? User asked for ordered, but let's just push or unshift, we can add a reorder method later if needed. Wait, we might want reorder. Let's just push.
    this.sync();
    return newItem;
  }

  public updateAward(id: string, updated: Partial<Award>): Award | null {
    if (!this.data.awards) this.data.awards = [];
    const idx = this.data.awards.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.awards[idx] = { ...this.data.awards[idx], ...updated, id };
    this.sync();
    return this.data.awards[idx];
  }

  public deleteAward(id: string): boolean {
    if (!this.data.awards) return false;
    const beforeLen = this.data.awards.length;
    this.data.awards = this.data.awards.filter(a => a.id !== id);
    const deleted = this.data.awards.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  public reorderAwards(orderedIds: string[]): Award[] {
    if (!this.data.awards) return [];
    const itemMap = new Map(this.data.awards.map(i => [i.id, i]));
    const newOrdered: Award[] = [];
    for (const id of orderedIds) {
      if (itemMap.has(id)) {
        newOrdered.push(itemMap.get(id)!);
        itemMap.delete(id);
      }
    }
    for (const [_, item] of itemMap) {
      newOrdered.push(item);
    }
    this.data.awards = newOrdered;
    this.sync();
    return this.data.awards;
  }

  public getAchievements(): Achievement[] {
    return this.data.achievements || [];
  }

  public addAchievement(item: Omit<Achievement, 'id'>): Achievement {
    const newItem: Achievement = {
      ...item,
      id: `ach-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    if (!this.data.achievements) this.data.achievements = [];
    this.data.achievements.unshift(newItem);
    this.sync();
    return newItem;
  }

    public reorderAchievements(orderedIds: string[]): Achievement[] {
    if (!this.data.achievements) return [];
    const itemMap = new Map(this.data.achievements.map(i => [i.id, i]));
    const newOrdered: Achievement[] = [];
    for (const id of orderedIds) {
      if (itemMap.has(id)) {
        newOrdered.push(itemMap.get(id)!);
        itemMap.delete(id);
      }
    }
    // Add remaining
    for (const [_, item] of itemMap) {
      newOrdered.push(item);
    }
    this.data.achievements = newOrdered;
    this.sync();
    return this.data.achievements;
  }

  public updateAchievement(id: string, updated: Partial<Achievement>): Achievement | null {
    if (!this.data.achievements) this.data.achievements = [];
    const idx = this.data.achievements.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.achievements[idx] = { ...this.data.achievements[idx], ...updated, id };
    this.sync();
    return this.data.achievements[idx];
  }

  public deleteAchievement(id: string): boolean {
    if (!this.data.achievements) return false;
    const beforeLen = this.data.achievements.length;
    this.data.achievements = this.data.achievements.filter(a => a.id !== id);
    const deleted = this.data.achievements.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Affiliations Operations ---
  public getAffiliations(): Affiliation[] {
    return this.data.affiliations || [];
  }

  public addAffiliation(item: Omit<Affiliation, 'id'>): Affiliation {
    const newItem: Affiliation = {
      ...item,
      id: `aff-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    if (!this.data.affiliations) this.data.affiliations = [];
    this.data.affiliations.unshift(newItem);
    this.sync();
    return newItem;
  }

  public updateAffiliation(id: string, updated: Partial<Affiliation>): Affiliation | null {
    if (!this.data.affiliations) this.data.affiliations = [];
    const idx = this.data.affiliations.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.affiliations[idx] = { ...this.data.affiliations[idx], ...updated, id };
    this.sync();
    return this.data.affiliations[idx];
  }

  public deleteAffiliation(id: string): boolean {
    if (!this.data.affiliations) return false;
    const beforeLen = this.data.affiliations.length;
    this.data.affiliations = this.data.affiliations.filter(a => a.id !== id);
    const deleted = this.data.affiliations.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Volunteer Work Operations ---
  public getVolunteerWork(): VolunteerEngagement[] {
    return this.data.volunteerWork || [];
  }

  public addVolunteerWork(item: Omit<VolunteerEngagement, 'id'>): VolunteerEngagement {
    const newItem: VolunteerEngagement = {
      ...item,
      id: `vol-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    if (!this.data.volunteerWork) this.data.volunteerWork = [];
    this.data.volunteerWork.unshift(newItem);
    this.sync();
    return newItem;
  }

  public updateVolunteerWork(id: string, updated: Partial<VolunteerEngagement>): VolunteerEngagement | null {
    if (!this.data.volunteerWork) this.data.volunteerWork = [];
    const idx = this.data.volunteerWork.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.volunteerWork[idx] = { ...this.data.volunteerWork[idx], ...updated, id };
    this.sync();
    return this.data.volunteerWork[idx];
  }

  public deleteVolunteerWork(id: string): boolean {
    if (!this.data.volunteerWork) return false;
    const beforeLen = this.data.volunteerWork.length;
    this.data.volunteerWork = this.data.volunteerWork.filter(v => v.id !== id);
    const deleted = this.data.volunteerWork.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- References Operations ---
  public reorderVolunteerWork(orderedIds: string[]): VolunteerEngagement[] {
    if (!this.data.volunteerWork) return [];
    const itemMap = new Map(this.data.volunteerWork.map(i => [i.id, i]));
    const newOrdered: VolunteerEngagement[] = [];
    for (const id of orderedIds) {
      if (itemMap.has(id)) {
        newOrdered.push(itemMap.get(id)!);
        itemMap.delete(id);
      }
    }
    for (const [_, item] of itemMap) {
      newOrdered.push(item);
    }
    this.data.volunteerWork = newOrdered;
    this.sync();
    return this.data.volunteerWork;
  }
  public getReferences(): Reference[] {
    return this.data.references || [];
  }

  public addReference(item: Omit<Reference, 'id'>): Reference {
    const newItem: Reference = {
      ...item,
      id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    if (!this.data.references) this.data.references = [];
    this.data.references.unshift(newItem);
    this.sync();
    return newItem;
  }

  public updateReference(id: string, updated: Partial<Reference>): Reference | null {
    if (!this.data.references) this.data.references = [];
    const idx = this.data.references.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.references[idx] = { ...this.data.references[idx], ...updated, id };
    this.sync();
    return this.data.references[idx];
  }

  public deleteReference(id: string): boolean {
    if (!this.data.references) return false;
    const beforeLen = this.data.references.length;
    this.data.references = this.data.references.filter(r => r.id !== id);
    const deleted = this.data.references.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Skills Operations ---
  public updateSkillGroups(groups: SkillGroup[]): SkillGroup[] {
    this.data.skillGroups = groups.map((g, idx) => ({
      ...g,
      id: g.id || `sg-${idx + 1}-${Date.now()}`,
      skills: Array.isArray(g.skills) ? g.skills : []
    }));
    this.sync();
    return this.data.skillGroups;
  }

  // --- Messages Operations ---
  public getMessages(): Message[] {
    return this.data.messages;
  }

  public addMessage(msg: { name: string; email: string; subject: string; message: string }): Message {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: msg.name.trim(),
      email: msg.email.trim(),
      subject: msg.subject.trim() || 'General Inquiry',
      message: msg.message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
      replied: false
    };
    this.data.messages.unshift(newMsg);
    this.sync();
    return newMsg;
  }

  public toggleMessageRead(id: string): Message | null {
    const idx = this.data.messages.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.messages[idx].read = !this.data.messages[idx].read;
    this.sync();
    return this.data.messages[idx];
  }

  public deleteMessage(id: string): boolean {
    const beforeLen = this.data.messages.length;
    this.data.messages = this.data.messages.filter(m => m.id !== id);
    const deleted = this.data.messages.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  // --- Section Ordering & Visibility Operations ---
  public getSections(): SectionConfig[] {
    const defaultMap = new Map(DEFAULT_SECTIONS.map(d => [d.id, d]));
    if (!this.data.sections || this.data.sections.length === 0) {
      this.data.sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
      this.sync();
      return this.data.sections;
    }

    // Ensure all fields (title, topText, description, visibility toggles) exist on loaded sections
    let changed = false;
    this.data.sections = this.data.sections.map(s => {
      const def = defaultMap.get(s.id);
      const updated: SectionConfig = {
        ...def,
        ...s,
        title: s.title !== undefined ? s.title : (def?.title || s.label),
        topText: s.topText !== undefined ? s.topText : (def?.topText || ''),
        description: s.description !== undefined ? s.description : (def?.description || ''),
        showTitle: s.showTitle !== undefined ? s.showTitle : true,
        showTopText: s.showTopText !== undefined ? s.showTopText : false,
        showDescription: s.showDescription !== undefined ? s.showDescription : false,
        showInFrontend: s.showInFrontend ?? true,
        showInCv: s.showInCv ?? true
      };
      if (
        s.title === undefined ||
        s.topText === undefined ||
        s.showTitle === undefined ||
        s.showTopText === undefined ||
        s.showDescription === undefined
      ) {
        changed = true;
      }
      return updated;
    });

    if (changed) {
      this.sync();
    }
    return this.data.sections;
  }

  public updateSections(sections: SectionConfig[]): SectionConfig[] {
    const defaultMap = new Map(DEFAULT_SECTIONS.map(d => [d.id, d]));
    const validatedSections: SectionConfig[] = [];
    const seenIds = new Set<string>();

    for (const sec of sections) {
      if (!sec || !sec.id) continue;
      const def = defaultMap.get(sec.id);
      if (def && !seenIds.has(sec.id)) {
        seenIds.add(sec.id);
        validatedSections.push({
          ...def,
          ...sec,
          title: sec.title !== undefined ? sec.title : (def.title ?? sec.label),
          cvTitle: sec.cvTitle !== undefined ? sec.cvTitle : (def.cvTitle ?? ''),
          cvEducationTitle: sec.cvEducationTitle !== undefined ? sec.cvEducationTitle : (def.cvEducationTitle ?? ''),
          experienceColumnTitle: sec.experienceColumnTitle !== undefined ? sec.experienceColumnTitle : (def.experienceColumnTitle ?? ''),
          educationColumnTitle: sec.educationColumnTitle !== undefined ? sec.educationColumnTitle : (def.educationColumnTitle ?? ''),
          educationHiddenText: sec.educationHiddenText !== undefined ? sec.educationHiddenText : (def.educationHiddenText ?? ''),
          topText: sec.topText !== undefined ? sec.topText : (def.topText ?? ''),
          description: sec.description !== undefined ? sec.description : (def.description ?? ''),
          showTitle: sec.showTitle !== undefined ? sec.showTitle : true,
          showTopText: sec.showTopText !== undefined ? sec.showTopText : false,
          showDescription: sec.showDescription !== undefined ? sec.showDescription : false,
          showInFrontend: sec.showInFrontend ?? true,
          showInCv: sec.showInCv ?? true
        });
      }
    }

    // append any missing sections
    for (const def of DEFAULT_SECTIONS) {
      if (!seenIds.has(def.id)) {
        validatedSections.push({ ...def });
      }
    }

    this.data.sections = validatedSections;
    this.sync();
    return this.data.sections;
  }

  public reorderSections(orderedIds: string[]): SectionConfig[] {
    const currentSections = this.getSections();
    const map = new Map(currentSections.map(s => [s.id, s]));
    const newOrdered: SectionConfig[] = [];

    for (const id of orderedIds) {
      if (map.has(id)) {
        newOrdered.push(map.get(id)!);
        map.delete(id);
      }
    }
    for (const [_, s] of map) {
      newOrdered.push(s);
    }

    this.data.sections = newOrdered;
    this.sync();
    return this.data.sections;
  }

  public toggleSectionVisibility(
    id: string, 
    field: 'showInFrontend' | 'showInCv' | 'showTitle' | 'showTopText' | 'showDescription', 
    value: boolean
  ): SectionConfig | null {
    const sections = this.getSections();
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1) return null;

    sections[idx][field] = value;
    this.data.sections = sections;
    this.sync();
    return sections[idx];
  }

  public resetSections(): SectionConfig[] {
    this.data.sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    this.sync();
    return this.data.sections;
  }

  // --- Research Pillars Operations ---
  public getResearchPillars(): ResearchPillar[] {
    return (this.data.researchPillars || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  public addResearchPillar(pillar: Omit<ResearchPillar, 'id'>): ResearchPillar {
    const newPillar: ResearchPillar = {
      ...pillar,
      id: `pillar-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order: (this.data.researchPillars?.length || 0) + 1,
      showInFrontend: pillar.showInFrontend !== false
    };
    if (!this.data.researchPillars) this.data.researchPillars = [];
    this.data.researchPillars.push(newPillar);
    this.sync();
    return newPillar;
  }

  public updateResearchPillar(id: string, updated: Partial<ResearchPillar>): ResearchPillar | null {
    if (!this.data.researchPillars) this.data.researchPillars = [];
    const idx = this.data.researchPillars.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.researchPillars[idx] = {
      ...this.data.researchPillars[idx],
      ...updated,
      id
    };
    this.sync();
    return this.data.researchPillars[idx];
  }

  public deleteResearchPillar(id: string): boolean {
    if (!this.data.researchPillars) return false;
    const beforeLen = this.data.researchPillars.length;
    this.data.researchPillars = this.data.researchPillars.filter(p => p.id !== id);
    const deleted = this.data.researchPillars.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }

  public reorderResearchPillars(orderedIds: string[]): ResearchPillar[] {
    if (!this.data.researchPillars) return [];
    const map = new Map(this.data.researchPillars.map(p => [p.id, p]));
    const reordered: ResearchPillar[] = [];
    orderedIds.forEach((id, index) => {
      if (map.has(id)) {
        const item = map.get(id)!;
        item.order = index + 1;
        reordered.push(item);
        map.delete(id);
      }
    });
    for (const [_, item] of map) {
      item.order = reordered.length + 1;
      reordered.push(item);
    }
    this.data.researchPillars = reordered;
    this.sync();
    return this.data.researchPillars;
  }

  // --- Full DB Operations ---
  public resetToDefault(): PortfolioData {
    this.data = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    this.sync();
    return this.data;
  }

  public importDatabase(importedData: any): boolean {
    if (!importedData || typeof importedData !== 'object') {
      throw new Error('Invalid JSON structure');
    }
    if (!importedData.profile || !Array.isArray(importedData.publications)) {
      throw new Error('Missing essential profile or publications array');
    }
    this.data = this.normalizeData({
      ...importedData,
      adminConfig: this.data.adminConfig
    });
    this.sync();
    return true;
  }
}

export const db = new PortfolioDatabase();
