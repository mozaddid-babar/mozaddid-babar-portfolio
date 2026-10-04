import React, { useState } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { Code, Plus, Search, Edit3, Trash2, X, Github, ExternalLink, Sparkles } from 'lucide-react';
import { Project } from '../../../types';
import { createProjectAPI, updateProjectAPI, deleteProjectAPI } from '../../../api';

interface ProjectsTabProps {
  projects: Project[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const EMPTY_PROJ: Omit<Project, 'id'> = {
  title: '',
  category: 'Healthcare AI / Full Stack',
  description: '',
  fullDescription: '',
  buildNote: '',
  images: [],
  technologies: [],
  githubUrl: '',
  liveUrl: '',
  featured: false,
  date: '',
  showInFrontend: true,
  showInCv: true
};

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ projects, onRefresh, showToast }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Project, 'id'>>(EMPTY_PROJ);
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = (projects || []).filter(p => {
    const q = search.toLowerCase().trim();
    return !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_PROJ);
    setTechInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingId(proj.id);
    setFormData({
      title: proj.title,
      category: proj.category,
      description: proj.description,
      fullDescription: proj.fullDescription || '',
      buildNote: proj.buildNote || '',
      images: proj.images || [],
      technologies: proj.technologies || [],
      githubUrl: proj.githubUrl || '',
      liveUrl: proj.liveUrl || '',
      featured: !!proj.featured,
      date: proj.date || '',
      showInFrontend: proj.showInFrontend ?? true,
      showInCv: proj.showInCv ?? true
    });
    setTechInput((proj.technologies || []).join(', '));
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
    const payload = {
      ...formData,
      technologies: parsedTech
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
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold text-[11px]">
                  {proj.category}
                </span>
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
                    placeholder="e.g. 2023 - 2024"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
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
                </div>
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
