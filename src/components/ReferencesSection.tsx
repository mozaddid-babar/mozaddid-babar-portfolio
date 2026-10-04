import React, { useState } from 'react';
import { UserCheck, Mail, Phone, Lock } from 'lucide-react';
import { Reference, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface ReferencesSectionProps {
  references?: Reference[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const ReferencesSection: React.FC<ReferencesSectionProps> = ({ references = [], isAlt = false, sectionConfig }) => {
  if (!references || references.length === 0) return null;

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="references">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Academic & Professional References"
          defaultTopText="RECOMMENDATIONS & ADVISORS"
          defaultDescription="Faculty mentors, research advisors, and industry supervisors. Contact details available upon verified request."
          icon={UserCheck}
          theme="indigo"
          titleGradientNode={
            <>
              Academic & Professional <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">References</span>
            </>
          }
        />

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
          {references.map((ref) => (
            <ReferenceCard key={ref.id} reference={ref} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ReferenceCard: React.FC<{ reference: Reference }> = ({ reference }) => {
  const [revealed, setRevealed] = useState(false);

  const role = reference.role || reference.designation;
  const org = reference.organization || reference.institution;

  const handleLinkClick = (e: React.MouseEvent) => {
    if (!revealed) {
      e.preventDefault();
      setRevealed(true);
    }
  };

  return (
    <div
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-[18px] sm:p-[20px] font-sans hover:border-brand-400 dark:hover:border-brand-500 shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)] hover:-translate-y-2 transition-all duration-300 ease-out cursor-default"
      onClick={() => setRevealed(true)}
      onMouseEnter={() => setRevealed(true)}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start gap-4">
        {/* Left Side */}
        <div className="flex-1">
          <h3 className="font-bold text-[14.5px] text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300 leading-tight">
            {reference.name}
          </h3>
          {role && (
            <div className="font-bold uppercase text-[12px] text-brand-600 dark:text-brand-400 leading-snug mt-1.5">
              {role}
            </div>
          )}
          {reference.department && (
            <div className="font-bold uppercase text-[11px] text-slate-400 dark:text-slate-400 leading-snug mt-0.5">
              {reference.department}
            </div>
          )}
          {org && (
            <div className="text-[12.5px] text-slate-600 dark:text-slate-300 mt-1.5 leading-snug">
              {org}
            </div>
          )}
        </div>

        {/* Right Side (Photo) */}
        {reference.imageUrl && (
          <img
            src={reference.imageUrl}
            alt={reference.name}
            className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm"
          />
        )}
      </div>

      {/* Contact Row & Hint */}
      {(reference.email || reference.phone) && (
        <div className="mt-5 relative">
          <div className={`flex items-center flex-wrap gap-2 text-[12px] text-slate-600 dark:text-slate-300 transition-all duration-500 ease-in-out ${revealed ? 'blur-0 opacity-100 select-auto' : 'blur-[5px] opacity-65 select-none'}`}>
            {reference.email && (
              <a href={`mailto:${reference.email}`} className="flex items-center hover:text-brand-600 dark:hover:text-brand-400 transition-colors" onClick={handleLinkClick}>
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                <span>{reference.email}</span>
              </a>
            )}
            {reference.email && reference.phone && (
              <span className="text-slate-400 dark:text-slate-500 mx-1">&bull;</span>
            )}
            {reference.phone && (
              <a href={`tel:${reference.phone}`} className="flex items-center hover:text-brand-600 dark:hover:text-brand-400 transition-colors" onClick={handleLinkClick}>
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                <span>{reference.phone}</span>
              </a>
            )}
          </div>

          <div className={`absolute left-0 -bottom-4 flex items-center text-[10px] text-slate-400 dark:text-slate-500 transition-opacity duration-300 ${revealed ? 'opacity-0' : 'opacity-100'}`}>
            <Lock className="w-2.5 h-2.5 mr-1" />
            <span className="hidden md:inline">hover to view</span>
            <span className="inline md:hidden">tap to view</span>
          </div>
        </div>
      )}
    </div>
  );
};