import React, { useState } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { useDragReorder } from './useDragReorder';
import { LinkVisibility } from './LinkVisibility';
import { Code, Plus, Search, Edit3, Trash2, X, Github, ExternalLink, Sparkles, Eye, EyeOff, FileText, GripVertical, FlaskConical, Wrench } from 'lucide-react';
import { Project, ProjectType, Publication } from '../../../types';
import { getProjectType, PROJECT_TYPE_LABELS } from '../../../utils/cvOrdering';
import { createProjectAPI, updateProjectAPI, deleteProjectAPI } from '../../../api';

interface ProjectsTabProps {
  projects: Project[];
  publications?: Publication[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const EMPTY_PROJ: Omit<Project, 'id'> = {
  title: '',
  category: 'Healthcare AI / Full Stack',
  projectType: 'technical',
  showTypeBadge: true,
  description: '',
  fullDescription: '',
  buildNote: '',
  images: [],
  technologies: [],
  githubUrl: '',
  liveUrl: '',
  githubShowInFrontend: true,
  githubShowInCv: false,
  liveShowInFrontend: true,
  liveShowInCv: false,
  cvPrintLinkUrls: false,
  role: '',
  roleShowInFrontend: true,
  roleShowInCv: true,
  highlights: [],
  highlightsShowInFrontend: true,
  highlightsShowInCv: true,
  relatedPublicationId: '',
  publicationShowInFrontend: true,
  publicationShowInCv: true,
  technologiesShowInFrontend: true,
  technologiesShowInCv: true,
  dateShowInFrontend: true,
  dateShowInCv: true,
  featured: false,
  date: '',
  showInFrontend: true,
  showInCv: true
};

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ projects, publications = [], onRefresh, showToast }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Project, 'id'>>(EMPTY_PROJ);
  const [techInput, setTechInput] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { localItems, draggedIndex, getItemProps, getHandleProps } = useDragReorder(projects || [], 'projects', onRefresh, showToast);
  // Reordering works on the full list, so it is turned off while searching
  const canReorder = !search.trim();

