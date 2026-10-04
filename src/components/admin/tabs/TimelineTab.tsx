import React, { useState } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { Briefcase, GraduationCap, Plus, Edit3, Trash2, X } from 'lucide-react';
import { Experience, Education, ExperienceRole } from '../../../types';
import { 
  createExperienceAPI, 
  updateExperienceAPI, 
  deleteExperienceAPI,
  createEducationAPI, 
  updateEducationAPI, 
  deleteEducationAPI 
} from '../../../api';

interface TimelineTabProps {
  experience: Experience[];
  education: Education[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  experience,
  education,
  onRefresh,
  showToast
}) => {
  // Sub-tabs: 'experience' | 'education'
  const [subTab, setSubTab] = useState<'experience' | 'education'>('experience');

  // Experience Modal
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expFormData, setExpFormData] = useState<Omit<Experience, 'id'>>({
    role: '',
    organization: '',
    logoUrl: '',
    department: '',
    location: '',
    period: '',
    description: '',
    highlights: [],
    skills: [],
    current: false,
    roles: []
  });
  const [highlightsInput, setHighlightsInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  // Roles form state
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [rolePeriodError, setRolePeriodError] = useState(false);
  const [editingRoleIdx, setEditingRoleIdx] = useState<number | null>(null);
  const [roleFormData, setRoleFormData] = useState<ExperienceRole>({
    id: '', title: '', period: '', description: '', highlights: [], skills: []
  });
  const [roleHighlightsInput, setRoleHighlightsInput] = useState('');
  const [roleSkillsInput, setRoleSkillsInput] = useState('');

  // Education Modal
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduFormData, setEduFormData] = useState<Omit<Education, 'id'>>({
    degree: '',
    institution: '',
    department: '',
    year: '',
    result: '',
    thesis: '',
    advisor: ''
  });

  const [loading, setLoading] = useState(false);

  // Handlers for Experience
  const openCreateExp = () => {
    setEditingExpId(null);
    setExpFormData({
      role: '',
      organization: '',
      logoUrl: '',
      department: '',
      location: '',
      period: '',
      description: '',
      highlights: [],
      skills: [],
      current: false,
      roles: []
    });
    setHighlightsInput('');
    setSkillsInput('');
    setIsExpModalOpen(true);
    setIsEditingRole(false);
  };

  const openEditExp = (exp: Experience) => {
    setEditingExpId(exp.id);
    setExpFormData({
      role: exp.role,
      organization: exp.organization,
      logoUrl: exp.logoUrl || '',
      department: exp.department || '',
      location: exp.location,
      period: exp.period,
      description: exp.description,
      highlights: exp.highlights || [],
      skills: exp.skills || [],
      current: !!exp.current,
      roles: exp.roles || [],
      showInFrontend: exp.showInFrontend ?? true,
      showInCv: exp.showInCv ?? true
    });
    setHighlightsInput((exp.highlights || []).join('\n'));
    setSkillsInput((exp.skills || []).join(', '));
    setIsExpModalOpen(true);
    setIsEditingRole(false);
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const parsedHighlights = highlightsInput.split('\n').map(h => h.trim()).filter(Boolean);
    const parsedSkills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { ...expFormData, highlights: parsedHighlights, skills: parsedSkills };

    try {
      if (editingExpId) {
        await updateExperienceAPI(editingExpId, payload);
        showToast('Experience updated successfully!');
      } else {
        await createExperienceAPI(payload);
        showToast('New experience added!');
      }
      setIsExpModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExpDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await deleteExperienceAPI(id);
      showToast('Experience removed.');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleOpenRoleForm = (idx: number | null) => {
    if (idx !== null && expFormData.roles) {
      const r = expFormData.roles[idx];
      setRoleFormData(r);
      setRoleHighlightsInput((r.highlights || []).join('\n'));
      setRoleSkillsInput((r.skills || []).join(', '));
      setEditingRoleIdx(idx);
    } else {
      setRoleFormData({ id: Date.now().toString(), title: '', period: '', description: '', highlights: [], skills: [], current: false });
      setRoleHighlightsInput('');
      setRoleSkillsInput('');
      setEditingRoleIdx(null);
    }
    setRolePeriodError(false);
    setIsEditingRole(true);
  };

  const parseDateStr = (dateStr: string): number => {
    if (!dateStr) return 0;
    if (dateStr.toLowerCase().includes('present')) return Infinity;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  const parsePeriodRange = (period: string) => {
    const parts = period.split('-');
    const start = parseDateStr(parts[0]?.trim() || '');
    const end = parts.length > 1 ? parseDateStr(parts[1]?.trim() || '') : start;
    return { start, end };
  };

  const handleSaveRole = () => {
    const currentPeriodRange = parsePeriodRange(roleFormData.period);
    
    if (currentPeriodRange.start > 0) {
      const hasOverlap = expFormData.roles?.some((r, idx) => {
        if (idx === editingRoleIdx) return false;
        const otherPeriod = parsePeriodRange(r.period);
        if (otherPeriod.start > 0) {
          // Strict overlap check
          return currentPeriodRange.start < otherPeriod.end && currentPeriodRange.end > otherPeriod.start;
        }
        return false;
      });

      if (hasOverlap) {
        setRolePeriodError(true);
        showToast('Time period overlaps with an existing transition role.', 'error');
        return;
      }
    }

    const parsedHighlights = roleHighlightsInput.split('\n').map(h => h.trim()).filter(Boolean);
    const parsedSkills = roleSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const newRole = { ...roleFormData, highlights: parsedHighlights, skills: parsedSkills };
    
    const updatedRoles = [...(expFormData.roles || [])];
    if (editingRoleIdx !== null) {
      updatedRoles[editingRoleIdx] = newRole;
    } else {
      updatedRoles.push(newRole);
    }
    setExpFormData({ ...expFormData, roles: updatedRoles });
    setIsEditingRole(false);
  };

  const handleDeleteRole = (idx: number) => {
    const updatedRoles = [...(expFormData.roles || [])];
    updatedRoles.splice(idx, 1);
    setExpFormData({ ...expFormData, roles: updatedRoles });
  };

  // Handlers for Education
  const openCreateEdu = () => {
    setEditingEduId(null);
    setEduFormData({
      degree: '',
      institution: '',
      department: '',
      year: '',
      result: '',
      thesis: '',
      advisor: ''
    });
    setIsEduModalOpen(true);
  };

  const openEditEdu = (edu: Education) => {
    setEditingEduId(edu.id);
    setEduFormData({
      degree: edu.degree,
      institution: edu.institution,
      department: edu.department || '',
      year: edu.year,
      result: edu.result || '',
      thesis: edu.thesis || '',
      advisor: edu.advisor || '',
      showInFrontend: edu.showInFrontend ?? true,
      showInCv: edu.showInCv ?? true
    });
    setIsEduModalOpen(true);
  };

  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEduId) {
        await updateEducationAPI(editingEduId, eduFormData);
        showToast('Education updated successfully!');
      } else {
        await createEducationAPI(eduFormData);
        showToast('New education degree added!');
      }
      setIsEduModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEduDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this degree record?')) return;
    try {
      await deleteEducationAPI(id);
      showToast('Degree removed.');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  
  const renderRoleForm = () => (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{editingRoleIdx !== null ? 'Edit Role' : 'Add Role'}</h4>
                      <button type="button" onClick={() => setIsEditingRole(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Designation / Title</label>
                        <input type="text" value={roleFormData.title || ''} onChange={e => setRoleFormData({...roleFormData, title: e.target.value})} className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Time Period</label>
                        <input type="text" value={roleFormData.period || ''} onChange={e => { setRolePeriodError(false); setRoleFormData({...roleFormData, period: e.target.value}); }} className={`w-full px-3 py-2 text-xs bg-slate-800 border rounded-lg text-white ${rolePeriodError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'}`} />
                        {rolePeriodError && (
                          <p className="text-[10px] text-red-400 mt-1 font-semibold animate-fadeIn">This period overlaps with an existing role.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Location (Optional)</label>
                      <input type="text" value={roleFormData.location || ''} onChange={e => setRoleFormData({...roleFormData, location: e.target.value})} className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                      <textarea rows={2} value={roleFormData.description || ''} onChange={e => setRoleFormData({...roleFormData, description: e.target.value})} className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white resize-y" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Highlights (one per line)</label>
                      <textarea rows={2} value={roleHighlightsInput} onChange={e => setRoleHighlightsInput(e.target.value)} className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white resize-y" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Skills (comma separated)</label>
                      <input type="text" value={roleSkillsInput} onChange={e => setRoleSkillsInput(e.target.value)} className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white" />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="button" onClick={handleSaveRole} className="px-3 py-1.5 text-xs font-semibold bg-brand-600 text-white rounded-lg">Save Role</button>
                    </div>
                  </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-timeline-tab">
      
      {/* Header & Sub-tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-400" />
            <span>Academic Experience & Education</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your career chronology, university appointments, and degrees.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setSubTab('experience')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'experience'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Experience ({experience.length})
          </button>
          <button
            onClick={() => setSubTab('education')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'education'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Education ({education.length})
          </button>
        </div>
      </div>

      {/* Experience Sub-view */}
      {subTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreateExp}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Appointment</span>
            </button>
          </div>

          <div className="space-y-3">
            {experience.map(exp => (
              <div
                key={exp.id}
                className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-brand-400 font-semibold">{exp.period}</span>
                    {exp.current && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-3 mt-2">
                    {exp.logoUrl && (
                      <img src={exp.logoUrl} alt="Logo" className="w-8 h-8 rounded bg-white object-contain p-0.5" />
                    )}
                    <div>
                      <h4 className="text-base font-bold text-white">{exp.role}</h4>
                      <p className="text-xs text-slate-300 font-medium">{exp.organization} • {exp.location}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 pt-1 leading-relaxed">{exp.description}</p>
                </div>

                <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700">
                  <button
                    onClick={() => openEditExp(exp)}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExpDelete(exp.id)}
                    className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/60"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Sub-view */}
      {subTab === 'education' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreateEdu}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Degree Record</span>
            </button>
          </div>

          <div className="space-y-3">
            {education.map(edu => (
              <div
                key={edu.id}
                className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-blue-400 font-semibold">{edu.year}</span>
                    {edu.result && (
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[10px] font-bold">
                        {edu.result}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">{edu.degree}</h4>
                  <p className="text-xs text-slate-300 font-medium">{edu.institution}</p>
                  {edu.thesis && (
                    <p className="text-xs text-slate-400 italic pt-1">
                      Thesis: "{edu.thesis}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700">
                  <button
                    onClick={() => openEditEdu(edu)}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEduDelete(edu.id)}
                    className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/60"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-800 rounded-3xl border border-slate-700 p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {editingExpId ? 'Edit Academic Appointment' : 'Add New Appointment'}
              </h3>
              <button onClick={() => setIsExpModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={expFormData.role || ''}
                    onChange={(e) => setExpFormData({ ...expFormData, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Period (e.g. 2022 - Present) *</label>
                  <input
                    type="text"
                    required
                    value={expFormData.period || ''}
                    onChange={(e) => setExpFormData({ ...expFormData, period: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / University *</label>
                  <input
                    type="text"
                    required
                    value={expFormData.organization || ''}
                    onChange={(e) => setExpFormData({ ...expFormData, organization: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={expFormData.logoUrl || ''}
                    onChange={(e) => setExpFormData({ ...expFormData, logoUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department (Optional)</label>
                  <input
                    type="text"
                    value={expFormData.department || ''}
                    onChange={(e) => setExpFormData({ ...expFormData, department: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={expFormData.location || ''}
                    onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={expFormData.description || ''}
                  onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Highlights (one per line)</label>
                <textarea
                  rows={3}
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              {/* Roles Section */}
              <div className="pt-4 border-t border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-white">Transition Roles (Optional)</label>
                  <button type="button" onClick={() => handleOpenRoleForm(null)} className="text-xs font-semibold text-brand-400 flex items-center space-x-1 hover:text-brand-300">
                    <Plus className="w-3 h-3" /> <span>Add Role</span>
                  </button>
                </div>
                
                {expFormData.roles && expFormData.roles.length > 0 && (
                  <div className="space-y-3">
                    {expFormData.roles.map((r, idx) => (
                      isEditingRole && editingRoleIdx === idx ? (
                        <div key={idx}>
                          {renderRoleForm()}
                        </div>
                      ) : (
                        <div key={idx} className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-white">{r.title}</div>
                            <div className="text-xs text-brand-400">{r.period}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button type="button" onClick={() => handleOpenRoleForm(idx)} className="text-slate-400 hover:text-white p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleDeleteRole(idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {isEditingRole && editingRoleIdx === null && (
                  <div className="mt-3">
                    {renderRoleForm()}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="current-exp-checkbox"
                  checked={expFormData.current || false}
                  onChange={(e) => setExpFormData({ ...expFormData, current: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 bg-slate-900 border-slate-700"
                />
                <label htmlFor="current-exp-checkbox" className="text-xs font-semibold text-slate-300">
                  This is my current ongoing role
                </label>
              </div>

              <VisibilityToggle showInFrontend={expFormData.showInFrontend ?? true} showInCv={expFormData.showInCv ?? true} onChange={(field, val) => setExpFormData({ ...expFormData, [field]: val })} />
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={() => setIsExpModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl">
                  {loading ? 'Saving...' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-800 rounded-3xl border border-slate-700 p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {editingEduId ? 'Edit Degree Record' : 'Add Degree Record'}
              </h3>
              <button onClick={() => setIsEduModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEduSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Degree Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master of Science in Computer Science"
                  value={eduFormData.degree || ''}
                  onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Institution *</label>
                  <input
                    type="text"
                    required
                    value={eduFormData.institution || ''}
                    onChange={(e) => setEduFormData({ ...eduFormData, institution: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year / Period *</label>
                  <input
                    type="text"
                    required
                    placeholder="2020 - 2022"
                    value={eduFormData.year || ''}
                    onChange={(e) => setEduFormData({ ...eduFormData, year: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Result / Honors</label>
                <input
                  type="text"
                  placeholder="e.g. CGPA 3.92 / 4.00"
                  value={eduFormData.result || ''}
                  onChange={(e) => setEduFormData({ ...eduFormData, result: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Thesis / Dissertation Title</label>
                <input
                  type="text"
                  value={eduFormData.thesis || ''}
                  onChange={(e) => setEduFormData({ ...eduFormData, thesis: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Advisor / Supervisor</label>
                <input
                  type="text"
                  value={eduFormData.advisor || ''}
                  onChange={(e) => setEduFormData({ ...eduFormData, advisor: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <VisibilityToggle showInFrontend={eduFormData.showInFrontend ?? true} showInCv={eduFormData.showInCv ?? true} onChange={(field, val) => setEduFormData({ ...eduFormData, [field]: val })} />
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={() => setIsEduModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl">
                  {loading ? 'Saving...' : 'Save Degree'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
