import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { Certification, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface CertificationsSectionProps {
  certifications: Certification[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

const CATEGORY_STYLES: Record<string, string> = {
  conference: 'text-brand-600 dark:text-brand-400 border-current',
  competition: 'text-amber-700 dark:text-amber-400 border-current',
  course: 'text-emerald-700 dark:text-emerald-400 border-current'
};

// Google Drive's thumbnail endpoint gets throttled when many images load at once,
// so Drive links get a second host to fall back to before giving up.
const getDriveId = (url: string): string | null => {
  if (!/drive\.google\.com|docs\.google\.com/.test(url)) return null;
  const match = url.match(/\/d\/([\w-]{10,})/) || url.match(/[?&]id=([\w-]{10,})/);
  return match ? match[1] : null;
};

const getImageSources = (url: string, width: number): string[] => {
  const id = getDriveId(url);
  if (!id) return [url];
  return [
    `https://lh3.googleusercontent.com/d/${id}=w${width}`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`
  ];
};

interface CertImageProps {
  url?: string;
  alt: string;
  width: number;
  className: string;
  iconClassName: string;
  lazy?: boolean;
}

const CertImage: React.FC<CertImageProps> = ({ url, alt, width, className, iconClassName, lazy = false }) => {
  const sources = url ? getImageSources(url, width) : [];
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
  }, [url]);

  if (attempt >= sources.length) {
    return <Award className={iconClassName} />;
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />}
      <img
        key={sources[attempt]}
        src={sources[attempt]}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        referrerPolicy="no-referrer"
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setAttempt(a => a + 1);
        }}
      />
    </>
  );
};

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications, isAlt = false, sectionConfig }) => {
  const visibleCerts = certifications.filter(c => c.showInFrontend !== false);

  const [expanded, setExpanded] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const modalCert = modalIndex !== null ? visibleCerts[modalIndex] ?? null : null;

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

  const openCert = (cert: Certification) => {
    setModalIndex(visibleCerts.findIndex(c => c.id === cert.id));
  };
  const handleRowClick = openCert;

  const handleKeyDown = (e: React.KeyboardEvent, cert: Certification) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openCert(cert);
    }
  };

  const closeModal = () => setModalIndex(null);
  const showPrev = () => setModalIndex(i => (i === null ? i : (i - 1 + visibleCerts.length) % visibleCerts.length));
  const showNext = () => setModalIndex(i => (i === null ? i : (i + 1) % visibleCerts.length));

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    };
    if (modalIndex !== null) {
      window.addEventListener('keydown', handleKeys);
    }
    return () => window.removeEventListener('keydown', handleKeys);
  }, [modalIndex, visibleCerts.length]);

  if (visibleCerts.length === 0) return null;

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
        <div className="relative w-[88px] h-[64px] rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 group-hover:scale-[1.05] transition-all duration-300 flex items-center justify-center shrink-0">
          <CertImage
            url={cert.imageUrl}
            alt={cert.title}
            width={240}
            lazy
            className="w-full h-full object-cover"
            iconClassName="w-6 h-6 text-slate-300 dark:text-slate-600"
          />
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

      {/* Framed Certificate Modal (portaled to body so section transforms can't clip it) */}
      {modalCert && modalIndex !== null && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {visibleCerts.length > 1 && (
            <>
              <button
                onClick={showPrev}
                className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Previous certificate"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={showNext}
                className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Next certificate"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            key={modalCert.id}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#e9e4dc] dark:bg-[#1b1f27] shadow-2xl animate-fadeInScale p-4 sm:p-8 lg:p-10 mx-10 sm:mx-14 lg:mx-20"
            role="dialog"
            aria-modal="true"
            aria-label={modalCert.title}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 lg:gap-10 items-center">
              {/* Wooden frame with mat */}
              <div className="rounded-[3px] p-2.5 sm:p-3.5 bg-gradient-to-br from-[#5a3f26] to-[#2f2013] shadow-[0_2px_0_#23180e,0_24px_48px_rgba(0,0,0,0.28)]">
                <div className="bg-white dark:bg-[#2a303b] p-3 sm:p-6 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),inset_0_6px_14px_rgba(0,0,0,0.12)]">
                  <div className="relative w-full aspect-[1.414/1] bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    <CertImage
                      key={modalCert.id}
                      url={modalCert.imageUrl}
                      alt={modalCert.title}
                      width={1200}
                      className="w-full h-full object-contain"
                      iconClassName="w-12 h-12 text-slate-300 dark:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Record card */}
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 pr-9">
                  {modalCert.category ? (
                    <span className={`font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[modalCert.category.toLowerCase()] || 'text-slate-600 dark:text-slate-300 border-current'}`}>
                      {modalCert.category}
                    </span>
                  ) : <span />}
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {modalIndex + 1} / {visibleCerts.length}
                  </span>
                </div>

                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <h3 className="font-serif font-semibold text-xl sm:text-2xl text-slate-900 dark:text-white leading-snug">
                    {modalCert.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{modalCert.issuer}</p>
                </div>

                <dl className="border-t border-slate-200 dark:border-slate-800 text-sm">
                  {modalCert.date && (
                    <div className="flex justify-between gap-3 py-2.5 border-b border-slate-200 dark:border-slate-800">
                      <dt className="text-slate-500 dark:text-slate-400">Issued</dt>
                      <dd className="font-mono text-slate-800 dark:text-slate-200 text-right">{modalCert.date}</dd>
                    </div>
                  )}
                  {modalCert.category && (
                    <div className="flex justify-between gap-3 py-2.5 border-b border-slate-200 dark:border-slate-800">
                      <dt className="text-slate-500 dark:text-slate-400">Category</dt>
                      <dd className="font-mono text-slate-800 dark:text-slate-200 text-right">{modalCert.category}</dd>
                    </div>
                  )}
                  {modalCert.credentialId && (
                    <div className="flex justify-between gap-3 py-2.5 border-b border-slate-200 dark:border-slate-800">
                      <dt className="text-slate-500 dark:text-slate-400">Credential ID</dt>
                      <dd className="font-mono text-slate-800 dark:text-slate-200 text-right break-all">{modalCert.credentialId}</dd>
                    </div>
                  )}
                </dl>

                {modalCert.description && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{modalCert.description}</p>
                )}

                {modalCert.credentialUrl && (
                  <div>
                    <a
                      href={modalCert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
                    >
                      Verify certificate <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {visibleCerts.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 pt-1" aria-label="All certificates">
                    {visibleCerts.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => setModalIndex(i)}
                        aria-current={i === modalIndex}
                        title={c.title}
                        className={`max-w-[180px] truncate px-2.5 py-1 rounded-md border text-xs transition-colors ${i === modalIndex ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'}`}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
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
