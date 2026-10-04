import React, { useState } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { Trophy, Users, HeartHandshake, UserCheck, Plus, Edit3, Trash2, X } from 'lucide-react';
import { Affiliation, Reference } from '../../../types';
import {
  
  createAffiliationAPI, updateAffiliationAPI, deleteAffiliationAPI,
  
} from '../../../api';

interface HonorsTabProps {
  affiliations?: Affiliation[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

type SubSection = 'affiliations' | 'volunteer' | 'references';

export const HonorsTab: React.FC<HonorsTabProps> = ({
  affiliations = [],
  onRefresh,
  showToast
}) => {
  const [section, setSection] = useState<SubSection>('affiliations');

  const sections: { id: SubSection; label: string; icon: React.ElementType; count: number }[] = [
        { id: 'affiliations', label: 'Affiliations', icon: Users, count: affiliations.length },
    { id: 'references', label: 'References', icon: UserCheck, count: 0 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Honors, Affiliations & References
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage achievements, memberships, volunteer work, and academic/professional references.
        </p>
      </div>

      {/* Sub-section tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all cursor-pointer ${
                section === s.id
                  ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
              {s.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${section === s.id ? 'bg-brand-800' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  {s.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

            {section === 'affiliations' && (
        <AffiliationsPanel items={affiliations} onRefresh={onRefresh} showToast={showToast} />
      )}
      
    </div>
  );
};

// Shared small UI bits
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
    {children}
  </div>
);

const CardActions: React.FC<{ onEdit: () => void; onDelete: () => void }> = ({ onEdit, onDelete }) => (
  <div className="flex items-center space-x-1">
    <button onClick={onEdit} className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit">
      <Edit3 className="w-4 h-4" />
    </button>
    <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800" title="Delete">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const ModalShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div>
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
      {label}{required && ' *'}
    </label>
    {children}
  </div>
);

const inputClass = "w-full mt-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl";

const FormActions: React.FC<{ onCancel: () => void; loading: boolean; editing: boolean }> = ({ onCancel, loading, editing }) => (
  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
    <button type="button" onClick={onCancel} className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
      Cancel
    </button>
    <button type="submit" disabled={loading} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold">
      {loading ? 'Saving...' : editing ? 'Update' : 'Save'}
    </button>
  </div>
);

const AffiliationsPanel: React.FC<{ items: Affiliation[]; onRefresh: () => void; showToast: (m: string, t?: 'success' | 'error') => void }> = ({ items, onRefresh, showToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ showInFrontend: true, showInCv: true, organization: '', role: '', membershipId: '', period: '' });
  const [loading, setLoading] = useState(false);

  const openCreate = () => { setEditingId(null); setForm({ organization: '', role: '', membershipId: '', period: '' }); setIsOpen(true); };
  const openEdit = (a: Affiliation) => { setEditingId(a.id); setForm({ organization: a.organization, role: a.role, membershipId: a.membershipId || '', period: a.period || '' , showInFrontend: a.showInFrontend ?? true, showInCv: a.showInCv ?? true }); setIsOpen(true); };

  const handleDelete = async (id: string, org: string) => {
    if (!window.confirm(`Delete affiliation with "${org}"?`)) return;
    try { await deleteAffiliationAPI(id); showToast('Affiliation deleted'); onRefresh(); }
    catch (err: any) { showToast(err.message || 'Failed to delete', 'error'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization || !form.role) { showToast('Organization and role are required.', 'error'); return; }
    try {
      setLoading(true);
      if (editingId) { await updateAffiliationAPI(editingId, form); showToast('Affiliation updated'); }
      else { await createAffiliationAPI(form); showToast('Affiliation added'); }
      setIsOpen(false);
      onRefresh();
    } catch (err: any) { showToast(err.message || 'Failed to save', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm">
          <Plus className="w-4 h-4" /><span>Add Affiliation</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400">{a.period}</span>
              <CardActions onEdit={() => openEdit(a)} onDelete={() => handleDelete(a.id, a.organization)} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{a.organization}</h3>
            <p className="text-xs text-slate-500">{a.role}</p>
            {a.membershipId && <p className="text-[11px] font-mono text-slate-400">ID: {a.membershipId}</p>}
          </Card>
        ))}
      </div>
      {items.length === 0 && <p className="text-xs text-slate-500 italic">No affiliations added yet.</p>}

      {isOpen && (
        <ModalShell title={editingId ? 'Edit Affiliation' : 'Add Affiliation'} onClose={() => setIsOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <FormField label="Organization" required>
              <input type="text" required value={form.organization || ''} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="e.g. IEEE" className={inputClass} />
            </FormField>
            <FormField label="Role / Membership Type" required>
              <input type="text" required value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Student Member" className={inputClass} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Membership ID">
                <input type="text" value={form.membershipId || ''} onChange={(e) => setForm({ ...form, membershipId: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Period">
                <input type="text" value={form.period || ''} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="e.g. 2022 - Present" className={inputClass} />
              </FormField>
            </div>
            <VisibilityToggle showInFrontend={form.showInFrontend ?? true} showInCv={form.showInCv ?? true} onChange={(field, val) => setForm({ ...form, [field]: val })} />
            <FormActions onCancel={() => setIsOpen(false)} loading={loading} editing={!!editingId} />
          </form>
        </ModalShell>
      )}
    </div>
  );
};

