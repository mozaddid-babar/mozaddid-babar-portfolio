export interface DynamicContact {
  id: string;
  title: string;
  value: string;
  icon?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface DynamicSocial {
  id: string;
  platform: string;
  url: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface CvSettings {
  downloadMode: 'auto' | 'manual';   // 'auto': dynamic generated CV; 'manual': custom uploaded PDF
  manualCvUrl?: string;             // base64 data URI or URL of custom uploaded PDF
  manualCvFileName?: string;        // original uploaded filename (e.g. "Mozaddid_Ul_Hoque_Babar_CV.pdf")
  manualCvFileSize?: number;        // size in bytes
  manualCvUploadedAt?: string;      // ISO timestamp of upload
}

export interface Profile {
  logoUrl?: string;
  siteTitle?: string;
  name: string;
  title: string;
  headline: string;
  bio: string;
  aboutText: string[];
  aboutTitle?: string;
  aboutBadge?: string;
  affiliation: string;
  department: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  location: string;
  avatarUrl: string;
  cvUrl?: string;
  cvSettings?: CvSettings;
  statusTag: string;
  stats: {
    citations: number;
    hIndex: number;
    publicationsCount: number;
    researchProjects: number;
  };
  social: {
    scholar?: string;
    researchgate?: string;
    github?: string;
    linkedin?: string;
    orcid?: string;
    twitter?: string;
    website?: string;
    codeforces?: string;
    leetcode?: string;
  };
  contactFields?: DynamicContact[];
  socialLinks?: DynamicSocial[];
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  category: 'Journal' | 'Conference' | 'Preprint' | 'Book Chapter' | 'Workshop' | 'Under Review' | 'Submitted';
  doi?: string;
  link?: string;
  pdfUrl?: string;
  abstract: string;
  citations?: number;
  bibtex?: string;
  featured?: boolean;
  tags: string[];
  statusNote?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  fullDescription?: string;
  buildNote?: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  images?: string[];
  featured?: boolean;
  date?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface ExperienceRole {
  id: string;
  title: string;
  period: string;
  location?: string;
  description: string;
  highlights: string[];
  skills?: string[];
  current?: boolean;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  logoUrl?: string;
  department?: string;
  location: string;
  period: string;
  description: string;
  highlights: string[];
  skills?: string[];
  current?: boolean;
  roles?: ExperienceRole[];
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  department?: string;
  location?: string;
  year: string;
  result?: string;
  thesis?: string;
  coursework?: string;
  advisor?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface SkillItem {
  name: string;
  level?: number;
  highlight?: boolean;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface SkillGroup {
  id: string;
  category: string;
  description?: string;
  skills: SkillItem[];
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  organization?: string;
  date?: string;
  year?: string;
  category?: string;
  icon?: string;
  description?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface Affiliation {
  id: string;
  organization: string;
  role: string;
  membershipId?: string;
  period: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface VolunteerEngagement {
  id: string;
  title?: string;
  role?: string;
  organization?: string;
  description?: string;
  period?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export type VolunteerExperience = VolunteerEngagement;

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  description?: string;
  imageUrl?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface Reference {
  id: string;
  name: string;
  designation?: string;
  role?: string;
  department?: string;
  institution?: string;
  organization?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  replied?: boolean;
}

export interface AdminCredentials {
  username: string;
  passwordHashOrPlain: string;
  lastUpdated: string;
}

export interface Training {
  id: string;
  title: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
  skillsAcquired?: string[];
  description?: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}


export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  showInFrontend?: boolean;
  showInCv?: boolean;
}

export type SectionMotionCategory =
  | 'opposite-angles'     // 3D Opposite Angles: Two parallel cards/columns converge from opposite angles
  | 'stacked-deck'        // 3D Stacked Deck: Cards slide and stack over one after another with 3D depth
  | 'epic-bidirectional'  // Epic Agency Fluid: Smooth appear & disappear bidirectional scroll motion
  | 'perspective-flip'    // 3D Perspective Flip: Tilted in Z-plane, smoothly flips upright with dynamic lighting
  | 'isometric-drift'     // 3D Isometric Drift: Angled 3D isometric arrival with depth glide
  | 'depth-zoom'          // Cinematic 3D Zoom: Deep Z-axis zoom with crisp focus revelation
  | 'origami-fold'        // 3D Origami Unfold: Unfolds from top X-axis like an architectural portfolio folder
  | 'cascade-stagger'     // 3D Cascade Stagger: Multi-layered staggered depth with alternating micro-rotations
  | 'matrix-glissade'     // Sleek 3D Glissade: Modern diagonal perspective slide with tech flair
  | 'subtle-elevation';   // Executive 3D Float: Subtle, ultra-clean vertical rise with soft ambient shadows

export type SectionHoverEffect =
  | 'tilt-3d'             // Interactive 3D tilt tracking mouse pointer with specular glare
  | 'lift-float'          // Floating lift with dynamic ambient shadow expansion
  | 'glow-pulse'          // Subtle radial glow and edge highlight on hover
  | 'magnetic'            // Magnetic gentle cursor attraction
  | 'none';               // No hover transform

export interface SectionConfig {
  id: string;
  label: string;
  title?: string;
  cvTitle?: string;            // Custom section heading for generated CV resume & PDF
  cvEducationTitle?: string;   // Custom heading for Education if grouped with experience
  experienceColumnTitle?: string; // Custom heading for Experience column on portfolio page
  educationColumnTitle?: string;  // Custom heading for Education column on portfolio page
  educationHiddenText?: string;   // Custom text for the vertical strip when education is hidden
  topText?: string;
  description?: string;
  showInFrontend: boolean;
  showInCv: boolean;
  showTitle?: boolean;       // default: true
  showTopText?: boolean;     // default: false (hidden by default)
  showDescription?: boolean; // default: false (hidden by default)
  motionCategory?: SectionMotionCategory;
  hoverEffect?: SectionHoverEffect;
}

export const DEFAULT_CV_TITLES: Record<string, string> = {
  about: 'Research Interest',
  publications: 'Publications',
  education: 'Education',
  experience: 'Professional Experiences',
  projects: 'Research & Technical Projects',
  capabilities: 'Technical Skills & Competencies',
  training: 'Trainings & Professional Workshops',
  certifications: 'Certifications & Credentials',
  achievements: 'Academic & Competitive Achievements',
  awards: 'Awards and Activities',
  volunteer: 'Community Service & Voluntary Work',
  affiliations: 'Professional Affiliations',
  references: 'Academic & Professional References',
  contact: 'Contact'
};

export const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: 'hero',
    label: 'Hero / Header Intro',
    title: 'Hero / Header Intro',
    cvTitle: '',
    topText: 'WELCOME',
    description: 'Header greeting, profile title, bio summary, avatar, and quick resume download button',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'depth-zoom',
    hoverEffect: 'tilt-3d'
  },
  {
    id: 'about',
    label: 'About Researcher',
    title: 'About the Researcher',
    cvTitle: 'Research Interest',
    topText: 'RESEARCH IDENTITY',
    description: 'Investigating computational intelligence, biomedical signal dynamics, and machine learning architectures.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'opposite-angles',
    hoverEffect: 'tilt-3d'
  },
  {
    id: 'publications',
    label: 'Publications & Research',
    title: 'Publications & Preprints',
    cvTitle: 'Publications',
    topText: 'RESEARCH & SCHOLARLY WORKS',
    description: 'Peer-reviewed journal papers, conference proceedings, and biomedical machine learning contributions.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'stacked-deck',
    hoverEffect: 'lift-float'
  },
  {
    id: 'experience',
    label: 'Experience & Education',
    title: 'Experience & Education',
    cvTitle: 'Professional Experiences',
    cvEducationTitle: 'Education',
    experienceColumnTitle: 'Relevant Experiences',
    educationColumnTitle: 'Academic Education',
    educationHiddenText: 'Education Hidden',
    topText: 'CAREER & ACADEMIA',
    description: 'Research appointments, industry software engineering roles, and academic qualifications.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'opposite-angles',
    hoverEffect: 'lift-float'
  },
  {
    id: 'projects',
    label: 'Featured Projects',
    title: 'Featured Projects & Systems',
    cvTitle: 'Research & Technical Projects',
    topText: 'ENGINEERING & APPLIED AI',
    description: 'Research prototypes, machine learning systems, and full-stack software applications.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'opposite-angles',
    hoverEffect: 'tilt-3d'
  },
  {
    id: 'capabilities',
    label: 'Skills & Capabilities',
    title: 'Technical Capabilities & Toolsets',
    cvTitle: 'Technical Skills & Competencies',
    topText: 'EXPERTISE & PROFICIENCIES',
    description: 'Core competencies across machine learning, biomedical signal analytics, algorithms, and full-stack software architectures.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'stacked-deck',
    hoverEffect: 'glow-pulse'
  },
  {
    id: 'training',
    label: 'Trainings & Courses',
    title: 'Trainings & Field Visits',
    cvTitle: 'Trainings & Professional Workshops',
    topText: 'PROFESSIONAL WORKSHOPS',
    description: 'Specialized industry workshops, institutional visits, and continuous technical education.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'cascade-stagger',
    hoverEffect: 'lift-float'
  },
  {
    id: 'certifications',
    label: 'Certifications',
    title: 'Licenses & Certifications',
    cvTitle: 'Certifications & Credentials',
    topText: 'PROFESSIONAL CREDENTIALS',
    description: 'Industry-recognized credentials, verified programs, and specialized technical certifications.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'perspective-flip',
    hoverEffect: 'lift-float'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    title: 'Notable Achievements',
    cvTitle: 'Academic & Competitive Achievements',
    topText: 'KEY MILESTONES & HONORS',
    description: 'Major milestone accomplishments, hackathon & competition wins, and academic recognitions.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'isometric-drift',
    hoverEffect: 'tilt-3d'
  },
  {
    id: 'awards',
    label: 'Honors & Awards',
    title: 'Honors & Awards',
    cvTitle: 'Awards and Activities',
    topText: 'DISTINCTIONS & MERITS',
    description: 'Competitive academic honors, research fellowships, and professional distinctions.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'depth-zoom',
    hoverEffect: 'glow-pulse'
  },
  {
    id: 'volunteer',
    label: 'Volunteer Work',
    title: 'Voluntary Service',
    cvTitle: 'Community Service & Voluntary Work',
    topText: 'COMMUNITY ENGAGEMENT',
    description: 'Community initiatives, tech mentorship, and social responsibility contributions.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'subtle-elevation',
    hoverEffect: 'lift-float'
  },
  {
    id: 'affiliations',
    label: 'Affiliations & Activities',
    title: 'Honors, Affiliations & Activities',
    cvTitle: 'Professional Affiliations',
    topText: 'DISTINCTIONS & ACADEMIC SERVICE',
    description: 'Recognitions, professional society memberships, and institutional leadership roles.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'origami-fold',
    hoverEffect: 'lift-float'
  },
  {
    id: 'references',
    label: 'Academic & Professional References',
    title: 'Academic & Professional References',
    cvTitle: 'Academic & Professional References',
    topText: 'RECOMMENDATIONS & ADVISORS',
    description: 'Faculty mentors, research advisors, and industry supervisors. Contact details available upon verified request.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'perspective-flip',
    hoverEffect: 'lift-float'
  },
  {
    id: 'contact',
    label: 'Contact Details & Form',
    title: 'Get In Touch',
    cvTitle: 'Contact',
    topText: 'COMMUNICATION & INQUIRIES',
    description: 'Reach out for research collaborations, doctoral queries, technical consultations, or speaking opportunities.',
    showInFrontend: true,
    showInCv: true,
    showTitle: true,
    showTopText: false,
    showDescription: false,
    motionCategory: 'epic-bidirectional',
    hoverEffect: 'glow-pulse'
  }
];

export interface ResearchPillar {
  id: string;
  title: string;
  category?: string;
  description: string;
  icon?: string;
  color?: string;
  tags?: string[];
  showInFrontend?: boolean;
  order?: number;
}

export interface PortfolioData {
  profile: Profile;
  publications: Publication[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  skillGroups: SkillGroup[];
  researchPillars?: ResearchPillar[];
  trainings?: Training[];
  certifications?: Certification[];
  awards?: Award[];
  achievements?: Achievement[];
  affiliations?: Affiliation[];
  volunteerWork?: VolunteerEngagement[];
  references?: Reference[];
  messages: Message[];
  adminConfig?: AdminCredentials;
  sections?: SectionConfig[];
}

export interface DatabaseStatus {
  connected: boolean;
  hasUri: boolean;
  dbName: string;
  collection: string;
  lastSync: string | null;
  error: string | null;
  mode: 'mongodb_atlas' | 'connection_error' | 'local_file_cache';
  stats: {
    publications: number;
    projects: number;
    experience: number;
    education: number;
    messages: number;
  };
}
