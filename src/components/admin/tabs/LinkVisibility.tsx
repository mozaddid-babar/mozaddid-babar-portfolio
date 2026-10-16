import React from 'react';
import { Eye, EyeOff, FileText } from 'lucide-react';

// Compact Frontend / CV switches shown under an individual field (links, dates, highlights...)
export const LinkVisibility: React.FC<{
  showInFrontend: boolean;
  showInCv: boolean;
  onChange: (field: 'frontend' | 'cv', value: boolean) => void;
}> = ({ showInFrontend, showInCv, onChange }) => (
  <div className="flex items-center gap-2 mt-1.5">
    <button
      type="button"
      onClick={() => onChange('frontend', !showInFrontend)}
      title={showInFrontend ? 'Shown on the website. Click to hide.' : 'Hidden on the website. Click to show.'}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${showInFrontend ? 'bg-brand-950/50 border-brand-800 text-brand-300' : 'bg-slate-900 border-slate-700 text-slate-500 line-through'}`}
    >
      {showInFrontend ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      Frontend
    </button>
    <button
      type="button"
      onClick={() => onChange('cv', !showInCv)}
      title={showInCv ? 'Shown in the CV. Click to hide.' : 'Hidden in the CV. Click to show.'}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${showInCv ? 'bg-indigo-950/50 border-indigo-800 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-500 line-through'}`}
    >
      <FileText className="w-3 h-3" />
      CV PDF
    </button>
  </div>
);
