import React from 'react';
import { X, ExternalLink, FileText, BarChart } from 'lucide-react';
import { Publication } from '../types';

interface PublicationDetailsModalProps {
  publication: Publication | null;
  onClose: () => void;
  citationCount?: number;
}

export const PublicationDetailsModal: React.FC<PublicationDetailsModalProps> = ({ 
  publication, 
  onClose,
  citationCount 
}) => {
  if (!publication) return null;

  const displayCitations = citationCount !== undefined ? citationCount : publication.citations;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" id="pub-details-modal-backdrop">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 dark:border-slate-800 overflow-hidden" id="pub-details-modal-card">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Publication Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Title Section */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {publication.title}
              </h1>
              {publication.link && (
                <div className="mt-4">
                  <a 
                    href={publication.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 rounded-lg text-xs font-mono font-medium border border-brand-200 dark:border-brand-800 transition-colors"
                  >
                    <span>[HTML] View at Publisher</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Metadata Section */}
            <div className="space-y-6">
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mr-2">Authors:</span>
                {publication.authors}
              </div>
              
              <div className="flex flex-wrap items-end gap-x-8 gap-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Publication Year</span>
                  <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{publication.year}</span>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Venue / Journal</span>
                  <span className="text-sm text-slate-800 dark:text-slate-200 italic font-medium">{publication.venue}</span>
                </div>
                
                {displayCitations !== undefined && displayCitations > 0 && (
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Citations</span>
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <BarChart className="w-3.5 h-3.5" />
                      <span>Cited by {displayCitations}</span>
                    </span>
                  </div>
                )}
              </div>

              {publication.abstract && (
                <div className="flex flex-col space-y-3">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Description</span>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5 max-h-[40vh] overflow-y-auto shadow-inner">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-wrap">
                      {publication.abstract}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
