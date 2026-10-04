import React, { useState } from 'react';
import { UserCheck, Plus, Edit3, Trash2, X } from 'lucide-react';
import { Reference } from '../../../types';
import { createReferenceAPI, updateReferenceAPI, deleteReferenceAPI } from '../../../api';
import { VisibilityToggle } from './VisibilityToggle';

interface ReferencesTabProps {
  references?: Reference[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ReferencesTab: React.FC<ReferencesTabProps> = ({
  references = [],
  onRefresh,
  showToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    showInFrontend: true, showInCv: true,
    name: '', role: '', department: '', organization: '', email: '', phone: '', imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', role: '', department: '', organization: '', email: '', phone: '', imageUrl: '', showInFrontend: true, showInCv: true });
    setIsOpen(true);
  };

  const openEdit = (r: Reference) => {
    setEditingId(r.id);
    setForm({
      name: r.name,
      role: r.role || r.designation || '',
      department: r.department || '',
      organization: r.organization || r.institution || '',
      email: r.email || '',
      phone: r.phone || '',
      imageUrl: r.imageUrl || '',
      showInFrontend: r.showInFrontend ?? true,
      showInCv: r.showInCv ?? true
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      showToast('Name is required', 'error');
      return;
    }
    
    setLoading(true);
    try {
      if (editingId) {
        await updateReferenceAPI(editingId, form);
        showToast('Reference updated', 'success');
      } else {
        await createReferenceAPI(form);
        showToast('Reference added', 'success');
      }
      setIsOpen(false);
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
      await deleteReferenceAPI(id);
      showToast('Reference deleted', 'success');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-references-tab">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#0B59B6]" />
            <span>References</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your academic and professional references.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reference</span>
        </button>
      </div>

      <div className="space-y-3">
        {references.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50 border-dashed">
            <UserCheck className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No references added yet.</p>
          </div>
        ) : (
          references.map((item) => (
            <div 
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition-all gap-4"
            >
              <div className="flex items-center gap-4">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-700" />
                )}
                <div>
                  <h3 className="text-white font-bold">{item.name}</h3>
                  <div className="text-sm text-slate-400 mt-0.5">
                    <span className="text-[#0B59B6] font-medium mr-2">{item.role || item.designation}</span>
                    <span>{item.organization || item.institution}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirmId(item.id)} className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Edit Reference' : 'New Reference'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="ref-form" onSubmit={handleSubmit} className="space-y-6">
                <VisibilityToggle 
                  showInFrontend={form.showInFrontend} 
                  showInCv={form.showInCv}
                  onChange={(field, val) => setForm((prev: any) => ({ ...prev, [field]: val }))} 
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name *</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. Dr. John Doe" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role / Designation</label>
                    <input type="text" value={form.role} onChange={(e) => setForm((prev: any) => ({ ...prev, role: e.target.value }))} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. Professor" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                    <input type="text" value={form.department} onChange={(e) => setForm((prev: any) => ({ ...prev, department: e.target.value }))} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. Computer Science" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Institution / Organization</label>
                  <input type="text" value={form.organization} onChange={(e) => setForm((prev: any) => ({ ...prev, organization: e.target.value }))} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. Stanford University" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((prev: any) => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm((prev: any) => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. +1 234 567 8900" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Photo URL</label>
                  <input type="url" value={form.imageUrl} onChange={(e) => setForm((prev: any) => ({ ...prev, imageUrl: e.target.value }))} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. https://example.com/photo.jpg" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
              <button form="ref-form" type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Reference'}
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
            <h3 className="text-lg font-bold text-white mb-2">Delete Reference?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} disabled={loading} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
