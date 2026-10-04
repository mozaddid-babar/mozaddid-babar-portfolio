import React, { useState, useRef, useEffect } from 'react';
import { Award } from 'lucide-react';
import { Certification, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface CertificationsSectionProps {
  certifications: Certification[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications, isAlt = false, sectionConfig }) => {
  const visibleCerts = certifications.filter(c => c.showInFrontend !== false);
  if (!visibleCerts || visibleCerts.length === 0) return null;

  const [expanded, setExpanded] = useState(false);
  const [modalCert, setModalCert] = useState<Certification | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [visibleCerts, expanded]);

  const initialCount = 3;
  const hasMore = visibleCerts.length > initialCount;
  const firstBatch = visibleCerts.slice(0, initialCount);
  const secondBatch = visibleCerts.slice(initialCount);

  const handleRowClick = (cert: Certification) => {
    setModalCert(cert);
  };

  const handleKeyDown = (e: React.KeyboardEvent, cert: Certification) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setModalCert(cert);
    }
  };

  const closeModal = () => setModalCert(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (modalCert) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalCert]);

  const renderRow = (cert: Certification) => {
    return (
      <div
        key={cert.id}
        role="button"
        tabIndex={0}
        onClick={() => handleRowClick(cert)}
        onKeyDown={(e) => handleKeyDown(e, cert)}
        className="group relative grid grid-cols-[88px_1fr] sm:grid-cols-[88px_1fr_auto] gap-4 sm:gap-6 items-center py-4 px-3 sm:px-4 rounded-xl border-b border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-[0_10px_25px_-10px_rgba(37,99,235,0.2)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer focus:outline-none"
        data-title={cert.title}
        data-issuer={cert.issuer}
        data-date={cert.date}
        data-desc={cert.description || ''}
      >
        {/* Thumbnail */}
        <div className="w-[88px] h-[64px] rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 group-hover:scale-[1.05] transition-all duration-300 flex items-center justify-center shrink-0">
          {cert.imageUrl ? (
            <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800"></div>
          )}
        </div>

        {/* Title & Issuer */}
        <div className="flex flex-col justify-center min-w-0">
          <h4 className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300 truncate">{cert.title}</h4>
          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate mt-0.5">{cert.issuer}</span>
        </div>

        {/* Date & ID (Hidden on small screens) */}
        <div className="hidden sm:flex flex-col items-end justify-center shrink-0">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{cert.date}</span>
          {cert.credentialId && (
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{cert.credentialId}</span>
          )}
        </div>

        {/* Date for Mobile (Visible only below sm) */}
        <div className="sm:hidden col-start-2 col-span-1 mt-1">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{cert.date}</span>
        </div>
      </div>
    );
  };

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="certifications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Licenses & Certifications"
          defaultTopText="PROFESSIONAL CREDENTIALS"
          defaultDescription="Industry-recognized credentials, verified programs, and specialized technical certifications."
          icon={Award}
          theme="cyan"
          titleGradientNode={
            <>
              Licenses & <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">Certifications</span>
            </>
          }
        />

        <div className="flex flex-col">
          {firstBatch.map(renderRow)}
        </div>

        {hasMore && (
          <div className="relative">
            <div
              ref={contentRef}
              className="flex flex-col overflow-hidden transition-[max-height] duration-500 ease-in-out"
              style={{ maxHeight: expanded ? `${contentHeight}px` : '0px' }}
            >
              {secondBatch.map(renderRow)}
            </div>

            {/* Fade Zone */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[64px] bg-gradient-to-b from-transparent to-[rgba(29,33,30,.05)] pointer-events-none transition-opacity duration-300 ${expanded ? 'opacity-0' : 'opacity-100'}`}
            ></div>

            <div className="flex justify-center mt-[-22px] relative z-10">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center space-x-2 px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all text-slate-800 dark:text-slate-200 font-sans font-medium text-sm focus:outline-none"
              >
                <span>{expanded ? 'Show less' : `Show ${secondBatch.length} more certifications`}</span>
                <svg
                  className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {modalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-[640px] rounded-2xl shadow-2xl overflow-hidden animate-fadeInScale flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-full text-slate-900 dark:text-white shadow-sm transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Area 16:10 aspect ratio */}
            <div className="w-full relative pt-[62.5%] bg-slate-100 dark:bg-slate-800 shrink-0 border-b border-slate-200 dark:border-slate-800">
              {modalCert.imageUrl ? (
                <img src={modalCert.imageUrl} alt={modalCert.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-slate-100 dark:bg-slate-800"></div>
              )}
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto">
              <h3 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mb-2">
                {modalCert.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6">
                <span className="font-sans text-sm font-medium text-slate-600 dark:text-slate-300">
                  {modalCert.issuer}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Issued {modalCert.date}
                </span>
                {modalCert.credentialId && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:inline-block"></span>
                    <span className="font-mono text-xs text-slate-400 dark:text-slate-500 w-full sm:w-auto mt-1 sm:mt-0">
                      ID: {modalCert.credentialId}
                    </span>
                  </>
                )}
              </div>

              {modalCert.description && (
                <p className="font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {modalCert.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </section>
  );
};
