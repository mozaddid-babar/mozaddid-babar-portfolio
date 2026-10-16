import { Certification, CvCategoryGroup, Experience, Project, ProjectType, SectionConfig } from '../types';

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

const PRESENT_RE = /present|current|now|ongoing/i;

// Turns one side of a period ("Sep 2022", "2023", "Present") into a comparable number (year * 12 + month)
function parsePoint(text: string, isEnd: boolean): number | null {
  if (PRESENT_RE.test(text)) return Number.MAX_SAFE_INTEGER;
  const yearMatch = text.match(/(19|20)\d{2}/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[0], 10);
  const monthMatch = text.toLowerCase().match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  // A bare year sorts as January when it is a start and December when it is an end
  const month = monthMatch ? MONTHS[monthMatch[1]] : (isEnd ? 11 : 0);
  return year * 12 + month;
}

// Parses periods like "Sep 2022 - Jun 2023", "Jan 2024 - Present" or "2021" into start/end keys
export function parsePeriod(period: string | undefined, current?: boolean): { start: number; end: number } {
  const parts = (period || '').split(/\s*(?:-|–|—|\bto\b)\s*/i).filter(Boolean);
  const start = parts.length ? parsePoint(parts[0], false) : null;
  let end = parts.length > 1 ? parsePoint(parts[parts.length - 1], true) : (parts.length ? parsePoint(parts[0], true) : null);
  if (current) end = Number.MAX_SAFE_INTEGER;
  return { start: start ?? end ?? 0, end: end ?? start ?? 0 };
}

// Latest work first: ongoing roles on top, then by end date, then by start date
export function sortExperienceByDateDesc(items: Experience[]): Experience[] {
  return items
    .map((exp, idx) => ({ exp, idx, key: parsePeriod(exp.period, exp.current) }))
    .sort((a, b) => (b.key.end - a.key.end) || (b.key.start - a.key.start) || (a.idx - b.idx))
    .map(x => x.exp);
}


// Projects saved before the type field existed fall back to their category text
export function getProjectType(project: Project): ProjectType {
  if (project.projectType) return project.projectType;
  return /research/i.test(project.category || '') ? 'research' : 'technical';
}

// Newest first by the date's end point; items without a parsable date keep their saved order at the bottom
export function sortByDateDesc<T>(items: T[], getDate: (item: T) => string | undefined): T[] {
  return items
    .map((item, idx) => ({ item, idx, key: parsePeriod(getDate(item)) }))
    .sort((a, b) => (b.key.end - a.key.end) || (b.key.start - a.key.start) || (a.idx - b.idx))
    .map(x => x.item);
}

// Every category in use, in the saved order first, then any new ones (as certifications, headed by their own name)
export function resolveCertCategoryGroups(certs: Certification[], saved: CvCategoryGroup[] = []): CvCategoryGroup[] {
  const groups = saved.filter(g => g.category?.trim());
  const known = new Set(groups.map(g => g.category.trim().toLowerCase()));
  for (const c of certs) {
    const cat = (c.category || '').trim() || 'Other';
    if (!known.has(cat.toLowerCase())) {
      known.add(cat.toLowerCase());
      groups.push({ category: cat, heading: '', placement: 'certifications' });
    }
  }
  return groups;
}

// Splits CV-visible certifications into the Certifications section (grouped) and those moved to Achievements
export function buildCertCvLayout(certs: Certification[], sec?: SectionConfig) {
  const sorted = sec?.cvSortByDate !== false ? sortByDateDesc(certs, c => c.date) : certs;
  const groups = resolveCertCategoryGroups(certs, sec?.cvCategoryGroups);
  const groupOf = (c: Certification) => {
    const cat = ((c.category || '').trim() || 'Other').toLowerCase();
    return groups.find(g => g.category.trim().toLowerCase() === cat)!;
  };
  const inCertSection = sorted.filter(c => groupOf(c).placement === 'certifications');
  const certGroups = sec?.cvGroupByCategory !== false
    ? groups
        .filter(g => g.placement === 'certifications')
        .map(g => ({ heading: g.heading?.trim() || g.category, items: inCertSection.filter(c => groupOf(c) === g) }))
        .filter(g => g.items.length > 0)
    : (inCertSection.length ? [{ heading: '', items: inCertSection }] : []);
  return {
    certGroups,
    achievementCerts: sorted.filter(c => groupOf(c).placement === 'achievements')
  };
}

// "https://www.github.com/user/repo/" -> "github.com/user/repo", for printing a readable address in the CV
export function shortUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  research: 'Research Project',
  technical: 'Technical Project'
};