  const filtered = localItems.filter(p => {
    const q = search.toLowerCase().trim();
    return !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_PROJ);
    setTechInput('');
    setHighlightsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingId(proj.id);
    setFormData({
      title: proj.title,
      category: proj.category,
      projectType: getProjectType(proj),
      showTypeBadge: proj.showTypeBadge ?? true,
      description: proj.description,
      fullDescription: proj.fullDescription || '',
      buildNote: proj.buildNote || '',
      images: proj.images || [],
      technologies: proj.technologies || [],
      githubUrl: proj.githubUrl || '',
      liveUrl: proj.liveUrl || '',
      githubShowInFrontend: proj.githubShowInFrontend ?? true,
      githubShowInCv: proj.githubShowInCv ?? false,
      liveShowInFrontend: proj.liveShowInFrontend ?? true,
      liveShowInCv: proj.liveShowInCv ?? false,
      cvPrintLinkUrls: proj.cvPrintLinkUrls ?? false,
      role: proj.role || '',
      roleShowInFrontend: proj.roleShowInFrontend ?? true,
      roleShowInCv: proj.roleShowInCv ?? true,
      highlights: proj.highlights || [],
      highlightsShowInFrontend: proj.highlightsShowInFrontend ?? true,
      highlightsShowInCv: proj.highlightsShowInCv ?? true,
      relatedPublicationId: proj.relatedPublicationId || '',
      publicationShowInFrontend: proj.publicationShowInFrontend ?? true,
      publicationShowInCv: proj.publicationShowInCv ?? true,
      technologiesShowInFrontend: proj.technologiesShowInFrontend ?? true,
      technologiesShowInCv: proj.technologiesShowInCv ?? true,
      dateShowInFrontend: proj.dateShowInFrontend ?? true,
      dateShowInCv: proj.dateShowInCv ?? true,
      featured: !!proj.featured,
      date: proj.date || '',
      showInFrontend: proj.showInFrontend ?? true,
      showInCv: proj.showInCv ?? true
    });
    setTechInput((proj.technologies || []).join(', '));
    setHighlightsInput((proj.highlights || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.description) {
      showToast('Please provide title, category, and description.', 'error');
      return;
    }

    setLoading(true);
    const parsedTech = techInput.split(',').map(t => t.trim()).filter(Boolean);
    // One highlight per line; a leading bullet or dash typed by hand is dropped
    const parsedHighlights = highlightsInput.split('\n').map(h => h.replace(/^\s*[-•*]\s*/, '').trim()).filter(Boolean);
    const payload = {
      ...formData,
      technologies: parsedTech,
      highlights: parsedHighlights
    };

    try {
      if (editingId) {
        await updateProjectAPI(editingId, payload);
        showToast('Project updated successfully!');
      } else {
        await createProjectAPI(payload);
        showToast('New project created successfully!');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectAPI(id);
      showToast('Project deleted.');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-projects-tab">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            <span>Research & Engineering Projects</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your open-source repositories, system prototypes, and software platforms.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all cursor-pointer"
          id="add-project-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title, category, or tech..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((proj, index) => (
          <div
            key={proj.id}
            {...(canReorder ? getItemProps(index) : {})}
            className={`p-5 rounded-2xl bg-slate-800/90 border transition-all flex flex-col justify-between space-y-4 ${draggedIndex === index ? 'opacity-50 border-brand-500 scale-[0.98]' : 'border-slate-700/80 hover:border-slate-600'}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {canReorder && (
                    <div {...getHandleProps(index)} className="text-slate-500 cursor-grab hover:text-slate-300 active:cursor-grabbing p-1 -ml-2">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  )}
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold text-[11px]">
                    {proj.category}
                  </span>
                  {getProjectType(proj) === 'research' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-semibold text-[11px]" title={proj.showTypeBadge === false ? 'Marker hidden on website' : 'Marker shown on website'}>
                      <FlaskConical className="w-3 h-3" /> Research
                      {proj.showTypeBadge === false && <EyeOff className="w-3 h-3 opacity-70" />}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-semibold text-[11px]" title={proj.showTypeBadge === false ? 'Marker hidden on website' : 'Marker shown on website'}>
                      <Wrench className="w-3 h-3" /> Technical
                      {proj.showTypeBadge === false && <EyeOff className="w-3 h-3 opacity-70" />}
                    </span>
                  )}
                </div>
                {proj.date && <span className="text-slate-400 font-medium">{proj.date}</span>}
              </div>

              <h3 className="text-base font-bold text-white">{proj.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {proj.technologies.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <div className="flex items-center space-x-2 text-xs">
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {proj.liveUrl && (
                  <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(proj)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(proj.id)}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/60"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-800 rounded-3xl border border-slate-700 p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. MedVisionAI: Clinical Decision Support"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Type
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {(['research', 'technical'] as ProjectType[]).map(type => {
                    const active = (formData.projectType || 'technical') === type;
                    const Icon = type === 'research' ? FlaskConical : Wrench;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, projectType: type })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${active ? (type === 'research' ? 'bg-sky-950/60 border-sky-700 text-sky-300' : 'bg-amber-950/60 border-amber-700 text-amber-300') : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {PROJECT_TYPE_LABELS[type]}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, showTypeBadge: !(formData.showTypeBadge ?? true) })}
                    title={(formData.showTypeBadge ?? true) ? 'Marker is shown on the website card. Click to hide.' : 'Marker is hidden on the website card. Click to show.'}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${(formData.showTypeBadge ?? true) ? 'bg-brand-950/50 border-brand-800 text-brand-300' : 'bg-slate-900 border-slate-700 text-slate-500 line-through'}`}
                  >
                    {(formData.showTypeBadge ?? true) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Marker on website
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  The CV lists Research Projects first, then Technical Projects, each under its own sub-heading.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Healthcare AI / Full Stack"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date / Period
                  </label>
                  <input
                    type="text"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Jan 2023 - Jun 2023"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                  <LinkVisibility
                    showInFrontend={formData.dateShowInFrontend ?? true}
                    showInCv={formData.dateShowInCv ?? true}
                    onChange={(field, val) => setFormData({ ...formData, [field === 'frontend' ? 'dateShowInFrontend' : 'dateShowInCv']: val })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role / Lab / Supervisor
                </label>
                <input
                  type="text"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder={(formData.projectType || 'technical') === 'research' ? 'e.g. Undergraduate Thesis · Dept. of CSE, HSTU · Supervisor: Dr. X' : 'e.g. Solo project · Full-stack'}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
                <LinkVisibility
                  showInFrontend={formData.roleShowInFrontend ?? true}
                  showInCv={formData.roleShowInCv ?? true}
                  onChange={(field, val) => setFormData({ ...formData, [field === 'frontend' ? 'roleShowInFrontend' : 'roleShowInCv']: val })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Short Summary / Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of the tool..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Results / Highlights (one per line)
                </label>
                <textarea
                  rows={3}
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  placeholder={'Achieved 94.2% accuracy on 64-channel EEG recordings (n = 120)\nReduced feature set by 60% using correlation-based selection'}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y"
                />
                <p className="text-[11px] text-slate-500 mt-1">Keep it to 1–2 lines, with a number where possible. Shown as bullets.</p>
                <LinkVisibility
                  showInFrontend={formData.highlightsShowInFrontend ?? true}
                  showInCv={formData.highlightsShowInCv ?? true}
                  onChange={(field, val) => setFormData({ ...formData, [field === 'frontend' ? 'highlightsShowInFrontend' : 'highlightsShowInCv']: val })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Related Publication
                </label>
                <select
                  value={formData.relatedPublicationId || ''}
                  onChange={(e) => setFormData({ ...formData, relatedPublicationId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="">None</option>
                  {publications.map(pub => (
                    <option key={pub.id} value={pub.id}>
                      {pub.title.length > 90 ? `${pub.title.slice(0, 90)}…` : pub.title} ({pub.year})
                    </option>
                  ))}
                </select>
                <LinkVisibility
                  showInFrontend={formData.publicationShowInFrontend ?? true}
                  showInCv={formData.publicationShowInCv ?? true}
                  onChange={(field, val) => setFormData({ ...formData, [field === 'frontend' ? 'publicationShowInFrontend' : 'publicationShowInCv']: val })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Technical Architecture / Key Highlights
                </label>
                <textarea
                  rows={2}
                  value={formData.fullDescription || ''}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Additional architectural notes or achievements..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Technologies / Stacks (comma separated)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="PyTorch, FastAPI, React, TypeScript, Docker"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
                <LinkVisibility
                  showInFrontend={formData.technologiesShowInFrontend ?? true}
                  showInCv={formData.technologiesShowInCv ?? true}
                  onChange={(field, val) => setFormData({ ...formData, [field === 'frontend' ? 'technologiesShowInFrontend' : 'technologiesShowInCv']: val })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                  <LinkVisibility
                    showInFrontend={formData.githubShowInFrontend ?? true}
                    showInCv={formData.githubShowInCv ?? false}
                    onChange={(field, val) => setFormData({ ...formData, [field === 'frontend' ? 'githubShowInFrontend' : 'githubShowInCv']: val })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Live Demo / Site URL
                  </label>
                  <input
                    type="text"
                    value={formData.liveUrl || ''}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://demo..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                  <LinkVisibility
                    showInFrontend={formData.liveShowInFrontend ?? true}
                    showInCv={formData.liveShowInCv ?? false}
                    onChange={(field, val) => setFormData({ ...formData, [field === 'frontend' ? 'liveShowInFrontend' : 'liveShowInCv']: val })}
                  />
                </div>

                <label className="sm:col-span-2 flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.cvPrintLinkUrls}
                    onChange={(e) => setFormData({ ...formData, cvPrintLinkUrls: e.target.checked })}
                    className="mt-0.5 accent-indigo-500"
                  />
                  <span>
                    Print link addresses in the CV
                    <span className="block text-[11px] text-slate-500">Shows e.g. github.com/user/repo next to the icon, so printed copies stay readable.</span>
                  </span>
                </label>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Project Images (Max 15)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if ((formData.images || []).length < 15) {
                        setFormData({ ...formData, images: [...(formData.images || []), ''] });
                      } else {
                        showToast('Maximum 15 images allowed', 'error');
                      }
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-400 bg-brand-950/30 hover:bg-brand-950/60 border border-brand-900/50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Picture</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {(formData.images || []).map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2 animate-fadeIn">
                      <input
                        type="text"
                        value={img || ''}
                        onChange={(e) => {
                          const newImages = [...(formData.images || [])];
                          newImages[idx] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        placeholder={`https://example.com/image-${idx + 1}.png`}
                        className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...(formData.images || [])];
                          newImages.splice(idx, 1);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="p-2 bg-red-950/60 hover:bg-red-900 border border-red-800/60 rounded-xl text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {!(formData.images && formData.images.length > 0) && (
                    <div className="text-center py-4 border-2 border-dashed border-slate-700 rounded-xl">
                      <p className="text-xs text-slate-500 font-medium">No images added. Click "Add Picture" to upload.</p>
                    </div>
                  )}
                </div>
              </div>

              </div>

              <VisibilityToggle showInFrontend={formData.showInFrontend ?? true} showInCv={formData.showInCv ?? true} onChange={(field, val) => setFormData({ ...formData, [field]: val })} />
<div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Delete Project?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove this project?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
