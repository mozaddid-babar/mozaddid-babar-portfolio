import React, { useState } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { Award, Plus, Edit3, Trash2, X, ExternalLink } from 'lucide-react';
import { Training } from '../../../types';
import {
  createTrainingAPI, updateTrainingAPI, deleteTrainingAPI
} from '../../../api';

interface TrainingsTabProps {
  trainings?: Training[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TrainingsTab: React.FC<TrainingsTabProps> = ({
  trainings = [],
  onRefresh,
  showToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Training, 'id'>>({
    title: '',
    issuer: '',
    year: '',
    credentialUrl: '',
    skillsAcquired: [],
    showInFrontend: true,
    showInCv: true
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      issuer: '',
      year: '',
      credentialUrl: '',
      skillsAcquired: [],
      showInFrontend: true,
      showInCv: true
    });
    setSkillsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (training: Training) => {
    setEditingId(training.id);
    setFormData({
      title: training.title || '',
      issuer: training.issuer || '',
      year: training.year || '',
      credentialUrl: training.credentialUrl || '',
      skillsAcquired: training.skillsAcquired || [],
      showInFrontend: training.showInFrontend ?? true,
      showInCv: training.showInCv ?? true
    });
    setSkillsInput((training.skillsAcquired || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSkills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { ...formData, skillsAcquired: parsedSkills };
    setLoading(true);
    try {
      if (editingId) {
        await updateTrainingAPI(editingId, payload);
        showToast('Training updated successfully', 'success');
      } else {
        await createTrainingAPI(payload);
        showToast('Training added successfully', 'success');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTrainingAPI(id);
      showToast('Training deleted successfully', 'success');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (error) {
      showToast('Failed to delete training', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Trainings Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-400" />
              Trainings & Courses
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Manage professional training credentials and specialized programs.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Training</span>
          </button>
        </div>

        <div className="space-y-4">
          {trainings.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800">
              <p className="text-slate-400">No trainings added yet.</p>
            </div>
          ) : (
            trainings.map((training) => (
              <div key={training.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition-all gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-bold">{training.title}</h3>
                  <div className="text-sm text-slate-400 mt-0.5">
                    {training.issuer} • {training.year}
                  </div>
                  {training.credentialUrl && (
                    <a href={training.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300 mt-2">
                      <span>View Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {training.skillsAcquired && training.skillsAcquired.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {training.skillsAcquired.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-[10px] text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => openEditModal(training)}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(training.id)}
                    className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Training Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Training' : 'Add New Training'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto">
              <form id="trainingForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                    <input
                      type="text" required value={formData.title || ''}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Issuer / Institution *</label>
                    <input
                      type="text" required value={formData.issuer || ''}
                      onChange={e => setFormData({...formData, issuer: e.target.value})}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Year *</label>
                    <input
                      type="text" required value={formData.year || ''}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Credential URL (Optional)</label>
                    <input
                      type="url" value={formData.credentialUrl || ''}
                      onChange={e => setFormData({...formData, credentialUrl: e.target.value})}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Skills Acquired (comma separated)</label>
                    <input
                      type="text" value={skillsInput}
                      onChange={e => setSkillsInput(e.target.value)}
                      placeholder="e.g. Python, Agile, Project Management"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <VisibilityToggle 
                  showInFrontend={formData.showInFrontend ?? true} 
                  showInCv={formData.showInCv ?? true} 
                  onChange={(field, val) => setFormData({ ...formData, [field]: val })} 
                />
              </form>
            </div>

            <div className="p-5 sm:p-6 border-t border-slate-700 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" form="trainingForm" disabled={loading} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl">
                {loading ? 'Saving...' : 'Save Training'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="relative bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Training?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone. Are you sure you want to proceed?</p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
