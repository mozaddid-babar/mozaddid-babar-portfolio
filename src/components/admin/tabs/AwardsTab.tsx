import React, { useState, useEffect } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { Trophy, Plus, Edit3, Trash2, X, GripVertical, Award as AwardIcon } from 'lucide-react';
import { Award } from '../../../types';
import { createAwardAPI, updateAwardAPI, deleteAwardAPI, reorderAwardsAPI } from '../../../api';

interface AwardsTabProps {
  awards?: Award[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AwardsTab: React.FC<AwardsTabProps> = ({
  awards = [],
  onRefresh,
  showToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Award, 'id'>>({
    title: '',
    issuer: '',
    date: '',
    description: '',
    showInFrontend: true
  });
  
  const [loading, setLoading] = useState(false);
  const [localAwards, setLocalAwards] = useState<Award[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalAwards(awards);
  }, [awards]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...localAwards];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setLocalAwards(newItems);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      await reorderAwardsAPI(localAwards.map(a => a.id));
      onRefresh();
    } catch (err) {
      showToast('Failed to save order', 'error');
      setLocalAwards(awards);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      issuer: '',
      date: '',
      description: '',
      showInFrontend: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (awd: Award) => {
    setEditingId(awd.id);
    setFormData({
      title: awd.title || '',
      issuer: awd.issuer || '',
      date: awd.date || '',
      description: awd.description || '',
      showInFrontend: awd.showInFrontend ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateAwardAPI(editingId, formData);
        showToast('Award updated successfully', 'success');
      } else {
        await createAwardAPI(formData);
        showToast('Award added successfully', 'success');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save award', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteAwardAPI(id);
      showToast('Award deleted', 'success');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-awards-tab">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AwardIcon className="w-5 h-5 text-teal-500" />
            <span>Honors & Awards</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your timeline of honors, awards, and scholarships.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Award</span>
        </button>
      </div>

      <div className="space-y-3">
        {localAwards.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50 border-dashed">
            <AwardIcon className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No awards added yet.</p>
          </div>
        ) : (
          localAwards.map((awd, index) => (
            <div 
              key={awd.id}
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
                    <h3 className="text-white font-bold">{awd.title}</h3>
                    <div className="text-sm text-slate-400 mt-0.5">
                      <span className="text-teal-400 mr-2">{awd.issuer}</span>
                      {awd.date}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(awd)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(awd.id)}
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
                {editingId ? 'Edit Award' : 'New Award'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="award-form" onSubmit={handleSubmit} className="space-y-6">
                <VisibilityToggle 
                  showInFrontend={formData.showInFrontend} 
                  showInCv={true} // hidden unused prop
                  onChange={(field, val) => setFormData(prev => ({ ...prev, [field]: val }))} 
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
                    placeholder="e.g. One Bank Scholarship"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issuer / Organization</label>
                    <input
                      type="text"
                      value={formData.issuer}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. One Bank Ltd."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="e.g. Apr 2016"
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
                    placeholder="Awarded for an excellent result..."
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
                form="award-form"
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Award'}
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
            <h3 className="text-lg font-bold text-white mb-2">Delete Award?</h3>
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
