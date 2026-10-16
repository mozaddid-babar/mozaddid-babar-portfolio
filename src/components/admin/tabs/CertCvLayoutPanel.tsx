import React, { useEffect, useState } from 'react';
import { FileText, ArrowUp, ArrowDown, Save, ChevronDown } from 'lucide-react';
import { Certification, CvCategoryGroup, CvCategoryPlacement, SectionConfig } from '../../../types';
import { resolveCertCategoryGroups } from '../../../utils/cvOrdering';
import { updateSectionsAPI } from '../../../api';

interface CertCvLayoutPanelProps {
  sections: SectionConfig[];
  certifications: Certification[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const PLACEMENT_OPTIONS: { value: CvCategoryPlacement; label: string }[] = [
  { value: 'certifications', label: 'Certifications section' },
  { value: 'achievements', label: 'Achievements section' },
  { value: 'hidden', label: 'Hidden in CV' }
];

// How certifications are laid out in the generated CV. Saved on the "certifications" section config.
export const CertCvLayoutPanel: React.FC<CertCvLayoutPanelProps> = ({ sections, certifications, onRefresh, showToast }) => {
  const certSec = sections.find(s => s.id === 'certifications');
  const [open, setOpen] = useState(false);
  const [sortByDate, setSortByDate] = useState(certSec?.cvSortByDate !== false);
  const [groupByCategory, setGroupByCategory] = useState(certSec?.cvGroupByCategory !== false);
  const [groups, setGroups] = useState<CvCategoryGroup[]>(() => resolveCertCategoryGroups(certifications, certSec?.cvCategoryGroups));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSortByDate(certSec?.cvSortByDate !== false);
    setGroupByCategory(certSec?.cvGroupByCategory !== false);
    setGroups(resolveCertCategoryGroups(certifications, certSec?.cvCategoryGroups));
  }, [certSec, certifications]);

  const countFor = (category: string) =>
    certifications.filter(c => ((c.category || '').trim() || 'Other').toLowerCase() === category.trim().toLowerCase()).length;

  const updateGroup = (idx: number, patch: Partial<CvCategoryGroup>) =>
    setGroups(groups.map((g, i) => (i === idx ? { ...g, ...patch } : g)));

  const moveGroup = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= groups.length) return;
    const next = [...groups];
    [next[idx], next[target]] = [next[target], next[idx]];
    setGroups(next);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = sections.map(s =>
        s.id === 'certifications'
          ? { ...s, cvSortByDate: sortByDate, cvGroupByCategory: groupByCategory, cvCategoryGroups: groups }
          : s
      );
      await updateSectionsAPI(updated);
      showToast('Certification CV layout saved!');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save CV layout', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 sm:px-6 text-left"
      >
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-white">CV Layout</span>
          <span className="text-xs text-slate-500 hidden sm:inline">Order, sub-headings and placement in the generated CV</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 sm:px-6 pb-5 space-y-4 border-t border-slate-800 pt-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={sortByDate} onChange={e => setSortByDate(e.target.checked)} className="accent-indigo-500" />
              Sort by date, newest first
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={groupByCategory} onChange={e => setGroupByCategory(e.target.checked)} className="accent-indigo-500" />
              Group by category with sub-headings
            </label>
          </div>

          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_1fr] gap-3 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <span className="w-14">Order</span>
              <span>Category</span>
              <span>CV sub-heading</span>
              <span>Show in CV under</span>
            </div>
            {groups.map((g, idx) => (
              <div key={g.category} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_1fr] gap-2 sm:gap-3 items-center p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-1 w-14">
                  <button type="button" onClick={() => moveGroup(idx, -1)} disabled={idx === 0} className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move up">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => moveGroup(idx, 1)} disabled={idx === groups.length - 1} className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30" aria-label="Move down">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-sm text-white">
                  {g.category} <span className="text-xs text-slate-500">({countFor(g.category)})</span>
                </div>
                <input
                  type="text"
                  value={g.heading || ''}
                  onChange={e => updateGroup(idx, { heading: e.target.value })}
                  placeholder={g.category}
                  disabled={!groupByCategory || g.placement !== 'certifications'}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-40"
                />
                <select
                  value={g.placement}
                  onChange={e => updateGroup(idx, { placement: e.target.value as CvCategoryPlacement })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  {PLACEMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500">
            Categories moved to Achievements are listed after your achievements, only while the Achievements section is shown in the CV.
            This only affects the CV; the website keeps all certifications.
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save CV Layout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
