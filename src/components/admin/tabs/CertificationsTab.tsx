import React, { useState, useEffect } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { ShieldCheck, Plus, Edit3, Trash2, X, ExternalLink, Image as ImageIcon, GripVertical } from 'lucide-react';
import { Certification } from '../../../types';
import { createCertificationAPI, updateCertificationAPI, deleteCertificationAPI, reorderCertificationsAPI } from '../../../api';

interface CertificationsTabProps {
  certifications?: Certification[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CertificationsTab: React.FC<CertificationsTabProps> = ({
  certifications = [],
  onRefresh,
  showToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Certification, 'id'>>({
    title: '',
    issuer: '',
    date: '',
    credentialId: '',
    description: '',
    imageUrl: '',
    showInFrontend: true,
    showInCv: true
  });
  const [loading, setLoading] = useState(false);

  const [localCerts, setLocalCerts] = useState<Certification[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    setLocalCerts(certifications);
  }, [certifications]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    // For firefox drag-and-drop to work, we need to set data
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...localCerts];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setLocalCerts(newItems);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    setIsSavingOrder(true);
    try {
      await reorderCertificationsAPI(localCerts.map(c => c.id));
      onRefresh(); // Refresh from backend
    } catch (err) {
      showToast('Failed to save order', 'error');
      setLocalCerts(certifications); // revert
    } finally {
      setIsSavingOrder(false);
    }
  };


  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      issuer: '',
      date: '',
      credentialId: '',
      description: '',
      imageUrl: '',
      showInFrontend: true,
      showInCv: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cert: Certification) => {
    setEditingId(cert.id);
    setFormData({
      title: cert.title || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      credentialId: cert.credentialId || '',
      description: cert.description || '',
      imageUrl: cert.imageUrl || '',
      showInFrontend: cert.showInFrontend ?? true,
      showInCv: cert.showInCv ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateCertificationAPI(editingId, formData);
        showToast('Certification updated successfully', 'success');
      } else {
        await createCertificationAPI(formData);
        showToast('Certification added successfully', 'success');
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
      await deleteCertificationAPI(id);
      showToast('Certification deleted successfully', 'success');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            Certifications
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your standalone certifications and credentials.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      <div className="space-y-4">
        {certifications.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400">No certifications added yet.</p>
          </div>
        ) : (
          localCerts.map((cert, index) => (
            <div 
              key={cert.id} 
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
                {cert.imageUrl ? (
                  <div className="w-16 h-12 shrink-0 rounded overflow-hidden bg-slate-900">
                    <img src={cert.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-12 shrink-0 rounded bg-slate-700 flex items-center justify-center text-slate-500">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-white font-bold">{cert.title}</h3>
                  <div className="text-sm text-slate-400 mt-0.5">
                    {cert.issuer} • {cert.date}
                  </div>
                  {cert.credentialId && (
                    <div className="text-xs text-slate-500 font-mono mt-1">ID: {cert.credentialId}</div>
                  )}
                </div>
              </div>

              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(cert)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(cert.id)}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Certification' : 'Add New Certification'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto">
              <form id="certForm" onSubmit={handleSubmit} className="space-y-4">
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Issuer *</label>
                    <input
                      type="text" required value={formData.issuer || ''}
                      onChange={e => setFormData({...formData, issuer: e.target.value})}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                    <input
                      type="text" required value={formData.date || ''}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      placeholder="e.g. Aug 2024"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Credential ID</label>
                    <input
                      type="text" value={formData.credentialId || ''}
                      onChange={e => setFormData({...formData, credentialId: e.target.value})}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                    <textarea
                      rows={3} value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL (Optional)</label>
                    <input
                      type="url" value={formData.imageUrl || ''}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://..."
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
              <button type="submit" form="certForm" disabled={loading} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl">
                {loading ? 'Saving...' : 'Save Certification'}
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
            <h3 className="text-lg font-bold text-white mb-2">Delete Certification?</h3>
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
