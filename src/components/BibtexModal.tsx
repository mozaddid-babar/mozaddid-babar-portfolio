import React, { useState } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';
import { Publication } from '../types';

interface BibtexModalProps {
  publication: Publication | null;
  onClose: () => void;
}

export const BibtexModal: React.FC<BibtexModalProps> = ({ publication, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!publication) return null;

  const bibtexContent = publication.bibtex || `@article{${publication.authors.split(' ')[0].toLowerCase()}${publication.year},\n  title={${publication.title}},\n  author={${publication.authors}},\n  journal={${publication.venue}},\n  year={${publication.year}},\n  doi={${publication.doi || ''}}\n}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bibtexContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" id="bibtex-modal-backdrop">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 dark:border-slate-800 overflow-hidden" id="bibtex-modal-card">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              BibTeX Citation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            id="close-bibtex-modal-btn"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper title preview */}
        <div className="px-6 pt-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Paper Reference
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
            {publication.title}
          </p>
        </div>

        {/* Code Content */}
        <div className="p-6">
          <div className="relative">
            <pre className="p-4 text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-64 leading-relaxed select-all">
              {bibtexContent}
            </pre>
            <button
              onClick={handleCopy}
              className={`absolute top-3 right-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
              id="copy-bibtex-btn"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Copy BibTeX</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            id="done-bibtex-modal-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
