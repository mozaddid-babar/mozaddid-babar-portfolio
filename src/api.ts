import { PortfolioData, Award, Publication, Project, Experience, Education, SkillGroup, Message, Profile, Training, Certification, Achievement, Affiliation, VolunteerExperience, Reference, SectionConfig, ResearchPillar, CvSettings, DatabaseStatus } from './types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('portfolio_admin_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem('portfolio_admin_token', token);
  } catch (e) {
    console.error('Failed to set auth token in localStorage', e);
  }
}

export function removeAuthToken() {
  try {
    localStorage.removeItem('portfolio_admin_token');
  } catch (e) {
    console.error('Failed to remove auth token from localStorage', e);
  }
}

export function isAdminLoggedIn(): boolean {
  return !!getAuthToken();
}

export function logoutAdmin() {
  removeAuthToken();
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    removeAuthToken();
  }
  return res;
}

// Public APIs
export async function fetchPortfolioData(): Promise<PortfolioData> {
  const res = await fetch(`${API_BASE}/portfolio`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch portfolio');
  return json.data;
}

export async function submitContactMessage(data: { name: string; email: string; subject: string; message: string }) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to send message');
  return json;
}

// Auth APIs
export async function loginAdmin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Invalid credentials');
  if (json.token) setAuthToken(json.token);
  return json;
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const res = await authFetch(`${API_BASE}/auth/me`);
    if (res.status === 401) {
      removeAuthToken();
      return false;
    }
    const json = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}

