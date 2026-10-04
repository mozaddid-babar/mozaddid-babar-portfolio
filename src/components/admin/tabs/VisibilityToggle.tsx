import React from 'react';
import { Eye, FileText, EyeOff } from 'lucide-react';

interface VisibilityToggleProps {
  showInFrontend?: boolean;
  showInCv?: boolean;
  onChange: (field: 'showInFrontend' | 'showInCv', value: boolean) => void;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ showInFrontend = true, showInCv = true, onChange }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
      <div className="text-xs font-semibold text-slate-300">Visibility</div>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center cursor-pointer gap-2">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showInFrontend !== false} 
              onChange={(e) => onChange('showInFrontend', e.target.checked)} 
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showInFrontend !== false ? 'bg-brand-600' : 'bg-slate-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showInFrontend !== false ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="flex items-center text-xs font-medium text-slate-300">
            {showInFrontend !== false ? <Eye className="w-3.5 h-3.5 mr-1 text-brand-400" /> : <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-500" />}
            Frontend
          </div>
        </label>
        
        <label className="flex items-center cursor-pointer gap-2">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showInCv !== false} 
              onChange={(e) => onChange('showInCv', e.target.checked)} 
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showInCv !== false ? 'bg-indigo-600' : 'bg-slate-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showInCv !== false ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="flex items-center text-xs font-medium text-slate-300">
            <FileText className={`w-3.5 h-3.5 mr-1 ${showInCv !== false ? 'text-indigo-400' : 'text-slate-500'}`} />
            CV PDF
          </div>
        </label>
      </div>
    </div>
  );
};
