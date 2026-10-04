import React, { useState, useEffect } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { HeartHandshake, Plus, Edit3, Trash2, X, GripVertical } from 'lucide-react';
import { VolunteerEngagement } from '../../../types';
import { createVolunteerWorkAPI, updateVolunteerWorkAPI, deleteVolunteerWorkAPI, reorderVolunteerWorkAPI } from '../../../api';

interface VolunteerTabProps {
  volunteerWork?: VolunteerEngagement[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const VolunteerTab: React.FC<VolunteerTabProps> = ({
  volunteerWork = [],
  onRefresh,
  showToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<VolunteerEngagement, 'id'>>({
    role: '',
    organization: '',
    period: '',
    description: '',
    showInFrontend: true
  });
  
  const [loading, setLoading] = useState(false);
  const [localItems, setLocalItems] = useState<VolunteerEngagement[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalItems(volunteerWork);
  }, [volunteerWork]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...localItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setLocalItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      await reorderVolunteerWorkAPI(localItems.map(a => a.id));
      onRefresh();
    } catch (err) {
      showToast('Failed to save order', 'error');
      setLocalItems(volunteerWork);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      role: '',
      organization: '',
      period: '',
      description: '',
      showInFrontend: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: VolunteerEngagement) => {
    setEditingId(item.id);
    setFormData({
      role: item.role || item.title || '',
      organization: item.organization || '',
      period: item.period || '',
      description: item.description || '',
      showInFrontend: item.showInFrontend ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateVolunteerWorkAPI(editingId, formData);
        showToast('Updated successfully', 'success');
      } else {
        await createVolunteerWorkAPI(formData);
        showToast('Added successfully', 'success');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteVolunteerWorkAPI(id);
      showToast('Deleted', 'success');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-volunteer-tab">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-500" />
            <span>Voluntary Experience</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your volunteer roles and community engagements.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Volunteer Role</span>
        </button>
      </div>

      <div className="space-y-3">
        {localItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50 border-dashed">
            <HeartHandshake className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No volunteer roles added yet.</p>
          </div>
        ) : (
          localItems.map((item, index) => (
            <div 
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-800/90 border transition-all gap-4 ${
                draggedIndex === index ? 'opacity-50 border-brand-500 scale-[0.98]' : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-slate-500 cursor-grab hover:text-slate-300 active:cursor-grabbing p-1 -ml-2">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="text-white font-bold">{item.role || item.title}</h3>
                    <div className="text-sm text-slate-400 mt-0.5">
                      <span className="text-indigo-400 mr-2">{item.organization}</span>
                      {item.period}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(item.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Edit Volunteer Role' : 'New Volunteer Role'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="volunteer-form" onSubmit={handleSubmit} className="space-y-6">
                <VisibilityToggle 
                  showInFrontend={formData.showInFrontend} 
                  showInCv={true}
                  onChange={(field, val) => setFormData(prev => ({ ...prev, [field]: val }))} 
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role *</label>
                  <input
                    required
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
                    placeholder="e.g. Seminar & Workshop Secretary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Organization</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. Programmers Arena, HSTU"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Period</label>
                    <input
                      type="text"
                      value={formData.period}
                      onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. Jul 2018 - Apr 2021 or Jan 2024 - Present"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
                    placeholder="Organized seminars and workshops..."
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                form="volunteer-form"
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm p-6 text-center animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-red-950/50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Role?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