export async function updateAdminCredentials(newUsername: string, newPassword?: string) {
  const res = await authFetch(`${API_BASE}/auth/update-credentials`, {
    method: 'POST',
    body: JSON.stringify({ newUsername, newPassword })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update credentials');
  return json;
}

// Admin Data API
export async function fetchAdminData(): Promise<PortfolioData> {
  const res = await authFetch(`${API_BASE}/admin/data`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch admin data');
  return json.data;
}

// Admin Profile API
export async function updateProfileAPI(profile: Partial<Profile>): Promise<Profile> {
  const res = await authFetch(`${API_BASE}/admin/profile`, {
    method: 'PUT',
    body: JSON.stringify(profile)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update profile');
  return json.data;
}

// Admin Publications API
export async function createPublicationAPI(pub: Omit<Publication, 'id'>): Promise<Publication> {
  const res = await authFetch(`${API_BASE}/admin/publications`, {
    method: 'POST',
    body: JSON.stringify(pub)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create publication');
  return json.data;
}

export async function updatePublicationAPI(id: string, pub: Partial<Publication>): Promise<Publication> {
  const res = await authFetch(`${API_BASE}/admin/publications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pub)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update publication');
  return json.data;
}

export async function deletePublicationAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/publications/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete publication');
  return json;
}

export async function parseBibTeXAPI(bibtex: string): Promise<{ data: any[]; count: number }> {
  const res = await authFetch(`${API_BASE}/admin/publications/parse-bibtex`, {
    method: 'POST',
    body: JSON.stringify({ bibtex })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to parse BibTeX');
  return json;
}

export async function fetchAcademicPapersAPI(
  source: 'scholar' | 'semanticscholar' | 'doi', 
  query: string
): Promise<{ data: any[]; count: number; source: string; notes?: string }> {
  const res = await authFetch(`${API_BASE}/admin/publications/fetch-academic`, {
    method: 'POST',
    body: JSON.stringify({ source, query })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch academic papers');
  return json;
}

export async function bulkImportPublicationsAPI(
  publications: any[], 
  updateExisting: boolean = true
): Promise<{ addedCount: number; updatedCount: number; data: any }> {
  const res = await authFetch(`${API_BASE}/admin/publications/bulk-import`, {
    method: 'POST',
    body: JSON.stringify({ publications, updateExisting })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to bulk import publications');
  return json.data;
}

// Admin Projects API
export async function createProjectAPI(proj: Omit<Project, 'id'>): Promise<Project> {
  const res = await authFetch(`${API_BASE}/admin/projects`, {
    method: 'POST',
    body: JSON.stringify(proj)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create project');
  return json.data;
}

export async function updateProjectAPI(id: string, proj: Partial<Project>): Promise<Project> {
  const res = await authFetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(proj)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update project');
  return json.data;
}

export async function deleteProjectAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete project');
  return json;
}

// Admin Experience API
export async function createExperienceAPI(exp: Omit<Experience, 'id'>): Promise<Experience> {
  const res = await authFetch(`${API_BASE}/admin/experience`, {
    method: 'POST',
    body: JSON.stringify(exp)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create experience');
  return json.data;
}

export async function updateExperienceAPI(id: string, exp: Partial<Experience>): Promise<Experience> {
  const res = await authFetch(`${API_BASE}/admin/experience/${id}`, {
    method: 'PUT',
    body: JSON.stringify(exp)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update experience');
  return json.data;
}

export async function deleteExperienceAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/experience/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete experience');
  return json;
}

// Admin Education API
export async function createEducationAPI(edu: Omit<Education, 'id'>): Promise<Education> {
  const res = await authFetch(`${API_BASE}/admin/education`, {
    method: 'POST',
    body: JSON.stringify(edu)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create education');
  return json.data;
}

export async function updateEducationAPI(id: string, edu: Partial<Education>): Promise<Education> {
  const res = await authFetch(`${API_BASE}/admin/education/${id}`, {
    method: 'PUT',
    body: JSON.stringify(edu)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update education');
  return json.data;
}

export async function deleteEducationAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/education/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete education');
  return json;
}

// Admin Trainings API
export async function createTrainingAPI(training: Omit<Training, 'id'>): Promise<Training> {
  const res = await authFetch(`${API_BASE}/admin/trainings`, {
    method: 'POST',
    body: JSON.stringify(training)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create training');
  return json.data;
}

export async function updateTrainingAPI(id: string, training: Partial<Training>): Promise<Training> {
  const res = await authFetch(`${API_BASE}/admin/trainings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(training)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update training');
  return json.data;
}

export async function deleteTrainingAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/trainings/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete training');
  return json;
}

// Admin Certifications API
export async function createCertificationAPI(cert: Omit<Certification, 'id'>): Promise<Certification> {
  const res = await authFetch(`${API_BASE}/admin/certifications`, {
    method: 'POST',
    body: JSON.stringify(cert)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create certification');
  return json.data;
}


export async function reorderCertificationsAPI(orderedIds: string[]): Promise<Certification[]> {
  const res = await authFetch(`${API_BASE}/admin/certifications/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder certifications');
  return json.data;
}

export async function updateCertificationAPI(id: string, cert: Partial<Certification>): Promise<Certification> {
  const res = await authFetch(`${API_BASE}/admin/certifications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cert)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update certification');
  return json.data;
}

export async function deleteCertificationAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/certifications/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete certification');
  return json;
}

// Admin Achievements API
export async function createAchievementAPI(item: Omit<Achievement, 'id'>): Promise<Achievement> {
  const res = await authFetch(`${API_BASE}/admin/achievements`, {
    method: 'POST',
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create achievement');
  return json.data;
}

export async function updateAchievementAPI(id: string, item: Partial<Achievement>): Promise<Achievement> {
  const res = await authFetch(`${API_BASE}/admin/achievements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update achievement');
  return json.data;
}


export async function reorderAchievementsAPI(orderedIds: string[]): Promise<Achievement[]> {
  const res = await authFetch(`${API_BASE}/admin/achievements/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder achievements');
  return json.data;
}

export async function deleteAchievementAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/achievements/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete achievement');
  return json;
}

// Admin Affiliations API
export async function createAffiliationAPI(item: Omit<Affiliation, 'id'>): Promise<Affiliation> {
  const res = await authFetch(`${API_BASE}/admin/affiliations`, {
    method: 'POST',
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create affiliation');
  return json.data;
}

export async function updateAffiliationAPI(id: string, item: Partial<Affiliation>): Promise<Affiliation> {
  const res = await authFetch(`${API_BASE}/admin/affiliations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update affiliation');
  return json.data;
}

export async function deleteAffiliationAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/affiliations/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete affiliation');
  return json;
}

// Admin Volunteer Work API
export async function createVolunteerWorkAPI(item: Omit<VolunteerExperience, 'id'>): Promise<VolunteerExperience> {
  const res = await authFetch(`${API_BASE}/admin/volunteer`, {
    method: 'POST',
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create volunteer entry');
  return json.data;
}


export async function reorderVolunteerWorkAPI(orderedIds: string[]): Promise<VolunteerExperience[]> {
  const res = await authFetch(`${API_BASE}/admin/volunteer-work/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder volunteer work');
  return json.data;
}
export async function updateVolunteerWorkAPI(id: string, item: Partial<VolunteerExperience>): Promise<VolunteerExperience> {
  const res = await authFetch(`${API_BASE}/admin/volunteer/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update volunteer entry');
  return json.data;
}

export async function deleteVolunteerWorkAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/volunteer/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete volunteer entry');
  return json;
}

// Admin References API
export async function createReferenceAPI(item: Omit<Reference, 'id'>): Promise<Reference> {
  const res = await authFetch(`${API_BASE}/admin/references`, {
    method: 'POST',
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create reference');
  return json.data;
}

export async function updateReferenceAPI(id: string, item: Partial<Reference>): Promise<Reference> {
  const res = await authFetch(`${API_BASE}/admin/references/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update reference');
  return json.data;
}

export async function deleteReferenceAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/references/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete reference');
  return json;
}

// Admin Skills API
export async function updateSkillsAPI(skillGroups: SkillGroup[]): Promise<SkillGroup[]> {
  const res = await authFetch(`${API_BASE}/admin/skills`, {
    method: 'PUT',
    body: JSON.stringify({ skillGroups })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update skills');
  return json.data;
}

// Admin Messages API
export async function fetchMessagesAPI(): Promise<Message[]> {
  const res = await authFetch(`${API_BASE}/admin/messages`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch messages');
  return json.data;
}

export async function toggleMessageReadAPI(id: string): Promise<Message> {
  const res = await authFetch(`${API_BASE}/admin/messages/${id}/read`, {
    method: 'PATCH'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update message status');
  return json.data;
}

export async function deleteMessageAPI(id: string) {
  const res = await authFetch(`${API_BASE}/admin/messages/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete message');
  return json;
}

// Admin Database Backup / Reset API
export async function resetDatabaseAPI(): Promise<PortfolioData> {
  const res = await authFetch(`${API_BASE}/admin/db/reset`, {
    method: 'POST'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reset database');
  return json.data;
}

export async function importDatabaseAPI(data: any) {
  const res = await authFetch(`${API_BASE}/admin/db/import`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to import database');
  return json;
}

export async function getDatabaseStatusAPI(): Promise<DatabaseStatus> {
  const res = await authFetch(`${API_BASE}/admin/db/status`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch database status');
  return json.data;
}

export async function reconnectDatabaseAPI(): Promise<{ success: boolean; connected: boolean; message: string; data: DatabaseStatus }> {
  const res = await authFetch(`${API_BASE}/admin/db/reconnect`, {
    method: 'POST'
  });
  const json = await res.json();
  return json;
}



// --- Awards ---
export async function createAwardAPI(data: Partial<Award>): Promise<Award> {
  const res = await authFetch(`${API_BASE}/admin/awards`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create award');
  return json.data;
}

export async function updateAwardAPI(id: string, data: Partial<Award>): Promise<Award> {
  const res = await authFetch(`${API_BASE}/admin/awards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to update award');
  return json.data;
}

export async function deleteAwardAPI(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/admin/awards/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete award');
}

export async function reorderAwardsAPI(orderedIds: string[]): Promise<Award[]> {
  const res = await authFetch(`${API_BASE}/admin/awards/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to reorder awards');
  return json.data;
}

async function safeJson(res: Response, fallbackError: string) {
  const text = await res.text();
  if (!text || text.trim() === '') {
    if (!res.ok) {
      throw new Error(`${fallbackError}: HTTP ${res.status}. Please restart your server ('npm run dev') to load new backend endpoints.`);
    }
    return { success: true, data: null };
  }
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch {
    throw new Error(`${fallbackError}: Server returned non-JSON (${res.status}). Please restart your server ('npm run dev').`);
  }
}

// --- Section Ordering & Visibility APIs ---
export async function fetchSectionsAPI(): Promise<SectionConfig[]> {
  const res = await fetch(`${API_BASE}/sections`);
  const json = await safeJson(res, 'Failed to fetch sections');
  if (!json.success) throw new Error(json.message || 'Failed to fetch sections');
  return json.data;
}

export async function updateSectionsAPI(sections: SectionConfig[]): Promise<SectionConfig[]> {
  const res = await authFetch(`${API_BASE}/admin/sections`, {
    method: 'PUT',
    body: JSON.stringify({ sections })
  });
  const json = await safeJson(res, 'Failed to update sections');
  if (!json.success) throw new Error(json.message || 'Failed to update sections');
  return json.data;
}

export async function reorderSectionsAPI(orderedIds: string[]): Promise<SectionConfig[]> {
  const res = await authFetch(`${API_BASE}/admin/sections/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedIds })
  });
  const json = await safeJson(res, 'Failed to reorder sections');
  if (!json.success) throw new Error(json.message || 'Failed to reorder sections');
  return json.data;
}

export async function toggleSectionVisibilityAPI(
  id: string,
  field: 'showInFrontend' | 'showInCv' | 'showTitle' | 'showTopText' | 'showDescription',
  value: boolean
): Promise<SectionConfig> {
  const res = await authFetch(`${API_BASE}/admin/sections/${id}/visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ field, value })
  });
  const json = await safeJson(res, 'Failed to toggle section visibility');
  if (!json.success) throw new Error(json.message || 'Failed to toggle section visibility');
  return json.data;
}

export async function resetSectionsAPI(): Promise<SectionConfig[]> {
  const res = await authFetch(`${API_BASE}/admin/sections/reset`, {
    method: 'POST'
  });
  const json = await safeJson(res, 'Failed to reset sections');
  if (!json.success) throw new Error(json.message || 'Failed to reset sections');
  return json.data;
}

// --- Research Pillars & Focus Area APIs ---
export async function fetchResearchPillarsAPI(): Promise<ResearchPillar[]> {
  const res = await fetch(`${API_BASE}/research-pillars`);
  const json = await safeJson(res, 'Failed to fetch research pillars');
  if (!json.success) throw new Error(json.message || 'Failed to fetch research pillars');
  return json.data;
}

export async function createResearchPillarAPI(pillar: Partial<ResearchPillar>): Promise<ResearchPillar> {
  const res = await authFetch(`${API_BASE}/admin/research-pillars`, {
    method: 'POST',
    body: JSON.stringify(pillar)
  });
  const json = await safeJson(res, 'Failed to create research pillar');
  if (!json.success) throw new Error(json.message || 'Failed to create research pillar');
  return json.data;
}

export async function updateResearchPillarAPI(id: string, pillar: Partial<ResearchPillar>): Promise<ResearchPillar> {
  const res = await authFetch(`${API_BASE}/admin/research-pillars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pillar)
  });
  const json = await safeJson(res, 'Failed to update research pillar');
  if (!json.success) throw new Error(json.message || 'Failed to update research pillar');
  return json.data;
}

export async function deleteResearchPillarAPI(id: string): Promise<boolean> {
  const res = await authFetch(`${API_BASE}/admin/research-pillars/${id}`, {
    method: 'DELETE'
  });
  const json = await safeJson(res, 'Failed to delete research pillar');
  if (!json.success) throw new Error(json.message || 'Failed to delete research pillar');
  return true;
}

export async function reorderResearchPillarsAPI(orderedIds: string[]): Promise<ResearchPillar[]> {
  const res = await authFetch(`${API_BASE}/admin/research-pillars-reorder`, {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  });
  const json = await safeJson(res, 'Failed to reorder research pillars');
  if (!json.success) throw new Error(json.message || 'Failed to reorder research pillars');
  return json.data;
}

export async function updateCvSettingsAPI(cvSettings: Partial<CvSettings>): Promise<CvSettings> {
  const res = await authFetch(`${API_BASE}/admin/cv-settings`, {
    method: 'PUT',
    body: JSON.stringify({ cvSettings })
  });
  const json = await safeJson(res, 'Failed to update CV settings');
  if (!json.success) throw new Error(json.message || 'Failed to update CV settings');
  return json.data;
}


